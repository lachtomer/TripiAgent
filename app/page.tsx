"use client";

import dynamic from "next/dynamic";
import { useLocation } from "@/hooks/useLocation";
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

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Geolocation Banner — hides itself once granted or city is set */}
      <LocationPermissionBanner />

      <div className="flex-1 px-4 pt-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Hidden SEO & Test headings */}
        <h1 className="sr-only">Explore Italy</h1>
        <p className="sr-only">Your intelligent travel assistant</p>

        {/* Responsive Grid: 1 column on mobile, 3 columns on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-6">
            {/* Location + sunset weather Hero Card */}
            <LocationCard />

            {/* AI Co-Pilot Morning Briefing & Serendipity Cards */}
            <CopilotCards />

            {/* Today Planner (Hour-by-hour timeline) */}
            <TodayPlanner />
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
