import { describe, it, expect } from "vitest";
import {
  TRIP_DAY_GUIDES,
  getDayGuide,
  getDayGuideFood,
  collectDayGuideUrls,
} from "./tripDayGuides";
import { isSafeExternalUrl } from "./urlSafety";

const ACTIVITY_DAYS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

describe("getDayGuide", () => {
  it("returns guides for activity days 2–9", () => {
    for (const day of ACTIVITY_DAYS) {
      expect(getDayGuide(day)).toBeDefined();
      expect(getDayGuide(day)?.dayNumber).toBe(day);
    }
  });

  it("returns undefined for days without guides", () => {
    expect(getDayGuide(1)).toBeUndefined();
    expect(getDayGuide(10)).toBeUndefined();
  });
});

describe("TRIP_DAY_GUIDES content", () => {
  it("each activity day has at least one lunch food entry", () => {
    for (const day of ACTIVITY_DAYS) {
      const guide = getDayGuide(day)!;
      const lunches = getDayGuideFood(guide).filter((f) => f.when === "lunch");
      expect(lunches.length, `Day ${day} lunch`).toBeGreaterThanOrEqual(1);
    }
  });

  it("all URLs pass isSafeExternalUrl", () => {
    for (const day of ACTIVITY_DAYS) {
      const guide = getDayGuide(day)!;
      for (const url of collectDayGuideUrls(guide)) {
        expect(isSafeExternalUrl(url), `Day ${day}: ${url}`).toBe(true);
      }
    }
  });

  it("Day 6 has exactly two dual options with banner", () => {
    const day6 = getDayGuide(6)!;
    expect(day6.options).toHaveLength(2);
    expect(day6.options?.[0].id).toBe("option-a-verona");
    expect(day6.options?.[1].id).toBe("option-b-baldo");
    expect(day6.bannerNote).toBeTruthy();
    expect(day6.locations).toBeUndefined();
    expect(day6.food).toBeUndefined();
  });

  it("marks Grotte di Catullo as optional on Day 8", () => {
    const day8 = getDayGuide(8)!;
    const sirmione = day8.locations?.find((l) => l.id === "loc-sirmione");
    const grotte = sirmione?.mustSee.find((s) => s.id === "sirmione-grotte");
    expect(grotte?.optional).toBe(true);
  });

  it("marks Manerba village as optional on Day 4", () => {
    const day4 = getDayGuide(4)!;
    const village = day4.locations?.find((l) => l.id === "loc-manerba-village");
    expect(village?.optional).toBe(true);
  });

  it("each location has at least one must-see", () => {
    for (const day of ACTIVITY_DAYS) {
      const guide = getDayGuide(day)!;
      if (guide.options) {
        for (const opt of guide.options) {
          for (const loc of opt.locations) {
            expect(loc.mustSee.length, `Day ${day} ${loc.id}`).toBeGreaterThanOrEqual(1);
          }
        }
      } else {
        for (const loc of guide.locations ?? []) {
          expect(loc.mustSee.length, `Day ${day} ${loc.id}`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("exports exactly eight activity day guides", () => {
    expect(Object.keys(TRIP_DAY_GUIDES).map(Number).sort((a, b) => a - b)).toEqual([
      2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });
});
