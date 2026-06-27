export interface KeywordInLocationSplit {
  keyword: string;
  locationText: string;
}

export interface NameWithAreaSplit {
  nameText: string;
  areaText: string;
}

export interface GeocodeProbe {
  cityName: string;
  matchedName?: string;
  placeTypes?: string[];
}

export type SearchAnchorSource = "target_saved" | "target_geocoded" | "gps";

export interface SearchAnchor {
  lat: number;
  lng: number;
  label: string;
  source: SearchAnchorSource;
  ready: boolean;
}

const LOCALITY_TYPES = new Set([
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "political",
]);

/** Default radius (km) for city/region location-browse searches. */
export const LOCATION_BROWSE_RADIUS_KM = 50;

/** Top Italy destinations + Lake Garda towns for location-browse detection. */
export const ITALY_CITY_ALLOWLIST: ReadonlySet<string> = new Set([
  "milan",
  "verona",
  "venice",
  "florence",
  "rome",
  "naples",
  "bologna",
  "turin",
  "genoa",
  "padua",
  "brescia",
  "como",
  "sirmione",
  "riva del garda",
  "desenzano del garda",
  "lake garda",
  "bergamo",
  "modena",
  "parma",
  "ravenna",
  "trieste",
  "perugia",
  "siena",
  "pisa",
  "lucca",
  "amalfi",
  "positano",
  "sorrento",
  "capri",
  "palermo",
  "catania",
  "taormina",
  "matera",
  "bari",
  "lecce",
  "cinque terre",
  "monza",
  "varenna",
  "bellagio",
  "menaggio",
  "limone sul garda",
  "malcesine",
  "peschiera del garda",
  "lazise",
  "bardolino",
  "garda",
  "trento",
  "bolzano",
  "verona province",
  "mestre",
]);

export function normalizeSearchText(text: string): string {
  return text.trim().toLowerCase();
}

export function isKnownArea(area: string): boolean {
  return ITALY_CITY_ALLOWLIST.has(normalizeSearchText(area));
}

/** Fast path: `"Pizza in Milan"` → keyword + location. */
export function parseKeywordInLocation(query: string): KeywordInLocationSplit | null {
  const inIndex = query.toLowerCase().indexOf(" in ");
  if (inIndex === -1) return null;

  const keyword = query.substring(0, inIndex).trim();
  const locationText = query.substring(inIndex + 4).trim();
  if (!keyword || !locationText) return null;

  return { keyword, locationText };
}

/**
 * Sync heuristic for `"Colosseum Rome"` / `"Gardaland Lake Garda"`.
 * Area segment must match allowlist; validated again at geocode probe in UI.
 */
export function parseNameWithArea(query: string): NameWithAreaSplit | null {
  if (parseKeywordInLocation(query)) return null;

  const trimmed = query.trim();
  // Whole query is a known browse area — defer to location_browse, not name+area.
  if (isKnownArea(trimmed)) return null;

  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2) return null;

  if (tokens.length >= 3) {
    const areaTwo = tokens.slice(-2).join(" ");
    if (isKnownArea(areaTwo)) {
      const nameText = tokens.slice(0, -2).join(" ").trim();
      if (nameText) {
        return { nameText, areaText: areaTwo };
      }
    }
  }

  const areaOne = tokens[tokens.length - 1];
  if (isKnownArea(areaOne)) {
    const nameText = tokens.slice(0, -1).join(" ").trim();
    if (nameText) {
      return { nameText, areaText: areaOne };
    }
  }

  return null;
}

/** After geocode probe: city browse vs name-led text search. */
export function isLocationBrowseCandidate(query: string, probe: GeocodeProbe): boolean {
  if (parseKeywordInLocation(query)) return false;
  if (parseNameWithArea(query)) return false;

  const types = probe.placeTypes ?? [];
  const hasLocalityType = types.some((t) => LOCALITY_TYPES.has(t));

  const normalized = normalizeSearchText(query);
  const cityNorm = normalizeSearchText(probe.cityName);
  const matchedNorm = probe.matchedName ? normalizeSearchText(probe.matchedName) : "";
  const isAllowlistedArea = ITALY_CITY_ALLOWLIST.has(normalized);

  if (!hasLocalityType && !isAllowlistedArea) return false;

  return (
    normalized === cityNorm ||
    normalized === matchedNorm ||
    isAllowlistedArea
  );
}
