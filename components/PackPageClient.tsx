"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTripStore } from "@/stores/tripStore";
import PackingList from "@/components/PackingList";

export default function PackPageClient() {
  const tripMode = useTripStore((s) => s.tripMode);
  const router = useRouter();

  useEffect(() => {
    if (tripMode === "in-trip") {
      router.replace("/");
    }
  }, [tripMode, router]);

  if (tripMode === "in-trip") {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pack</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI-powered checklist — tailored to your itinerary
        </p>
      </div>

      <PackingList />
    </div>
  );
}
