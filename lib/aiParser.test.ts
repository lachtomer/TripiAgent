import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseItineraryLocally,
  parseItineraryWithAi,
  parsedPlacesResponseSchema,
} from "./aiParser";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
  SchemaType: {
    OBJECT: "OBJECT",
    ARRAY: "ARRAY",
    STRING: "STRING",
    NUMBER: "NUMBER",
  },
}));

describe("parseItineraryLocally", () => {
  it("splits semicolon-separated entries into name-only places", () => {
    const places = parseItineraryLocally(
      "Day 1 – Visit Sirmione; Day 2 – Explore Verona"
    );
    expect(places).toEqual([
      { name: "Day 1 – Visit Sirmione" },
      { name: "Day 2 – Explore Verona" },
    ]);
  });

  it("returns empty array for blank input", () => {
    expect(parseItineraryLocally("   ")).toEqual([]);
  });
});

describe("parseItineraryWithAi", () => {
  const envBackup = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "mock-api-key";
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = envBackup;
  });

  it("falls back to local parser when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const places = await parseItineraryWithAi("Colosseum; Pantheon");
    expect(places).toEqual([{ name: "Colosseum" }, { name: "Pantheon" }]);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it("returns Gemini-parsed places when response is valid", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            places: [
              {
                name: "Sirmione",
                category: "nature",
                description: "Lake Garda peninsula town",
              },
              {
                name: "Verona Arena",
                category: "cultural",
              },
            ],
          }),
      },
    });

    const places = await parseItineraryWithAi("Day 1 Sirmione; Day 2 Verona", {
      createdBy: "Tomer",
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(places).toEqual([
      {
        name: "Sirmione",
        category: "nature",
        description: "Lake Garda peninsula town",
        createdBy: "Tomer",
      },
      {
        name: "Verona Arena",
        category: "cultural",
        createdBy: "Tomer",
      },
    ]);
  });

  it("falls back to local parser when Gemini throws", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Gemini unavailable"));

    const places = await parseItineraryWithAi("Alpha; Beta");
    expect(places).toEqual([{ name: "Alpha" }, { name: "Beta" }]);
  });

  it("falls back when Gemini returns invalid JSON shape", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ places: [{ name: 123 }] }),
      },
    });

    const places = await parseItineraryWithAi("One; Two");
    expect(places).toEqual([{ name: "One" }, { name: "Two" }]);
  });

  it("validates expected Gemini response schema", () => {
    const sample = parsedPlacesResponseSchema.parse({
      places: [{ name: "Colosseum", category: "cultural" }],
    });
    expect(sample.places[0].name).toBe("Colosseum");
  });
});
