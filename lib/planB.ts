import type { ItineraryDay, SavedAttraction } from "@/types";
import { getBankPlannedStatus } from "@/lib/bankPlanned";
import { LAKE_GARDA_DAY_BACKUPS, type LakeGardaDayBackupEntry } from "@/lib/lakeGardaDayBackups";

export interface PlanBOption {
  bankId: string;
  name: string;
  reason: string;
  alternateFor?: string;
}

export interface GetPlanBOptionsParams {
  max?: number;
}

const DEFAULT_MAX = 2;

function resolveReason(
  mapEntry: LakeGardaDayBackupEntry | undefined,
  bankEntry: SavedAttraction
): string {
  if (mapEntry?.reason) return mapEntry.reason;
  if (bankEntry.planBReason) return bankEntry.planBReason;
  return "Backup option";
}

function resolveAlternateFor(
  mapEntry: LakeGardaDayBackupEntry | undefined,
  bankEntry: SavedAttraction
): string | undefined {
  return mapEntry?.alternateFor ?? bankEntry.alternateFor;
}

function buildCandidateList(
  dayNumber: number,
  savedAttractions: SavedAttraction[]
): LakeGardaDayBackupEntry[] {
  const fromMap = [...(LAKE_GARDA_DAY_BACKUPS[dayNumber] ?? [])];
  const seen = new Set(fromMap.map((entry) => entry.bankId));

  for (const entry of savedAttractions) {
    if (entry.backupForDay !== dayNumber || seen.has(entry.id)) continue;
    seen.add(entry.id);
    fromMap.push({
      bankId: entry.id,
      reason: entry.planBReason ?? "Backup option",
      alternateFor: entry.alternateFor,
    });
  }

  return fromMap;
}

export function getPlanBOptionsForDay(
  dayNumber: number,
  itinerary: ItineraryDay[],
  savedAttractions: SavedAttraction[],
  options?: GetPlanBOptionsParams
): PlanBOption[] {
  const max = options?.max ?? DEFAULT_MAX;
  const candidates = buildCandidateList(dayNumber, savedAttractions);
  if (candidates.length === 0) return [];

  const bankById = new Map(savedAttractions.map((entry) => [entry.id, entry]));
  const results: PlanBOption[] = [];

  for (const candidate of candidates) {
    if (results.length >= max) break;

    const bankEntry = bankById.get(candidate.bankId);
    if (!bankEntry) continue;

    const plannedStatus = getBankPlannedStatus(bankEntry, itinerary);
    if (plannedStatus.isPlanned) continue;

    results.push({
      bankId: bankEntry.id,
      name: bankEntry.name,
      reason: resolveReason(candidate, bankEntry),
      alternateFor: resolveAlternateFor(candidate, bankEntry),
    });
  }

  return results;
}
