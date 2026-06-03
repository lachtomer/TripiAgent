"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import Image from "next/image";
import { buildGoogleMapsUrl } from "@/lib/places";
import type { PlaceDetail } from "@/lib/places";
import { useTranslation } from "@/lib/translations";
import PlaceNameLink from "@/components/PlaceNameLink";

const PLACE_COVER_PHOTOS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAiB8CHimE3CmDarZ9rOmpp9XxARrPcXOAvgPyoQSMR6KTQRd2ns20hpw1uK4BXCqe5LC4xK2Y4zKEJQwj1iThdXRw0r7WPM-khHj7Bv1FNPFvs9ZQTlzCFG22V2vGOHn4aUsq2hFYYyRXD7Y0wQ1sqfmxFGfPz8CE0CadhHnxaJHFW6lRzyLakACJYPqPCj2oZ11RzLWTb-1ijGAY-2QOcnd6nMIWuQ8-W2UuNaB25iQ-MqfFPeaZdb_3BflsAqZYaiIETxjMcLzS1",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqTDh6JdnHDLJOaJFniUH11g9-z2nE0X4rvMyh9HxQJNJP4-IMrp7EAXMgWpiH_TA6p-UHOYjZgHuX7byzBkmZh03ry02zNGKtkG3BgCtBKqsXJy6tdKYqDsrmAS-rEDZ25CIPYVPJvCMBCm-efB3MoUXvm2sqR4tuQuYkqu_06LJp7GInzFb5bKSme39kwOQwUpJRCphkXbRL72wKWa9a7nksp4mtZf9Atiak8HFPx66WCvoPGf_RQPYxif0kAMmyNX5WIEWJ2oNo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6iXbPX1PKwEz4d0sNbGxz6ch-IWmESbPPkx8JIfVT4Bb0Iz0_4M7kE50D__NPnp8tx0L8eSeOKBsPeSs51-_Eeoki_vwNPJwEerYfSs-aZocRO5rGvbCKTu5tmsSS06TcnzLKuwsye0E0ymDUtUFsT3DoEp6pZJyz_qHqWMXaShP_SMCMOaeIjpocnRsM7vf0sCVypt33xf5OWFnCPk8AdCjBmMsyZSrDTefG_KB-CG-76gMSKlLbOjX_tYPqLS8YjLWDYUasXTAm",
];

const MOCK_PICKS: PlaceDetail[] = [
  {
    place_id: "place1",
    name: "Colosseum",
    rating: 4.9,
    distance: 800,
    open_now: true,
    image: PLACE_COVER_PHOTOS[0],
    maps_url: buildGoogleMapsUrl("place1"),
  },
  {
    place_id: "place2",
    name: "Pantheon",
    rating: 4.8,
    distance: 1200,
    open_now: true,
    image: PLACE_COVER_PHOTOS[1],
    maps_url: buildGoogleMapsUrl("place2"),
  },
  {
    place_id: "place3",
    name: "Trastevere",
    rating: 4.7,
    distance: 2500,
    open_now: true,
    image: PLACE_COVER_PHOTOS[2],
    maps_url: buildGoogleMapsUrl("place3"),
  },
];

const MOCK_DISCOVER_MORE: PlaceDetail[] = [
  {
    place_id: "place4",
    name: "Trevi Fountain",
    rating: 4.8,
    distance: 1500,
    open_now: true,
    image: PLACE_COVER_PHOTOS[0],
    types: ["tourist_attraction"],
    maps_url: buildGoogleMapsUrl("place4"),
    description: "Iconic 18th-century sculpted fountain where tourists throw coins.",
  },
  {
    place_id: "place5",
    name: "Piazza Navona",
    rating: 4.7,
    distance: 1800,
    open_now: true,
    image: PLACE_COVER_PHOTOS[1],
    types: ["tourist_attraction"],
    maps_url: buildGoogleMapsUrl("place5"),
    description: "Elegant square with fountains, outdoor cafes, street artists, and Baroque architecture.",
  },
  {
    place_id: "place6",
    name: "Vatican Museums",
    rating: 4.9,
    distance: 2900,
    open_now: false,
    image: PLACE_COVER_PHOTOS[2],
    types: ["museum"],
    maps_url: buildGoogleMapsUrl("place6"),
    description: "Renowned art museums displaying the immense collection amassed by Popes.",
  },
];

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

interface NearbyPlacesSectionProps {
  lat?: number;
  lng?: number;
}

