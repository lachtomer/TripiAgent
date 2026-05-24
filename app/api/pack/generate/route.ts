import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PackingGenerateSchema } from "@/lib/schemas";
import { PackingItem } from "@/types";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const CATEGORY_ORDER = [
  "Essentials",
  "Documents",
  "Clothing",
  "Electronics",
  "Health & Comfort",
  "Activities",
  "Miscellaneous",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PackingGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { itinerarySummary, tripStartDate, cityName, durationDays } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const duration = durationDays ?? 5;
  const location = cityName ?? "Italy";
  const startDate = tripStartDate
    ? `Trip starts ${tripStartDate}.`
    : "Trip date not set.";

  const prompt = `You are a travel packing assistant specialising in Italy trips.
Generate a comprehensive packing list for a ${duration}-day trip to ${location}.
${startDate}
${itinerarySummary ? `Itinerary:\n${itinerarySummary}` : ""}

Return ONLY a valid JSON array (no markdown, no code fences, no explanation) of packing items with this shape:
[
  { "id": "unique-slug", "name": "Item name", "category": "Category", "checked": false },
  ...
]

Use exactly these categories where applicable: ${CATEGORY_ORDER.join(", ")}.
Include 20-30 practical, specific items tailored to the itinerary, weather, and activities.
Prioritise items most travellers forget. Do not duplicate. Return pure JSON only.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip markdown code fences if the model added them despite instructions
    const jsonStr = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    let items: PackingItem[];
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      // Validate shape lightly; fill defaults for safety
      items = (parsed as Record<string, unknown>[]).map((item, idx) => ({
        id: typeof item.id === "string" ? item.id : `gen-${idx}`,
        name: typeof item.name === "string" ? item.name : "Unknown Item",
        category: typeof item.category === "string" ? item.category : "Miscellaneous",
        checked: false,
      }));
    } catch {
      console.error("Packing JSON parse error. Raw:", jsonStr.slice(0, 200));
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Pack generate error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
