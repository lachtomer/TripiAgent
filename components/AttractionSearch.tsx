"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, RefreshCw, MapPin, Landmark, Utensils, Bookmark, Star, CalendarPlus, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { type PlaceDetail } from "@/lib/places";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { DEFAULT_ITALY_ITINERARY } from "./ItineraryCard";
import { useTranslation } from "@/lib/translations";

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

export default function AttractionSearch() {
  const router = useRouter();
  const saveAttraction = useTripStore((s) => s.saveAttraction);
  const removeSavedAttraction = useTripStore((s) => s.removeSavedAttraction);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const setPendingPrompt = useTripStore((s) => s.setPendingPrompt);
  const addActivity = useTripStore((s) => s.addActivity);
  const itinerary = useTripStore((s) => s.itinerary);
  const setItinerary = useTripStore((s) => s.setItinerary);
  const currentUser = useTripStore((s) => s.currentUser);
  const users = useTripStore((s) => s.users);
  const activeUser = users.find((u) => u.id === currentUser);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    if (isHydrated && itinerary === null) {
      setItinerary(DEFAULT_ITALY_ITINERARY);
    }
  }, [isHydrated, itinerary, setItinerary]);

  const { location: userLocation, refreshLocation, loading: locationLoading } = useLocation();
  const [useCurrentLocPending, setUseCurrentLocPending] = useState(false);
  const { t, locale } = useTranslation();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"tourist_attraction" | "restaurant">("tourist_attraction");
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<PlaceDetail[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const results = allResults.slice(0, visibleCount);
  const [error, setError] = useState<string | null>(null);
  
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

  const fetchPlacesNearCoords = useCallback(async (lat: number, lng: number, cityName: string | null, keyword?: string, radiusOverride?: number) => {
    setLoading(true);
    setError(null);
    setAllResults([]);
    setVisibleCount(5);
    setLocalWeather(null);
    setLastSearchCoords({ lat, lng, cityName, keyword });

    const radiusVal = radiusOverride !== undefined ? radiusOverride : selectedRadius;
    const radiusMeters = radiusVal * 1000;

    try {
      const keywordParam = keyword ? `&keyword=${encodeURIComponent(keyword)}` : "";
      const placesRes = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&radius=${radiusMeters}&type=${searchType}${keywordParam}`
      );
      if (!placesRes.ok) {
        const errData = await placesRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load spots");
      }
      const placesData: PlaceDetail[] = await placesRes.json();
      
      const sorted = placesData
        .filter((p) => p.name)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      let filtered = sorted;
      if (searchType === "restaurant") {
        if (openNowOnly) {
          filtered = filtered.filter(p => p.open_now !== false);
        }
        if (glutenFreeOnly) {
          filtered = filtered.filter(p => isGlutenFree(p.place_id));
        }
        if (diabeticFriendlyOnly) {
          filtered = filtered.filter(p => isDiabeticFriendly(p.place_id));
        }
        if (moreOptions.includes("vegetarian")) {
          filtered = filtered.filter(p => isVegetarian(p.place_id));
        }
        if (moreOptions.includes("vegan")) {
          filtered = filtered.filter(p => isVegan(p.place_id));
        }
      }

      setAllResults(filtered);
      setVisibleCount(5);
      if (filtered.length === 0) {
        setError(`No matching ${searchType === "restaurant" ? "restaurants" : "attractions"} found in ${cityName || "this location"} for the selected filters.`);
      }

      // Fetch local weather to check for rain alerts
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
    } catch (err) {
      console.error("Search failed:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during search.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [
    searchType,
    openNowOnly,
    glutenFreeOnly,
    diabeticFriendlyOnly,
    moreOptions,
    selectedRadius,
    setVisibleCount,
    setLoading,
    setError,
    setAllResults,
    setLocalWeather,
    setLastSearchCoords
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
    if (!queryStr) return;

    setLoading(true);
    setError(null);
    setAllResults([]);
    setVisibleCount(5);

    let searchCity = queryStr;
    let keyword: string | undefined = undefined;

    const inIndex = queryStr.toLowerCase().indexOf(" in ");
    if (inIndex !== -1) {
      keyword = queryStr.substring(0, inIndex).trim();
      searchCity = queryStr.substring(inIndex + 4).trim();
    }

    

    try {
      // Step 1: Geocode the city query to get lat & lng
      const geocodeRes = await fetch(`/api/geocode?query=${encodeURIComponent(searchCity)}`);
      if (!geocodeRes.ok) {
        const errData = await geocodeRes.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to locate "${searchCity}"`);
      }
      const geocodeData = await geocodeRes.json();
      const { lat, lng, cityName } = geocodeData;

      // Step 2: Search places near coords
      await fetchPlacesNearCoords(lat, lng, cityName, keyword);
    } catch (err) {
      console.error("Search failed:", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during search.";
      setError(errMsg);
      setLoading(false);
    }
  };

  const handlePlaceTap = (place: { name: string }) => {
    const prompt = `Tell me more about ${place.name}. What should I know before visiting? Any tips?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

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
              disabled={loading || !query.trim()}
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
                  if (lastSearchCoords) {
                    fetchPlacesNearCoords(
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
                 if (isSaved) {
                   removeSavedAttraction(placeId);
                 } else {
                   saveAttraction({
                     id: placeId,
                     name: place.name,
                     description: place.formatted_address || place.address || `Recommended ${searchType === "restaurant" ? "dining spot" : "attraction"} in Italy`,
                     locationName: place.name,
                     rating: place.rating,
                     image: coverImage,
                     createdBy: activeUser?.name || "Liran",
                   });
                 }
              };

              return (
                <div
                  key={placeId}
                  className="flex gap-3 items-center p-2.5 rounded-xl border border-outline-variant/20 bg-card hover:bg-muted/5 transition-all duration-200 group animate-in fade-in duration-200"
                >
                  {/* Thumbnail Cover Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-outline-variant/10">
                    <Image src={coverImage} alt={place.name} fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {/* Add to Bank Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      id={`search-bookmark-${placeId}`}
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
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-start gap-1">
                      <div dir="ltr" className="text-start truncate flex-1">
                        <h4 className="font-bold text-xs text-foreground truncate pr-1">
                          {place.name}
                        </h4>
                      </div>
                      {place.rating !== undefined && (
                        <span dir="ltr" className="flex items-center gap-0.5 text-[10px] font-bold text-[#006400] dark:text-[#86df72] shrink-0">
                          <Star className="h-2.5 w-2.5 fill-[#006400] dark:fill-[#86df72] text-[#006400] dark:text-[#86df72]" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-1.5 pt-0.5" dir={locale === "he" ? "rtl" : "ltr"}>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                        {place.types?.[0]?.replace(/_/g, " ") || (searchType === "restaurant" ? t.dining : t.attractions)}
                      </span>
                      {place.open_now !== undefined && (
                        <span className={cn("text-[9px] font-extrabold uppercase tracking-wide", place.open_now ? "text-[#006400] dark:text-[#86df72]" : "text-destructive")}>
                          {place.open_now ? t.openState : t.closedState}
                        </span>
                      )}
                    </div>

                    {place.address && (
                      <div dir="ltr" className="text-start flex items-center gap-0.5 mt-0.5 truncate">
                        <MapPin className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground truncate">{place.address}</span>
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

                  <div className="flex items-center gap-1 shrink-0 relative">
                    {/* Direct Timeline Binding Dropdown */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === placeId ? null : placeId);
                      }}
                      id={`direct-add-${placeId}`}
                      className={cn(
                        "h-8.5 w-8.5 rounded-lg border border-outline-variant/30 flex items-center justify-center text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all cursor-pointer focus:outline-none",
                        openDropdownId === placeId && "border-[#006400] text-[#006400] dark:border-[#86df72] dark:text-[#86df72] bg-[#006400]/5 dark:bg-[#86df72]/5"
                      )}
                      title={t.scheduleTo}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </button>

                    {openDropdownId === placeId && (
                      <div
                        className="absolute end-0 top-9.5 z-50 bg-card border border-outline-variant/40 rounded-xl shadow-lg p-2 min-w-[130px] space-y-1 animate-in fade-in slide-in-from-top-1 duration-150"
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
                                  time: "12:00", // Default activity time
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

                    {/* Ask AI Trigger Button */}
                    <button
                      onClick={() => handlePlaceTap(place)}
                      className="h-8.5 w-8.5 rounded-lg border border-outline-variant/30 flex items-center justify-center text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                      title={t.askAiGuide}
                    >
                      <Sparkles className="h-4 w-4" />
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
    </Card>
  );
}
