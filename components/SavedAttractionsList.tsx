"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Compass,
  Check,
  ThumbsUp,
  ThumbsDown,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTranslation } from "@/lib/translations";
import PlaceNameLink from "@/components/PlaceNameLink";
import { isBankAdminUser } from "@/lib/bankPermissions";
import { resolveSavedAttractionLinks } from "@/lib/urlSafety";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import {
  type BankFilter,
  filterBankEntries,
  sortBankEntries,
  type SortedBankEntry,
} from "@/lib/bankPlanned";

export default function SavedAttractionsList() {
  const router = useRouter();
  const isHydrated = useIsHydrated();
  const savedAttractions = useTripStore((state) => state.savedAttractions);
  const saveAttraction = useTripStore((state) => state.saveAttraction);
  const removeSavedAttraction = useTripStore((state) => state.removeSavedAttraction);
  const itinerary = useTripStore((state) => state.itinerary);
  const addAttractionToItinerary = useTripStore((state) => state.addAttractionToItinerary);
  const setToast = useTripStore((state) => state.setToast);
  
  // User/Admin permissions
  const currentUser = useTripStore((state) => state.currentUser);
  const users = useTripStore((state) => state.users);
  const voteAttraction = useTripStore((state) => state.voteAttraction);

  const activeUser = users.find((u) => u.id === currentUser);
  const isAdmin = isBankAdminUser(activeUser);
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankFilter, setBankFilter] = useState<BankFilter>("all");

  const activeItinerary =
    itinerary && itinerary.length > 0 ? itinerary : DEFAULT_ITALY_ITINERARY;

  const displayEntries = useMemo(
    () =>
      filterBankEntries(
        sortBankEntries(savedAttractions, activeItinerary),
        bankFilter
      ),
    [savedAttractions, activeItinerary, bankFilter]
  );

  const unplannedEntries = useMemo(
    () => displayEntries.filter((row) => !row.plannedStatus.isPlanned),
    [displayEntries]
  );

  const plannedEntries = useMemo(
    () => displayEntries.filter((row) => row.plannedStatus.isPlanned),
    [displayEntries]
  );

  // Form states for custom POI
  const [poiName, setPoiName] = useState("");
  const [poiLocation, setPoiLocation] = useState("");
  const [poiNotes, setPoiNotes] = useState("");

  // In-card scheduling state for each attraction: attractionId -> { dayNumber, time }
  const [scheduleState, setScheduleState] = useState<Record<string, { dayNumber: number; time: string }>>({});
  // Feedback state to show temporary checkmark: attractionId -> boolean
  const [successState, setSuccessState] = useState<Record<string, boolean>>({});

  if (!isHydrated) {
    return (
      <Card className="border border-outline-variant/30 bg-card/50">
        <CardContent className="p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading saved attractions...</span>
        </CardContent>
      </Card>
    );
  }

  const activeDays = activeItinerary.map((d) => ({
    dayNumber: d.dayNumber,
    date: d.date || `Day ${d.dayNumber}`,
  }));

  const handleAddCustomPOI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poiName.trim()) return;

    const newPoi = {
      id: `custom-poi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: poiName.trim(),
      description: poiNotes.trim() || undefined,
      locationName: poiLocation.trim() || undefined,
      upvotes: [],
      downvotes: [],
      createdBy: activeUser?.name || "Liran"
    };

    saveAttraction(newPoi);
    setPoiName("");
    setPoiLocation("");
    setPoiNotes("");
    setShowAddForm(false);
  };

  const handleAddToItinerary = (attractionId: string) => {
    const state = scheduleState[attractionId] || { dayNumber: 1, time: "10:00" };
    addAttractionToItinerary(state.dayNumber, attractionId, state.time);
    
    // Show success feedback
    setSuccessState((prev) => ({ ...prev, [attractionId]: true }));
    setTimeout(() => {
      setSuccessState((prev) => ({ ...prev, [attractionId]: false }));
    }, 2000);
  };

  const updateSchedule = (attractionId: string, updates: Partial<{ dayNumber: number; time: string }>) => {
    setScheduleState((prev) => {
      const current = prev[attractionId] || { dayNumber: 1, time: "10:00" };
      return {
        ...prev,
        [attractionId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  const formatScheduledDaysLabel = (days: number[]) => {
    if (days.length === 0) return "";
    if (days.length === 1) {
      return t.bankScheduledOnDay.replace("{day}", String(days[0]));
    }
    return days.map((day) => `Day ${day}`).join(", ");
  };

  const handlePlannedNavigate = (row: SortedBankEntry) => {
    const day = row.plannedStatus.scheduledDayNumbers[0];
    if (!day) return;
    setToast({
      message: t.bankViewOnItinerary.replace("{day}", String(day)),
      type: "info",
    });
    router.push(`/itinerary#day-card-${day}`);
  };

  const renderAttractionCard = (row: SortedBankEntry) => {
    const attraction = row.entry;
    const { plannedStatus } = row;
    const isCustom = attraction.id.startsWith("custom-poi-");
    const currentSchedule = scheduleState[attraction.id] || { dayNumber: 1, time: "10:00" };
    const isSuccess = !!successState[attraction.id];
    const links = resolveSavedAttractionLinks(attraction);
    const scheduledLabel = formatScheduledDaysLabel(plannedStatus.scheduledDayNumbers);

    return (
      <div
        key={attraction.id}
        data-attraction-name={attraction.name}
        className="flex flex-col p-3 rounded-2xl border border-outline-variant/20 bg-card/60 shadow-sm relative animate-in fade-in duration-200"
      >
        <div
          className={`flex gap-2.5 items-start justify-between ${plannedStatus.isPlanned ? "cursor-pointer" : ""}`}
          onClick={plannedStatus.isPlanned ? () => handlePlannedNavigate(row) : undefined}
          onKeyDown={
            plannedStatus.isPlanned
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handlePlannedNavigate(row);
                  }
                }
              : undefined
          }
          role={plannedStatus.isPlanned ? "button" : undefined}
          tabIndex={plannedStatus.isPlanned ? 0 : undefined}
        >
          {attraction.image && (
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              <Image src={attraction.image} alt={attraction.name} width={48} height={48} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 ${
                isCustom
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                  : "bg-[#006400]/10 text-[#006400] border-[#006400]/20 dark:text-[#86df72]"
              }`}>
                {isCustom ? "Custom" : "Explore Spot"}
              </span>
              {plannedStatus.isPlanned && (
                <span
                  data-testid="bank-planned-badge"
                  aria-label={`${t.bankPlannedBadge}: ${scheduledLabel}`}
                  className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border shrink-0 bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300 flex items-center gap-0.5"
                >
                  <CalendarCheck className="h-3 w-3" aria-hidden="true" />
                  {t.bankPlannedBadge}
                </span>
              )}
              {attraction.rating && (
                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                  ⭐ {attraction.rating.toFixed(1)}
                </span>
              )}
            </div>
            {plannedStatus.isPlanned && scheduledLabel && (
              <p
                data-testid="bank-scheduled-days"
                className="text-[9px] font-semibold text-sky-700/80 dark:text-sky-300/80 mt-1"
              >
                {scheduledLabel}
              </p>
            )}
            <div className="mt-1">
              <PlaceNameLink
                placeId={attraction.id}
                name={attraction.name}
                websiteUrl={links.websiteUrl}
                mapsUrl={links.mapsUrl}
              />
            </div>
            {attraction.locationName && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{attraction.locationName}</span>
              </p>
            )}
            {attraction.description && (
              <p className="text-[10px] text-muted-foreground/80 leading-normal mt-1 line-clamp-2">
                {attraction.description}
              </p>
            )}
            {attraction.createdBy && (
              <p className="text-[9px] font-semibold text-muted-foreground/60 mt-1 italic">
                {(t.createdByLabel || "Added by {name}").replace("{name}", attraction.createdBy)}
              </p>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                removeSavedAttraction(attraction.id);
              }}
              className="text-muted-foreground/60 hover:text-destructive p-1 rounded-lg hover:bg-muted shrink-0 transition-colors cursor-pointer"
              aria-label={`Remove ${attraction.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2.5 items-center mt-2.5">
          <button
            onClick={() => {
              const hasUpvoted = (attraction.upvotes || []).includes(currentUser);
              voteAttraction(attraction.id, hasUpvoted ? null : "up", currentUser);
            }}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer select-none ${
              (attraction.upvotes || []).includes(currentUser)
                ? "bg-[#006400]/10 text-[#006400] border-[#006400]/30 dark:bg-[#86df72]/15 dark:text-[#86df72] dark:border-[#86df72]/30"
                : "bg-background text-muted-foreground border-outline-variant/20 hover:bg-muted"
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{(attraction.upvotes || []).length}</span>
          </button>

          <button
            onClick={() => {
              const hasDownvoted = (attraction.downvotes || []).includes(currentUser);
              voteAttraction(attraction.id, hasDownvoted ? null : "down", currentUser);
            }}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer select-none ${
              (attraction.downvotes || []).includes(currentUser)
                ? "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400 dark:border-red-500/30"
                : "bg-background text-muted-foreground border-outline-variant/20 hover:bg-muted"
            }`}
          >
            <ThumbsDown className="h-3 w-3" />
            <span>{(attraction.downvotes || []).length}</span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/40 border border-outline-variant/30 rounded-lg px-2 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                value={currentSchedule.dayNumber}
                onChange={(e) => updateSchedule(attraction.id, { dayNumber: parseInt(e.target.value) })}
                className="bg-transparent border-none text-[10px] font-bold focus:outline-none text-foreground cursor-pointer"
              >
                {activeDays.map((d) => (
                  <option key={d.dayNumber} value={d.dayNumber} className="bg-card text-foreground text-xs">
                    Day {d.dayNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-muted/40 border border-outline-variant/30 rounded-lg px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={currentSchedule.time}
                onChange={(e) => updateSchedule(attraction.id, { time: e.target.value })}
                placeholder="e.g. 10:00"
                className="bg-transparent border-none text-[10px] font-bold w-12 focus:outline-none text-foreground"
              />
            </div>
          </div>

          <button
            onClick={() => handleAddToItinerary(attraction.id)}
            className={`px-3 py-1 font-semibold text-[10px] rounded-lg shadow-sm border flex items-center gap-1 transition-all cursor-pointer ${
              isSuccess
                ? "bg-green-600 border-green-600 text-white"
                : "bg-[#006400] dark:bg-[#86df72] hover:bg-[#004d00] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 border-transparent"
            }`}
          >
            {isSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Add to Day</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card dir="ltr" className="border border-outline-variant/30 bg-card overflow-hidden shadow-sm transition-all duration-300">
      <span data-testid="saved-attractions-ready" className="sr-only">ready</span>
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/5 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary dark:text-[#86df72] fill-primary/10 dark:fill-[#86df72]/10" />
            <CardTitle className="text-sm font-extrabold tracking-tight">Saved Attractions & POIs</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground">
            Bookmark spots or add custom points of interest
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary dark:text-[#86df72] bg-primary/5 dark:bg-[#86df72]/10 px-2 py-0.5 rounded-full border border-primary/10 dark:border-[#86df72]/10">
            {savedAttractions.length} Saved
          </span>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-0 space-y-4 animate-in fade-in duration-200">
          {/* Add custom POI button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[#006400] dark:text-[#86df72] text-xs font-bold flex items-center gap-1 hover:underline focus:outline-none cursor-pointer"
            >
              {showAddForm ? "Cancel Adding" : "Add Custom Attraction"}
              <Plus className={`h-3.5 w-3.5 transition-transform duration-200 ${showAddForm ? "rotate-45" : ""}`} />
            </button>
          </div>

          {/* Add custom POI form */}
          {showAddForm && (
            <form onSubmit={handleAddCustomPOI} className="p-3 bg-muted/20 border border-outline-variant/30 rounded-xl space-y-3">
              <div className="space-y-1">
                <label htmlFor="custom-poi-name" className="text-[10px] font-bold text-muted-foreground uppercase">
                  Attraction Name *
                </label>
                <Input
                  id="custom-poi-name"
                  placeholder="e.g. Sirmione Ferry Pier"
                  value={poiName}
                  onChange={(e) => setPoiName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-poi-location" className="text-[10px] font-bold text-muted-foreground uppercase">
                  Location / City (Optional)
                </label>
                <Input
                  id="custom-poi-location"
                  placeholder="e.g. Sirmione"
                  value={poiLocation}
                  onChange={(e) => setPoiLocation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-poi-notes" className="text-[10px] font-bold text-muted-foreground uppercase">
                  Notes / Description (Optional)
                </label>
                <textarea
                  id="custom-poi-notes"
                  placeholder="e.g. Buy ferry tickets to Limone early in the morning."
                  value={poiNotes}
                  onChange={(e) => setPoiNotes(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm dark:bg-input/30 min-h-[50px] resize-none"
                />
              </div>

              <button 
                type="submit" 
                id="add-custom-poi-submit"
                className="w-full bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 font-semibold h-8 text-xs flex items-center justify-center gap-1.5 rounded-lg cursor-pointer transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Custom POI
              </button>
            </form>
          )}

          {/* Saved Attractions List */}
          {savedAttractions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-outline-variant/30 rounded-2xl bg-muted/5">
              <Compass className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-bold text-muted-foreground">No saved attractions yet</p>
              <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mt-0.5">
                Go to Home to bookmark nearby spots or add your custom ones.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter target bank">
                {(
                  [
                    { id: "all" as const, label: t.bankFilterAll },
                    { id: "unplanned" as const, label: t.bankFilterUnplanned },
                    { id: "planned" as const, label: t.bankFilterPlanned },
                  ] as const
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={bankFilter === id}
                    data-testid={`bank-filter-${id}`}
                    onClick={() => setBankFilter(id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      bankFilter === id
                        ? "bg-[#006400] text-white border-[#006400] dark:bg-[#86df72] dark:text-zinc-950 dark:border-[#86df72]"
                        : "bg-background text-muted-foreground border-outline-variant/30 hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {displayEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-outline-variant/30 rounded-2xl bg-muted/5">
                  <p className="text-xs font-bold text-muted-foreground">
                    {bankFilter === "planned"
                      ? "No planned attractions in this view"
                      : "No unplanned attractions in this view"}
                  </p>
                </div>
              ) : bankFilter === "all" ? (
                <>
                  {unplannedEntries.length > 0 && (
                    <div className="space-y-3">
                      <p
                        data-testid="bank-section-unplanned"
                        className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {t.bankSectionUnplanned}
                      </p>
                      {unplannedEntries.map(renderAttractionCard)}
                    </div>
                  )}
                  {plannedEntries.length > 0 && (
                    <div className="space-y-3">
                      <p
                        data-testid="bank-section-planned"
                        className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {t.bankSectionPlanned}
                      </p>
                      {plannedEntries.map(renderAttractionCard)}
                    </div>
                  )}
                </>
              ) : (
                displayEntries.map(renderAttractionCard)
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
