# Tasks: Step 16 — Move Map to Home & Logistics to Bookings

> Spec: `.specify/step_16_map_to_home_logistics_to_bookings.md`
> Plan: `.specify/plans/step_16_plan.md`
> Research: `.specify/plans/step_16_research.md`

---

## User Stories

| ID | Story | Priority |
|---|---|---|
| US1 | Active Route Map visible on Home; removed from Planning sidebar | P1 |
| US2 | Logistics & Orders card lives on the Bookings tab; nav tab renamed | P1 |

---

## Phase 1: Foundational — Translations (shared prerequisite)

> Both US1 and US2 are blocked on nothing, but US2 depends on the nav label being correct.
> This single foundational change unblocks the rest.

- [ ] T001 Update `bookings` translation key: `"ניירות"` → `"לוגיסטיקה"` (Hebrew) and `"Bookings"` → `"Logistics"` (English) in `lib/translations.ts`

---

## Phase 2: US1 — Active Route Map → Home only

> Independent of US2. Can execute in parallel with Phase 3.

Story goal: `MapPreview` renders directly on the home page; the planning sidebar no longer contains a map.

Independent test criteria:
- `http://localhost:9001/` shows the Lake Garda route map card near the top of the page.
- `http://localhost:9001/itinerary` sidebar shows NO map component.

- [ ] T002 [US1] In `app/page.tsx`: remove `import ActiveRouteMapCard` and `<ActiveRouteMapCard />` JSX; add `import MapPreview` and render `<MapPreview />` inside the existing `<div className="px-4 pt-3">` wrapper
- [ ] T003 [US1] In `app/itinerary/page.tsx`: remove `import MapPreview` and its `<MapPreview />` JSX from the sidebar column (keep ItineraryCard, EssentialsChecklist, LogisticsCard, SavedAttractionsList untouched at this stage)

---

## Phase 3: US2 — Logistics & Orders → Bookings tab

> Independent of US2. Can execute in parallel with Phase 2.

Story goal: `LogisticsCard` is the primary content of `/bookings`; the planning sidebar no longer contains it; the nav tab reads "לוגיסטיקה".

Independent test criteria:
- `http://localhost:9001/bookings` renders `LogisticsCard` with page heading "לוגיסטיקה והזמנות".
- `http://localhost:9001/itinerary` sidebar shows NO logistics card.
- Bottom nav 6th tab label reads `"לוגיסטיקה"` (Hebrew locale).

- [ ] T004 [P] [US2] In `app/itinerary/page.tsx`: remove `import LogisticsCard` and its `<LogisticsCard />` JSX from the sidebar column (after T003 has already touched this file — combine into single edit)
- [ ] T005 [US2] Rewrite `app/bookings/page.tsx`: replace placeholder `<p>` content with `<LogisticsCard />`; update `metadata.title` to `"לוגיסטיקה והזמנות — TripiAgent"`; replace `<h1>` heading text with `"לוגיסטיקה והזמנות"`; add `import LogisticsCard`; remove the emoji placeholder

---

## Phase 4: Polish & Verification

- [ ] T006 Verify `app/itinerary/page.tsx` has no orphaned imports after T003 + T004 removals; run `npm run lint` and fix any unused-import warnings
- [ ] T007 Check existing Playwright E2E specs for any selector referencing `"ניירות"` or the old bookings placeholder text and update them to match the new label `"לוגיסטיקה"`
- [ ] T008 Run full validation suite: `npm run lint && npm test && npm run build` and confirm all pass

---

## Dependency Graph

```
T001 (translations)
  ├─► T002 (home page map)  → T006 (lint check)
  ├─► T003 (remove map from itinerary)
  ├─► T004 (remove logistics from itinerary — combine edit with T003)
  └─► T005 (bookings page)  → T007 (E2E selector check) → T008 (full build)
```

T002, T003+T004, T005 are all parallelisable after T001.

---

## Parallel Execution Examples

```
Agent A: T001 → T002 → T006
Agent B: T001 → T003 + T004 (single file edit)
Agent C: T001 → T005 → T007
(all agents converge) → T008
```

---

## Implementation Strategy (MVP first)

MVP = T001 + T002 + T003 + T004 + T005 (all P1, ~10 min single-agent run).
T006–T008 = validation pass (always run before marking DONE).

---

## Format Validation

All 8 tasks carry: `- [ ]` checkbox · sequential `T00N` ID · `[P]` where parallelisable · `[USx]` story label in story phases · description with explicit file path. ✅
