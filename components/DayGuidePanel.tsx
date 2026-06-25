"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, UtensilsCrossed, MapPin } from "lucide-react";
import PlaceNameLink from "@/components/PlaceNameLink";
import { getDayGuide } from "@/lib/tripDayGuides";
import { groupFoodByLocation } from "@/lib/dayGuideFoodGrouping";
import { useTranslation } from "@/lib/translations";
import type { DayGuideFood, DayGuideLocation, DayGuideOption } from "@/types";
import { cn } from "@/lib/utils";

interface DayGuidePanelProps {
  dayNumber: number;
  defaultExpanded?: boolean;
}

function mealLabel(
  when: DayGuideFood["when"],
  t: {
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  }
): string {
  if (when === "lunch") return t.dayGuideLunch;
  if (when === "dinner") return t.dayGuideDinner;
  return t.dayGuideSnack;
}

function MustSeeList({
  locations,
  optionalLabel,
}: {
  locations: DayGuideLocation[];
  optionalLabel: string;
}) {
  return (
    <ul className="space-y-3">
      {locations.map((location) => (
        <li
          key={location.id}
          data-testid={`day-guide-location-${location.id}`}
          className="space-y-1.5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="h-3 w-3 text-[#006400] dark:text-[#86df72] shrink-0" aria-hidden="true" />
            <PlaceNameLink
              placeId={location.id}
              name={location.name}
              websiteUrl={location.websiteUrl}
              mapsUrl={location.mapsUrl}
              variant="md"
            />
            {location.optional && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-outline-variant/30">
                {optionalLabel}
              </span>
            )}
          </div>
          <ul className="ps-5 space-y-1">
            {location.mustSee.map((spot) => (
              <li
                key={spot.id}
                data-testid={`day-guide-spot-${spot.id}`}
                className="text-xs text-muted-foreground leading-relaxed text-start"
              >
                <span dir="ltr" className="inline">
                  • <span className="font-semibold text-foreground">{spot.title}</span>
                  {spot.detail ? ` — ${spot.detail}` : ""}
                  {spot.optional && (
                    <span
                      data-testid={`day-guide-optional-${spot.id}`}
                      className="ms-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      ({optionalLabel})
                    </span>
                  )}
                  {spot.link && (
                    <>
                      {" "}
                      <a
                        href={spot.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#006400] dark:text-[#86df72] font-bold hover:underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {spot.linkLabel ?? "Link"}
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function FoodItemRow({
  item,
  t,
}: {
  item: DayGuideFood;
  t: {
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
}) {
  return (
    <li
      data-testid={`day-guide-food-item-${item.id}`}
      className={cn(
        "rounded-lg px-2.5 py-2 border border-outline-variant/20 bg-card/50",
        item.isPrimary && "border-[#006400]/25 dark:border-[#86df72]/25 bg-[#006400]/5 dark:bg-[#86df72]/5"
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#006400] dark:text-[#86df72] shrink-0">
          {mealLabel(item.when, t)}
        </span>
        <PlaceNameLink
          placeId={item.id}
          name={item.name}
          websiteUrl={item.websiteUrl}
          mapsUrl={item.mapsUrl}
        />
      </div>
      <p dir="ltr" className="text-[10px] text-muted-foreground mt-0.5 ps-0.5 text-start">
        {item.style}
      </p>
    </li>
  );
}

function FoodList({
  dayNumber,
  food,
  t,
  showHeading = true,
}: {
  dayNumber: number;
  food: DayGuideFood[];
  t: {
    dayGuideFood: string;
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
  showHeading?: boolean;
}) {
  if (food.length === 0) return null;

  return (
    <div className="space-y-2 pt-1">
      {showHeading && (
        <p
          data-testid={`day-guide-food-${dayNumber}`}
          className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
        >
          <UtensilsCrossed className="h-3 w-3 shrink-0" aria-hidden="true" />
          {t.dayGuideFood}
        </p>
      )}
      <ul className="space-y-2">
        {food.map((item) => (
          <FoodItemRow key={item.id} item={item} t={t} />
        ))}
      </ul>
    </div>
  );
}

function LocationFoodSublist({
  food,
  t,
}: {
  food: DayGuideFood[];
  t: {
    dayGuideFood: string;
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
}) {
  if (food.length === 0) return null;

  return (
    <div className="ps-5 pt-2 space-y-1.5">
      <p className="text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <UtensilsCrossed className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
        {t.dayGuideFood}
      </p>
      <ul className="space-y-2">
        {food.map((item) => (
          <FoodItemRow key={item.id} item={item} t={t} />
        ))}
      </ul>
    </div>
  );
}

function LocationGuideList({
  locations,
  food,
  optionalLabel,
  t,
}: {
  locations: DayGuideLocation[];
  food: DayGuideFood[];
  optionalLabel: string;
  t: {
    dayGuideFood: string;
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
}) {
  const { byLocation, ungrouped } = groupFoodByLocation(locations, food);

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {byLocation.map(({ location, food: locationFood }) => (
          <li
            key={location.id}
            data-testid={`day-guide-location-${location.id}`}
            className="space-y-1.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <MapPin className="h-3 w-3 text-[#006400] dark:text-[#86df72] shrink-0" aria-hidden="true" />
              <PlaceNameLink
                placeId={location.id}
                name={location.name}
                websiteUrl={location.websiteUrl}
                mapsUrl={location.mapsUrl}
                variant="md"
              />
              {location.optional && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-outline-variant/30">
                  {optionalLabel}
                </span>
              )}
            </div>
            <ul className="ps-5 space-y-1">
              {location.mustSee.map((spot) => (
                <li
                  key={spot.id}
                  data-testid={`day-guide-spot-${spot.id}`}
                  className="text-xs text-muted-foreground leading-relaxed text-start"
                >
                  <span dir="ltr" className="inline">
                    • <span className="font-semibold text-foreground">{spot.title}</span>
                    {spot.detail ? ` — ${spot.detail}` : ""}
                    {spot.optional && (
                      <span
                        data-testid={`day-guide-optional-${spot.id}`}
                        className="ms-1.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        ({optionalLabel})
                      </span>
                    )}
                    {spot.link && (
                      <>
                        {" "}
                        <a
                          href={spot.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#006400] dark:text-[#86df72] font-bold hover:underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {spot.linkLabel ?? "Link"}
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <LocationFoodSublist food={locationFood} t={t} />
          </li>
        ))}
      </ul>
      {ungrouped.length > 0 && (
        <FoodList dayNumber={-1} food={ungrouped} t={t} showHeading />
      )}
    </div>
  );
}

function GuideContentBlock({
  dayNumber,
  locations,
  food,
  t,
  seeHeading = true,
}: {
  dayNumber: number;
  locations: DayGuideLocation[];
  food: DayGuideFood[];
  t: {
    dayGuideWhatToSee: string;
    dayGuideFood: string;
    dayGuideOptional: string;
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
  seeHeading?: boolean;
}) {
  return (
    <div className="space-y-3">
      {locations.length > 0 && (
        <div>
          {seeHeading && (
            <p
              data-testid={`day-guide-see-${dayNumber}`}
              className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"
            >
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {t.dayGuideWhatToSee}
            </p>
          )}
          <MustSeeList locations={locations} optionalLabel={t.dayGuideOptional} />
        </div>
      )}
      <FoodList dayNumber={dayNumber} food={food} t={t} />
    </div>
  );
}

function OptionBlock({
  option,
  t,
}: {
  option: DayGuideOption;
  t: {
    dayGuideWhatToSee: string;
    dayGuideFood: string;
    dayGuideOptional: string;
    dayGuideLunch: string;
    dayGuideDinner: string;
    dayGuideSnack: string;
  };
}) {
  return (
    <div
      data-testid={`day-guide-option-${option.id}`}
      className="rounded-lg border border-outline-variant/25 bg-card/40 p-3 space-y-3"
    >
      <p className="text-xs font-extrabold text-foreground">{option.label}</p>
      <LocationGuideList
        locations={option.locations}
        food={option.food}
        optionalLabel={t.dayGuideOptional}
        t={t}
      />
    </div>
  );
}

export default function DayGuidePanel({ dayNumber, defaultExpanded = false }: DayGuidePanelProps) {
  const { t } = useTranslation();
  const guide = getDayGuide(dayNumber);
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!guide) {
    return null;
  }

  const contentId = `day-guide-content-${dayNumber}`;

  return (
    <div
      data-testid={`day-guide-${dayNumber}`}
      className="border border-outline-variant/25 rounded-xl bg-[#006400]/[0.03] dark:bg-[#86df72]/5 overflow-hidden"
    >
      <button
        type="button"
        id={`day-guide-toggle-${dayNumber}`}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-start cursor-pointer hover:bg-muted/15 transition-colors min-h-11"
      >
        <span className="text-[11px] font-extrabold text-[#006400] dark:text-[#86df72]">
          {t.dayGuideTitle}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div
          id={contentId}
          className="px-3 pb-3 pt-1 space-y-3 border-t border-outline-variant/20 animate-in slide-in-from-top-1 duration-200"
        >
          {guide.bannerNote && (
            <p
              data-testid={`day-guide-banner-${dayNumber}`}
              role="status"
              className="text-[10px] font-bold text-amber-700 dark:text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 leading-relaxed"
            >
              {guide.bannerNote}
            </p>
          )}

          {guide.options && guide.options.length > 0 ? (
            <div className="space-y-3">
              {guide.options.map((option) => (
                <OptionBlock key={option.id} option={option} t={t} />
              ))}
            </div>
          ) : (
            <GuideContentBlock
              dayNumber={dayNumber}
              locations={guide.locations ?? []}
              food={guide.food ?? []}
              t={t}
            />
          )}
        </div>
      )}
    </div>
  );
}
