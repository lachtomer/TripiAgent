"use client";

import dynamic from "next/dynamic";
import { useLocation } from "@/hooks/useLocation";
import LocationPermissionBanner from "@/components/LocationPermissionBanner";
import LocationCard from "@/components/LocationCard";
import TodayPlanner from "@/components/TodayPlanner";

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

      <div className="flex-1 px-4 pt-6 space-y-6">
        {/* Hidden SEO & Test headings */}
        <h1 className="sr-only">Explore Italy</h1>
        <p className="sr-only">Your intelligent travel assistant</p>

        {/* Location + sunset weather Hero Card */}
        <LocationCard />

        {/* Today Planner (Hour-by-hour timeline) */}
        <TodayPlanner />

        {/* Top Picks / Places Section */}
        <NearbyPlacesSection
          lat={location.coords?.latitude}
          lng={location.coords?.longitude}
        />
      </div>
    </div>
  );
}
