import { describe, it, expect } from "vitest";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "@/lib/lakeGardaTargetBank";
import {
  getBankPlannedStatus,
  sortBankEntries,
  filterBankEntries,
  titleTokensMatch,
  normalizePlanText,
} from "./bankPlanned";
import type { ItineraryDay, SavedAttraction } from "@/types";

function findBank(id: string): SavedAttraction {
  const entry = LAKE_GARDA_TEEN_TARGET_BANK.find((item) => item.id === id);
  if (!entry) throw new Error(`Missing bank entry ${id}`);
  return entry;
}

describe("normalizePlanText", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizePlanText("Verona Arena!")).toBe("verona arena");
  });
});

describe("titleTokensMatch", () => {
  it("matches Gardaland in Gardaland Theme Park", () => {
    expect(titleTokensMatch("Gardaland", "Gardaland Theme Park")).toBe(true);
  });

  it("matches Verona Arena exactly", () => {
    expect(titleTokensMatch("Verona Arena", "Verona Arena")).toBe(true);
  });

  it("does not match Verona Arena bank to Verona-only activity", () => {
    expect(titleTokensMatch("Verona Arena", "Verona")).toBe(false);
  });
});

describe("getBankPlannedStatus", () => {
  it("marks Gardaland planned on day 6", () => {
    const status = getBankPlannedStatus(findBank("bank-gardaland"), DEFAULT_ITALY_ITINERARY);
    expect(status.isPlanned).toBe(true);
    expect(status.scheduledDayNumbers).toContain(6);
    expect(status.matchKind).toBe("title_fuzzy");
  });

  it("marks CanevaWorld unplanned", () => {
    const status = getBankPlannedStatus(findBank("bank-caneva-aqua"), DEFAULT_ITALY_ITINERARY);
    expect(status.isPlanned).toBe(false);
    expect(status.scheduledDayNumbers).toEqual([]);
    expect(status.matchKind).toBeNull();
  });

  it("marks Verona Arena planned on day 4 with exact title match", () => {
    const status = getBankPlannedStatus(findBank("bank-verona-arena"), DEFAULT_ITALY_ITINERARY);
    expect(status.isPlanned).toBe(true);
    expect(status.scheduledDayNumbers).toEqual([4]);
    expect(status.matchKind).toBe("title_exact");
  });

  it("marks Rimbalzello planned on day 3", () => {
    const status = getBankPlannedStatus(findBank("bank-rimbalzello"), DEFAULT_ITALY_ITINERARY);
    expect(status.isPlanned).toBe(true);
    expect(status.scheduledDayNumbers).toContain(3);
  });

  it("uses sourceAttractionId link when titles differ", () => {
    const itinerary: ItineraryDay[] = [
      {
        dayNumber: 3,
        activities: [
          {
            id: "x1",
            time: "14:00",
            title: "Rain backup water park",
            description: "Indoor backup",
            sourceAttractionId: "bank-caneva-aqua",
          },
        ],
      },
    ];
    const status = getBankPlannedStatus(findBank("bank-caneva-aqua"), itinerary);
    expect(status.isPlanned).toBe(true);
    expect(status.scheduledDayNumbers).toEqual([3]);
    expect(status.matchKind).toBe("id_link");
  });

  it("returns unplanned for empty itinerary", () => {
    const status = getBankPlannedStatus(findBank("bank-gardaland"), []);
    expect(status.isPlanned).toBe(false);
  });
});

describe("sortBankEntries", () => {
  it("places unplanned entries before planned entries", () => {
    const sorted = sortBankEntries(LAKE_GARDA_TEEN_TARGET_BANK, DEFAULT_ITALY_ITINERARY);
    const canevaIdx = sorted.findIndex((row) => row.entry.id === "bank-caneva-aqua");
    const gardalandIdx = sorted.findIndex((row) => row.entry.id === "bank-gardaland");
    expect(canevaIdx).toBeGreaterThanOrEqual(0);
    expect(gardalandIdx).toBeGreaterThanOrEqual(0);
    expect(canevaIdx).toBeLessThan(gardalandIdx);
    expect(sorted[canevaIdx].plannedStatus.isPlanned).toBe(false);
    expect(sorted[gardalandIdx].plannedStatus.isPlanned).toBe(true);
  });
});

describe("filterBankEntries", () => {
  it("filters to unplanned only", () => {
    const sorted = sortBankEntries(LAKE_GARDA_TEEN_TARGET_BANK, DEFAULT_ITALY_ITINERARY);
    const unplanned = filterBankEntries(sorted, "unplanned");
    expect(unplanned.every((row) => !row.plannedStatus.isPlanned)).toBe(true);
    expect(unplanned.some((row) => row.entry.id === "bank-gardaland")).toBe(false);
    expect(unplanned.some((row) => row.entry.id === "bank-caneva-aqua")).toBe(true);
  });

  it("filters to planned only", () => {
    const sorted = sortBankEntries(LAKE_GARDA_TEEN_TARGET_BANK, DEFAULT_ITALY_ITINERARY);
    const planned = filterBankEntries(sorted, "planned");
    expect(planned.every((row) => row.plannedStatus.isPlanned)).toBe(true);
    expect(planned.some((row) => row.entry.id === "bank-gardaland")).toBe(true);
  });
});
