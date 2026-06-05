"use client";

import { useState, useEffect, useMemo } from "react";
import { useTripStore } from "@/stores/tripStore";
import { useLocation } from "@/hooks/useLocation";
import { useTranslation } from "@/lib/translations";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AttractionSearch from "@/components/AttractionSearch";
import type { SearchAnchor } from "@/lib/searchIntent";
import { cn } from "@/lib/utils";

type InvestigateMode = "target" | "around-me";

export default function InvestigateSection() {
  const tripMode = useTripStore((s) => s.tripMode);
  const cityName = useTripStore((s) => s.location?.cityName);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const targetCity = savedAttractions[0]?.locationName ?? "Lake Garda";
  const { location: userLocation } = useLocation();
  const { t } = useTranslation();

  const [mode, setMode] = useState<InvestigateMode>(
    tripMode === "in-trip" ? "around-me" : "target"
  );

  const [geocodedTarget, setGeocodedTarget] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  const savedWithCoords = savedAttractions.find(
    (a) => a.lat != null && a.lng != null
  );

  useEffect(() => {
    if (mode !== "target" || savedWithCoords) {
      return;
    }

    let cancelled = false;
    const loadingTimer = setTimeout(() => {
      if (!cancelled) setGeocodeLoading(true);
    }, 0);

    fetch(`/api/geocode?query=${encodeURIComponent(targetCity)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("geocode failed");
        return res.json();
      })
      .then((data: { lat: number; lng: number; cityName?: string }) => {
        if (cancelled) return;
        setGeocodedTarget({
          lat: data.lat,
          lng: data.lng,
          label: data.cityName ?? targetCity,
        });
      })
      .catch(() => {
        if (!cancelled) setGeocodedTarget(null);
      })
      .finally(() => {
        if (!cancelled) setGeocodeLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
  }, [mode, savedWithCoords, targetCity]);

  const searchAnchor = useMemo((): SearchAnchor => {
    if (mode === "around-me") {
      const coords = userLocation.coords;
      if (coords) {
        return {
          lat: coords.latitude,
          lng: coords.longitude,
          label: userLocation.cityName ?? "Current Location",
          source: "gps",
          ready: true,
        };
      }
      return {
        lat: 0,
        lng: 0,
        label: userLocation.cityName ?? "Current Location",
        source: "gps",
        ready: false,
      };
    }

    if (savedWithCoords?.lat != null && savedWithCoords.lng != null) {
      return {
        lat: savedWithCoords.lat,
        lng: savedWithCoords.lng,
        label: savedWithCoords.locationName ?? targetCity,
        source: "target_saved",
        ready: true,
      };
    }

    if (geocodedTarget) {
      return {
        lat: geocodedTarget.lat,
        lng: geocodedTarget.lng,
        label: geocodedTarget.label,
        source: "target_geocoded",
        ready: true,
      };
    }

    return {
      lat: 0,
      lng: 0,
      label: targetCity,
      source: "target_geocoded",
      ready: false,
    };
  }, [mode, userLocation, savedWithCoords, geocodedTarget, targetCity]);

  const resolvedCity = mode === "around-me" ? (cityName ?? targetCity) : targetCity;
  const gpsDenied = mode === "around-me" && !cityName;
  const anchorLoading = mode === "target" && geocodeLoading && !savedWithCoords;

  return (
    <Card
      data-testid="investigate-section"
      className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden"
    >
      <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20 space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-extrabold tracking-tight text-foreground">
            Investigate
          </CardTitle>
          <p
            data-testid="investigate-search-hint"
            className="text-[10px] text-muted-foreground leading-snug"
          >
            {t.searchInvestigateHint}
          </p>
        </div>

        <div className="flex w-full rounded-full bg-muted/60 p-0.5 gap-0.5">
          {(["target", "around-me"] as const).map((m) => (
            <button
              key={m}
              data-testid={m === "target" ? "investigate-target-btn" : "investigate-aroundme-btn"}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none",
                mode === m
                  ? "bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "target" ? "Target" : "Nearby"}
            </button>
          ))}
        </div>

        {anchorLoading && (
          <p
            data-testid="search-anchor-loading"
            className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 text-center"
          >
            Preparing search area…
          </p>
        )}

        {gpsDenied && (
          <p className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 text-center">
            Enable location to search near you
          </p>
        )}
      </CardHeader>

      <AttractionSearch
        key={mode}
        defaultQuery={resolvedCity}
        headless
        investigateMode={mode}
        searchAnchor={searchAnchor}
      />
    </Card>
  );
}
