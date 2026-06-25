import { describe, it, expect } from "vitest";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "@/lib/lakeGardaTargetBank";
import { getPlanBOptionsForDay } from "./planB";
import type { ItineraryDay } from "@/types";

describe("getPlanBOptionsForDay", () => {
  it("returns up to two unplanned backups for day 3 nature day", () => {
    const options = getPlanBOptionsForDay(3, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.bankId)).toEqual([
      "bank-movieland",
      "bank-vittoriale",
    ]);
    expect(options.some((option) => option.alternateFor?.includes("Rimbalzello"))).toBe(false);
    expect(options.some((option) => option.alternateFor?.includes("Desenzano"))).toBe(false);
  });

  it("returns Gardaland alternates for day 5 (CanevaWorld already on day 7)", () => {
    const options = getPlanBOptionsForDay(5, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(1);
    expect(options[0].bankId).toBe("bank-movieland");
    expect(options[0].alternateFor).toBe("Gardaland Theme Park");
  });

  it("returns Monte Baldo alternates for day 6 when cable car not scheduled", () => {
    const options = getPlanBOptionsForDay(6, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.bankId)).toEqual([
      "bank-paragliding-malcesine",
      "bank-limone",
    ]);
    expect(options[0].alternateFor).toBe("Monte Baldo Cable Car");
  });

  it("returns Manerba hike alternates for day 4 boat day", () => {
    const options = getPlanBOptionsForDay(4, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.bankId)).toEqual([
      "bank-tibetan-bridge",
      "bank-paganella-traverse",
    ]);
  });

  it("returns empty for days without a backup map", () => {
    expect(getPlanBOptionsForDay(2, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK)).toEqual(
      []
    );
  });

  it("skips planned backups and promotes tertiary candidate on day 5", () => {
    const itinerary: ItineraryDay[] = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 5
        ? {
            ...day,
            activities: [
              ...day.activities,
              {
                id: "added-caneva",
                time: "14:00",
                title: "Rain backup water park",
                description: "Added Plan B",
                sourceAttractionId: "bank-caneva-aqua",
              },
            ],
          }
        : day
    );

    const options = getPlanBOptionsForDay(5, itinerary, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(1);
    expect(options[0].bankId).toBe("bank-movieland");
  });

  it("returns empty when all mapped backups are planned", () => {
    const itinerary: ItineraryDay[] = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 6
        ? {
            ...day,
            activities: [
              ...day.activities,
              {
                id: "added-paragliding",
                time: "15:30",
                title: "Paragliding Tandem (Monte Baldo)",
                description: "Booked tandem",
                sourceAttractionId: "bank-paragliding-malcesine",
              },
              {
                id: "added-limone",
                time: "16:00",
                title: "Limone sul Garda",
                description: "West-shore village backup",
                sourceAttractionId: "bank-limone",
              },
            ],
          }
        : day
    );

    expect(getPlanBOptionsForDay(6, itinerary, LAKE_GARDA_TEEN_TARGET_BANK)).toEqual([]);
  });
});
