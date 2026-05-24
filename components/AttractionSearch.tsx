"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, MapPin, Bookmark, Sparkles, Utensils, Landmark, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { buildGoogleMapsUrl, type PlaceDetail } from "@/lib/places";
import { cn } from "@/lib/utils";

const PLACE_FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80", // Colosseum
  "https://images.unsplash.com/photo-1529260830199-445524b06d2d?auto=format&fit=crop&w=300&q=80", // Venice
  "https://images.unsplash.com/photo-1543489822-c49534f3271f?auto=format&fit=crop&w=300&q=80", // Florence
];

export default function AttractionSearch() {
  const router = useRouter();
  const saveAttraction = useTripStore((s) => s.saveAttraction);
  const removeSavedAttraction = useTripStore((s) => s.removeSavedAttraction);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const setPendingPrompt = useTripStore((s) => s.setPendingPrompt);

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"tourist_attraction" | "restaurant">("tourist_attraction");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceDetail[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPlace = query.trim();
    if (!targetPlace) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Step 1: Geocode the city query to get lat & lng
      const geocodeRes = await fetch(`/api/geocode?query=${encodeURIComponent(targetPlace)}`);
      if (!geocodeRes.ok) {
        const errData = await geocodeRes.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to locate "${targetPlace}"`);
      }
      const geocodeData = await geocodeRes.json();
      const { lat, lng, cityName } = geocodeData;

      // Step 2: Search Google Places near resolved coordinates
      const placesRes = await fetch(
        `/api/places?lat=${lat}&lng=${lng}&radius=2500&type=${searchType}`
      );
      if (!placesRes.ok) {
        const errData = await placesRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to load spots");
      }
      const placesData: PlaceDetail[] = await placesRes.json();
      
      // Filter out places without names and sort by rating if available
      const sorted = placesData
        .filter((p) => p.name)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));

      setResults(sorted.slice(0, 5));
      if (sorted.length === 0) {
        setError(`No ${searchType === "restaurant" ? "restaurants" : "attractions"} found in ${cityName}.`);
      }
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "An unexpected error occurred during search.");
    } finally {
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
          Explore & Search Italy
        </CardTitle>
        <CardDescription className="text-[11px]">
          Find attractions or restaurants in any city and add them to your bank
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <Input
              id="attraction-search-input"
              type="text"
              placeholder="Enter city (e.g. Verona, Venice, Florence)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9.5 text-xs sm:text-sm bg-muted/30 focus-visible:ring-1 focus-visible:ring-[#006400]"
            />
            <Button
              id="attraction-search-btn"
              type="submit"
              disabled={loading || !query.trim()}
              size="sm"
              className="h-9.5 bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 px-4 gap-1.5 shrink-0 rounded-xl"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Search Category Toggle Chips */}
          <div className="flex gap-2 justify-start items-center pt-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Type:</span>
            
            <button
              type="button"
              onClick={() => setSearchType("tourist_attraction")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                searchType === "tourist_attraction"
                  ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                  : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted/50"
              )}
            >
              <Landmark className="h-3.5 w-3.5" />
              Attractions
            </button>

            <button
              type="button"
              onClick={() => setSearchType("restaurant")}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                searchType === "restaurant"
                  ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                  : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted/50"
              )}
            >
              <Utensils className="h-3.5 w-3.5" />
              Dining
            </button>
          </div>
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
                    description: (place as any).formatted_address || (place as any).address || `Recommended ${searchType === "restaurant" ? "dining spot" : "attraction"} in Italy`,
                    locationName: place.name,
                    rating: place.rating,
                    image: coverImage,
                  });
                }
              };

              return (
                <div
                  key={placeId}
                  className="flex gap-3 items-center p-2.5 rounded-xl border border-outline-variant/20 bg-card hover:bg-muted/5 transition-all duration-200 group"
                >
                  {/* Thumbnail Cover Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-muted border border-outline-variant/10">
                    <img
                      src={coverImage}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Add to Bank Button */}
                    <button
                      onClick={handleBookmarkToggle}
                      id={`search-bookmark-${placeId}`}
                      className="absolute top-0.5 left-0.5 bg-white/95 dark:bg-zinc-900/90 text-foreground p-1 rounded-md border border-outline-variant/20 flex items-center justify-center shadow-sm cursor-pointer z-10 hover:scale-105 active:scale-95 transition-all"
                      title={isSaved ? "Remove from Saved" : "Save to Attraction Bank"}
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
                      <h4 className="font-bold text-xs text-foreground truncate pr-1">
                        {place.name}
                      </h4>
                      {place.rating !== undefined && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#006400] dark:text-[#86df72] shrink-0">
                          <Star className="h-2.5 w-2.5 fill-[#006400] dark:fill-[#86df72] text-[#006400] dark:text-[#86df72]" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-1.5 pt-0.5">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                        {place.types?.[0]?.replace(/_/g, " ") || (searchType === "restaurant" ? "dining" : "attraction")}
                      </span>
                      {place.open_now !== undefined && (
                        <span className={cn("text-[9px] font-extrabold uppercase tracking-wide", place.open_now ? "text-[#006400] dark:text-[#86df72]" : "text-destructive")}>
                          {place.open_now ? "Open" : "Closed"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ask AI Trigger Button */}
                  <button
                    onClick={() => handlePlaceTap(place)}
                    className="h-8.5 w-8.5 rounded-lg border border-outline-variant/30 flex items-center justify-center text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none"
                    title="Ask AI Guide"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
