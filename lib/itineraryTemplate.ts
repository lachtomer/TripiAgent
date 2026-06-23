import type { ItineraryDay } from "@/types";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";

/** Bump when default itinerary content or structure changes — triggers client re-seed. */
export const ITINERARY_TEMPLATE_VERSION = 5;

export function buildItineraryFingerprint(itinerary: ItineraryDay[]): string {
  return itinerary
    .map(
      (day) =>
        `${day.dayNumber}|${day.date ?? ""}|${day.activities.map((activity) => activity.id).join(",")}`
    )
    .join(";");
}

export const DEFAULT_ITINERARY_FINGERPRINT =
  buildItineraryFingerprint(DEFAULT_ITALY_ITINERARY);

/** True when persisted trip does not match the shipped default schedule. */
export function isPersistedItineraryStale(itinerary: ItineraryDay[] | null): boolean {
  if (!itinerary?.length) return false;
  return buildItineraryFingerprint(itinerary) !== DEFAULT_ITINERARY_FINGERPRINT;
}
