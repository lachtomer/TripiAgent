"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Calendar, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { DEFAULT_ITALY_ITINERARY } from "@/components/ItineraryCard";

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

export default function TodayPlanner() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const itinerary = useTripStore((state) => state.itinerary);
  const tripStartDate = useTripStore((state) => state.tripStartDate);
  const setPendingPrompt = useTripStore((state) => state.setPendingPrompt);
  const completedActivityIds = useTripStore((state) => state.completedActivityIds);
  const toggleActivityCompletion = useTripStore((state) => state.toggleActivityCompletion);

  const [activeDayNum, setActiveDayNum] = useState<number>(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const activeItinerary = itinerary && itinerary.length > 0 ? itinerary : DEFAULT_ITALY_ITINERARY;

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        const todayNum = getTodayDayNumber(tripStartDate, activeItinerary.length);
        if (todayNum !== null) {
          setActiveDayNum(todayNum);
          setIsPreviewMode(false);
        } else {
          setActiveDayNum(1); // Default to Day 1 preview if not on the trip dates
          setIsPreviewMode(true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, tripStartDate, activeItinerary.length]);

  if (!isHydrated) {
    return (
      <Card data-testid="today-planner-loading" className="border border-outline-variant/30 bg-card/50">
        <CardContent className="p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground animate-pulse">Loading today&apos;s schedule...</span>
        </CardContent>
      </Card>
    );
  }

  const currentDay = activeItinerary.find((d) => d.dayNumber === activeDayNum) || activeItinerary[0];

  const handleAskAI = (title: string, location?: string) => {
    const prompt = `Tell me more about ${title}${location ? ` near ${location}` : ""}. What should I know before visiting? Any practical tips?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  // Sort activities chronologically by time string
  const sortedActivities = [...currentDay.activities].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card data-testid="today-planner" className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary dark:text-[#86df72]" />
            <CardTitle className="text-sm font-extrabold tracking-tight">Today&apos;s Planner</CardTitle>
          </div>
          <button
            onClick={() => router.push("/itinerary")}
            className="text-[#006400] dark:text-[#86df72] text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 hover:underline"
          >
            Full Itinerary <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Date and Day Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">
              {currentDay.date || `Day ${currentDay.dayNumber}`}
            </h4>
            {isPreviewMode && (
              <span className="inline-flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                <AlertCircle className="h-3 w-3" /> Pre-Trip Preview
              </span>
            )}
          </div>

          {/* Interactive Day Switcher for preview exploration */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Day:</span>
            <select
              value={activeDayNum}
              onChange={(e) => {
                setActiveDayNum(parseInt(e.target.value));
                setIsPreviewMode(true); // Manually selecting a day enters preview mode
              }}
              className="bg-muted/50 border border-outline-variant/30 rounded px-1.5 py-0.5 text-[10px] font-bold focus:outline-none text-foreground cursor-pointer"
            >
              {activeItinerary.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber} className="bg-card text-foreground">
                  {d.dayNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-5">
        {sortedActivities.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-outline-variant/30 rounded-2xl bg-muted/5">
            <Calendar className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs font-bold text-muted-foreground">No activities scheduled</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Add some from your saved attractions or custom events.
            </p>
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-primary/20 dark:border-[#86df72]/20 space-y-5 ml-2">
            {sortedActivities.map((act) => {
              const isCompleted = completedActivityIds.includes(act.id);
              return (
                <div key={act.id} className="relative group" data-testid="timeline-item">
                  {/* Timeline node checkbox */}
                  <button
                    onClick={() => toggleActivityCompletion(act.id)}
                    className={`absolute -left-[23px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all duration-200 z-10 ${
                      isCompleted
                        ? "bg-primary border-primary text-white dark:bg-[#86df72] dark:border-[#86df72]"
                        : "bg-card border-primary/50 dark:border-[#86df72]/50 hover:border-primary dark:hover:border-[#86df72]"
                    }`}
                    aria-label="Toggle activity completion"
                  >
                    {isCompleted && (
                      <svg className="w-2.5 h-2.5 stroke-current fill-none stroke-[3]" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Activity details card */}
                  <div className={`space-y-1 transition-all duration-200 ${isCompleted ? "opacity-40 line-through decoration-muted-foreground" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-primary dark:text-[#86df72] bg-primary/5 dark:bg-[#86df72]/10 px-2 py-0.5 rounded border border-primary/10 dark:border-[#86df72]/10 shrink-0">
                        {act.time}
                      </span>
                    {act.locationName && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate max-w-[150px]">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{act.locationName}</span>
                      </span>
                    )}
                  </div>
                  
                  <h5 className="text-xs font-bold text-foreground leading-tight">
                    {act.title}
                  </h5>
                  
                  {act.description && (
                    <p className="text-[10px] text-muted-foreground leading-relaxed pr-2">
                      {act.description}
                    </p>
                  )}

                  {/* Ask AI quick assistant */}
                  <button
                    onClick={() => handleAskAI(act.title, act.locationName)}
                    className="mt-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#006400] dark:text-[#86df72] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    Ask AI Guide
                  </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
