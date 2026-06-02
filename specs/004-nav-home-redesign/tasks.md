# Tasks: Navigation Redesign & Home Screen

**Feature:** `specs/004-nav-home-redesign/spec.md`  
**Plan:** `specs/004-nav-home-redesign/plan.md`  
**Generated:** 2026-06-02

---

## User Stories (from spec.md)

| ID | Story |
|----|-------|
| US1 | As a traveler, I want a 6-tab bottom nav with Hebrew labels |
| US2 | As a traveler on the go, I want the Home screen to show an Active Route Map |
| US3 | As a planner/traveler, I want an Investigate section (Target / Around Me) with bookmark |
| US4 | As a traveler, I want `/locations` to show my saved attractions (Target Bank) |
| US5 | As a traveler, I want `/bookings` to exist as a navigable placeholder |

---

## Dependency Order

```
Phase 2 (translations) → must complete before all other phases
Phase 3 (US1 nav)      → must complete before any E2E nav assertions
Phase 4 (US2 map)      → independent of Phase 5; can run after Phase 2
Phase 5 (US3 search)   → requires AttractionSearch props (T009) first
Phase 6 (US4 locations) → independent; only needs Phase 2
Phase 7 (US5 bookings)  → independent; only needs Phase 2
Phase 8 (home layout)   → requires Phase 3, 4, 5 complete
Phase 9 (E2E + polish)  → requires all phases complete
```

---

## Phase 1: Setup

- [ ] T001 Verify `specs/004-nav-home-redesign/plan.md` is current v2 and `feature.json` points to `specs/004-nav-home-redesign`

---

## Phase 2: Foundation — Translation Keys

> **Blocks all other phases.** All nav labels and page strings depend on these keys.

- [ ] T002 Add `home`, `calendar`, `locations`, `bookings` keys to the `en` locale object in `lib/translations.ts`
- [ ] T003 Add `home: "בית"`, `calendar: "תכנון"`, `locations: "יעדים"`, `bookings: "ניירות"` keys to the `he` locale object in `lib/translations.ts`
- [ ] T004 Run `npm run lint` — confirm no TypeScript errors on `translations.ts` (type-check that both locales have the same keys)

---

## Phase 3: US1 — 6-Tab Bottom Navigation

> **Goal:** Nav bar shows 6 tabs with Hebrew labels, fits 390px, all tabs navigate correctly.  
> **Independent test:** Open app → count 6 tabs visible → each tab routes correctly → active state highlights.

- [ ] T005 [US1] Update icon imports in `components/BottomNav.tsx`: add `Home`, `FileText` from `lucide-react`; remove unused imports if any
- [ ] T006 [US1] Replace the 4-item `navItems` array in `components/BottomNav.tsx` with the 6-item array from plan §2c (Home/`/`, Calendar/`/itinerary`, Chat/`/chat`, Pack/`/pack`, Locations/`/locations`, Bookings/`/bookings`)
- [ ] T007 [US1] Apply 390px layout fix in `components/BottomNav.tsx`: container `px-0`, each Link `min-w-[48px] px-1`, label `text-[9px]`
- [ ] T008 [US1] Update `e2e/step4i-4j.smoke.spec.ts`: rename test to "6 tabs", change `#nav-link-explore` → `#nav-link-home`, add `toBeVisible` assertions for `#nav-link-locations` and `#nav-link-bookings`

---

## Phase 4: US2 — Active Route Map Card

> **Goal:** Home screen shows a 220px compact map card; tapping it opens a full-screen overlay that closes with X.  
> **Independent test:** Navigate to `/` → `[data-testid="active-route-map"]` visible → click it → full-screen overlay visible → click X → overlay gone.

- [ ] T009 [US2] Create `components/ActiveRouteMapCard.tsx` with compact 220px wrapper (`data-testid="active-route-map"`) that renders `MapPreview`, with `useState(false)` for expanded state
- [ ] T010 [US2] Add full-screen overlay to `ActiveRouteMapCard.tsx`: `fixed inset-0 z-50 bg-background flex flex-col` div (not Sheet, not Dialog), with close button (`X` icon, `aria-label="סגור"`) that sets expanded to false
- [ ] T011 [US2] Ensure both compact and expanded views render `<MapPreview />` and that the component is fully typed with no TypeScript errors

