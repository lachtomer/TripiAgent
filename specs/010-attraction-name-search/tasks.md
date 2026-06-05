# Tasks: 010 — Search by Attraction Name

**Feature directory:** `specs/010-attraction-name-search`  
**Spec:** `specs/010-attraction-name-search/spec.md`  
**Plan:** `specs/010-attraction-name-search/plan.md`  
**Contracts:** `specs/010-attraction-name-search/contracts/search-intent-and-api.md`  
**Quickstart:** `specs/010-attraction-name-search/quickstart.md`

> **Delivery rule:** One quickstart step at a time; stop for **`confirmed`** before the next step (project contract).

---

## Status snapshot (2026-06-05)

| Quickstart step | Status |
| --- | --- |
| Step 1 — Intent + text library | **DONE** (T002–T006) |
| Step 2 — API routes | **DONE** (T007–T010) |
| Step 3 — Investigate anchor | **DONE** (T011–T012, T015b) |
| Step 4 — State machine + discoverability | **DONE** (T013–T022, T015, T015c) |
| Step 5 — E2E | **DONE** (T023–T025; step17 radius test flaky, passes on retry) |
| Step 6 — Full verification | **DONE** (T026) |

---

## User story map

| ID | Priority | Story (from spec) |
| --- | --- | --- |
| US1 | P1 | Planner types attraction name → relevant place cards without city syntax |
| US2 | P1 | `Pizza in Milan` and city browse (`Verona`) keep working |
| US3 | P2 | Trip bias, disambiguation, `name_with_area`, empty state |
| US4 | P2 | In-trip Nearby mode uses GPS anchor for name search |
| US5 | P3 | Bookmark, add-to-day, external links unchanged (regression) |

---

## Dependencies

```text
Phase 1 (baseline)
    → Phase 2 (foundational lib + APIs) ─┬→ Phase 3 (US1 text path)
                                         ├→ Phase 4 (US2 location preserve)
                                         └→ Phase 5 (US3/US4 anchor + widen + radius)
                                                    → Phase 6 (E2E + verify)
```

**Recommended order:** Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6.

---

## Phase 1: Setup

> **Goal:** Green baseline before feature work.

**Independent test:** `npm run lint` (TripiAgent paths) + `npm test` + `npm run build` exit 0.

- [ ] T001 Run baseline from repo root: `npx eslint lib components stores app hooks` then `npm test && npm run build`; exclude `jobmatcher-fix/` from scope

---

## Phase 2: Foundational — Intent helpers, text search lib, APIs

> **Goal:** Server + library primitives for two-phase orchestration.  
> **Maps to:** contract state machine (server side), research Decisions 1, 5, 6, 7, 8.

**Independent test:**

```bash
npm test -- lib/searchIntent.test.ts lib/places.test.ts app/api/places/text/route.test.ts app/api/geocode/route.test.ts
```

### TDD — intent + places

- [x] T002 [P] Create `lib/searchIntent.ts` — `parseKeywordInLocation`, `parseNameWithArea`, `isLocationBrowseCandidate`, `ITALY_CITY_ALLOWLIST` per contract
- [x] T003 Create `lib/searchIntent.test.ts` — cases: `Pizza in Milan`, `Verona`, `Gardaland`, `Colosseum Rome`, `Osteria Francescana Modena`, `ab` rejected
- [x] T004 Create `searchPlacesByText()` in `lib/places.ts` — Phase A (biased), Phase B (national, no lat/lng), distance/rating sort, enrich cap 8
- [x] T005 Extend `lib/places.test.ts` — Phase B triggers when A empty; sort by distance then rating on Phase A
- [x] T006 Add `PlacesTextQuerySchema` to `lib/schemas.ts`

### API routes

- [x] T007 Create `app/api/places/text/route.ts` — Zod validate, cache, call `searchPlacesByText`, 404 after both phases empty
- [x] T008 Create `app/api/places/text/route.test.ts` — 400 invalid params, 200 mock, 404 empty
- [x] T009 Modify `app/api/geocode/route.ts` — forward geocode adds `placeTypes`, `matchedName`
- [x] T010 Create `app/api/geocode/route.test.ts` — assert new fields on `?query=Verona` mock

---

## Phase 3: User Story 1 — Name-led search (P1)

> **Story:** Planner types `Gardaland` → sees matching place card(s) via Text Search.  
> **Maps to:** spec §3.B name-led, success criteria 1 & 5.

