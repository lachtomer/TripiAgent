"use client";

import { useMemo, useState } from "react";
import { Bookmark, CalendarCheck, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTripStore } from "@/stores/tripStore";
import { useTranslation } from "@/lib/translations";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { sortBankEntries } from "@/lib/bankPlanned";

interface TargetBankDayPickerProps {
  dayNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export default function TargetBankDayPicker({
  dayNumber,
  open,
  onOpenChange,
  disabled = false,
}: TargetBankDayPickerProps) {
  const { t } = useTranslation();
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const itinerary = useTripStore((s) => s.itinerary);
  const addAttractionToItinerary = useTripStore((s) => s.addAttractionToItinerary);
  const setToast = useTripStore((s) => s.setToast);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("12:00");

  const activeItinerary =
    itinerary && itinerary.length > 0 ? itinerary : DEFAULT_ITALY_ITINERARY;

  const sortedEntries = useMemo(
    () => sortBankEntries(savedAttractions, activeItinerary),
    [savedAttractions, activeItinerary]
  );

  const formatScheduledDaysLabel = (days: number[]) => {
    if (days.length === 0) return "";
    if (days.length === 1) {
      return t.bankScheduledOnDay.replace("{day}", String(days[0]));
    }
    return days.map((day) => `Day ${day}`).join(", ");
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    const selectedRow = sortedEntries.find((row) => row.entry.id === selectedId);
    if (selectedRow?.plannedStatus.isPlanned) return;

    addAttractionToItinerary(dayNumber, selectedId, scheduleTime);
    const name = savedAttractions.find((a) => a.id === selectedId)?.name ?? "";
    setToast({
      message: t.addedToDay.replace("{name}", name).replace("{day}", String(dayNumber)),
      type: "success",
    });
    setSelectedId(null);
    setScheduleTime("12:00");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-2xl px-4 pb-8"
        data-testid={`target-bank-picker-sheet-day-${dayNumber}`}
      >
        <SheetHeader className="text-start pb-2">
          <SheetTitle className="text-base font-extrabold text-foreground">
            {t.targetBankPickerTitle.replace("{day}", String(dayNumber))}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t.targetBankPickerDescription}
          </SheetDescription>
        </SheetHeader>

        {savedAttractions.length === 0 ? (
          <div
            className="py-8 text-center space-y-2"
            data-testid="target-bank-picker-empty"
          >
            <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-xs font-bold text-muted-foreground">{t.targetBankPickerEmpty}</p>
            <p className="text-[10px] text-muted-foreground/70 max-w-[260px] mx-auto">
              {t.targetBankPickerEmptyHint}
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[50vh] pe-1">
            <ul className="space-y-2" data-testid="target-bank-picker-list">
              {sortedEntries.map(({ entry: attraction, plannedStatus }) => {
                const isPlanned = plannedStatus.isPlanned;
                const isSelected = selectedId === attraction.id;
                const up = (attraction.upvotes || []).length;
                const down = (attraction.downvotes || []).length;
                const scheduledLabel = formatScheduledDaysLabel(plannedStatus.scheduledDayNumbers);
                const rowDisabled = disabled || isPlanned;

                return (
                  <li key={attraction.id}>
                    <button
                      type="button"
                      data-testid={`target-bank-picker-row-${attraction.id}`}
                      disabled={rowDisabled}
                      onClick={() => {
                        if (isPlanned) return;
                        setSelectedId(attraction.id);
                      }}
                      className={`w-full flex gap-3 p-3 rounded-xl border text-start transition-colors min-h-12 ${
                        rowDisabled && !isPlanned
                          ? "opacity-50 cursor-not-allowed"
                          : isPlanned
                            ? "opacity-70 cursor-not-allowed border-outline-variant/20 bg-muted/20"
                            : "cursor-pointer"
                      } ${
                        isSelected
                          ? "border-[#006400]/40 bg-[#006400]/5 dark:border-[#86df72]/30 dark:bg-[#86df72]/10"
                          : !isPlanned
                            ? "border-outline-variant/25 bg-card hover:bg-muted/10"
                            : ""
                      }`}
                      aria-pressed={isSelected}
                      aria-disabled={isPlanned}
                      aria-label={
                        isPlanned
                          ? `${attraction.name}: ${t.targetBankPickerAlreadyPlanned}`
                          : t.targetBankPickerSelect.replace("{name}", attraction.name)
                      }
                    >
                      {attraction.image && (
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 relative">
                          <Image
                            src={attraction.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">{attraction.name}</p>
                          {isPlanned && (
                            <span
                              data-testid="bank-planned-badge"
                              aria-label={`${t.bankPlannedBadge}: ${scheduledLabel}`}
                              className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300 flex items-center gap-0.5"
                            >
                              <CalendarCheck className="h-3 w-3" aria-hidden="true" />
                              {t.bankPlannedBadge}
                            </span>
                          )}
                        </div>
                        {isPlanned && scheduledLabel && (
                          <p
                            data-testid="bank-scheduled-days"
                            className="text-[9px] font-semibold text-sky-700/80 dark:text-sky-300/80 mt-0.5"
                          >
                            {scheduledLabel}
                          </p>
                        )}
                        {isPlanned && (
                          <p className="text-[9px] font-semibold text-muted-foreground mt-0.5">
                            {t.targetBankPickerAlreadyPlanned}
                          </p>
                        )}
                        {attraction.locationName && (
                          <p className="text-[10px] text-muted-foreground truncate">{attraction.locationName}</p>
                        )}
                        {(up > 0 || down > 0) && (
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            👍 {up} · 👎 {down}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 pt-1">
              <Clock className="h-4 w-4 text-[#006400] dark:text-[#86df72] shrink-0" />
              <label htmlFor={`target-bank-time-day-${dayNumber}`} className="text-[10px] font-bold text-muted-foreground uppercase">
                {t.timeLabel}
              </label>
              <Input
                id={`target-bank-time-day-${dayNumber}`}
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={disabled || !selectedId}
                className="h-10 w-32 text-xs ms-auto"
                data-testid={`target-bank-picker-time-day-${dayNumber}`}
              />
            </div>

            <Button
              id={`target-bank-picker-confirm-day-${dayNumber}`}
              data-testid={`target-bank-picker-confirm-day-${dayNumber}`}
              disabled={disabled || !selectedId}
              onClick={handleConfirm}
              className="w-full min-h-12 bg-[#006400] hover:bg-[#004d00] text-white font-bold rounded-xl cursor-pointer"
              aria-label={t.targetBankPickerConfirm}
            >
              {t.targetBankPickerConfirm}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
