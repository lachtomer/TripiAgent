"use client";

import { useState } from "react";
import { Sparkles, X, Plus, Check, RefreshCw, Sun } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { DEFAULT_ITALY_ITINERARY } from "@/components/ItineraryCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const getTodayDayNumber = (startDateStr: string | null, totalDays: number): number | null => {
  if (!startDateStr) return null;
  const [year, month, day] = startDateStr.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays < totalDays) {
    return diffDays + 1;
  }
  return null;
};

export default function CopilotCards() {
  const isHydrated = useIsHydrated();
  const itinerary = useTripStore((state) => state.itinerary);
  const tripStartDate = useTripStore((state) => state.tripStartDate);
  const location = useTripStore((state) => state.location);
  const morningBriefing = useTripStore((state) => state.morningBriefing);
  const serendipitySuggestion = useTripStore((state) => state.serendipitySuggestion);
  const setMorningBriefing = useTripStore((state) => state.setMorningBriefing);
  const setSerendipitySuggestion = useTripStore((state) => state.setSerendipitySuggestion);
  const addActivity = useTripStore((state) => state.addActivity);
  const setToast = useTripStore((state) => state.setToast);

  const [loading, setLoading] = useState(false);
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [addedSerendipity, setAddedSerendipity] = useState(false);

  const activeItinerary = itinerary && itinerary.length > 0 ? itinerary : DEFAULT_ITALY_ITINERARY;

  // Calculate today's day number as a derived value to avoid set-state-in-effect warning
  const activeDayNum = isHydrated
    ? (getTodayDayNumber(tripStartDate, activeItinerary.length) ?? 1)
    : 1;

  const currentDay = activeItinerary.find((d) => d.dayNumber === activeDayNum) || activeItinerary[0];

  const handleCheckUpdate = async () => {
    setLoading(true);
    setAddedSerendipity(false);
    try {
      // 1. Fetch current weather from coordinates (fallback to default)
      const lat = location?.coords?.latitude ?? 41.9028;
      const lng = location?.coords?.longitude ?? 12.4964;
      const weatherRes = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      const weatherData = await weatherRes.json();

      // 2. Fetch Copilot Briefing & Serendipity
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: activeDayNum,
          date: currentDay.date || "",
          itineraryActivities: currentDay.activities,
          weatherInfo: {
            temp: weatherData.temp ?? 24,
            description: weatherData.condition ?? "Sunny",
          },
          cityName: location?.cityName || "Italy",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate copilot response");
      const data = await response.json();

      setMorningBriefing({
        text: data.morningBriefing,
        date: new Date().toISOString().split("T")[0],
      });
      setSerendipitySuggestion({
        title: data.serendipity.title,
        description: data.serendipity.description,
        category: data.serendipity.category,
        date: new Date().toISOString().split("T")[0],
      });

      setBriefingDismissed(false);
      setToast({ message: "Co-Pilot checklist updated!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Could not sync with Co-Pilot.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = () => {
    if (!serendipitySuggestion) return;
    addActivity(activeDayNum, {
      time: "17:00", // Default to late-afternoon serendipity slot
      title: `${serendipitySuggestion.title} (${serendipitySuggestion.category})`,
      description: serendipitySuggestion.description,
    });
    setAddedSerendipity(true);
    setToast({ message: "Spontaneous activity added to your day!", type: "success" });
  };

  if (!isHydrated) return null;

  return (
    <div className="space-y-4">
      {/* 1. On-Demand Generator Trigger */}
      <div className="flex items-center justify-between bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4.5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-[#006400] dark:text-[#86df72] rounded-xl shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-foreground tracking-tight">AI Co-Pilot Advice</h4>
            <p className="text-[10px] text-muted-foreground leading-normal max-w-[210px]">
              Generate a smart briefing and a unique serendipity tip tailored for Day {activeDayNum}.
            </p>
          </div>
        </div>
        <Button
          onClick={handleCheckUpdate}
          disabled={loading}
          size="sm"
          className="bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#6ec25c] text-white dark:text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl px-4 py-2 h-9 flex items-center gap-1.5 shadow-md shadow-emerald-900/10 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Syncing..." : "Consult"}
        </Button>
      </div>

      {/* 2. Morning Briefing Card */}
      {morningBriefing && !briefingDismissed && (
        <Card className="border border-outline-variant/40 bg-card/60 backdrop-blur-md shadow-md rounded-2xl overflow-hidden relative transition-all duration-300">
          <CardContent className="p-4 flex items-start gap-3.5 pr-9">
            <div className="p-2 bg-amber-500/15 text-amber-600 rounded-xl shrink-0 mt-0.5">
              <Sun className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1">
              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                Morning Briefing
              </h5>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {morningBriefing.text}
              </p>
            </div>
            <button
              onClick={() => setBriefingDismissed(true)}
              className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss briefing"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* 3. Serendipity Recommendation Card */}
      {serendipitySuggestion && (
        <Card className="border border-[#006400]/25 dark:border-[#86df72]/20 bg-gradient-to-br from-[#006400]/5 via-card to-card backdrop-blur-md shadow-md rounded-2xl overflow-hidden transition-all duration-300">
          <CardContent className="p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#006400]/10 dark:bg-[#86df72]/10 text-[#006400] dark:text-[#86df72] rounded-xl shrink-0">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider bg-[#006400]/10 dark:bg-[#86df72]/15 text-[#006400] dark:text-[#86df72] px-2 py-0.5 rounded-full border border-[#006400]/10 dark:border-[#86df72]/10">
                    {serendipitySuggestion.category}
                  </span>
                  <h5 className="text-xs font-bold text-foreground leading-tight">
                    {serendipitySuggestion.title}
                  </h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed pr-2">
                    {serendipitySuggestion.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Spontaneous Tip
              </span>
              <Button
                onClick={handleQuickAdd}
                disabled={addedSerendipity}
                size="sm"
                variant="ghost"
                className={`h-7.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border px-3 py-1 flex items-center gap-1 transition-all ${
                  addedSerendipity
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-transparent text-[#006400] border-[#006400]/20 hover:bg-[#006400]/5 dark:text-[#86df72] dark:border-[#86df72]/20 dark:hover:bg-[#86df72]/5"
                }`}
              >
                {addedSerendipity ? (
                  <>
                    <Check className="h-3 w-3" /> Added
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" /> Add to Today
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
