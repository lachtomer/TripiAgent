import type { ItineraryDay, SavedAttraction } from "@/types";

export interface PlannedStatus {
  isPlanned: boolean;
  scheduledDayNumbers: number[];
  matchKind: "id_link" | "title_exact" | "title_fuzzy" | null;
}

export type BankFilter = "all" | "unplanned" | "planned";

export interface SortedBankEntry {
  entry: SavedAttraction;
  plannedStatus: PlannedStatus;
  originalIndex: number;
}

const DEFAULT_TOKEN_THRESHOLD = 0.8;

/** Lowercase, strip punctuation, collapse whitespace for title matching. */
export function normalizePlanText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(text: string): string[] {
  return normalizePlanText(text).split(" ").filter((token) => token.length >= 3);
}

function activityTitleTokens(title: string): Set<string> {
  return new Set(normalizePlanText(title).split(" ").filter(Boolean));
}

/**
 * True when ≥threshold of bank name tokens (length ≥3) appear in the activity title.
 */
export function titleTokensMatch(
  bankName: string,
  activityTitle: string,
  threshold = DEFAULT_TOKEN_THRESHOLD
): boolean {
  const bankTokens = significantTokens(bankName);
  if (bankTokens.length === 0) {
    return normalizePlanText(bankName) === normalizePlanText(activityTitle);
  }

  const titleTokens = activityTitleTokens(activityTitle);
  const matched = bankTokens.filter((token) => titleTokens.has(token)).length;
  return matched / bankTokens.length >= threshold;
}

type MatchKind = NonNullable<PlannedStatus["matchKind"]>;

function matchKindRank(kind: MatchKind): number {
  switch (kind) {
    case "id_link":
      return 3;
    case "title_exact":
      return 2;
    case "title_fuzzy":
      return 1;
  }
}

function matchActivityToBank(
  entry: SavedAttraction,
  activityTitle: string,
  sourceAttractionId?: string
): MatchKind | null {
  if (sourceAttractionId === entry.id) {
    return "id_link";
  }

  const normalizedBank = normalizePlanText(entry.name);
  const normalizedTitle = normalizePlanText(activityTitle);
  if (normalizedBank === normalizedTitle) {
    return "title_exact";
  }

  if (titleTokensMatch(entry.name, activityTitle)) {
    return "title_fuzzy";
  }

  return null;
}

export function getBankPlannedStatus(
  entry: SavedAttraction,
  itinerary: ItineraryDay[]
): PlannedStatus {
  const scheduledDayNumbers: number[] = [];
  let bestKind: PlannedStatus["matchKind"] = null;

  for (const day of itinerary) {
    for (const activity of day.activities) {
      const kind = matchActivityToBank(entry, activity.title, activity.sourceAttractionId);
      if (!kind) continue;

      if (!scheduledDayNumbers.includes(day.dayNumber)) {
        scheduledDayNumbers.push(day.dayNumber);
      }

      if (!bestKind || matchKindRank(kind) > matchKindRank(bestKind)) {
        bestKind = kind;
      }
    }
  }

  scheduledDayNumbers.sort((a, b) => a - b);

  return {
    isPlanned: scheduledDayNumbers.length > 0,
    scheduledDayNumbers,
    matchKind: bestKind,
  };
}

export function sortBankEntries(
  entries: SavedAttraction[],
  itinerary: ItineraryDay[]
): SortedBankEntry[] {
  const sorted = entries.map((entry, originalIndex) => ({
    entry,
    plannedStatus: getBankPlannedStatus(entry, itinerary),
    originalIndex,
  }));

  sorted.sort((a, b) => {
    const plannedRank = Number(a.plannedStatus.isPlanned) - Number(b.plannedStatus.isPlanned);
    if (plannedRank !== 0) return plannedRank;

    if (a.plannedStatus.isPlanned && b.plannedStatus.isPlanned) {
      const aDay = a.plannedStatus.scheduledDayNumbers[0] ?? Number.MAX_SAFE_INTEGER;
      const bDay = b.plannedStatus.scheduledDayNumbers[0] ?? Number.MAX_SAFE_INTEGER;
      if (aDay !== bDay) return aDay - bDay;
      return a.entry.name.localeCompare(b.entry.name);
    }

    return a.originalIndex - b.originalIndex;
  });

  return sorted;
}

export function filterBankEntries(
  sorted: SortedBankEntry[],
  filter: BankFilter
): SortedBankEntry[] {
  if (filter === "all") return sorted;
  if (filter === "unplanned") {
    return sorted.filter((row) => !row.plannedStatus.isPlanned);
  }
  return sorted.filter((row) => row.plannedStatus.isPlanned);
}
