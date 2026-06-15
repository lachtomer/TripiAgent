# Tasks: 011 — Target Bank Planned & Plan A/B per Day

**Feature directory:** `specs/011-bank-planned-plan-ab`  
**Spec:** `specs/011-bank-planned-plan-ab/spec.md`  
**Plan:** `specs/011-bank-planned-plan-ab/plan.md`  
**Contracts:** `specs/011-bank-planned-plan-ab/contracts/planned-bank-and-plan-ab.md`  
**Quickstart:** `specs/011-bank-planned-plan-ab/quickstart.md`

> **Delivery rule:** One quickstart/plan step at a time; stop for **`confirmed`** before the next step (project contract).

---

## Status snapshot (2026-06-03)

| Plan step | Tasks | Status |
| --- | --- | --- |
| Step 1 — Types + `bankPlanned` lib | T002–T004 | **DONE** |
| Step 2 — Plan B lib + seed metadata | T005–T008 | **DONE** |
| Step 3 — Locations sort/filter/badge | T009–T013 | **DONE** |
| Step 4 — Target Bank day picker | T018 | **DONE** |
| Step 5 — Plan B panel + itinerary | T014–T017 | **DONE** |
| Step 6 — Swap + store tests (optional) | T019–T021 | **SKIPPED** (user chose Step 7) |
| Step 7 — E2E + full verification | T022–T025 | **DONE** |

---

## User story map

| ID | Priority | Story (from spec §2) |
| --- | --- | --- |
| US1 | P1 | Bank items already on itinerary labeled **Planned** |
| US2 | P1 | Unplanned suggestions at **top** of Target Bank list + filter chips |
| US3 | P1 | Each day shows Plan A + optional collapsed **Plan B** backups |
| US4 | P2 | Plan B limited to **1–2 sensible alternates** from bank |
| US5 | P2 | Planned status **updates** when activities added/removed (derived) |

---

## Dependencies

```text
Phase 1 (baseline)
    → Phase 2 (types + bankPlanned + planB libs)
            ├→ Phase 3 (US1 — Planned badge + sourceAttractionId)
            ├→ Phase 4 (US2 — sort, filter, navigate)
            │       └→ Phase 5 (US3/US4 — Plan B panel)
            │               └→ Phase 6 (US5 — picker + swap + store tests)
            └→ Phase 7 (E2E + constitution loop)
```

**Recommended order:** Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7.

---

## Phase 1: Setup

> **Goal:** Green baseline before feature work.

**Independent test:** `npm run lint` (TripiAgent paths) + `npm test` + `npm run build` exit 0.

- [ ] T001 Run baseline from repo root: `npx eslint lib components stores app hooks` then `npm test && npm run build`; exclude `jobmatcher-fix/` from scope

---

## Phase 2: Foundational — Types, planned matching, Plan B lib

> **Goal:** Client-side primitives for Planned detection, sort, and day backups.  
> **Maps to:** data-model.md, research Decisions 1–5, contract lib contract.

**Independent test:**

```bash
npm test -- lib/bankPlanned.test.ts lib/planB.test.ts
```

- [x] T002 Extend `types/index.ts` — add `Activity.sourceAttractionId?`; add `SavedAttraction.backupForDay?`, `alternateFor?`, `planBReason?`
- [x] T003 [P] Create `lib/bankPlanned.ts` — `normalizePlanText`, `titleTokensMatch`, `getBankPlannedStatus`, `sortBankEntries`, `filterBankEntries`, `BankFilter` per plan §2a
- [x] T004 Create `lib/bankPlanned.test.ts` — Gardaland planned day 6; CanevaWorld unplanned; sort order; Verona Arena exact match; token overlap ≥80%; `sourceAttractionId` link; empty itinerary all unplanned
- [x] T005 [P] Create `lib/lakeGardaDayBackups.ts` — `LAKE_GARDA_DAY_BACKUPS` map for days 3, 6, 7 per contract table
- [x] T006 Create `lib/planB.ts` — `getPlanBOptionsForDay(dayNumber, itinerary, savedAttractions, { max: 2 })`; drop planned entries; resolve names/reasons from bank
- [x] T007 Create `lib/planB.test.ts` — day 3 returns ≤2 unplanned (CanevaWorld, Movieland); day 6 Gardaland alternates; empty when all backups planned; hide panel days with no map
- [x] T008 Extend `lib/lakeGardaTargetBank.ts` — add `backupForDay`, `alternateFor`, `planBReason` on `bank-caneva-aqua`, `bank-movieland`, `bank-jungle-adventure` (and paragliding day 7 if present)

---

## Phase 3: User Story 1 — Planned badge (P1)

> **Story:** Bank items on itinerary show visible **Planned** badge.  
> **Maps to:** spec §3.A, success criteria 1.

**Independent test:** Locations tab — Gardaland, Verona Arena, Rimbalzello show `data-testid="bank-planned-badge"`; CanevaWorld does not.

- [x] T009 [US1] Modify `stores/tripStore.ts` — `addAttractionToItinerary` sets `sourceAttractionId: attractionId` on new activity
- [x] T010 [US1] Modify `lib/translations.ts` — keys: `bankPlannedBadge`, `bankScheduledOnDay`, `bankViewOnItinerary` (English only per Feature 009)
- [x] T011 [US1] Modify `components/SavedAttractionsList.tsx` — compute `getBankPlannedStatus` per row; render `[data-testid='bank-planned-badge']` with icon + text; `[data-testid='bank-scheduled-days']` when multiple days; `aria-label` includes day numbers

---

## Phase 4: User Story 2 — Sort & filter (P1)

