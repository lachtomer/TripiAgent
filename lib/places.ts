export interface PlaceDetail {
  place_id: string;
  name: string;
  rating?: number;
  open_now?: boolean;
  types: string[];
  distance?: number;
  maps_url: string;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  rating?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  types?: string[];
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
}

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

export async function getGoogleNearbyPlaces(
  lat: number,
  lng: number,
  radius: number,
  type: string | undefined,
  apiKey: string
): Promise<PlaceDetail[]> {
  const baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const typeParam = type ? `&type=${type}` : "";
  const requestUrl = `${baseUrl}?location=${lat},${lng}&radius=${radius}${typeParam}&key=${apiKey}`;

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Google Places HTTP error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  const results = data.results || [];

  return results.slice(0, 5).map((place: GooglePlaceResult) => {
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
    };
  });
}
