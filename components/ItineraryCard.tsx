"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TargetBankDayPicker from "@/components/TargetBankDayPicker";
import PlanBDayPanel from "@/components/PlanBDayPanel";
import DayGuidePanel from "@/components/DayGuidePanel";
import ActivityNearbyPanel from "@/components/ActivityNearbyPanel";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trash2, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CalendarCheck2,
  AlertTriangle,
  Bookmark,
  Compass
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { isPersistedItineraryStale } from "@/lib/itineraryTemplate";
import { useTranslation } from "@/lib/translations";

export { DEFAULT_ITALY_ITINERARY };

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

export default function ItineraryCard() {
  const router = useRouter();
  const { t } = useTranslation();

  const itinerary = useTripStore((state) => state.itinerary);
  const setItinerary = useTripStore((state) => state.setItinerary);
  const tripStartDate = useTripStore((state) => state.tripStartDate);
  const setTripStartDate = useTripStore((state) => state.setTripStartDate);
  const setPendingPrompt = useTripStore((state) => state.setPendingPrompt);
  const isPlanning = useTripStore((state) => state.isPlanning);

  const updateDayTitle = useTripStore((state) => state.updateDayTitle);
  const addActivity = useTripStore((state) => state.addActivity);
  const updateActivity = useTripStore((state) => state.updateActivity);
  const deleteActivity = useTripStore((state) => state.deleteActivity);
  
  // Day anchor and swapping state
  const dayAnchors = useTripStore((state) => state.dayAnchors);
  const updateDayAnchor = useTripStore((state) => state.updateDayAnchor);
  const swapItineraryDays = useTripStore((state) => state.swapItineraryDays);

  const isHydrated = useIsHydrated();
  const location = useTripStore((state) => state.location);
  const [weatherCondition, setWeatherCondition] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && location?.coords) {
      fetch(`/api/weather?lat=${location.coords.latitude}&lng=${location.coords.longitude}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.condition) {
            setWeatherCondition(data.condition.toLowerCase());
          }
        })
        .catch((err) => console.error("Error fetching weather in ItineraryCard:", err));
    }
  }, [isHydrated, location]);

  const isOutdoorActivity = (title: string, desc: string): boolean => {
    const text = `${title} ${desc}`.toLowerCase();
    const outdoorKeywords = ["swim", "beach", "pool", "lake shore", "boat", "walk", "stroll", "hike", "gardens", "park", "explore village", "outdoor"];
    return outdoorKeywords.some(keyword => text.includes(keyword));
  };

  const checkRainAlert = (act: Activity, dayNum: number) => {
    const isOutdoor = isOutdoorActivity(act.title, act.description);
    const isRainy = weatherCondition?.includes("rain") || weatherCondition?.includes("drizzle") || weatherCondition?.includes("shower");
    const isSimulatedRain = dayNum === 8 && act.id === "a8boat";
    return isOutdoor && (isRainy || isSimulatedRain);
  };

  const handleAskAISwap = (act: Activity, dayNum: number) => {
    const prompt = `My outdoor activity '${act.title}' on Day ${dayNum} has a rain alert. What are some good indoor alternative activities in ${act.locationName || "the area"} that we can swap it with?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  const handleSwapDays = (dayA: number, dayB: number) => {
    const activeItinerary = itinerary || DEFAULT_ITALY_ITINERARY;
    const dayDataA = activeItinerary.find((d) => d.dayNumber === dayA);
    const dayDataB = activeItinerary.find((d) => d.dayNumber === dayB);

    if (!dayDataA || !dayDataB) return;

    const conflicts: string[] = [];

    // ZTL Driving swap warning
    const hasMilanA = dayDataA.activities.some((a) => a.title.toLowerCase().includes("milan") || a.locationName?.toLowerCase().includes("milan"));
    const hasMilanB = dayDataB.activities.some((a) => a.title.toLowerCase().includes("milan") || a.locationName?.toLowerCase().includes("milan"));

    if (hasMilanA || hasMilanB) {
      conflicts.push("Milan ZTL Area C warning: Driving schedules could move to active weekday times. Ensure ZTL paid tags match.");
    }

    // Weather mismatch warning
    const hasOutdoorA = dayDataA.activities.some((a) => isOutdoorActivity(a.title, a.description));
    const hasOutdoorB = dayDataB.activities.some((a) => isOutdoorActivity(a.title, a.description));
    const isRainy = weatherCondition?.includes("rain") || weatherCondition?.includes("drizzle") || weatherCondition?.includes("shower");

    if (isRainy && (hasOutdoorA || hasOutdoorB)) {
      conflicts.push("Rain Alert: One of the swapped days contains outdoor activities and weather forecast warns of rain.");
    }

    if (conflicts.length > 0) {
      const confirmSwap = confirm(
        `⚠️ Scheduling Warnings:\n\n${conflicts.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nDo you want to swap Day ${dayA} and Day ${dayB} anyway?`
      );
      if (!confirmSwap) return;
    }

    swapItineraryDays(dayA, dayB);
  };

  // Editing state for day titles: dayNumber -> boolean
  const [editingDayTitle, setEditingDayTitle] = useState<Record<number, boolean>>({});
  const [dayTitleInput, setDayTitleInput] = useState<Record<number, string>>({});

  // Expanded activities: activityId -> boolean
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});

  // Editing activities: activityId -> boolean
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActTime, setEditActTime] = useState("");
  const [editActTitle, setEditActTitle] = useState("");
  const [editActDesc, setEditActDesc] = useState("");
  const [editActLoc, setEditActLoc] = useState("");

  // Target bank day picker: which day's sheet is open
  const [bankPickerDay, setBankPickerDay] = useState<number | null>(null);
  // Activity-scoped nearby panel
  const [nearbyActivityId, setNearbyActivityId] = useState<string | null>(null);

  // Adding activities: dayNumber -> boolean
  const [addingActivityDay, setAddingActivityDay] = useState<number | null>(null);
  const [newActTime, setNewActTime] = useState("09:00");
  const [newActTitle, setNewActTitle] = useState("");
  const [newActDesc, setNewActDesc] = useState("");
  const [newActLoc, setNewActLoc] = useState("");


  useEffect(() => {
    if (!isHydrated) return;
    if (itinerary === null || isPersistedItineraryStale(itinerary)) {
      setItinerary(DEFAULT_ITALY_ITINERARY);
    }
  }, [isHydrated, itinerary, setItinerary]);

  if (!isHydrated) {
    return (
      <div className="space-y-4 pb-24">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">{t.loadingItinerary}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeItinerary = itinerary || DEFAULT_ITALY_ITINERARY;
  const todayDayNumber = getTodayDayNumber(tripStartDate, activeItinerary.length);

  const startEditDayTitle = (dayNumber: number, currentTitle: string) => {
    setEditingDayTitle((prev) => ({ ...prev, [dayNumber]: true }));
    setDayTitleInput((prev) => ({ ...prev, [dayNumber]: currentTitle }));
  };

  const saveDayTitle = (dayNumber: number) => {
    const newTitle = dayTitleInput[dayNumber]?.trim();
    if (newTitle) {
      updateDayTitle(dayNumber, newTitle);
    }
    setEditingDayTitle((prev) => ({ ...prev, [dayNumber]: false }));
  };

  const startEditActivity = (act: Activity) => {
    setEditingActivityId(act.id);
    setEditActTime(act.time);
    setEditActTitle(act.title);
    setEditActDesc(act.description);
    setEditActLoc(act.locationName || "");
  };

  const saveEditActivity = (dayNumber: number, actId: string) => {
    if (!editActTitle.trim()) return;
    updateActivity(dayNumber, actId, {
      time: editActTime,
      title: editActTitle,
      description: editActDesc,
      locationName: editActLoc || undefined
    });
    setEditingActivityId(null);
  };

  const handleAddActivity = (dayNumber: number) => {
    if (!newActTitle.trim()) return;
    addActivity(dayNumber, {
      time: newActTime,
      title: newActTitle,
      description: newActDesc,
      locationName: newActLoc || undefined
    });
    setAddingActivityDay(null);
    setNewActTitle("");
    setNewActDesc("");
    setNewActLoc("");
    setNewActTime("09:00");
  };

  const handleAskAI = (act: Activity) => {
    const prompt = `Tell me about ${act.title} near ${act.locationName || "Italy"}. What are the highlights, open times, and travel tips?`;
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  return (
    <div className="space-y-6">
      {/* Start Date Picker Section */}
      <Card className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5 text-[#004900] dark:text-[#86df72] shrink-0">
            <CalendarCheck2 className="h-5 w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">{t.tripStartDate}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              id="trip-start-date"
              type="date"
              disabled={isPlanning}
              value={tripStartDate || ""}
              onChange={(e) => setTripStartDate(e.target.value || null)}
              className="h-10 text-xs w-full sm:w-48 border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {tripStartDate && (
              <Button
                id="clear-start-date"
                variant="ghost"
                size="sm"
                disabled={isPlanning}
                onClick={() => setTripStartDate(null)}
                className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/15 rounded-xl cursor-pointer"
              >
                {t.clear}
              </Button>
            )}
          </div>
          {tripStartDate && (
            <div className="text-xs text-muted-foreground">
              {todayDayNumber ? (
                <span className="text-[#004900] dark:text-[#86df72] font-extrabold bg-[#006400]/5 dark:bg-[#86df72]/10 border border-[#006400]/10 dark:border-[#86df72]/10 px-3 py-1.5 rounded-full inline-block">
                  {t.todayIsDay.replace("{day}", String(todayDayNumber))}
                </span>
              ) : (
                <span className="bg-muted px-3 py-1.5 rounded-full inline-block">{t.tripNotStarted}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
 
      {/* Daily Cards List */}
      <div className="space-y-5">
        {activeItinerary.map((day) => {
          const isToday = todayDayNumber === day.dayNumber;
          const isEditingTitle = editingDayTitle[day.dayNumber];

          return (
            <Card
              key={day.dayNumber}
              id={`day-card-${day.dayNumber}`}
              className={cn(
                "border border-outline-variant/30 bg-card transition-all duration-300 shadow-sm rounded-2xl",
                isToday ? "ring-2 ring-[#006400]" : ""
              )}
            >
              <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex-1 me-4">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        id={`edit-day-title-input-${day.dayNumber}`}
                        value={dayTitleInput[day.dayNumber] || ""}
                        disabled={isPlanning}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDayTitleInput((prev) => ({ ...prev, [day.dayNumber]: val }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveDayTitle(day.dayNumber);
                          if (e.key === "Escape") setEditingDayTitle((prev) => ({ ...prev, [day.dayNumber]: false }));
                        }}
                        className="h-9 text-xs font-semibold rounded-lg"
                        autoFocus
                        dir="auto"
                      />
                      <Button
                        id={`save-day-title-btn-${day.dayNumber}`}
                        size="icon"
                        variant="ghost"
                        disabled={isPlanning}
                        onClick={() => saveDayTitle(day.dayNumber)}
                        className="h-9 w-9 text-[#006400] dark:text-[#86df72] hover:bg-primary/5 rounded-lg cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        id={`cancel-day-title-btn-${day.dayNumber}`}
                        size="icon"
                        variant="ghost"
                        disabled={isPlanning}
                        onClick={() => setEditingDayTitle((prev) => ({ ...prev, [day.dayNumber]: false }))}
                        className="h-9 w-9 text-muted-foreground hover:bg-muted/10 rounded-lg cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="h-4 w-4 text-[#006400] dark:text-[#86df72] shrink-0" />
                        <button
                          id={`day-title-label-${day.dayNumber}`}
                          disabled={isPlanning}
                          onClick={() => startEditDayTitle(day.dayNumber, day.date || `Day ${day.dayNumber}`)}
                          className="text-sm font-extrabold text-foreground text-start hover:underline focus:outline-none cursor-pointer disabled:no-underline disabled:cursor-not-allowed"
                        >
                          {day.date || `Day ${day.dayNumber}`}
                        </button>
                        <button
                          id={`edit-day-title-trigger-${day.dayNumber}`}
                          disabled={isPlanning}
                          onClick={() => startEditDayTitle(day.dayNumber, day.date || `Day ${day.dayNumber}`)}
                          className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Edit day title"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        {isToday && (
                          <span 
                            id={`today-badge-${day.dayNumber}`}
                            className="bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          >
                            {t.today}
                          </span>
                        )}
                      </div>
 
                      {/* Day Anchor Selector */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">{t.anchor}</span>
                        <input
                          type="text"
                          placeholder="e.g. Sirmione"
                          value={dayAnchors[day.dayNumber] || ""}
                          disabled={isPlanning}
                          onChange={(e) => updateDayAnchor(day.dayNumber, e.target.value)}
                          className="h-6 text-[10px] font-bold bg-muted/40 hover:bg-muted/60 border border-outline-variant/30 rounded px-2 w-28 text-foreground focus:outline-none focus:border-[#006400]/40 transition-all"
                          dir="auto"
                        />
                      </div>
                    </div>
                  )}
                  <CardDescription className="mt-1 text-[11px] text-muted-foreground">{t.dailyActivities}</CardDescription>
                </div>
                </CardHeader>

                {day.dayNumber >= 2 && day.dayNumber <= 9 && (
                  <div className="px-4 pb-2">
                    <DayGuidePanel
                      dayNumber={day.dayNumber}
                      defaultExpanded={todayDayNumber === day.dayNumber}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0 px-4 pb-2">
                  {/* Day Swap button */}
                  <Button
                    id={`swap-day-btn-${day.dayNumber}`}
                    variant="ghost"
                    size="sm"
                    disabled={isPlanning}
                    onClick={() => {
                      const swapTargetStr = prompt(t.enterDayToSwap.replace("{day}", String(day.dayNumber)));
                      if (swapTargetStr) {
                        const targetNum = parseInt(swapTargetStr);
                        if (!isNaN(targetNum) && targetNum !== day.dayNumber && targetNum >= 1 && targetNum <= activeItinerary.length) {
                          handleSwapDays(day.dayNumber, targetNum);
                        } else {
                          alert(t.invalidDayNumber);
                        }
                      }
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer flex items-center justify-center border border-outline-variant/30"
                    title={t.swapDay}
                  >
                    <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </Button>

                  <Button
                    id={`add-from-target-bank-day-${day.dayNumber}`}
                    data-testid={`add-from-target-bank-day-${day.dayNumber}`}
                    variant="outline"
                    size="sm"
                    disabled={isPlanning}
                    onClick={() => setBankPickerDay(day.dayNumber)}
                    className="h-8 border-[#006400]/30 text-[#006400] dark:text-[#86df72] dark:border-[#86df72]/20 hover:bg-[#006400]/5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                    aria-label={t.addFromTargetBank}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">{t.addFromTargetBank}</span>
                  </Button>

                  <Button
                    id={`add-activity-btn-${day.dayNumber}`}
                    variant="outline"
                    size="sm"
                    disabled={isPlanning}
                    onClick={() => setAddingActivityDay(addingActivityDay === day.dayNumber ? null : day.dayNumber)}
                    className="h-8 border-[#006400]/30 text-[#006400] dark:text-[#86df72] dark:border-[#86df72]/20 hover:bg-[#006400]/5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.addActivity}</span>
                  </Button>
                </div>
              

              <CardContent className="p-4 pt-0 space-y-3">
                {/* Add Activity Inline Form */}
                {addingActivityDay === day.dayNumber && (
                  <div 
                    id={`add-activity-form-${day.dayNumber}`}
                    className="border border-outline-variant/30 bg-primary/5 dark:bg-[#86df72]/5 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200"
                  >
                    <p className="text-[10px] font-extrabold text-[#006400] dark:text-[#86df72] uppercase tracking-wider">{t.newActivityDetails}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.timeLabel}</label>
                        <Input
                          id={`new-activity-time-${day.dayNumber}`}
                          type="time"
                          value={newActTime}
                          onChange={(e) => setNewActTime(e.target.value)}
                          className="h-8.5 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.titleLabel}</label>
                        <Input
                          id={`new-activity-title-${day.dayNumber}`}
                          placeholder="e.g. Pantheon Visit"
                          value={newActTitle}
                          onChange={(e) => setNewActTitle(e.target.value)}
                          className="h-8.5 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                          dir="auto"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.locationLabel}</label>
                      <Input
                        id={`new-activity-location-${day.dayNumber}`}
                        placeholder="e.g. Rome"
                        value={newActLoc}
                        onChange={(e) => setNewActLoc(e.target.value)}
                        className="h-8.5 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                        dir="auto"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.descriptionLabel}</label>
                      <textarea
                        id={`new-activity-description-${day.dayNumber}`}
                        placeholder="Activity details..."
                        value={newActDesc}
                        onChange={(e) => setNewActDesc(e.target.value)}
                        className="flex min-h-[60px] w-full rounded-xl border border-outline-variant/30 bg-card px-3 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                        dir="auto"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button
                        id={`new-activity-cancel-${day.dayNumber}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingActivityDay(null)}
                        className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {t.cancelBtn}
                      </Button>
                      <Button
                        id={`new-activity-submit-${day.dayNumber}`}
                        size="sm"
                        disabled={!newActTitle.trim()}
                        onClick={() => handleAddActivity(day.dayNumber)}
                        className="h-8 px-4 text-xs font-semibold bg-[#006400] text-white hover:bg-[#004d00] rounded-lg cursor-pointer shadow-sm hover:shadow"
                      >
                        {t.addBtn}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Activity List with Connecting Timeline */}
                {day.activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2 ps-2">{t.noActivities}</p>
                ) : (
                  <div className="relative ps-6 space-y-4 pt-2">
                    {day.activities.map((act, idx) => {
                      const isExpanded = !!expandedActivities[act.id];
                      const isEditing = editingActivityId === act.id;
                      const isLast = idx === day.activities.length - 1;

                      // Check for keywords to display confirm tag
                      const titleLower = act.title.toLowerCase();
                      const descLower = act.description.toLowerCase();
                      const isConfirmed = 
                        titleLower.includes("flight") ||
                        titleLower.includes("check-in") ||
                        titleLower.includes("car rental") ||
                        titleLower.includes("centauro") ||
                        titleLower.includes("spa") ||
                        titleLower.includes("ticket") ||
                        titleLower.includes("booking") ||
                        titleLower.includes("apartment") ||
                        descLower.includes("booking") ||
                        descLower.includes("confirmed");

                      const hasRainAlert = checkRainAlert(act, day.dayNumber);

                      return (
                        <div
                          key={act.id}
                          id={`activity-row-${act.id}`}
                          data-testid={`activity-${act.id}`}
                          className={cn(
                            "relative transition-all duration-300",
                            isLast ? "itinerary-line-last" : "itinerary-line"
                          )}
                        >
                          {/* Left-hand timeline connection dot */}
                          <div className="absolute start-[14px] top-[18px] w-2.5 h-2.5 rounded-full bg-[#006400] dark:bg-[#86df72] border border-white dark:border-zinc-950 z-10 shadow-sm" data-testid={`timeline-item-${act.id}`} />

                          {/* Nested Card wrapper */}
                          <div className="ps-6">
                            {isEditing ? (
                              /* Inline Edit Form */
                              <div className="p-3.5 space-y-3 bg-card border border-outline-variant/30 rounded-2xl shadow-sm">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-1">
                                    <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.timeLabel}</label>
                                    <Input
                                      id={`edit-activity-time-${act.id}`}
                                      type="time"
                                      value={editActTime}
                                      onChange={(e) => setEditActTime(e.target.value)}
                                      className="h-8 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.titleLabel}</label>
                                    <Input
                                      id={`edit-activity-title-${act.id}`}
                                      value={editActTitle}
                                      onChange={(e) => setEditActTitle(e.target.value)}
                                      className="h-8 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                                      dir="auto"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.locationLabel}</label>
                                  <Input
                                    id={`edit-activity-location-${act.id}`}
                                    value={editActLoc}
                                    onChange={(e) => setEditActLoc(e.target.value)}
                                    className="h-8 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-[#006400]"
                                    dir="auto"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">{t.descriptionLabel}</label>
                                  <textarea
                                    id={`edit-activity-description-${act.id}`}
                                    value={editActDesc}
                                    onChange={(e) => setEditActDesc(e.target.value)}
                                    className="flex min-h-[60px] w-full rounded-xl border border-outline-variant/30 bg-card px-3 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                                    dir="auto"
                                  />
                                </div>
                                <div className="flex gap-2 justify-end pt-1">
                                  <Button
                                    id={`edit-activity-cancel-${act.id}`}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingActivityId(null)}
                                    className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
                                  >
                                    {t.cancelBtn}
                                  </Button>
                                  <Button
                                    id={`edit-activity-save-${act.id}`}
                                    size="sm"
                                    disabled={!editActTitle.trim()}
                                    onClick={() => saveEditActivity(day.dayNumber, act.id)}
                                    className="h-8 px-4 text-xs font-semibold bg-[#006400] text-white hover:bg-[#004d00] rounded-lg cursor-pointer"
                                  >
                                    {t.saveBtn}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Collapsible Activity Row */
                              <div className="rounded-2xl border border-outline-variant/30 bg-card hover:bg-muted/5 transition-all shadow-sm overflow-hidden">
                                {/* Header (always visible) */}
                                <button
                                  id={`activity-header-${act.id}`}
                                  onClick={() => {
                                    setExpandedActivities((prev) => ({
                                      ...prev,
                                      [act.id]: !prev[act.id]
                                    }));
                                  }}
                                  className="w-full text-start p-3.5 flex items-center justify-between gap-3 focus:outline-none cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <div dir="ltr" className="flex items-center gap-1 text-[11px] text-[#006400] dark:text-[#86df72] font-bold bg-[#006400]/5 dark:bg-[#86df72]/10 px-2 py-0.5 rounded-full shrink-0 border border-primary/10 dark:border-[#86df72]/10 text-start">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      <span>{act.time}</span>
                                    </div>
                                    <span dir="ltr" className="text-xs font-bold text-foreground truncate max-w-[130px] sm:max-w-[180px] text-start">{act.title}</span>
                                    
                                    {isConfirmed && (
                                      <span className="bg-[#006400]/10 dark:bg-[#86df72]/15 text-[#006400] dark:text-[#86df72] text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/10 dark:border-[#86df72]/10 flex items-center gap-0.5 shrink-0">
                                        <Check className="h-2.5 w-2.5 shrink-0" />
                                        {t.confirmed}
                                      </span>
                                    )}
                                    {hasRainAlert && (
                                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-0.5 shrink-0">
                                        {t.rainAlert}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {act.locationName && (
                                      <span dir="ltr" className="text-[10px] text-muted-foreground truncate hidden xs:block text-start">{act.locationName}</span>
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                  </div>
                                </button>

                                {/* Expanded panel details */}
                                {isExpanded && (
                                  <div 
                                    id={`activity-details-${act.id}`}
                                    className="px-3.5 pb-3.5 pt-0 border-t border-outline-variant/20 mt-1 space-y-2.5 animate-in slide-in-from-top-1 duration-200"
                                  >
                                    <p dir="ltr" className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap text-start">{act.description}</p>
                                    
                                    {hasRainAlert && (
                                      <div className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-500 rounded-xl text-[10px] font-bold w-full">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                        <span className="flex-1">{t.rainForecast}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAskAISwap(act, day.dayNumber);
                                          }}
                                          className="underline hover:text-amber-700 font-extrabold cursor-pointer shrink-0 ms-2"
                                        >
                                          {t.askAiSwap}
                                        </button>
                                      </div>
                                    )}
                                    
                                    {nearbyActivityId === act.id && (
                                      <ActivityNearbyPanel
                                        activity={act}
                                        dayNumber={day.dayNumber}
                                        disabled={isPlanning}
                                        onClose={() => setNearbyActivityId(null)}
                                      />
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                      <div className="flex items-center gap-3">
                                        {act.locationName && (
                                          <button
                                            id={`activity-location-tag-${act.id}`}
                                            onClick={() => handleAskAI(act)}
                                            className="flex items-center gap-1 text-[10px] font-bold text-[#006400] dark:text-[#86df72] hover:underline focus:outline-none bg-[#006400]/5 dark:bg-[#86df72]/10 px-2.5 py-1 rounded-lg border border-[#006400]/10 dark:border-[#86df72]/10 cursor-pointer"
                                            aria-label={`Ask AI about ${act.title} in ${act.locationName}`}
                                          >
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span dir="ltr" className="text-start">{act.locationName}</span>
                                          </button>
                                        )}
                                        
                                        <button
                                          id={`ask-ai-link-${act.id}`}
                                          onClick={() => handleAskAI(act)}
                                          className="flex items-center gap-1 text-[10px] font-bold text-[#006400] dark:text-[#86df72] hover:underline focus:outline-none cursor-pointer"
                                          aria-label={`Ask AI about ${act.title}`}
                                        >
                                          <Info className="h-3 w-3 shrink-0" />
                                          <span>{t.askAiTips}</span>
                                        </button>

                                        <button
                                          id={`explore-nearby-${act.id}`}
                                          data-testid={`explore-nearby-${act.id}`}
                                          type="button"
                                          disabled={isPlanning}
                                          onClick={() =>
                                            setNearbyActivityId(
                                              nearbyActivityId === act.id ? null : act.id
                                            )
                                          }
                                          className="flex items-center gap-1 text-[10px] font-bold text-[#006400] dark:text-[#86df72] hover:underline focus:outline-none cursor-pointer min-h-12 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                          aria-label={t.exploreNearby}
                                        >
                                          <Compass className="h-3 w-3 shrink-0" />
                                          <span>{t.exploreNearby}</span>
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <Button
                                          id={`edit-activity-trigger-${act.id}`}
                                          variant="ghost"
                                          size="icon"
                                          disabled={isPlanning}
                                          onClick={() => startEditActivity(act)}
                                          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                                          aria-label="Edit activity"
                                        >
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          id={`delete-activity-btn-${act.id}`}
                                          variant="ghost"
                                          size="icon"
                                          disabled={isPlanning}
                                          onClick={() => deleteActivity(day.dayNumber, act.id)}
                                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                          aria-label="Delete activity"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <PlanBDayPanel
                  dayNumber={day.dayNumber}
                  defaultAddTime="14:00"
                  disabled={isPlanning}
                  showWeatherHint={day.activities.some((act) =>
                    checkRainAlert(act, day.dayNumber)
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {bankPickerDay !== null && (
        <TargetBankDayPicker
          dayNumber={bankPickerDay}
          open
          onOpenChange={(open) => {
            if (!open) setBankPickerDay(null);
          }}
          disabled={isPlanning}
        />
      )}
    </div>
  );
}
