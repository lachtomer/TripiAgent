import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseItineraryWithAi } from "@/lib/aiParser";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const parseRequestSchema = z.object({
  text: z.string().min(1, "Itinerary text is required"),
  createdBy: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const validation = parseRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text, createdBy } = validation.data;
  const places = await parseItineraryWithAi(text, { createdBy });

  return NextResponse.json({ places }, { status: 200 });
}
