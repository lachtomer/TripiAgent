"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, RefreshCw, MapPin, Landmark, Utensils, Bookmark, Star, CalendarPlus, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { buildGoogleMapsUrl, type PlaceDetail } from "@/lib/places";
import PlaceNameLink from "@/components/PlaceNameLink";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { DEFAULT_ITALY_ITINERARY } from "./ItineraryCard";
import { useTranslation } from "@/lib/translations";
import type { SearchAnchor } from "@/lib/searchIntent";
import {
  parseKeywordInLocation,
  parseNameWithArea,
  isLocationBrowseCandidate,
} from "@/lib/searchIntent";

const LOCALITY_TYPES = new Set([
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "political",
]);

interface GeocodeProbeResult {
  lat: number;
  lng: number;
  cityName: string;
  placeTypes?: string[];
  matchedName?: string;
}

async function geocodeQuery(query: string): Promise<GeocodeProbeResult> {
  const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as { error?: string }).error || `Failed to locate "${query}"`);
  }
  return res.json() as Promise<GeocodeProbeResult>;
}

function probeLooksLikeLocality(probe: GeocodeProbeResult): boolean {
  return (probe.placeTypes ?? []).some((t) => LOCALITY_TYPES.has(t));
}

const PLACE_FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80", // Colosseum
  "https://images.unsplash.com/photo-1529260830199-445524b06d2d?auto=format&fit=crop&w=300&q=80", // Venice
  "https://images.unsplash.com/photo-1543489822-c49534f3271f?auto=format&fit=crop&w=300&q=80", // Florence
];

// Helper functions to simulate dietary availability deterministically
const isGlutenFree = (placeId: string) => {
  return placeId.charCodeAt(placeId.length - 1) % 2 === 0;
};
const isDiabeticFriendly = (placeId: string) => {
  return placeId.charCodeAt(placeId.length - 2) % 2 === 0;
};
const isVegetarian = (placeId: string) => {
  return placeId.charCodeAt(placeId.length - 3) % 2 === 0;
};
const isVegan = (placeId: string) => {
  return placeId.charCodeAt(placeId.length - 4) % 2 === 0;
};

