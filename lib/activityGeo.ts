import type { Activity } from "@/types";

export interface ResolvedCoordinates {
  lat: number;
  lng: number;
}

/** Returns stored activity coordinates or geocodes locationName/title once. */
export async function resolveActivityCoordinates(
  activity: Pick<Activity, "lat" | "lng" | "locationName" | "title">
): Promise<ResolvedCoordinates | null> {
  if (
    typeof activity.lat === "number" &&
    typeof activity.lng === "number" &&
    !Number.isNaN(activity.lat) &&
    !Number.isNaN(activity.lng)
  ) {
    return { lat: activity.lat, lng: activity.lng };
  }

  const query = (activity.locationName || activity.title || "").trim();
  if (!query) return null;

  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { lat?: number; lng?: number };
    if (typeof data.lat !== "number" || typeof data.lng !== "number") return null;
    return { lat: data.lat, lng: data.lng };
  } catch {
    return null;
  }
}