---

## Phase 5: US3 — AttractionSearch Props (pre-req for InvestigateSection)

> **Goal:** `AttractionSearch` accepts `defaultQuery` and `headless` props without breaking any existing behaviour.  
> **Independent test:** Existing `step17.smoke.spec.ts` passes unchanged — `AttractionSearch` with no props still works identically.

- [ ] T012 [US3] Add `interface AttractionSearchProps { defaultQuery?: string; headless?: boolean }` to `components/AttractionSearch.tsx`
- [ ] T013 [US3] Change `const [query, setQuery] = useState("")` → `useState(defaultQuery ?? "")` in `components/AttractionSearch.tsx` — no `useEffect`
- [ ] T014 [US3] Add `headless` conditional render to `components/AttractionSearch.tsx`: when `headless === true`, render content in a plain `<div className="p-4 space-y-4">` instead of wrapping in `<Card>` + `<CardHeader>`
- [ ] T015 [US3] Run `npm run lint` — confirm `react-hooks/exhaustive-deps` passes and no TS errors

---

## Phase 6: US3 — InvestigateSection Component

> **Goal:** Home screen shows Investigate section with Target/Around Me toggle; pre-fills city; uses `key={mode}` to reset on toggle.  
> **Independent test:** `[data-testid="investigate-section"]` visible on `/` → toggle buttons present → clicking Around Me changes active state.

- [ ] T016 [P] [US3] Create `components/InvestigateSection.tsx` with local `mode` state (`"target" | "around-me"`), initialised from `tripMode` (`in-trip` → `"around-me"`, else `"target"`)
- [ ] T017 [US3] Add city resolution logic in `InvestigateSection.tsx`: GPS city = `useTripStore(s => s.location?.cityName)`; target city = `useTripStore(s => s.savedAttractions[0]?.locationName) ?? "Lake Garda"`; resolved = mode-based selection
- [ ] T018 [US3] Add pill-segmented toggle in `InvestigateSection.tsx` Card header: two buttons with `data-testid="investigate-target-btn"` and `data-testid="investigate-aroundme-btn"`, accent active style matching existing pill pattern
- [ ] T019 [US3] Add GPS-denied soft info banner in `InvestigateSection.tsx`: render `<p>הפעל מיקום לחיפוש סביבך</p>` when `mode === "around-me"` and `!cityName`
- [ ] T020 [US3] Render `<AttractionSearch key={mode} defaultQuery={resolvedCity} headless />` inside `InvestigateSection.tsx` Card; add `data-testid="investigate-section"` to the root Card element

---

## Phase 7: US4 — `/locations` Route

> **Goal:** `/locations` page loads and shows `SavedAttractionsList`.  
> **Independent test:** Navigate to `/locations` → `[data-testid="saved-attractions-ready"]` visible (existing testid from `SavedAttractionsList`).

- [ ] T021 [P] [US4] Create `app/locations/page.tsx` as a server component (no `"use client"`): export `metadata` with title `"יעדים — TripiAgent"`, render `<SavedAttractionsList />`

---

## Phase 8: US5 — `/bookings` Route

> **Goal:** `/bookings` page loads with "בקרוב" placeholder and correct testid.  
> **Independent test:** Navigate to `/bookings` → `[data-testid="bookings-page"]` visible → text "ניירות" visible.

- [ ] T022 [P] [US5] Create `app/bookings/page.tsx` as a server component (no `"use client"`): export `metadata` with title `"ניירות — TripiAgent"`, render placeholder div with `data-testid="bookings-page"`, heading "ניירות", and subtext "בקרוב — ניהול הזמנות, שוברים, ומסמכי נסיעה."

---

## Phase 9: Home Page Restructure

> **Goal:** Home (`/`) shows: Mode Switcher (top) → ActiveRouteMapCard → (in-trip: CopilotCards + TodayPlanner) → InvestigateSection. Old 3-column grid, LocationCard, NearbyPlacesSection removed.  
> **Blocks:** Requires T007 (nav), T011 (map), T020 (investigate) complete.