export default function AttractionSearch({
  defaultQuery,
  headless,
  investigateMode,
  searchAnchor,
}: {
  defaultQuery?: string;
  headless?: boolean;
  investigateMode?: "target" | "around-me";
  searchAnchor?: SearchAnchor;
}) {
  const router = useRouter();
  const toggleSearchBookmark = useTripStore((s) => s.toggleSearchBookmark);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const setPendingPrompt = useTripStore((s) => s.setPendingPrompt);
  const addActivity = useTripStore((s) => s.addActivity);
  const itinerary = useTripStore((s) => s.itinerary);
  const setItinerary = useTripStore((s) => s.setItinerary);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (isHydrated && itinerary === null) {
      setItinerary(DEFAULT_ITALY_ITINERARY);
    }
  }, [isHydrated, itinerary, setItinerary]);

  const { location: userLocation, refreshLocation, loading: locationLoading } = useLocation();
  const [useCurrentLocPending, setUseCurrentLocPending] = useState(false);
  const { t } = useTranslation();

  const [query, setQuery] = useState(defaultQuery ?? "");
  const [searchType, setSearchType] = useState<"tourist_attraction" | "restaurant">("tourist_attraction");
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<PlaceDetail[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const results = allResults.slice(0, visibleCount);
  const [error, setError] = useState<string | null>(null);
  const [emptyHint, setEmptyHint] = useState<string | null>(null);
  
  // Custom states for precision search & direct itinerary binding
  const [localWeather, setLocalWeather] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  

  // Food Filter States
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);
  const [diabeticFriendlyOnly, setDiabeticFriendlyOnly] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [moreOptions, setMoreOptions] = useState<string[]>([]); // "vegetarian", "vegan"

  // Search Radius States
  const [selectedRadius, setSelectedRadius] = useState<number>(5); // Default is 5km
  const [lastSearchCoords, setLastSearchCoords] = useState<{ lat: number; lng: number; cityName: string | null; keyword?: string } | null>(null);
  const [lastSearchMode, setLastSearchMode] = useState<"nearby" | "text" | null>(null);
  const [lastTextQuery, setLastTextQuery] = useState<string | null>(null);

  const applyResultFilters = useCallback(
    (places: PlaceDetail[]) => {
      const sorted = places
        .filter((p) => p.name)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      if (searchType !== "restaurant") return sorted;

      let filtered = sorted;
      if (openNowOnly) filtered = filtered.filter((p) => p.open_now !== false);
      if (glutenFreeOnly) filtered = filtered.filter((p) => isGlutenFree(p.place_id));
      if (diabeticFriendlyOnly) filtered = filtered.filter((p) => isDiabeticFriendly(p.place_id));
      if (moreOptions.includes("vegetarian")) filtered = filtered.filter((p) => isVegetarian(p.place_id));
      if (moreOptions.includes("vegan")) filtered = filtered.filter((p) => isVegan(p.place_id));
      return filtered;
    },
    [searchType, openNowOnly, glutenFreeOnly, diabeticFriendlyOnly, moreOptions]
  );

  const fetchWeatherForCoords = useCallback(async (lat: number, lng: number) => {
    try {
      const weatherRes = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        if (weatherData?.condition) {
          setLocalWeather(weatherData.condition.toLowerCase());
        }
      }
    } catch (weatherErr) {
      console.warn("Could not fetch weather for search warning check:", weatherErr);
    }
  }, []);

  const fetchPlacesNearCoords = useCallback(async (
    lat: number,
    lng: number,
    cityName: string | null,
    keyword?: string,
    radiusOverride?: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setEmptyHint(null);
    setAllResults([]);
    setVisibleCount(5);
    setLocalWeather(null);
    setLastSearchCoords({ lat, lng, cityName, keyword });
    setLastSearchMode("nearby");
    setLastTextQuery(null);

    const radiusVal = radiusOverride !== undefined ? radiusOverride : selectedRadius;
    const radiusMeters = radiusVal * 1000;

    try {
      const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
      const placesRes = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&radius=${radiusMeters}&type=${searchType}${keywordParam}`
      );
      if (!placesRes.ok) {
        const errData = await placesRes.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Failed to load spots");
      }
      const placesData: PlaceDetail[] = await placesRes.json();
      const filtered = applyResultFilters(placesData);

      setAllResults(filtered);
      setVisibleCount(5);
      if (filtered.length === 0) {
        setEmptyHint(t.searchNoResultsHint);
        return false;
      }

      await fetchWeatherForCoords(lat, lng);
      return true;
    } catch (err) {
      console.error("Search failed:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during search.";
      setError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    searchType,
    selectedRadius,
    applyResultFilters,
    fetchWeatherForCoords,
    t.searchNoResultsHint,
  ]);

  const fetchPlacesByText = useCallback(async (
    textQuery: string,
    biasLat: number,
    biasLng: number,
    biasLabel: string | null,
    radiusOverride?: number,
    options?: { suppressEmptyHint?: boolean }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    if (!options?.suppressEmptyHint) setEmptyHint(null);
    setAllResults([]);
    setVisibleCount(5);
    setLocalWeather(null);
    setLastSearchCoords({ lat: biasLat, lng: biasLng, cityName: biasLabel });
    setLastSearchMode("text");
    setLastTextQuery(textQuery);

    const radiusVal = radiusOverride !== undefined ? radiusOverride : selectedRadius;
    const radiusMeters = radiusVal * 1000;

    try {
      const params = new URLSearchParams({
        q: textQuery,
        lat: String(biasLat),
        lng: String(biasLng),
        radius: String(radiusMeters),
        type: searchType,
      });
      const placesRes = await fetch(`/api/places/text?${params.toString()}`);

      if (placesRes.status === 404) {
        if (!options?.suppressEmptyHint) setEmptyHint(t.searchNoResultsHint);
        return false;
      }
      if (!placesRes.ok) {
        const errData = await placesRes.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error || "Failed to load places by name");
      }

      const placesData: PlaceDetail[] = await placesRes.json();
      const filtered = applyResultFilters(placesData);

      setAllResults(filtered);
      setVisibleCount(5);
      if (filtered.length === 0) {
        if (!options?.suppressEmptyHint) setEmptyHint(t.searchNoResultsHint);
        return false;
      }

      await fetchWeatherForCoords(biasLat, biasLng);
      return true;
    } catch (err) {
      console.error("Text search failed:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during search.";
      setError(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [
    searchType,
    selectedRadius,
    applyResultFilters,
    fetchWeatherForCoords,
    t.searchNoResultsHint,
  ]);

  useEffect(() => {
    if (useCurrentLocPending && userLocation.coords) {
      const coords = userLocation.coords;
      const timer = setTimeout(() => {
        setUseCurrentLocPending(false);
        const name = userLocation.cityName || "Current Location";
        setQuery(name);
  
        fetchPlacesNearCoords(
          coords.latitude,
          coords.longitude,
          name
        );
      }, 0);
      return () => clearTimeout(timer);
    } else if (useCurrentLocPending && userLocation.permissionState === "denied") {
      const timer = setTimeout(() => {
        setUseCurrentLocPending(false);
        setError("Location permission denied. Please search by city name.");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [useCurrentLocPending, userLocation, fetchPlacesNearCoords]);

  const handleUseCurrentLocation = () => {

    if (userLocation.coords) {
      const name = userLocation.cityName || "Current Location";
      setQuery(name);
      fetchPlacesNearCoords(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        name
      );
    } else {
      setUseCurrentLocPending(true);
      refreshLocation();
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryStr = query.trim();
    if (queryStr.length < 3) return;

    if (investigateMode === "around-me" && searchAnchor && !searchAnchor.ready) {
      setError("Location permission denied. Please search by city name.");
      return;
    }

    setError(null);
    setEmptyHint(null);

    const keywordSplit = parseKeywordInLocation(queryStr);
    if (keywordSplit) {
      try {
        const geocodeData = await geocodeQuery(keywordSplit.locationText);
        await fetchPlacesNearCoords(
          geocodeData.lat,
          geocodeData.lng,
          geocodeData.cityName,
          keywordSplit.keyword
        );
      } catch (err) {
        console.error("Search failed:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during search.");
        setLoading(false);
      }
      return;
    }

    const nameAreaSplit = parseNameWithArea(queryStr);
    let textQuery = queryStr;
    let biasLat = searchAnchor?.lat ?? 0;
    let biasLng = searchAnchor?.lng ?? 0;
    let biasLabel = searchAnchor?.label ?? null;

    try {
      if (nameAreaSplit) {
        textQuery = nameAreaSplit.nameText;
        const areaProbe = await geocodeQuery(nameAreaSplit.areaText);
        biasLat = areaProbe.lat;
        biasLng = areaProbe.lng;
        biasLabel = areaProbe.cityName;
        await fetchPlacesByText(textQuery, biasLat, biasLng, biasLabel);
        return;
      }

      const probe = await geocodeQuery(queryStr);

      if (isLocationBrowseCandidate(queryStr, probe)) {
        await fetchPlacesNearCoords(probe.lat, probe.lng, probe.cityName);
        return;
      }

      if (searchAnchor && !searchAnchor.ready) {
        setError("Location permission denied. Please search by city name.");
        return;
      }

      const textFound = await fetchPlacesByText(
        textQuery,
        biasLat,
        biasLng,
        biasLabel,
        undefined,
        { suppressEmptyHint: searchType === "restaurant" && probeLooksLikeLocality(probe) }
      );

      if (!textFound && searchType === "restaurant" && probeLooksLikeLocality(probe)) {
        await fetchPlacesNearCoords(probe.lat, probe.lng, probe.cityName);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during search.");
      setLoading(false);
    }
  };

  const searchExamples = [
    { key: "gardaland", value: t.searchExampleGardaland },
    { key: "verona", value: t.searchExampleVerona },
    { key: "pizzaInMilan", value: t.searchExamplePizzaInMilan },
  ];

  const handlePlaceTap = (place: { name: string }) => {
    const prompt = `Tell me more about ${place.name}. What should I know before visiting? Any tips?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  const anchorBlocksSearch = searchAnchor != null && !searchAnchor.ready;
  const queryTooShort = query.trim().length > 0 && query.trim().length < 3;

  const content = (
    <CardContent className="p-4 space-y-4">
        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="attraction-search-input"
                type="text"
                dir="auto"
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9.5 pe-8 ps-3 text-xs sm:text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-[#006400] w-full"
                data-testid="search-input"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={loading || locationLoading}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-[#006400] dark:hover:text-[#86df72] transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
                title="Use current location"
              >
                {locationLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <Button
              id="attraction-search-btn"
              type="submit"
              disabled={loading || query.trim().length < 3 || anchorBlocksSearch}
              size="sm"
              className="h-9.5 bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 px-4 gap-1.5 shrink-0 rounded-xl"
              data-testid="search-button"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {t.searchBtn}
            </Button>
          </div>

          <p
            data-testid="search-helper-hint"
            className="text-[10px] text-muted-foreground leading-snug px-0.5"
          >
            {t.searchHelperHint}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {searchExamples.map(({ key, value }) => (
              <button
                key={key}
                type="button"
                data-testid="search-example-chip"
                onClick={() => setQuery(value)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold border border-outline-variant/30 bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {value}
              </button>
            ))}
          </div>

          {queryTooShort && (
            <p className="text-[10px] text-muted-foreground px-0.5">Enter at least 3 characters to search.</p>
          )}

          {/* Search Category Toggle Chips */}
          <div className="flex gap-2 justify-start items-center pt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase me-1 shrink-0">{t.typeLabel}</span>
            
            <button
              type="button"
              onClick={() => {
                setSearchType("tourist_attraction");
                setAllResults([]);
                setVisibleCount(5);
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                searchType === "tourist_attraction"
                  ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                  : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted/50"
              )}
            >
              <Landmark className="h-3.5 w-3.5" />
              {t.attractions}
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchType("restaurant");
                setAllResults([]);
                setVisibleCount(5);
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                searchType === "restaurant"
                  ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                  : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted/50"
              )}
            >
              <Utensils className="h-3.5 w-3.5" />
              {t.dining}
            </button>
          </div>

          {/* Search Radius Selection */}
          <div className="flex gap-2 justify-start items-center pt-0.5 mt-1 select-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase me-1 shrink-0">Radius:</span>
            {[1, 5, 10, 50].map((r) => (
              <button
                key={r}
                type="button"
                id={`search-radius-${r}km`}
                onClick={() => {
                  setSelectedRadius(r);
                  if (lastSearchMode === "text" && lastTextQuery && lastSearchCoords) {
                    void fetchPlacesByText(
                      lastTextQuery,
                      lastSearchCoords.lat,
                      lastSearchCoords.lng,
                      lastSearchCoords.cityName,
                      r
                    );
                  } else if (lastSearchCoords) {
                    void fetchPlacesNearCoords(
                      lastSearchCoords.lat,
                      lastSearchCoords.lng,
                      lastSearchCoords.cityName,
                      lastSearchCoords.keyword,
                      r
                    );
                  }
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none",
                  selectedRadius === r
                    ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                    : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                )}
              >
                {r} KM
              </button>
            ))}
          </div>

          {/* Food Filters (rendered only when searchType is restaurant) */}
          {searchType === "restaurant" && (
            <div className="space-y-2 pt-2 border-t border-outline-variant/10 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{t.foodOptions}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOpenNowOnly(!openNowOnly)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none",
                    openNowOnly
                      ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                      : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                  )}
                >
                  {t.openNow}
                </button>
                <button
                  type="button"
                  onClick={() => setGlutenFreeOnly(!glutenFreeOnly)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none",
                    glutenFreeOnly
                      ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                      : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                  )}
                >
                  {t.glutenFree}
                </button>
                <button
                  type="button"
                  onClick={() => setDiabeticFriendlyOnly(!diabeticFriendlyOnly)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none",
                    diabeticFriendlyOnly
                      ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                      : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                  )}
                >
                  {t.diabeticFriendly}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none",
                    showMoreOptions || moreOptions.length > 0
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/30"
                      : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                  )}
                >
                  {showMoreOptions ? t.lessOptionsBtn : t.moreOptionsBtn}
                </button>
              </div>

              {showMoreOptions && (
                <div className="flex gap-2 p-2 bg-muted/20 border border-outline-variant/20 rounded-xl animate-in slide-in-from-top-1 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOptions((prev) =>
                        prev.includes("vegetarian")
                          ? prev.filter((o) => o !== "vegetarian")
                          : [...prev, "vegetarian"]
                      );
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer",
                      moreOptions.includes("vegetarian")
                        ? "bg-[#006400]/15 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/20 dark:text-[#86df72]"
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {t.vegetarian}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOptions((prev) =>
                        prev.includes("vegan")
                          ? prev.filter((o) => o !== "vegan")
                          : [...prev, "vegan"]
                      );
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer",
                      moreOptions.includes("vegan")
                        ? "bg-[#006400]/15 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/20 dark:text-[#86df72]"
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {t.vegan}
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-center font-medium">
            {error}
          </p>
        )}

        {emptyHint && !loading && !error && (
          <p
            data-testid="search-empty-hint"
            className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 text-center font-medium"
          >
            {emptyHint}
          </p>
        )}

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 items-center p-2.5 rounded-xl border border-outline-variant/20 bg-muted/10 animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-muted skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted skeleton rounded w-2/3" />
                  <div className="h-3 bg-muted skeleton rounded w-1/3" />
                </div>
              </div>
            ))
          ) : (
            results.map((place, idx) => {
              const placeId = place.place_id;
              const isSaved = savedAttractions.some((a) => a.id === placeId);
              const coverImage = PLACE_FALLBACK_PHOTOS[idx % PLACE_FALLBACK_PHOTOS.length];

              const handleBookmarkToggle = (e: React.MouseEvent) => {
                e.stopPropagation();
                toggleSearchBookmark({
                  id: placeId,
                  name: place.name,
                  description: place.formatted_address || place.address || `Recommended ${searchType === "restaurant" ? "dining spot" : "attraction"} in Italy`,
                  locationName: place.name,
                  lat: lastSearchCoords?.lat,
                  lng: lastSearchCoords?.lng,
                  rating: place.rating,
                  image: coverImage,
                  website_url: place.website_url,
                  maps_url: place.maps_url ?? buildGoogleMapsUrl(placeId),
                  upvotes: [],
                  downvotes: [],
                });
              };

              return (
                <div
                  key={placeId}
                  className="flex flex-col gap-2 p-2.5 rounded-xl border border-outline-variant/20 bg-card hover:bg-muted/5 transition-all duration-200 group animate-in fade-in duration-200"
                >
                  {/* Row 1: thumbnail + full-width text */}
                  <div className="flex gap-3 items-start min-w-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-outline-variant/10">
                      <Image src={coverImage} alt={place.name} fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button
                        onClick={handleBookmarkToggle}
                        id={`search-bookmark-${placeId}`}
                        aria-label={isSaved ? `Remove ${place.name}` : `Bookmark ${place.name}`}
                        className="absolute top-0.5 start-0.5 bg-white/95 dark:bg-zinc-900/90 text-foreground p-1.5 rounded-lg border border-outline-variant/20 flex items-center justify-center shadow-sm cursor-pointer z-10 hover:scale-105 active:scale-95 transition-all"
                        title={isSaved ? t.removeFromSaved : t.saveToBank}
                      >
                        <Bookmark
                          className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            isSaved
                              ? "fill-[#006400] text-[#006400] dark:fill-[#86df72] dark:text-[#86df72]"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                      {place.rating !== undefined && (
                        <span
                          dir="ltr"
                          className="absolute bottom-0.5 end-0.5 bg-white/90 dark:bg-[#181d16]/95 backdrop-blur-sm px-1 py-0.5 rounded text-[10px] font-bold text-[#006400] dark:text-[#86df72] border border-outline-variant/30 flex items-center gap-0.5 shadow-sm"
                        >
                          <Star className="h-2 w-2 fill-[#006400] dark:fill-[#86df72] text-[#006400] dark:text-[#86df72]" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                      <PlaceNameLink
                        placeId={placeId}
                        name={place.name}
                        websiteUrl={place.website_url}
                        mapsUrl={place.maps_url}
                        variant="search"
                      />

                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5" dir="ltr">
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {place.types?.[0]?.replace(/_/g, " ") || (searchType === "restaurant" ? t.dining : t.attractions)}
                        </span>
                        {place.open_now !== undefined && (
                          <>
                            <span className="text-muted-foreground/50 text-xs" aria-hidden="true">·</span>
                            <span className={cn("text-xs font-extrabold uppercase tracking-wide shrink-0", place.open_now ? "text-[#006400] dark:text-[#86df72]" : "text-destructive")}>
                              {place.open_now ? t.openState : t.closedState}
                            </span>
                          </>
                        )}
                      </div>

                      {place.address && (
                        <div dir="ltr" className="text-start flex items-start gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                          <span className="text-xs text-muted-foreground leading-snug line-clamp-2">{place.address}</span>
                        </div>
                      )}

                    {/* Active trip warning badges */}
                    {(() => {
                      const addressStr = (place.address || place.formatted_address || "").toLowerCase();
                      const isPlaceInMilan = addressStr.includes("milan") || addressStr.includes("milano");
                      const isOutdoorPlace = searchType === "tourist_attraction";
                      const isRainy = localWeather?.includes("rain") || localWeather?.includes("drizzle") || localWeather?.includes("shower");

                      if (isPlaceInMilan || (isOutdoorPlace && isRainy)) {
                        return (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {isPlaceInMilan && (
                              <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                                ⚠️ ZTL Area C
                              </span>
                            )}
                            {isOutdoorPlace && isRainy && (
                              <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-destructive/10 text-destructive border border-destructive/15">
                                🌧️ Rain Alert
                              </span>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Food option tags */}
                    {searchType === "restaurant" && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {isGlutenFree(placeId) && (
                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
                            {t.glutenFree}
                          </span>
                        )}
                        {isDiabeticFriendly(placeId) && (
                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15">
                            {t.diabeticFriendly}
                          </span>
                        )}
                        {isVegetarian(placeId) && (
                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
                            {t.vegetarian}
                          </span>
                        )}
                        {isVegan(placeId) && (
                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15">
                            {t.vegan}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  </div>

                  {/* Row 2: actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/10 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === placeId ? null : placeId);
                      }}
                      id={`direct-add-${placeId}`}
                      className={cn(
                        "h-9 flex-1 max-w-[50%] rounded-lg border border-outline-variant/30 flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all cursor-pointer focus:outline-none",
                        openDropdownId === placeId && "border-[#006400] text-[#006400] dark:border-[#86df72] dark:text-[#86df72] bg-[#006400]/5 dark:bg-[#86df72]/5"
                      )}
                      title={t.scheduleTo}
                    >
                      <CalendarPlus className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t.scheduleTo}</span>
                    </button>

                    {openDropdownId === placeId && (
                      <div
                        className="absolute end-0 bottom-10 z-50 bg-card border border-outline-variant/40 rounded-xl shadow-lg p-2 min-w-[130px] space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[9px] font-extrabold text-muted-foreground px-2 py-0.5 uppercase tracking-wide">{t.scheduleTo}</p>
                        <div className="max-h-[140px] overflow-y-auto pr-1">
                          {itinerary && itinerary.map((day) => (
                            <button
                              key={day.dayNumber}
                              id={`direct-add-day-${day.dayNumber}-${placeId}`}
                              onClick={() => {
                                addActivity(day.dayNumber, {
                                  time: "12:00",
                                  title: place.name,
                                  description: place.formatted_address || place.address || `Recommended spot in Italy`,
                                  locationName: place.name,
                                });
                                useTripStore.getState().setToast({
                                  message: t.addedToDay.replace("{name}", place.name).replace("{day}", day.dayNumber.toString()),
                                  type: "success",
                                });
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-start text-[11px] font-bold px-2 py-1.5 rounded-lg hover:bg-[#006400]/10 hover:text-[#006400] dark:hover:bg-[#86df72]/15 dark:hover:text-[#86df72] transition-colors cursor-pointer text-foreground"
                            >
                              Day {day.dayNumber}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handlePlaceTap(place)}
                      className="h-9 flex-1 max-w-[50%] rounded-lg border border-outline-variant/30 flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title={t.askAiGuide}
                    >
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t.askAiGuide}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {allResults.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((prev) => Math.min(prev + 5, allResults.length))}
              id="show-more-results-btn"
              className="w-full mt-2 py-2.5 px-4 border border-outline-variant/30 hover:border-outline-variant rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#006400] dark:text-[#86df72] bg-muted/5 hover:bg-muted/15 transition-all active:scale-[0.99] cursor-pointer focus:outline-none"
            >
              <ChevronDown className="h-4 w-4 shrink-0" />
              <span>
                {t.showMoreResults}
              </span>
              <span className="text-[10px] font-medium opacity-70">
                ({t.showingCount.replace("{visible}", visibleCount.toString()).replace("{total}", allResults.length.toString())})
              </span>
            </button>
          )}
        </div>
    </CardContent>
  );

  if (headless) {
    return <div className="p-4 space-y-4">{content.props.children}</div>;
  }

  return (
    <Card className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20">
        <CardTitle className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 text-foreground">
          <Search className="h-4.5 w-4.5 text-[#006400] dark:text-[#86df72]" />
          {t.searchTitle}
        </CardTitle>
        <CardDescription className="text-[11px]">
          {t.searchDescription}
        </CardDescription>
      </CardHeader>
      {content}
    </Card>
  );
}
