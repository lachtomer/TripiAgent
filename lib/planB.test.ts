import { describe, it, expect } from "vitest";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "@/lib/lakeGardaTargetBank";
import { getPlanBOptionsForDay } from "./planB";
import type { ItineraryDay } from "@/types";

describe("getPlanBOptionsForDay", () => {
  it("returns up to two unplanned backups for day 3", () => {
    const options = getPlanBOptionsForDay(3, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.bankId)).toEqual([
      "bank-caneva-aqua",
      "bank-movieland",
    ]);
    expect(options[0].reason).toContain("Rain backup");
  });

  it("returns Gardaland alternates for day 6", () => {
    const options = getPlanBOptionsForDay(6, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.every((option) => option.alternateFor === "Gardaland Theme Park")).toBe(true);
  });

  it("returns paragliding backup for day 7", () => {
    const options = getPlanBOptionsForDay(7, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(1);
    expect(options[0].bankId).toBe("bank-paragliding-malcesine");
    expect(options[0].alternateFor).toBe("Monte Baldo Cable Car");
  });

  it("returns empty for days without a backup map", () => {
    expect(getPlanBOptionsForDay(2, DEFAULT_ITALY_ITINERARY, LAKE_GARDA_TEEN_TARGET_BANK)).toEqual(
      []
    );
  });

  it("skips planned backups and promotes tertiary candidate on day 3", () => {
    const itinerary: ItineraryDay[] = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 3
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

    const options = getPlanBOptionsForDay(3, itinerary, LAKE_GARDA_TEEN_TARGET_BANK);
    expect(options).toHaveLength(2);
    expect(options.map((option) => option.bankId)).toEqual([
      "bank-movieland",
      "bank-jungle-adventure",
    ]);
  });

  it("returns empty when all mapped backups are planned", () => {
    const itinerary: ItineraryDay[] = DEFAULT_ITALY_ITINERARY.map((day) =>
      day.dayNumber === 7
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
            ],
          }
        : day
    );

    expect(getPlanBOptionsForDay(7, itinerary, LAKE_GARDA_TEEN_TARGET_BANK)).toEqual([]);
  });
});