- [ ] T023 Import `ActiveRouteMapCard` and `InvestigateSection` into `app/page.tsx`; remove imports for `LocationCard` and `NearbyPlacesSection`
- [ ] T024 Replace the entire JSX return in `app/page.tsx` with the new vertical layout from plan §2c: mode-switcher first → `<ActiveRouteMapCard />` → in-trip conditionals → `<InvestigateSection />`; remove 3-column grid wrapper
- [ ] T025 Confirm `LocationPermissionBanner` is kept (in-trip only), `CopilotCards` and `TodayPlanner` remain (in-trip only), all wrapped in `px-4 pt-3 space-y-4`
- [ ] T026 Run `npm run lint` and `npm run build` — confirm no TypeScript errors and no unused imports in `app/page.tsx`

---

## Phase 10: E2E Smoke Test & Polish

> **Goal:** All 10 E2E scenarios pass; lint + unit + build all green.

- [ ] T027 Create `e2e/step20.nav-home-redesign.spec.ts` with test: "Nav bar has exactly 6 tabs" — count `[id^="nav-link-"]` === 6
- [ ] T028 Add test to `step20`: "Home tab active on `/`" — `#nav-link-home` has `aria-current="page"`
- [ ] T029 Add test to `step20`: "All 6 tabs navigate" — click each tab, assert URL matches `/`, `/itinerary`, `/chat`, `/pack`, `/locations`, `/bookings`
- [ ] T030 Add test to `step20`: "Active Route Map visible" — navigate `/`, assert `[data-testid="active-route-map"]` visible
- [ ] T031 Add test to `step20`: "Map card expand/collapse" — click `[data-testid="active-route-map"]`, assert overlay visible, click close button, assert overlay gone
- [ ] T032 Add test to `step20`: "Investigate section visible" — `[data-testid="investigate-section"]` visible on `/`
- [ ] T033 Add test to `step20`: "Investigate toggle switches mode" — click `[data-testid="investigate-aroundme-btn"]`, assert it has active styling; click `[data-testid="investigate-target-btn"]`, assert it has active styling
- [ ] T034 Add test to `step20`: "Locations page loads" — navigate `/locations`, `[data-testid="saved-attractions-ready"]` visible
- [ ] T035 Add test to `step20`: "Bookings page loads" — navigate `/bookings`, `[data-testid="bookings-page"]` visible, text "ניירות" visible
- [ ] T036 Run `npx playwright test e2e/step20.nav-home-redesign.spec.ts` — all 9 scenarios pass
- [ ] T037 Run `npx playwright test e2e/step4i-4j.smoke.spec.ts` — updated 6-tab assertions pass
- [ ] T038 Run `npm run lint && npm run test && npm run build` — all green; confirm no regressions in existing specs

---

## Dependency Graph

```
T001
 └── T002, T003
      └── T004
           ├── T005 → T006 → T007 → T008         [US1 — nav]
           ├── T009 → T010 → T011                  [US2 — map card]
           ├── T012 → T013 → T014 → T015           [US3 — AttractionSearch props]
           │    └── T016 → T017 → T018 → T019 → T020  [US3 — InvestigateSection]
           ├── T021                                 [US4 — /locations]
           └── T022                                 [US5 — /bookings]
                    All above → T023 → T024 → T025 → T026  [home restructure]
                                        └── T027–T038       [E2E + validation]
```

---

## Parallel Execution Opportunities

| Parallel Group | Tasks | Can run simultaneously after |
|----------------|-------|------------------------------|
| A | T005–T008, T009–T011, T012–T015, T021, T022 | T004 |
| B | T016–T020 | T015 (AttractionSearch props done) |
| C | T027–T035 | T026 (home restructure done) |

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 38 |
| Phase 1 (setup) | 1 |
| Phase 2 (foundation) | 3 |
| US1 — nav | 4 |
| US2 — map | 3 |
| US3 — search props | 4 |
| US3 — investigate | 5 |
| US4 — locations | 1 |
| US5 — bookings | 1 |
| Home restructure | 4 |
| E2E + polish | 12 |
| Parallelizable [P] tasks | T016, T021, T022, T027–T035 |

**Suggested MVP scope (first shippable increment):** T001–T008 — delivers the 6-tab navigation bar with correct Hebrew labels, 390px layout, and updated E2E test. App is immediately improved even before home screen changes land.
