import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

export const placeCategoryEnum = z.enum([
  "cultural",
  "food",
  "nature",
  "shopping",
  "nightlife",
]);

export const parsedPlaceSchema = z.object({
  name: z.string().min(1),
  category: placeCategoryEnum.optional(),
  description: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  createdBy: z.string().optional(),
});

export const parsedPlacesResponseSchema = z.object({
  places: z.array(parsedPlaceSchema),
});

export type ParsedPlace = z.infer<typeof parsedPlaceSchema>;

export function parseItineraryLocally(text: string): ParsedPlace[] {
  return text
    .split(";")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((name) => ({ name }));
}

export type ParseItineraryOptions = {
  createdBy?: string;
  apiKey?: string;
  model?: string;
};

export async function parseItineraryWithAi(
  text: string,
  options: ParseItineraryOptions = {}
): Promise<ParsedPlace[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return parseItineraryLocally(trimmed);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = options.model ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            places: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  category: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  lat: { type: SchemaType.NUMBER },
                  lng: { type: SchemaType.NUMBER },
                },
                required: ["name"],
              },
            },
          },
          required: ["places"],
        },
      },
    });

    const prompt = `You parse Italy trip itinerary text into a list of distinct attraction bank entries.

Rules:
- Extract one entry per distinct place or activity.
- Use concise place names (strip day labels like "Day 1 –" or "Jun 25 –").
- Set category when obvious: cultural, food, nature, shopping, nightlife.
- Add a short description when inferable from context.
- Omit lat/lng unless clearly known; do not invent coordinates.
- Return JSON only.

Itinerary text:
${trimmed}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = JSON.parse(raw) as unknown;
    const validated = parsedPlacesResponseSchema.parse(json);

    return validated.places.map((place) => ({
      ...place,
      createdBy: place.createdBy ?? options.createdBy,
    }));
  } catch (error) {
    console.error("aiParser: Gemini parse failed, using local fallback:", error);
    return parseItineraryLocally(trimmed);
  }
}
