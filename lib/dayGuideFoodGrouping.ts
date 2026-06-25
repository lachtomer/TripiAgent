import type { DayGuideFood, DayGuideLocation } from "@/types";

export interface LocationFoodGroup {
  location: DayGuideLocation;
  food: DayGuideFood[];
}

export interface GroupedOptionFood {
  byLocation: LocationFoodGroup[];
  ungrouped: DayGuideFood[];
}

/** Pair food items with their location block; preserve location order. */
export function groupFoodByLocation(
  locations: DayGuideLocation[],
  food: DayGuideFood[]
): GroupedOptionFood {
  const byLocation: LocationFoodGroup[] = locations.map((location) => ({
    location,
    food: food.filter((item) => item.locationId === location.id),
  }));

  const groupedIds = new Set(
    byLocation.flatMap((group) => group.food.map((item) => item.id))
  );
  const ungrouped = food.filter((item) => !groupedIds.has(item.id));

  return { byLocation, ungrouped };
}
