import { TripContext } from "@/types";

export function buildSystemPrompt(ctx: TripContext): string {
  const { coords, cityName, localTime, dayOfWeek, weather, itinerarySummary, locale } = ctx;

  const locationPart = cityName
    ? `Location: ${cityName} ${coords ? `(Latitude: ${coords.latitude.toFixed(4)}, Longitude: ${coords.longitude.toFixed(4)})` : ""}`
    : "Location: Unknown (Italy)";

  const timePart = localTime
    ? `Local Time: ${localTime}${dayOfWeek ? ` (${dayOfWeek})` : ""}`
    : "";

  const weatherPart = weather
    ? `Current Weather: ${weather.temp}°C, ${weather.condition}`
    : "";

  const itineraryPart = itinerarySummary && itinerarySummary.trim() !== ""
    ? `Active Itinerary Summary: ${itinerarySummary}`
    : "Active Itinerary: None";

  const localePart = locale ? `Preferred Locale/Language: ${locale}` : "";

  return `You are TripiAgent, a passionate, knowledgeable, and friendly AI travel assistant specializing in Italy.
Your task is to guide the user on their trip with expert local advice.

USER CONTEXT:
- ${locationPart}
- ${timePart}
- ${weatherPart}
- ${itineraryPart}
- ${localePart}

CORE DIRECTIONS & GUIDELINES:
1. **Tone**: Warm, enthusiastic, and welcoming, reflecting Italian hospitality.
2. **Mobile Optimization**: Keep responses very concise and formatted for a 390px mobile screen. Use short paragraphs, bullet points, and bold text. Avoid large walls of text.
3. **Walkability**: Favor and highlight recommendations within walking distance (<1km) whenever the user asks for nearby suggestions.
4. **Practical Info**: Include opening hours, crowd tips (how to avoid long queues), prices in Euros (€), and booking hints (e.g. "book Colosseum tickets 30 days in advance").
5. **Language Matching**: Always respond in the user's query language (e.g., English, Italian, Spanish, etc.) and adapt to the provided locale if specified.
6. **Accuracy**: Stick to true facts about Italy. Do not hallucinate or guess addresses, places, opening hours, or historical facts. If unsure, admit it.`;
}

export async function getGeminiTravelResponse(
  prompt: string,
  history?: { role: "user" | "model"; text: string }[]
): Promise<string> {
  // Stub travel guide Gemini request
  console.log("Mock getGeminiTravelResponse called with:", prompt, history);
  return `This is a stub travel assistant response from Gemini. It answers to: "${prompt}"`;
}
