"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, CloudRain, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/stores/tripStore";
import { useTranslation } from "@/lib/translations";
import { DEFAULT_ITALY_ITINERARY } from "@/lib/defaultItalyItinerary";
import { getPlanBOptionsForDay } from "@/lib/planB";
import PlaceNameLink from "@/components/PlaceNameLink";
import { resolveSavedAttractionLinks } from "@/lib/urlSafety";

interface PlanBDayPanelProps {
  dayNumber: number;
  defaultAddTime?: string;
  disabled?: boolean;
  showWeatherHint?: boolean;
}

export default function PlanBDayPanel({
  dayNumber,
  defaultAddTime = "14:00",
  disabled = false,
  showWeatherHint = false,
}: PlanBDayPanelProps) {
  const { t } = useTranslation();
  const savedAttractions = useTripStore((s) => s.savedAttractions);
  const itinerary = useTripStore((s) => s.itinerary);
  const addAttractionToItinerary = useTripStore((s) => s.addAttractionToItinerary);
  const setToast = useTripStore((s) => s.setToast);

  const [expanded, setExpanded] = useState(false);
  const [detailsBankId, setDetailsBankId] = useState<string | null>(null);

  const activeItinerary =
    itinerary && itinerary.length > 0 ? itinerary : DEFAULT_ITALY_ITINERARY;

  const options = useMemo(
    () =>
      getPlanBOptionsForDay(dayNumber, activeItinerary, savedAttractions, {
        max: 2,
      }),
    [dayNumber, activeItinerary, savedAttractions]
  );

  if (options.length === 0) {
    return null;
  }

  const handleAdd = (bankId: string, name: string) => {
    if (disabled) return;
    addAttractionToItinerary(dayNumber, bankId, defaultAddTime);
    setToast({
      message: t.addedToDay.replace("{name}", name).replace("{day}", String(dayNumber)),
      type: "success",
    });
  };

  return (
    <div className="border border-outline-variant/25 rounded-xl bg-muted/10 overflow-hidden">
      <button
        type="button"
        data-testid={`plan-b-toggle-day-${dayNumber}`}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-start cursor-pointer hover:bg-muted/20 transition-colors"
      >
        <span className="text-[11px] font-extrabold text-foreground">{t.planBTitle}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div
          data-testid={`plan-b-panel-day-${dayNumber}`}
          className="px-3 pb-3 space-y-2 border-t border-outline-variant/20"
        >
          {showWeatherHint && (
            <p
              data-testid={`plan-b-weather-hint-day-${dayNumber}`}
              className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 pt-2"
            >
              <CloudRain className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t.planBWeatherHint}
            </p>
          )}

          {options.map((option) => {
            const bankEntry = savedAttractions.find((entry) => entry.id === option.bankId);
            const links = bankEntry ? resolveSavedAttractionLinks(bankEntry) : null;
            const showDetails = detailsBankId === option.bankId;

            return (
              <div
                key={option.bankId}
                data-testid={`plan-b-option-${option.bankId}`}
                className="rounded-lg border border-outline-variant/20 bg-card p-2.5 space-y-2"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{option.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{option.reason}</p>
                  {option.alternateFor && (
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5">
                      Alternate for: {option.alternateFor}
                    </p>
                  )}
                </div>

                {showDetails && bankEntry && (
                  <div className="text-[10px] text-muted-foreground space-y-1 pt-1 border-t border-outline-variant/15">
                    {bankEntry.description && <p>{bankEntry.description}</p>}
                    <PlaceNameLink
                      placeId={bankEntry.id}
                      name={bankEntry.name}
                      websiteUrl={links?.websiteUrl}
                      mapsUrl={links?.mapsUrl}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    data-testid={`plan-b-add-day-${dayNumber}-${option.bankId}`}
                    onClick={() => handleAdd(option.bankId, option.name)}
                    className="h-8 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3 w-3 me-1" />
                    {t.planBAddToDay}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!bankEntry}
                    onClick={() =>
                      setDetailsBankId(showDetails ? null : option.bankId)
                    }
                    className="h-8 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    {showDetails ? t.planBHideBackup : t.planBViewBackup}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
