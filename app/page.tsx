"use client";

import dynamic from "next/dynamic";
import { useLocation } from "@/hooks/useLocation";
import { useTripStore } from "@/stores/tripStore";
import LocationPermissionBanner from "@/components/LocationPermissionBanner";
import LocationCard from "@/components/LocationCard";
import CopilotCards from "@/components/CopilotCards";
import TodayPlanner from "@/components/TodayPlanner";
import AttractionSearch from "@/components/AttractionSearch";

const NearbyPlacesSection = dynamic(
  () => import("@/components/NearbyPlacesSection"),
  { ssr: false }
);

export default function Home() {
  const { location } = useLocation();
  const tripMode = useTripStore((s) => s.tripMode);
  const toggleTripMode = useTripStore((s) => s.toggleTripMode);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Geolocation Banner — hides itself once granted or city is set, only in-trip */}
      {tripMode === "in-trip" && <LocationPermissionBanner />}

      {/* Dynamic Mode Switcher Bar */}
      <div className="px-4 pt-4 flex justify-center shrink-0">
        <div className="bg-muted/80 dark:bg-zinc-800/80 backdrop-blur-md p-1 rounded-full flex gap-1 border border-outline-variant/20 shadow-sm">
          <button
            onClick={() => tripMode !== "planning" && toggleTripMode()}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
              tripMode === "planning"
                ? "bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Planning (At Home)
          </button>
          <button
            onClick={() => tripMode !== "in-trip" && toggleTripMode()}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
              tripMode === "in-trip"
                ? "bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            In-Trip (Traveling)
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Hidden SEO & Test headings */}
        <h1 className="sr-only">Explore Italy</h1>
        <p className="sr-only">Your intelligent travel assistant</p>

        {/* Responsive Grid: 1 column on mobile, 3 columns on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-6">
            {/* Location + sunset weather Hero Card */}
            <LocationCard />

            {/* AI Co-Pilot Morning Briefing & Serendipity Cards — Only shown in-trip */}
            {tripMode === "in-trip" && <CopilotCards />}

            {/* Today Planner (Hour-by-hour timeline) — Only shown in-trip */}
            {tripMode === "in-trip" && <TodayPlanner />}
          </div>
          
          <div className="space-y-6">
            {/* Custom Destination Attraction & Dining Search */}
            <AttractionSearch />

            {/* Top Picks / Places Section */}
            <NearbyPlacesSection
              lat={location.coords?.latitude}
              lng={location.coords?.longitude}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
