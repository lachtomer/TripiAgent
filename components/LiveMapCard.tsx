"use client";

import { useMemo } from "react";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import MapPreview from "@/components/MapPreview";

// Approximate bounding box for Lake Garda / Northern Italy region
const SVG_W = 390;
const SVG_H = 220;
const MAP_LNG_MIN = 10.4;
const MAP_LNG_MAX = 11.0;
const MAP_LAT_MIN = 45.3;
const MAP_LAT_MAX = 45.9;

function lngToX(lng: number): number {
  return ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * SVG_W;
}
function latToY(lat: number): number {
  // Invert Y axis (SVG top = high lat)
  return ((MAP_LAT_MAX - lat) / (MAP_LAT_MAX - MAP_LAT_MIN)) * SVG_H;
}

interface Props {
  className?: string;
}

export default function LiveMapCard({ className }: Props) {
  const isHydrated = useIsHydrated();
  const itinerary = useTripStore((s) => s.itinerary);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const tripStartDate = useTripStore((s) => s.tripStartDate);

  // Timezone-safe day calculation using Date.UTC (Fix #11)
  const todayDay = useMemo(() => {
    if (!tripStartDate || !itinerary) return null;
    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const [y, m, d] = tripStartDate.split("-").map(Number);
    const startUTC = Date.UTC(y, m - 1, d);
    const daysSinceStart = Math.floor((todayUTC - startUTC) / 86_400_000);
    const dayNumber = daysSinceStart + 1;
    return itinerary.find((day) => day.dayNumber === dayNumber) ?? null;
  }, [tripStartDate, itinerary]);

  // Fall back to MapPreview if no trip data
  if (!isHydrated || !tripStartDate || !itinerary || itinerary.length === 0) {
    return (
      <div data-testid="live-map-card" className={className}>
        <MapPreview />
      </div>
    );
  }

  const todayStops = todayDay?.activities ?? [];

  // Pins for today's stops (green) — only activities with coordinates
  const todayPins = todayStops.filter(
    (a) => typeof a.lat === "number" && typeof a.lng === "number"
  );

  // Pins for saved attractions (yellow/amber) with coords
  const bankPins = savedAttractions.filter(
    (a) => typeof a.lat === "number" && typeof a.lng === "number"
  );

  return (
    <div data-testid="live-map-card" className={className}>
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-full"
        aria-label="Live trip map"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width={SVG_W} height={SVG_H} fill="url(#mapBg)" />

        {/* Lake Garda decorative shape */}
        <ellipse cx={195} cy={105} rx={18} ry={52} fill="#1d4ed8" opacity={0.4} />

        {/* Saved attraction pins (amber ★) */}
        {bankPins.map((a) => {
          const x = lngToX(a.lng!);
          const y = latToY(a.lat!);
          if (x < 0 || x > SVG_W || y < 0 || y > SVG_H) return null;
          return (
            <text key={a.id} x={x} y={y} fontSize={14} textAnchor="middle" fill="#f59e0b">
              ★
            </text>
          );
        })}

        {/* Today's itinerary stops (green ●) */}
        {todayPins.map((a) => {
          const x = lngToX(a.lng!);
          const y = latToY(a.lat!);
          if (x < 0 || x > SVG_W || y < 0 || y > SVG_H) return null;
          return (
            <circle key={a.id} cx={x} cy={y} r={7} fill="#22c55e" opacity={0.9} stroke="#fff" strokeWidth={1.5} />
          );
        })}

        {/* Legend */}
        <g transform="translate(8, 8)">
          <rect width={120} height={36} rx={6} fill="#000" opacity={0.5} />
          <circle cx={14} cy={12} r={5} fill="#22c55e" />
          <text x={24} y={16} fontSize={9} fill="#fff" fontWeight="bold">Today&apos;s stops</text>
          <text x={14} y={28} fontSize={11} fill="#f59e0b" textAnchor="middle">★</text>
          <text x={24} y={30} fontSize={9} fill="#fff" fontWeight="bold">Saved places</text>
        </g>

        {/* Day label */}
        {todayDay && (
          <text x={SVG_W - 8} y={SVG_H - 8} textAnchor="end" fontSize={10} fill="#94a3b8" fontWeight="bold">
            Day {todayDay.dayNumber}
          </text>
        )}
      </svg>
    </div>
  );
}
