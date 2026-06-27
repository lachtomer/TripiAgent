"use client";

import { useTripStore } from "@/stores/tripStore";
import LocationPermissionBanner from "@/components/LocationPermissionBanner";
import CopilotCards from "@/components/CopilotCards";
import TodayPlanner from "@/components/TodayPlanner";
import MapPreview from "@/components/MapPreview";
import InvestigateSection from "@/components/InvestigateSection";

export default function Home() {
  const tripMode = useTripStore((s) => s.tripMode);
  const toggleTripMode = useTripStore((s) => s.toggleTripMode);

  return (
    <div className="flex flex-col flex-1 pb-16">
      <h1 className="sr-only">Explore Italy</h1>
      <p className="sr-only">Your intelligent travel assistant</p>

      {/* 1. Mode switcher — planning only; in-trip shows locked label */}
      <div className="px-4 pt-4 flex justify-center shrink-0">
        {tripMode === "planning" ? (
          <div
            data-testid="trip-mode-switcher"
            className="bg-muted/80 dark:bg-zinc-800/80 backdrop-blur-md p-1 rounded-full flex gap-1 border border-outline-variant/20 shadow-sm"
          >
            <button
              onClick={() => toggleTripMode()}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm"
            >
              Planning (At Home)
            </button>
            <button
              onClick={() => toggleTripMode()}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none text-muted-foreground hover:text-foreground"
            >
              In-Trip (Traveling)
            </button>
          </div>
        ) : (
          <div
            data-testid="in-trip-badge"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm border border-outline-variant/20"
          >
            In-Trip (Traveling)
          </div>
        )}
      </div>

      {/* 2. Active Route Map */}
      <div className="px-4 pt-3" data-testid="active-route-map">
        <MapPreview />
      </div>

      {/* 3. In-trip only: Location banner + Copilot + Today Planner */}
      {tripMode === "in-trip" && <LocationPermissionBanner />}
      {tripMode === "in-trip" && (
        <div className="px-4 pt-3 space-y-4">
          <CopilotCards />
          <TodayPlanner />
        </div>
      )}

      {/* 4. Investigate Section */}
      <div className="px-4 pt-4 pb-2">
        <InvestigateSection key={tripMode} />
      </div>
    </div>
  );
}
