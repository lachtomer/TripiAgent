import { isSafeExternalUrl } from "./urlSafety";

export interface PlaceDetail {
  place_id: string;
  name: string;
  rating?: number;
  open_now?: boolean;
  types?: string[];
  distance?: number;
  maps_url?: string;
  website_url?: string;
  formatted_address?: string;
  address?: string;
  description?: string;
  image?: string;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  types?: string[];
  vicinity?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
}

export const PLACE_DETAILS_ENRICHMENT_CAP = 8;

// Great-circle distance in meters using Haversine formula
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Server-safe URL builder for Google Maps search using place_id
export function buildGoogleMapsUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`;
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{ website_url?: string; maps_url?: string }> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}&fields=website,url&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { maps_url: buildGoogleMapsUrl(placeId) };

    const data = await res.json();
    const website = data?.result?.website as string | undefined;
    const googleUrl = data?.result?.url as string | undefined;

    return {
      website_url: website && isSafeExternalUrl(website) ? website : undefined,
      maps_url:
        googleUrl && isSafeExternalUrl(googleUrl)
          ? googleUrl
          : buildGoogleMapsUrl(placeId),
    };
  } catch {
    return { maps_url: buildGoogleMapsUrl(placeId) };
  }
}

async function enrichPlacesWithDetails(
  places: PlaceDetail[],
  apiKey: string
): Promise<PlaceDetail[]> {
  const toEnrich = places.slice(0, PLACE_DETAILS_ENRICHMENT_CAP);
  const rest = places.slice(PLACE_DETAILS_ENRICHMENT_CAP);

  const settled = await Promise.allSettled(
    toEnrich.map(async (p) => {
      const details = await fetchPlaceDetails(p.place_id, apiKey);
      return {
        ...p,
        website_url: details.website_url,
        maps_url: details.maps_url ?? p.maps_url ?? buildGoogleMapsUrl(p.place_id),
      };
    })
  );

  const enriched = settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          ...toEnrich[i],
          maps_url: toEnrich[i].maps_url ?? buildGoogleMapsUrl(toEnrich[i].place_id),
        }
  );

  const tail = rest.map((p) => ({
    ...p,
    maps_url: p.maps_url ?? buildGoogleMapsUrl(p.place_id),
  }));

  return [...enriched, ...tail];
}

export async function getGoogleNearbyPlaces(
  lat: number,
  lng: number,
  radius: number,
  type: string | undefined,
  apiKey: string,
  keyword?: string
): Promise<PlaceDetail[]> {
  const baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const typeParam = type ? `&type=${type}` : "";
  const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
  const requestUrl = `${baseUrl}?location=${lat},${lng}&radius=${radius}${typeParam}${keywordParam}&key=${apiKey}`;

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Google Places HTTP error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  const results = data.results || [];

  return results.map((place: GooglePlaceResult) => {
    const placeLat = place.geometry?.location?.lat;
    const placeLng = place.geometry?.location?.lng;
    const distance =
      placeLat !== undefined && placeLng !== undefined
        ? getDistanceMeters(lat, lng, placeLat, placeLng)
        : undefined;

    return {
      place_id: place.place_id,
      name: place.name,
      rating: place.rating,
      open_now: place.opening_hours?.open_now,
      types: place.types || [],
      distance,
      maps_url: buildGoogleMapsUrl(place.place_id),
      address: place.vicinity,
    };
  });
}

export async function getProgressiveNearbyPlaces(
  lat: number,
  lng: number,
  type: string | undefined,
  apiKey: string,
  keyword?: string
): Promise<PlaceDetail[]> {
  // Progressive radius scan: 1000m -> 2500m -> 5000m
  try {
    const results = await getGoogleNearbyPlaces(lat, lng, 1000, type, apiKey, keyword);
    if (results.length >= 3) {
      return enrichPlacesWithDetails(results, apiKey);
    }
  } catch (err) {
    console.warn("1000m radius search failed, retrying at 2500m:", err);
  }

  try {
    const results = await getGoogleNearbyPlaces(lat, lng, 2500, type, apiKey, keyword);
    if (results.length >= 3) {
      return enrichPlacesWithDetails(results, apiKey);
    }
  } catch (err) {
    console.warn("2500m radius search failed, retrying at 5000m:", err);
  }

  const results = await getGoogleNearbyPlaces(lat, lng, 5000, type, apiKey, keyword);
  return enrichPlacesWithDetails(results, apiKey);
}
