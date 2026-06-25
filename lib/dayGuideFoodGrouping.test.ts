import { describe, it, expect } from "vitest";
import { groupFoodByLocation } from "./dayGuideFoodGrouping";
import type { DayGuideFood, DayGuideLocation } from "@/types";

const locA: DayGuideLocation = {
  id: "loc-a",
  name: "Town A",
  mapsUrl: "https://example.com/a",
  mustSee: [{ id: "s1", title: "Spot" }],
};

const locB: DayGuideLocation = {
  id: "loc-b",
  name: "Town B",
  mapsUrl: "https://example.com/b",
  mustSee: [{ id: "s2", title: "Spot 2" }],
};

const lunchA: DayGuideFood = {
  id: "food-a",
  name: "Cafe A",
  style: "Pizza",
  when: "lunch",
  mapsUrl: "https://example.com/cafe-a",
  locationId: "loc-a",
};

const lunchB: DayGuideFood = {
  id: "food-b",
  name: "Cafe B",
  style: "Pasta",
  when: "lunch",
  mapsUrl: "https://example.com/cafe-b",
  locationId: "loc-b",
};

describe("groupFoodByLocation", () => {
  it("groups food under matching locations in location order", () => {
    const result = groupFoodByLocation([locA, locB], [lunchB, lunchA]);
    expect(result.byLocation).toHaveLength(2);
    expect(result.byLocation[0].location.id).toBe("loc-a");
    expect(result.byLocation[0].food.map((f) => f.id)).toEqual(["food-a"]);
    expect(result.byLocation[1].food.map((f) => f.id)).toEqual(["food-b"]);
    expect(result.ungrouped).toEqual([]);
  });

  it("returns ungrouped items without locationId", () => {
    const loose: DayGuideFood = {
      id: "food-loose",
      name: "Snacks",
      style: "Casual",
      when: "snack",
      mapsUrl: "https://example.com/snack",
    };
    const result = groupFoodByLocation([locA], [lunchA, loose]);
    expect(result.ungrouped.map((f) => f.id)).toEqual(["food-loose"]);
  });
});
