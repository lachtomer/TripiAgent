# Research — 011 Target Bank Planned & Plan A/B

**Status:** COMPLETE — v1 approach resolved.

---

## Decision 1: Planned status is derived, not stored

- **Decision:** Compute `isPlanned`, `scheduledDayNumbers[]` from itinerary + optional `activity.sourceAttractionId` at render time.
- **Rationale:** Spec requires auto-update when activities added/removed; avoids stale flags in `savedAttractions`.
- **Alternatives considered:** Persist `planned: boolean` on bank entries (rejected — sync burden).

---

## Decision 2: Title matching with token overlap

- **Decision:** Match bank `name` to activity `title` when ≥80% of bank name tokens (length ≥3) appear in normalized activity title, **or** exact normalized equality, **or** `activity.sourceAttractionId === bank.id`.
- **Rationale:** Spec edge case “Verona” vs “Verona Arena”; token rule reduces false positives.
- **Alternatives considered:** Substring only (rejected — too many false positives).

---

## Decision 3: Sort — unplanned first, planned by day

- **Decision:** Single pass sort: `(isPlanned ? 1 : 0)`, then `minScheduledDay`, then original index.
- **Rationale:** Spec §3.B; stable within groups.
- **Alternatives considered:** Separate sections with headers (acceptable UI enhancement in same step).

---

## Decision 4: Plan B from curated day backup map + bank metadata

- **Decision:** New static map `LAKE_GARDA_DAY_BACKUPS: Record<dayNumber, PlanBEntry[]>` with bank ids + reason strings; only include entries where bank is **not** Planned.
- **Rationale:** Spec §3.D tertiary + user’s Jun 27 rain case; avoids parsing free text at runtime for v1 core path.
- **Supplement:** Extend bank seed with optional `backupForDay?: number`, `alternateFor?: string` on `SavedAttraction` for future trips; parser for “Jun 27” in description as fallback.
- **Alternatives considered:** AI Plan B (out of scope); parse description only (fragile alone).

---

## Decision 5: `sourceAttractionId` on activities from bank

- **Decision:** When `addAttractionToItinerary` runs, set `sourceAttractionId: attractionId` on new activity.
- **Rationale:** Reliable Planned detection for dining rows whose titles differ slightly from bank name.
- **Alternatives considered:** Backfill matcher only (insufficient for “Welcome Dinner” vs “Trattoria del Ponte”).

---

## Decision 6: Plan B UI on itinerary day card only (v1)

- **Decision:** Collapsible `PlanBDayPanel` inside `ItineraryCard` per day; Locations list gets Planned badge + sort only.
- **Rationale:** Spec §3.C; keeps Plan A/B contextual to the day.
- **Alternatives considered:** Duplicate Plan B on Home Investigate (deferred).

---

## Decision 7: Swap is optional confirm dialog

- **Decision:** “Replace activity…” opens dialog: pick one Plan A activity on that day + confirm → `swapActivityWithBankEntry(dayNumber, activityId, bankId)`.
- **Rationale:** Spec §3.E no silent swap.
- **Alternatives considered:** Skip swap in v1 (acceptable MVP — Add to day only in Step 1).

---

## Decision 8: No new API routes

- **Decision:** Pure client lib + Zustand; unit tests on `lib/bankPlanned.ts` and `lib/planB.ts`.
- **Rationale:** Spec §3.F; constitution no DB v1.

---

## Open questions (deferred)

- Swap in MVP vs Phase 2 → **include swap** if ≤1 day effort; else Add-only in Step 4.
- Section headers “Alternatives” / “Already planned” on Locations → **yes** in UI step.
