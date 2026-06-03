"use client";

import { useState } from "react";
import { useTripStore } from "@/stores/tripStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AttractionSearch from "@/components/AttractionSearch";
import { cn } from "@/lib/utils";

type InvestigateMode = "target" | "around-me";

export default function InvestigateSection() {
  const tripMode = useTripStore((s) => s.tripMode);
  const cityName = useTripStore((s) => s.location?.cityName);
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const targetCity = savedAttractions[0]?.locationName ?? "Lake Garda";

  const [mode, setMode] = useState<InvestigateMode>(
    tripMode === "in-trip" ? "around-me" : "target"
  );

  const resolvedCity = mode === "around-me" ? (cityName ?? targetCity) : targetCity;
  const gpsDenied = mode === "around-me" && !cityName;

  return (
    <Card
      data-testid="investigate-section"
      className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden"
    >
      <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20 space-y-3">
        <CardTitle className="text-sm font-extrabold tracking-tight text-foreground">
          Investigate
        </CardTitle>

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
      />
    </Card>
  );
}
