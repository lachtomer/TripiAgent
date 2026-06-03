export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolvePlaceHref(websiteUrl?: string, mapsUrl?: string): string | null {
  if (websiteUrl && isSafeExternalUrl(websiteUrl)) return websiteUrl;
  if (mapsUrl && isSafeExternalUrl(mapsUrl)) return mapsUrl;
  return null;
}

export type SavedAttractionLinkFields = {
  id: string;
  name: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  website_url?: string;
  maps_url?: string;
};

function buildGoogleMapsPlaceIdUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`;
}

function buildGoogleMapsCoordsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function buildGoogleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function isPersistedPlaceId(id: string): boolean {
  return !id.startsWith("bank-") && !id.startsWith("custom-poi-");
}

/** Derive link targets for saved attractions missing explicit URLs (Target Bank, custom POIs). */
export function resolveSavedAttractionLinks(
  attraction: SavedAttractionLinkFields
): { websiteUrl?: string; mapsUrl?: string } {
  if (attraction.website_url || attraction.maps_url) {
    return {
      websiteUrl: attraction.website_url,
      mapsUrl: attraction.maps_url,
    };
  }

  if (attraction.lat != null && attraction.lng != null) {
    return { mapsUrl: buildGoogleMapsCoordsUrl(attraction.lat, attraction.lng) };
  }

  if (isPersistedPlaceId(attraction.id)) {
    return { mapsUrl: buildGoogleMapsPlaceIdUrl(attraction.id) };
  }

  const query = [attraction.name, attraction.locationName].filter(Boolean).join(", ");
  if (query) {
    return { mapsUrl: buildGoogleMapsSearchUrl(query) };
  }

  return {};
}

/** Stable slug for data-testid (Google place_ids may contain awkward chars). */
export function placeTestIdSlug(placeId: string): string {
  return placeId.replace(/[^a-zA-Z0-9_-]/g, "_");
}
