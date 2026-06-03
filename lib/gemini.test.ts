import { describe, it, expect } from "vitest";
import { buildSystemPrompt, buildVenueMapsSearchUrl } from "./gemini";

describe("gemini prompts", () => {
  it("includes venue link guidance in system prompt", () => {
    const prompt = buildSystemPrompt({
      coords: null,
      cityName: "Verona",
      itinerarySummary: null,
    });

    expect(prompt).toContain("Venue Links");
    expect(prompt).toContain("google.com/maps/search");
    expect(prompt).toContain("Never invent custom website domains");
  });

  it("includes mixed-language and overwhelmingly Hebrew reply rules", () => {
    const prompt = buildSystemPrompt({
      coords: null,
      cityName: "Verona",
      itinerarySummary: null,
      locale: "en",
    });

    expect(prompt).toContain("Mixed Hebrew and English");
    expect(prompt).toContain("Overwhelmingly Hebrew");
    expect(prompt).toContain("respond in **English**");
  });

  it("buildVenueMapsSearchUrl encodes venue and city", () => {
    const url = buildVenueMapsSearchUrl("Osteria Francescana", "Modena");
    expect(url).toContain("google.com/maps/search");
    expect(url).toContain(encodeURIComponent("Osteria Francescana Modena"));
  });
});
