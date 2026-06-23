import type { ItineraryDay } from "@/types";

/** Bump when default itinerary content or structure changes — triggers client re-seed. */
export const ITINERARY_TEMPLATE_VERSION = 4;

/** Detect persisted trips that predate the Jun 2026 replan or English copy refresh. */
export function isPersistedItineraryStale(itinerary: ItineraryDay[] | null): boolean {
  if (!itinerary?.length) return false;

  const day4 = itinerary.find((d) => d.dayNumber === 4);
  const day6 = itinerary.find((d) => d.dayNumber === 6);
  if (!day4?.date?.includes("Sirmione")) return true;
  if (!day6?.date?.includes("Verona")) return true;

  const day2 = itinerary.find((d) => d.dayNumber === 2);
  const bergamoStop = day2?.activities.find((a) => a.id === "a5b");
  if (bergamoStop?.title?.includes("Città Alta")) return true;
  if (bergamoStop?.description?.includes("Città Alta")) return true;

  const oldDay3 = itinerary.find((d) => d.dayNumber === 3)?.date;
  if (oldDay3?.includes("Rimbalzello") || oldDay3?.includes("Lake Boat")) return true;

  return false;
}
