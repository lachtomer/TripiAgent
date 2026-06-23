import { describe, it, expect } from "vitest";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import {
  buildItineraryFingerprint,
  isPersistedItineraryStale,
  ITINERARY_TEMPLATE_VERSION,
  DEFAULT_ITINERARY_FINGERPRINT,
} from "@/lib/itineraryTemplate";

describe("itineraryTemplate", () => {
  it("current default is not stale", () => {
    expect(isPersistedItineraryStale(DEFAULT_ITALY_ITINERARY)).toBe(false);
  });

  it("detects swapped Sun/Tue activities", () => {
    const swapped = DEFAULT_ITALY_ITINERARY.map((day) => {
      if (day.dayNumber === 4) {
        const wrong = DEFAULT_ITALY_ITINERARY.find((d) => d.dayNumber === 6)!;
        return { ...wrong, dayNumber: 4 };
      }
      if (day.dayNumber === 6) {
        const wrong = DEFAULT_ITALY_ITINERARY.find((d) => d.dayNumber === 4)!;
        return { ...wrong, dayNumber: 6 };
      }
      return day;
    });
    expect(isPersistedItineraryStale(swapped)).toBe(true);
  });

  it("fingerprint changes when activity ids change", () => {
    const altered = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 8
        ? {
            ...day,
            activities: day.activities.map((activity) =>
              activity.id === "a13" ? { ...activity, id: "stale-id" } : activity
            ),
          }
        : day
    );
    expect(buildItineraryFingerprint(altered)).not.toBe(DEFAULT_ITINERARY_FINGERPRINT);
  });

  it("exports template version 7", () => {
    expect(ITINERARY_TEMPLATE_VERSION).toBe(7);
  });
});
