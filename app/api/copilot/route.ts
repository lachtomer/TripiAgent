import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CopilotRequestBodySchema } from "@/lib/schemas";
import { rateLimiter } from "@/lib/rateLimit";
import { checkMilanZTL } from "@/lib/ztl";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function POST(request: NextRequest) {
  // 1. Get Client IP Address for Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Limit: max 30 requests per IP per hour
  const rateLimitResult = rateLimiter(ip, 30, 60 * 60 * 1000);
  if (!rateLimitResult.success) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", message: "Rate limit exceeded. Take a break!" },
      { status: 429 }
    );
  }

  // 2. Validate Request Body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const validation = CopilotRequestBodySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid parameters in request body", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { dayNumber, date, itineraryActivities, weatherInfo, cityName } = validation.data;

  // 3. Check Gemini API Configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // 4. Precompute ZTL Warning if Milan is in context
    let ztlWarning = "";
    const isMilanInContext = cityName?.toLowerCase().includes("milan") || 
      itineraryActivities.some(a => a.title.toLowerCase().includes("milan") || a.locationName?.toLowerCase().includes("milan"));

    if (isMilanInContext && date) {
      // Check ZTL rules for Milan Area C at common driving hours (e.g. 10:00 AM)
      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
      const ztlCheck = checkMilanZTL("10:00", dayName);
      if (ztlCheck.active) {
        ztlWarning = `🚨 Milan ZTL Area C is active today (charge: €${ztlCheck.costEuro.toFixed(2)}). Ensure you have registered your entry!`;
      }
    }

    // 5. Build prompt with context
    const activitiesList = itineraryActivities.length > 0 
      ? itineraryActivities.map(a => `- [${a.time}] ${a.title}: ${a.description}`).join("\n")
      : "No activities scheduled yet.";

    const weatherText = weatherInfo 
      ? `${weatherInfo.temp}°C, ${weatherInfo.description}`
      : "Unknown weather conditions";

    const prompt = `
    You are the TripiAgent Travel Co-Pilot. Your job is to analyze the user's daily itinerary and weather conditions to generate a Morning Briefing and exactly one curated Serendipity recommendation.

    Context:
    - Trip Location/City: ${cityName || "Italy"}
    - Day of Trip: Day ${dayNumber} ${date ? `(Date: ${date})` : ""}
    - Weather Today: ${weatherText}
    - Planned Activities:
    ${activitiesList}
    
    ${ztlWarning ? `ZTL Rules Alert: ${ztlWarning}` : ""}

    Instructions:
    1. morningBriefing: Write a 2-3 sentence overview of their day. Keep it highly practical, welcoming, and concise. Mention the weather (e.g. advise sunscreen/sunglasses if sunny, or carrying an umbrella if rain is forecast). If the ZTL warning is active, include a note about ZTL.
    2. serendipity: Recommend exactly ONE unique, spontaneous local experience tailored specifically to their active location (${cityName || "Italy"}).
       - It must be a high-quality suggestion (e.g., a quiet panoramic viewpoint, a local bakery specialty to try, or a hidden corner).
       - Do not suggest generic tourist traps.
       - Provide:
         - title: The name of the experience.
         - description: 1-2 sentences of why they should do it.
         - category: Choose one of "Views", "Local Food", "Hidden Gem", "Activity".
    `;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            morningBriefing: {
              type: SchemaType.STRING,
              description: "A 2 to 3 sentence daily update for the traveler summarizing their plan, weather tips, and any driving alerts."
            },
            serendipity: {
              type: SchemaType.OBJECT,
              description: "One single spontaneous local recommendation.",
              properties: {
                title: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                category: { type: SchemaType.STRING, description: "Must be one of: Views, Local Food, Hidden Gem, Activity" }
              },
              required: ["title", "description", "category"]
            }
          },
          required: ["morningBriefing", "serendipity"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error in Travel Copilot route:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate copilot update.", details: errorMessage },
      { status: 500 }
    );
  }
}
