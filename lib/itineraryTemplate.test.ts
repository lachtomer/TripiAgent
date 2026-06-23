import { describe, it, expect } from "vitest";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import {
  isPersistedItineraryStale,
  ITINERARY_TEMPLATE_VERSION,
} from "@/lib/itineraryTemplate";

describe("itineraryTemplate", () => {
  it("current default is not stale", () => {
    expect(isPersistedItineraryStale(DEFAULT_ITALY_ITINERARY)).toBe(false);
  });

  it("detects old Verona-on-Sun schedule", () => {
    const stale = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 4
        ? { ...day, date: "Jun 28 – Verona (or Monte Baldo — see Day guide)" }
        : day
    );
    expect(isPersistedItineraryStale(stale)).toBe(true);
  });

  it("exports template version 4", () => {
    expect(ITINERARY_TEMPLATE_VERSION).toBe(4);
  });
});
