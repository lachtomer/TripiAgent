# Technical Plan: 011 — Target Bank Planned & Plan A/B per Day

**Feature spec:** `specs/011-bank-planned-plan-ab/spec.md`  
**Research:** `specs/011-bank-planned-plan-ab/research.md`  
**Data model:** `specs/011-bank-planned-plan-ab/data-model.md`  
**Contracts:** `specs/011-bank-planned-plan-ab/contracts/planned-bank-and-plan-ab.md`  
**Quickstart:** `specs/011-bank-planned-plan-ab/quickstart.md`  
**Tasks:** `specs/011-bank-planned-plan-ab/tasks.md` (after `/speckit-tasks`)  
**Branch:** `main` (port **9001**; one step at a time per project contract)

---

## 0. Problem statement

The Target Bank list treats **scheduled** places (Gardaland, Verona Arena, Rimbalzello, …) the same as **unused alternatives** (CanevaWorld, Movieland). Users scroll past “already planned” noise and assume they must **replan the whole trip**. There is no per-day **Plan B** surface for rain or closure without opening chat or manually hunting the bank.

Feature 011 adds **derived Planned status**, **sort/filter** on the bank, and a **collapsed Plan B panel** on each itinerary day card backed by a curated Lake Garda backup map.

---

## 1. Architectural Changes

### 1a. Data flow

```
itinerary + savedAttractions
        │
        ├─► getBankPlannedStatus(entry) ──► badge, disabled in picker
        │
        ├─► sortBankEntries() ──► Locations list + TargetBankDayPicker order
        │
        └─► getPlanBOptionsForDay(dayN) ──► PlanBDayPanel (max 2, unplanned only)
                    │
                    └─► addAttractionToItinerary(dayN, bankId, time)
                              └─ sets activity.sourceAttractionId
```

**No new API routes.** No new npm dependencies.

### 1b. In scope

| Surface | Change |
| --- | --- |
| `types/index.ts` | `Activity.sourceAttractionId?`, `SavedAttraction.backupForDay?`, `alternateFor?`, `planBReason?` |
| `lib/bankPlanned.ts` | **NEW** — normalize, fuzzy match, sort, planned status |
| `lib/planB.ts` | **NEW** — `LAKE_GARDA_DAY_BACKUPS`, `getPlanBOptionsForDay` |
| `lib/lakeGardaTargetBank.ts` | Seed metadata for key alternates (CanevaWorld, Movieland, …) |
| `stores/tripStore.ts` | `addAttractionToItinerary` sets `sourceAttractionId`; optional `swapActivityWithBankEntry` |
| `components/SavedAttractionsList.tsx` | Filter chips, Planned badge, sort, section headers, “View on itinerary” |
| `components/TargetBankDayPicker.tsx` | Same sort + badge; disable planned rows |
| `components/PlanBDayPanel.tsx` | **NEW** — accordion, add/swap actions |
| `components/ItineraryCard.tsx` | Mount `PlanBDayPanel` per day |
| `lib/translations.ts` | EN keys for Planned, filters, Plan B copy |
| Unit tests | `lib/bankPlanned.test.ts`, `lib/planB.test.ts` |
| E2E | `e2e/step25.bank-planned-plan-b.smoke.spec.ts` |

### 1c. Out of scope (v1)

- AI-generated Plan B
- Auto-replan / bulk day rewrite
- Weather-driven auto-swap (rain **highlight** only, optional)
- Home / Investigate duplicate of Plan B
- Server persistence beyond existing Zustand persist

---

## 2. Component Design & State

### 2a. NEW `lib/bankPlanned.ts`

```typescript
export interface PlannedStatus {
  isPlanned: boolean;
  scheduledDayNumbers: number[];
  matchKind: "id_link" | "title_exact" | "title_fuzzy" | null;
}

export function normalizePlanText(s: string): string;
export function titleTokensMatch(bankName: string, activityTitle: string, threshold?: number): boolean;
export function getBankPlannedStatus(entry: SavedAttraction, itinerary: ItineraryDay[]): PlannedStatus;
export function sortBankEntries(
  entries: SavedAttraction[],
  itinerary: ItineraryDay[]
): Array<{ entry: SavedAttraction; plannedStatus: PlannedStatus; originalIndex: number }>;
export type BankFilter = "all" | "unplanned" | "planned";
export function filterBankEntries(sorted: ReturnType<typeof sortBankEntries>, filter: BankFilter): ...;
```

**Matching order:** `sourceAttractionId` on any activity → normalized exact title → token overlap ≥80%.

### 2b. NEW `lib/planB.ts`

```typescript
export interface PlanBOption {
  bankId: string;
  name: string;
  reason: string;
  alternateFor?: string;
}

export function getPlanBOptionsForDay(
  dayNumber: number,
  itinerary: ItineraryDay[],
  savedAttractions: SavedAttraction[],
  options?: { max?: number }
): PlanBOption[];
```

