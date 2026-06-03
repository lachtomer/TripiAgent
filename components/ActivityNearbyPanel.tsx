"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Plus, UtensilsCrossed } from "lucide-react";
import type { Activity } from "@/types";
import { buildGoogleMapsUrl, type PlaceDetail } from "@/lib/places";
import PlaceNameLink from "@/components/PlaceNameLink";
import { resolveActivityCoordinates } from "@/lib/activityGeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { useTranslation } from "@/lib/translations";

interface ActivityNearbyPanelProps {
  activity: Activity;
  dayNumber: number;
  disabled?: boolean;
  onClose?: () => void;
}

type NearbyType = "tourist_attraction" | "restaurant";

export default function ActivityNearbyPanel({
  activity,
  dayNumber,
  disabled = false,
  onClose,
}: ActivityNearbyPanelProps) {
  const { t } = useTranslation();
  const itinerary = useTripStore((s) => s.itinerary);
  const updateActivity = useTripStore((s) => s.updateActivity);
  const addPlaceToItinerary = useTripStore((s) => s.addPlaceToItinerary);
  const saveAttraction = useTripStore((s) => s.saveAttraction);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const setToast = useTripStore((s) => s.setToast);
  const users = useTripStore((s) => s.users);
  const currentUser = useTripStore((s) => s.currentUser);
  const activeUser = users.find((u) => u.id === currentUser);

  const [searchType, setSearchType] = useState<NearbyType>("restaurant");
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const loadNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlaces([]);

    const coords = await resolveActivityCoordinates(activity);
    if (!coords) {
      setError(t.activityNearbyGeocodeFailed);
      setLoading(false);
      return;
    }

    setResolvedCoords(coords);
    if (activity.lat !== coords.lat || activity.lng !== coords.lng) {
      updateActivity(dayNumber, activity.id, { lat: coords.lat, lng: coords.lng });
    }

    try {
      const keywordParam = keyword.trim() ? `&keyword=${encodeURIComponent(keyword.trim())}` : "";
      const res = await fetch(
        `/api/places?lat=${coords.lat}&lng=${coords.lng}&type=${searchType}&radius=5000${keywordParam}`
      );
      if (!res.ok) {
        setError(t.activityNearbyLoadFailed);
        return;
      }
      const data = (await res.json()) as PlaceDetail[];
      const list = Array.isArray(data) ? data.slice(0, 8) : [];
      setPlaces(list);
      if (list.length === 0) {
        setError(t.activityNearbyNoResults);
      }
    } catch {
      setError(t.activityNearbyLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [activity, dayNumber, keyword, searchType, t, updateActivity]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadNearby();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when activity anchor or category changes
  }, [activity.id, searchType]);

  const dayOptions =
    itinerary?.map((d) => d.dayNumber) ??
    Array.from({ length: 10 }, (_, i) => i + 1);

  const handleAddToDay = (place: PlaceDetail, targetDay: number) => {
    addPlaceToItinerary(targetDay, {
      time: "12:00",
      title: place.name,
      description: place.formatted_address || place.address || `Near ${activity.title}`,
      locationName: place.name,
      lat: resolvedCoords?.lat,
      lng: resolvedCoords?.lng,
    });
    setToast({
      message: t.addedToDay.replace("{name}", place.name).replace("{day}", String(targetDay)),
      type: "success",
    });
  };

  const handleSaveToBank = (place: PlaceDetail) => {
    if (savedAttractions.some((a) => a.id === place.place_id)) return;
    saveAttraction({
      id: place.place_id,
      name: place.name,
      description: place.formatted_address || place.address,
      locationName: place.name,
      rating: place.rating,
      lat: resolvedCoords?.lat,
      lng: resolvedCoords?.lng,
      createdBy: activeUser?.name ?? "Traveler",
      website_url: place.website_url,
      maps_url: place.maps_url ?? buildGoogleMapsUrl(place.place_id),
    });
    setToast({ message: t.activityNearbySavedToBank.replace("{name}", place.name), type: "success" });
  };

  return (
    <div
      className="mt-3 rounded-xl border border-outline-variant/25 bg-muted/5 p-3 space-y-3 animate-in fade-in duration-200"
      data-testid={`activity-nearby-panel-${activity.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold text-[#006400] dark:text-[#86df72] uppercase tracking-wide">
          {t.activityNearbyTitle}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer min-h-12 px-2"
            aria-label={t.cancelBtn}
          >
            {t.cancelBtn}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={searchType === "restaurant" ? "default" : "outline"}
          disabled={disabled || loading}
          onClick={() => setSearchType("restaurant")}
          className={`h-10 flex-1 text-xs font-bold cursor-pointer ${
            searchType === "restaurant" ? "bg-[#006400] hover:bg-[#004d00] text-white" : ""
          }`}
          data-testid={`activity-nearby-type-restaurant-${activity.id}`}
        >
          <UtensilsCrossed className="h-3.5 w-3.5 me-1" />
          {t.dining}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={searchType === "tourist_attraction" ? "default" : "outline"}
          disabled={disabled || loading}
          onClick={() => setSearchType("tourist_attraction")}
          className={`h-10 flex-1 text-xs font-bold cursor-pointer ${
            searchType === "tourist_attraction" ? "bg-[#006400] hover:bg-[#004d00] text-white" : ""
          }`}
          data-testid={`activity-nearby-type-attraction-${activity.id}`}
        >
          <MapPin className="h-3.5 w-3.5 me-1" />
          {t.attractions}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t.activityNearbyKeywordPlaceholder}
          disabled={disabled || loading}
          className="h-10 text-xs flex-1"
          data-testid={`activity-nearby-keyword-${activity.id}`}
        />
        <Button
          type="button"
          size="sm"
          disabled={disabled || loading}
          onClick={() => void loadNearby()}
          className="h-10 px-3 text-xs font-bold bg-[#006400] text-white hover:bg-[#004d00] cursor-pointer min-w-12"
          data-testid={`activity-nearby-refresh-${activity.id}`}
        >
          {t.searchBtn}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground" data-testid={`activity-nearby-loading-${activity.id}`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">{t.activityNearbyLoading}</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-destructive font-medium" data-testid={`activity-nearby-error-${activity.id}`}>
          {error}
        </p>
      )}

      {!loading && places.length > 0 && (
        <ul className="space-y-2 max-h-[200px] overflow-y-auto" data-testid={`activity-nearby-results-${activity.id}`}>
          {places.map((place) => (
            <li
              key={place.place_id}
              className="flex flex-col gap-2 p-2.5 rounded-lg border border-outline-variant/20 bg-card"
              data-testid={`activity-nearby-result-${place.place_id}`}
            >
              <div>
                <PlaceNameLink
                  placeId={place.place_id}
                  name={place.name}
                  websiteUrl={place.website_url}
                  mapsUrl={place.maps_url}
                />
                {(place.formatted_address || place.address) && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{place.formatted_address || place.address}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <select
                  defaultValue={String(dayNumber)}
                  disabled={disabled}
                  className="h-9 text-[10px] font-bold rounded-lg border border-outline-variant/30 bg-background px-2 flex-1 min-w-0"
                  aria-label={t.scheduleTo}
                  data-testid={`activity-nearby-day-select-${place.place_id}`}
                  id={`activity-nearby-day-${place.place_id}`}
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  className="h-9 text-[10px] font-bold bg-[#006400] text-white hover:bg-[#004d00] cursor-pointer shrink-0"
                  data-testid={`activity-nearby-add-${place.place_id}`}
                  onClick={() => {
                    const select = document.getElementById(
                      `activity-nearby-day-${place.place_id}`
                    ) as HTMLSelectElement | null;
                    const targetDay = select ? parseInt(select.value, 10) : dayNumber;
                    handleAddToDay(place, targetDay);
                  }}
                >
                  <Plus className="h-3 w-3 me-0.5" />
                  {t.addBtn}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disabled || savedAttractions.some((a) => a.id === place.place_id)}
                  className="h-9 text-[10px] font-bold cursor-pointer shrink-0"
                  data-testid={`activity-nearby-save-bank-${place.place_id}`}
                  onClick={() => handleSaveToBank(place)}
                >
                  {t.saveToBank}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
