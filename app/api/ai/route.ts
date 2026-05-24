import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiRequestBodySchema } from "@/lib/schemas";
import { buildSystemPrompt } from "@/lib/gemini";
import { rateLimiter } from "@/lib/rateLimit";

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
      { error: "Too many requests. Please try again later.", message: "Rate limit exceeded (30 messages/hr). Take a break!" },
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

  const validation = AiRequestBodySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid parameters in request body", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { message, history, context } = validation.data;

  // 3. Check Gemini API Configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // 4. Compile System Instructions incorporating Context
    const systemInstruction = buildSystemPrompt(context || {
      coords: null,
      cityName: null,
    });

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    // 5. Structure Chat Contents history for Gemini SDK
    const contents: { role: string; parts: { text: string }[] }[] = [];
    if (history && history.length > 0) {
      contents.push(
        ...history.map((item) => ({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }],
        }))
      );
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 6. Generate content stream and return as ReadableStream
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({
            contents,
          });

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Gemini stream error:", err);
          controller.error(err);
        }
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Gemini AI API connection failed:", error);
    return NextResponse.json({ error: "Failed to connect to AI assistant" }, { status: 500 });
  }
}