> **Story:** Unplanned first, Planned last; filter chips All | Unplanned | Planned.  
> **Maps to:** spec §3.B, success criteria 2.

**Independent test:** Default list — CanevaWorld appears above Gardaland; filter **Unplanned only** hides Gardaland.

- [x] T012 [US2] Modify `components/SavedAttractionsList.tsx` — `useMemo` + `sortBankEntries` + `filterBankEntries`; filter chips `[data-testid='bank-filter-all']`, `bank-filter-unplanned`, `bank-filter-planned`; optional section headers `bank-section-unplanned` / `bank-section-planned`
- [x] T013 [US2] Modify `components/SavedAttractionsList.tsx` — tap Planned row → `router.push('/itinerary#day-card-{n}')` for earliest `scheduledDayNumbers[0]`; toast or inline “Scheduled on Day N”

---

## Phase 5: User Stories 3 & 4 — Plan B panel (P1 / P2)

> **Stories:** Collapsed Plan B per day; max 2 backup options with Add action.  
> **Maps to:** spec §3.C–D, success criteria 3–4.

**Independent test:** Itinerary Day 3 — expand `[data-testid='plan-b-toggle-day-3']` → see CanevaWorld + Movieland; Add appends activity without removing Plan A.

- [x] T014 [US3] Modify `lib/translations.ts` — keys: `planBTitle`, `planBAddToDay`, `planBViewBackup`, `planBWeatherHint`, `planBSwapConfirm` (if swap in scope)
- [x] T015 [US3] Create `components/PlanBDayPanel.tsx` — collapsed by default; `[data-testid='plan-b-toggle-day-{n}']` with `aria-expanded`; panel `[data-testid='plan-b-panel-day-{n}']`; rows `[data-testid='plan-b-option-{bankId}']`; Add `[data-testid='plan-b-add-day-{n}-{bankId}']` → `addAttractionToItinerary`; hide when zero options
- [x] T016 [US4] Enforce max 2 options in `components/PlanBDayPanel.tsx` via `getPlanBOptionsForDay(..., { max: 2 })`; show one-line `reason` per row
- [x] T017 [US3] Modify `components/ItineraryCard.tsx` — mount `PlanBDayPanel` below each day card activities block; pass `dayNumber` and default add time (e.g. `"14:00"`)

---

## Phase 6: User Story 5 — Picker, swap, reactive Planned (P2)

> **Story:** Picker respects Planned; optional swap with confirm; Planned updates when itinerary changes.  
> **Maps to:** spec §3.A–E, contract picker + swap testids.

**Independent test:** Day picker — planned rows disabled; add unplanned still works (`step18`); removing Gardaland from itinerary clears its Planned badge.

- [x] T018 [US5] Modify `components/TargetBankDayPicker.tsx` — use `sortBankEntries`; Planned badge on rows; disable selection for planned entries with “Already on itinerary” copy
- [ ] T019 [US5] Add `swapActivityWithBankEntry(dayNumber, activityId, bankId, time?)` to `stores/tripStore.ts` — replace title/description/location from bank; preserve activity `id` and `time` unless overridden; set `sourceAttractionId`
- [ ] T020 [US5] Modify `components/PlanBDayPanel.tsx` — optional Swap button `[data-testid='plan-b-swap-day-{n}-{bankId}']` + confirm dialog; no silent swap
- [ ] T021 [US5] Extend `stores/tripStore.test.ts` — `sourceAttractionId` on add; Planned clears after activity removal; swap updates activity fields

---

## Phase 7: E2E, regression, verification

> **Maps to:** contract E2E expectations, quickstart §5–6, constitution loop.

**Independent test:** `step25` green; `step18` + `step19` regression green; no Hebrew chrome.

- [x] T022 [P] Create `e2e/step25.bank-planned-plan-b.smoke.spec.ts` — (1) Locations: Gardaland Planned, CanevaWorld unplanned, sort order; (2) filter Unplanned hides Gardaland; (3) Day 3 Plan B expand + Add; (4) navigate from Planned row to itinerary anchor
- [x] T023 Run regression: `npx playwright test e2e/step18.target-bank-day-picker.smoke.spec.ts e2e/step19.itinerary-garda-refresh.smoke.spec.ts`
- [x] T024 Run `node scripts/check-no-hebrew-chrome.mjs` after UI string changes
- [x] T025 Run constitution loop: `npm run lint && npm test && npm run build` green; full `npm run test:e2e` — step25 + step18/19 green; 4 pre-existing failures (step6/10/16/21), 5 flaky (unrelated to 011)

---

## Parallel opportunities

| Tasks | Can run in parallel after |
| --- | --- |
| T003 + T005 | T002 |
| T006 | T003, T005 |
| T010 + T014 | T003 (translations independent of UI wiring) |
| T015 + T018 | T006, T009 (panel vs picker different files) |
| T022 | T011–T017 (E2E spec can be drafted while UI lands) |

---

## MVP scope (first shippable increment)

**Minimum:** Phase 2 + Phase 3 + Phase 4 (T002–T013) — Planned badge + sort/filter on Locations without Plan B panel.  
**Full feature:** through T025 (Plan B on itinerary + picker + E2E + constitution loop).

---

## Implementation steps ↔ tasks (plan §4)

| Plan step | Task IDs |
| --- | --- |
| 1 — Types + `bankPlanned` | T002–T004 |
| 2 — Plan B lib + seed | T005–T008 |
| 3 — Locations UI + store link | T009–T013 |
| 4 — Target Bank picker | T018 |
| 5 — Plan B panel + itinerary | T014–T017 |
| 6 — Swap + store tests | T019–T021 |
| 7 — E2E + verify | T022–T025 |