export default function NearbyPlacesSection({ lat, lng }: NearbyPlacesSectionProps) {
  const router = useRouter();
  const setPendingPrompt = useTripStore((s) => s.setPendingPrompt);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const saveAttraction = useTripStore((s) => s.saveAttraction);
  const removeSavedAttraction = useTripStore((s) => s.removeSavedAttraction);
  const tripMode = useTripStore((s) => s.tripMode);
  const currentUser = useTripStore((s) => s.currentUser);
  const users = useTripStore((s) => s.users);
  const activeUser = users.find((u) => u.id === currentUser);
  const isPlanningMode = tripMode === "planning";
  const { t } = useTranslation();

  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeLat = isPlanningMode ? 45.6267 : lat;
    const activeLng = isPlanningMode ? 10.6133 : lng;

    if (activeLat === undefined || activeLng === undefined) {
      setTimeout(() => {
        setPlaces([]);
      }, 0);
      return;
    }

    let active = true;
    setTimeout(() => {
      if (active) {
        setLoading(true);
      }
    }, 0);

    fetch(`/api/places?lat=${activeLat}&lng=${activeLng}&radius=5000`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load nearby places");
        return r.json();
      })
      .then((data: PlaceDetail[]) => {
        if (active) {
          // If geocoding returns spots, filter/slice to top 6, otherwise use empty
          setPlaces(data.slice(0, 6));
        }
      })
      .catch((err: Error) => {
        console.error("Failed to load nearby places:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lng, isPlanningMode]);

  const handlePlaceTap = (place: { name: string }) => {
    const prompt = `Tell me more about ${place.name}. What should I know before visiting? Any tips?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  const handleViewAllClick = () => {
    const searchInput = document.getElementById("attraction-search-input");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  };

  // Decide if we display real API places or fallback Stitch mock items
  const activePlaces = places.length > 0 ? places : MOCK_PICKS;
  const topPicks = activePlaces.slice(0, 3);
  const discoverPlaces = places.length > 3 ? places.slice(3, 6) : MOCK_DISCOVER_MORE;

  return (
    <div className="space-y-6">
      {/* Top Picks Section Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-title-md text-foreground">
            {t.topPicks}
            <span className="sr-only">{t.nearbyHighlights}</span>
          </h3>
          <button
            onClick={handleViewAllClick}
            id="view-all-nearby"
            className="text-[#006400] dark:text-[#86df72] text-sm font-bold flex items-center gap-0.5 hover:underline focus:outline-none cursor-pointer"
          >
            {t.viewAll} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Horizontal Snap Scrolling Container */}
      <div className="flex gap-4 overflow-x-auto snap-x hide-scrollbar pb-3">
        {loading ? (
          // Stitch loading cards placeholder
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="min-w-[280px] snap-start bg-card border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm animate-pulse"
            >
              <div className="h-40 bg-muted/80 skeleton" />
              <div className="p-4 space-y-3.5">
                <div className="h-5 bg-muted/80 skeleton rounded w-2/3" />
                <div className="h-4 bg-muted/80 skeleton rounded w-1/2" />
                <div className="h-10 bg-muted/80 skeleton rounded-xl w-full" />
              </div>
            </div>
          ))
        ) : (
          topPicks.map((place, idx) => {
            const placeId = place.place_id;
            const distanceStr = place.distance !== undefined ? formatDistance(place.distance) : "";
            const coverImage = (place as { image?: string }).image || PLACE_COVER_PHOTOS[idx % PLACE_COVER_PHOTOS.length];

            const isSaved = savedAttractions.some((a) => a.id === placeId);
            const handleBookmarkToggle = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (isSaved) {
                removeSavedAttraction(placeId);
              } else {
                saveAttraction({
                  id: placeId,
                  name: place.name,
                  description: place.formatted_address || place.address || `Recommended spot in Italy`,
                  locationName: place.name,
                  lat,
                  lng,
                  rating: place.rating,
                  image: coverImage,
                  createdBy: activeUser?.name || "Liran",
                  website_url: place.website_url,
                  maps_url: place.maps_url ?? buildGoogleMapsUrl(placeId),
                });
              }
            };

            return (
              <div
                key={placeId}
                className="min-w-[280px] snap-start bg-card border border-outline-variant/30 hover:border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Hero Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={place.name}
                    fill
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <button
                    onClick={handleBookmarkToggle}
                    id={`bookmark-${placeId}`}
                    className="absolute top-3 start-3 bg-white/95 dark:bg-zinc-900/90 text-foreground hover:scale-105 active:scale-95 transition-all p-1.5 rounded-lg border border-outline-variant/30 flex items-center justify-center shadow-sm cursor-pointer z-10"
                    aria-label={isSaved ? `Remove ${place.name} from saved` : `Save ${place.name}`}
                  >
                    <Bookmark
                      className={`h-4 w-4 transition-colors ${
                        isSaved
                          ? "fill-[#006400] text-[#006400] dark:fill-[#86df72] dark:text-[#86df72]"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  {place.rating !== undefined && (
                    <span 
                      dir="ltr"
                      className="absolute top-3 end-3 bg-white/90 dark:bg-[#181d16]/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-[#006400] dark:text-[#86df72] border border-outline-variant/30 flex items-center gap-1 shadow-sm"
                    >
                      <Star className="h-3 w-3 fill-[#006400] dark:fill-[#86df72] text-[#006400] dark:text-[#86df72]" />
                      {place.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Card Content details */}
                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="text-start truncate flex-1 min-w-0">
                        <PlaceNameLink
                          placeId={placeId}
                          name={place.name}
                          websiteUrl={place.website_url}
                          mapsUrl={place.maps_url}
                          variant="md"
                          className="font-semibold text-[17px] leading-tight drop-shadow-sm"
                        />
                      </div>
                      {place.open_now !== undefined && (
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider mt-0.5 shrink-0 ${
                          place.open_now ? "text-[#006400] dark:text-[#86df72]" : "text-destructive dark:text-red-400"
                        }`}>
                          {place.open_now ? t.openNowState : t.closedState}
                        </span>
                      )}
                    </div>
                    
                    {distanceStr && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5" dir="ltr">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="flex gap-1" dir="ltr">
                          <span>{distanceStr}</span>
                          <span className="text-[10px]">{t.away}</span>
                        </span>
                      </p>
                    )}
                  </div>

                  <button
                    id={`place-card-${placeId}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceTap(place);
                    }}
                    className="w-full mt-4 py-2.5 bg-[#006400] dark:bg-[#86df72] hover:bg-[#004d00] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                    aria-label={`${t.askAiAboutPlace}: ${place.name}`}
                  >
                    <span>{t.exploreGuide}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Discover More Section */}
      <section className="mt-8 space-y-5">
        <h3 className="font-title-md text-foreground">{t.discoverMore}</h3>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center p-3 rounded-2xl border border-outline-variant/20 bg-card/60 shadow-sm animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-muted/80 skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4.5 bg-muted/80 skeleton rounded w-2/3" />
                  <div className="h-3.5 bg-muted/80 skeleton rounded w-full" />
                  <div className="h-3.5 bg-muted/80 skeleton rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            discoverPlaces.map((place, idx) => {
              const placeId = place.place_id;
              const distanceStr = place.distance !== undefined ? formatDistance(place.distance) : "";
              const coverImage = (place as { image?: string }).image || PLACE_COVER_PHOTOS[(idx + 3) % PLACE_COVER_PHOTOS.length];
              const isSaved = savedAttractions.some((a) => a.id === placeId);

              const handleBookmarkToggle = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (isSaved) {
                  removeSavedAttraction(placeId);
                } else {
                  saveAttraction({
                    id: placeId,
                    name: place.name,
                    description: place.formatted_address || place.description || place.address || `Recommended spot in Italy`,
                    locationName: place.name,
                    lat,
                    lng,
                    rating: place.rating,
                    image: coverImage,
                    createdBy: activeUser?.name || "Liran",
                    website_url: place.website_url,
                    maps_url: place.maps_url ?? buildGoogleMapsUrl(placeId),
                  });
                }
              };

              return (
                <div
                  key={placeId}
                  id={`discover-place-${placeId}`}
                  className="flex gap-4 items-center p-3 rounded-2xl border border-outline-variant/20 bg-card hover:bg-muted/10 shadow-sm transition-all duration-300 group hover:shadow-md"
                >
                  {/* Left Side: Thumbnail Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-muted">
                    <Image
                      src={coverImage}
                      alt={place.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={handleBookmarkToggle}
                      id={`discover-bookmark-${placeId}`}
                      className="absolute top-1 start-1 bg-white/95 dark:bg-zinc-900/90 text-foreground p-1.5 rounded-lg border border-outline-variant/20 flex items-center justify-center shadow-sm cursor-pointer z-10 hover:scale-105 active:scale-95 transition-all"
                      aria-label={isSaved ? `Remove ${place.name}` : `Save ${place.name}`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${
                          isSaved
                            ? "fill-[#006400] text-[#006400] dark:fill-[#86df72] dark:text-[#86df72]"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="text-start truncate flex-1 min-w-0">
                        <PlaceNameLink
                          placeId={placeId}
                          name={place.name}
                          websiteUrl={place.website_url}
                          mapsUrl={place.maps_url}
                          variant="md"
                        />
                      </div>
                      {place.rating !== undefined && (
                        <span dir="ltr" className="flex items-center gap-0.5 text-xs font-bold text-[#006400] dark:text-[#86df72] shrink-0">
                          <Star className="h-3 w-3 fill-[#006400] dark:fill-[#86df72] text-[#006400] dark:text-[#86df72]" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground" dir="ltr">
                      {distanceStr && (
                        <span className="flex gap-1" dir="ltr">
                          <span>{distanceStr}</span>
                          <span className="text-[10px]">{t.away}</span>
                        </span>
                      )}
                      {place.open_now !== undefined && (
                        <span className={place.open_now ? "text-[#006400] dark:text-[#86df72] font-medium" : "text-destructive font-medium"}>
                          {place.open_now ? t.openState : t.closedState}
                        </span>
                      )}
                    </div>

                    <div dir="ltr" className="text-start">
                      <p className="text-[11px] text-muted-foreground truncate pr-2">
                        {place.description || t.beautifulPlace}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id={`discover-ask-ai-${placeId}`}
                    onClick={() => handlePlaceTap(place)}
                    className="h-11 w-11 shrink-0 rounded-xl border border-outline-variant/30 flex items-center justify-center text-muted-foreground hover:text-[#006400] hover:border-[#006400]/30 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30 active:scale-95 transition-all cursor-pointer focus:outline-none"
                    aria-label={`${t.askAiAboutPlace}: ${place.name}`}
                    title={t.askAiGuide}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