**Independent test:** Manual Target mode `Gardaland` hits `/api/places/text`; result card visible.

- [x] T011 [US1] Modify `components/InvestigateSection.tsx` — compute `searchAnchor` (`target_saved` / `target_geocoded` / `gps`), `ready` flag, `data-testid="search-anchor-loading"`
- [x] T012 [US1] Modify `components/AttractionSearch.tsx` — accept `searchAnchor`, `investigateMode`; disable search until anchor `ready` in Target mode
- [x] T013 [US1] Add `fetchPlacesByText()` in `components/AttractionSearch.tsx` — `GET /api/places/text` with `selectedRadius * 1000`; set `lastSearchMode: 'text'`
- [x] T014 [US1] Wire geocode probe branch in `handleSearch` — non-locality probe → text path with `nameText` or full query
- [x] T015 [US1] Modify `lib/translations.ts` — `searchPlaceholder`, `searchHelperHint`, `searchNoResultsHint`; example chip labels
- [x] T015b [US1] Modify `components/InvestigateSection.tsx` — `data-testid="investigate-search-hint"` subtitle under title
- [x] T015c [US1] Modify `components/AttractionSearch.tsx` — helper line `[data-testid='search-helper-hint']`; example chips `[data-testid='search-example-chip']` (Gardaland, Verona, Pizza in Milan)

---

## Phase 4: User Story 2 — Location-led search preserved (P1)

> **Story:** `Verona` and `Pizza in Milan` behave as today.  
> **Maps to:** spec §3.C, success criteria 2 & 7.

**Independent test:** `Verona` → `/api/places` only; `Pizza in Milan` → geocode Milan + nearby with keyword.

- [x] T016 [US2] Implement fast path in `handleSearch` — `" in "` → `parseKeywordInLocation` → existing geocode + `fetchPlacesNearCoords` (no regression)
- [x] T017 [US2] After geocode probe, `isLocationBrowseCandidate` → `location_browse` → nearby without keyword; set `lastSearchMode: 'nearby'`
- [x] T018 [US2] Dining locality fallback in `handleSearch` — text 404 → nearby at probe coords

---

## Phase 5: User Stories 3 & 4 — Bias, area, radius, empty state (P2)

> **Stories:** Trip/GPS bias; `Colosseum Rome`; radius chips on text path; empty hint; Nearby GPS anchor.  
> **Maps to:** spec §3.B–D, success criteria 3–4, 6–7.

**Independent test:** `Colosseum Rome` uses Rome bias; radius chip changes text `radius` param; empty query shows `search-empty-hint`.

- [x] T019 [US3] Implement `name_with_area` in `handleSearch` — area geocode bias per contract table (`Colosseum Rome`, `Gardaland Lake Garda`)
- [x] T020 [US3] Radius chip handler — if `lastSearchMode === 'text'`, re-call `fetchPlacesByText` with new radius; nearby path unchanged
- [x] T021 [US3] Empty results UI — render `[data-testid='search-empty-hint']` with `t.searchNoResultsHint` when text/nearby returns 0 post-filters
- [x] T022 [US4] Nearby mode — pass GPS anchor to text path; denied GPS blocks name search with existing permission copy

---

## Phase 6: E2E, regression, verification

> **Maps to:** contract E2E expectations, constitution loop.

**Independent test:** step24 + step13 + step17 green; full loop green.

- [x] T023 [P] Add `mockGardalandTextSearch` + geocode probe fixtures to `e2e/helpers/apiMocks.ts`
- [x] T024 Create `e2e/step24.attraction-name-search.smoke.spec.ts` — (1) Gardaland text card, (2) Verona locality → places not text, (3) empty hint
- [x] T025 Run regression: `npx playwright test e2e/step13.smoke.spec.ts e2e/step17.smoke.spec.ts`
- [x] T026 Run constitution loop: `npm run lint && npm test && npm run test:e2e && npm run build` (self-healed step16 + step20 mocks/selectors)

---

## Parallel opportunities

| Tasks | Can run in parallel after |
| --- | --- |
| T002 + T006 | T001 |
| T007 + T009 | T004, T006 |
| T023 | T013 (mocks independent of final UI polish) |

---

## MVP scope (first shippable increment)

**Minimum:** Phase 2 + Phase 3 (T002–T015) — `Gardaland` name search works in Target mode with manual smoke.  
**Full feature:** through T026.