- Reads `LAKE_GARDA_DAY_BACKUPS[dayNumber]`
- Resolves bank rows; **drops** entries where `getBankPlannedStatus.isPlanned`
- Cap at 2 (default)
- Optional: merge entries with `backupForDay === dayNumber` from bank metadata

### 2c. `PlanBDayPanel.tsx`

Props: `dayNumber`, `defaultExpandTime?: string` (e.g. `"14:00"`)

- Renders nothing when `getPlanBOptionsForDay` returns `[]`
- Collapsible header: `t.planBTitle` (“Backup options (Plan B)”)
- Each row: name, reason, **Add to this day** → `addAttractionToItinerary`
- Optional **Swap** → confirm dialog → `swapActivityWithBankEntry`
- `data-testid` per contract

### 2d. `SavedAttractionsList.tsx`

- Local state: `bankFilter: BankFilter`
- `useMemo` → `sortBankEntries` → `filterBankEntries`
- Planned badge + `bank-scheduled-days` hint
- Tap planned row → `router.push('/itinerary#day-card-{n}')` (first day)
- Optional visual split: unplanned / planned section headers

### 2e. `TargetBankDayPicker.tsx`

- Reuse `sortBankEntries`; planned rows show badge, `disabled` on select button
- Unplanned selection unchanged

### 2f. `tripStore.addAttractionToItinerary`

Add to new activity:

```typescript
sourceAttractionId: attractionId,
```

Optional new action:

```typescript
swapActivityWithBankEntry: (dayNumber, activityId, bankId, time?) => void;
```

Replaces activity fields from bank entry; preserves `id` and `time` unless overridden.

---

## 3. Lake Garda seed updates

Extend `lib/lakeGardaTargetBank.ts` for alternates (examples):

| id | backupForDay | alternateFor | planBReason |
| --- | --- | --- | --- |
| `bank-caneva-aqua` | 3, 6 | Self-Drive Boat / Gardaland | Rain backup · same area |
| `bank-movieland` | 3, 6 | — | Indoor backup · Caneva park |
| `bank-jungle-adventure` | 3 | — | Active backup · near Desenzano |

Add `lib/lakeGardaDayBackups.ts` with explicit day → `[{ bankId, reason, alternateFor? }]` for v1 deterministic E2E.

---

## 4. Implementation steps (one at a time)

| Step | Scope | Verification |
| --- | --- | --- |
| **1** | Types + `lib/bankPlanned.ts` + unit tests | `npm test -- bankPlanned` |
| **2** | `lib/planB.ts` + day backup map + seed metadata + tests | `npm test -- planB` |
| **3** | `tripStore` `sourceAttractionId`; `SavedAttractionsList` sort/filter/badge | Manual Locations; `check-no-hebrew-chrome` |
| **4** | `TargetBankDayPicker` planned UX | `step18` smoke |
| **5** | `PlanBDayPanel` + `ItineraryCard` integration + translations | Manual Day 3 / Day 6 |
| **6** | Optional swap dialog + store action | Unit or manual |
| **7** | E2E `step25` + regression `step18`/`step19` | `npm run test:e2e -- step25` |

Wait for user **`confirmed`** between steps.

---

## 5. Testing strategy

### Unit

- Gardaland + default itinerary → planned on day 6
- CanevaWorld → unplanned
- Sort: CanevaWorld before Gardaland
- Token match: “Verona Arena” ↔ bank “Verona Arena”
- Plan B day 3 returns 2 unplanned; after adding CanevaWorld, returns 1

### E2E (`step25`)

- Seed trip with default itinerary + Lake Garda bank (existing fixtures)
- Locations assertions per contract
- Expand Plan B day 3, add backup, assert toast / activity count

### Regression

- `step18` day picker add still works for unplanned entry
- `step19` itinerary refresh unchanged
- No Hebrew in chrome (`scripts/check-no-hebrew-chrome.mjs`)

---

## 6. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| False Planned (substring) | Token threshold + prefer `sourceAttractionId` |
| Dining title mismatch | Set `sourceAttractionId` on bank add; fuzzy match for seeded itinerary |
| Empty Plan B after all backups planned | Hide panel (spec) |
| Persisted old activities without id link | Title fuzzy match still works for major venues |

---

## 7. Success criteria

- SC-001: Planned badge on ≥90% of seeded scheduled venues (Gardaland, Verona Arena, Rimbalzello, Aquaria, …)
- SC-002: Unplanned entries appear above Planned in default list
- SC-003: Plan B visible on Jun 27 and Jun 30 default days with ≥1 unplanned backup
- SC-004: Add from Plan B does not remove Plan A activities
- SC-005: E2E step25 green; lint + unit + build green
