# Tasks: 012 — Calendar Day Guide & Jun 2026 Itinerary Refresh

**Feature directory:** `specs/012-calendar-day-guide`  
**Spec:** `specs/012-calendar-day-guide/spec.md`  
**Plan:** `specs/012-calendar-day-guide/plan.md`  
**Contracts:** `specs/012-calendar-day-guide/contracts/calendar-day-guide-ui.md`  
**Quickstart:** `specs/012-calendar-day-guide/quickstart.md`

> **Delivery rule:** One plan step at a time; stop for **`confirmed`** before the next step (project contract).

---

## Status snapshot (2026-06-22)

| Plan step | Tasks | Status |
| --- | --- | --- |
| Step 1 — Types + day guide data | T002–T006 | **DONE** |
| Step 2 — DayGuidePanel + itinerary mount | T007–T011 | **DONE** |
| Step 3 — Default itinerary refresh | T012–T013 | **DONE** |
| Step 4 — Target bank + Plan B sync | T014–T016 | **DONE** |
| Step 5 — E2E + verification | T017–T021 | **DONE** |

---

## User story map

| ID | Priority | Story (from spec §2) |
| --- | --- | --- |
| US1 | P1 | Each day lists **must-see highlights** per location |
| US2 | P1 | **Casual lunch suggestions** (~noon) with tappable links |
| US3 | P1 | **Official site or map links** for sights and restaurants |
| US4 | P1 | **Default trip schedule** matches agreed Jun 2026 replan |
| US5 | P2 | **Optional** sights clearly marked (Grotte di Catullo, Manerba village) |
| US6 | P2 | **Sun Jun 28** shows Verona **OR** Monte Baldo until group picks |

---

## Dependencies

```text
Phase 1 (baseline)
    → Phase 2 (types)
            → Phase 3 (US1–US3, US5, US6 — curated content + unit tests)
                    → Phase 4 (US1–US3, US5, US6 — DayGuidePanel UI)
                            ├→ Phase 5 (US4 — default itinerary)
                            │       └→ Phase 6 (bank + Plan B sync)
                            └→ Phase 7 (E2E + constitution loop)
```

**Recommended order:** Phase 2 → 3 → 4 → **pause `confirmed`** → 5 → **pause** → 6 → **pause** → 7.

---

## Phase 1: Setup

> **Goal:** Green baseline before feature work.

**Independent test:** `npm run lint` (TripiAgent paths) + `npm test` + `npm run build` exit 0.

- [ ] T001 Run baseline from repo root: `npx eslint lib components stores app hooks` then `npm test && npm run build`; exclude `jobmatcher-fix/` from scope

---

## Phase 2: Foundational — Types

> **Goal:** Shared TypeScript shapes for Day Guide entities.  
> **Maps to:** `data-model.md`, plan §2a.

**Independent test:** TypeScript compiles; no runtime test yet.

- [x] T002 Add `DayGuideSpot`, `DayGuideLocation`, `DayGuideFood`, `DayGuideOption`, `DayGuide` interfaces to `types/index.ts` per `specs/012-calendar-day-guide/data-model.md`

---

## Phase 3: User Stories 1–3, 5, 6 — Curated day guide content (P1 / P2)

> **Stories:** Must-see, lunch/food, links, optional labels, Sun dual-option data.  
> **Maps to:** spec §3A–D, plan §2a, quickstart §3.

**Independent test:**

```bash
npm test -- tripDayGuides
```

- [x] T003 [US1] [US2] [US3] Create `lib/tripDayGuides.ts` — export `TRIP_DAY_GUIDES` and `getDayGuide(dayNumber)` with full curated content for Days **2–9** (must-see bullets, food rows, maps/official URLs) per approved trip plan and spec §9 reference table
- [x] T004 [US5] In `lib/tripDayGuides.ts` — mark **Grotte di Catullo** (Day 6) and **Manerba village** (Day 8) with `optional: true` on spot or location
- [x] T005 [US6] In `lib/tripDayGuides.ts` — Day 4 uses `options[]` with **Option A: Verona** and **Option B: Monte Baldo + Malcesine**; set `bannerNote` for group vote; omit top-level `locations`/`food` on Day 4
- [x] T006 [P] [US1] [US2] [US3] Create `lib/tripDayGuides.test.ts` — Days 2–9 defined; all URLs pass `isSafeExternalUrl`; each day has ≥1 lunch food; Day 4 has exactly 2 options; optional spots flagged

---

## Phase 4: User Stories 1–3, 5, 6 — Day Guide UI (P1 / P2)

> **Stories:** Collapsible Day Guide on Calendar with links, food labels, optional badges, dual-option banner.  
> **Maps to:** `contracts/calendar-day-guide-ui.md`, plan §2b–2c.

**Independent test:** Manual on http://localhost:9001/itinerary — expand Day 2 guide → Piazza Vecchia visible; food link opens; Day 4 shows two options + banner.

- [x] T007 [US1] [US3] Create `components/DayGuidePanel.tsx` — collapsible panel per contract (`data-testid='day-guide-{n}'`); **What to see** section with location headings via `PlaceNameLink` and must-see bullet list
- [x] T008 [US2] [US3] Extend `components/DayGuidePanel.tsx` — **Food** section with Lunch/Dinner/Snack labels; food rows via `PlaceNameLink`; primary lunch visually distinct if `isPrimary`
- [x] T009 [US5] [US6] Extend `components/DayGuidePanel.tsx` — **Optional** badge on optional spots; dual-option `bannerNote` + per-option blocks (`data-testid='day-guide-option-{id}'`); `defaultExpanded` prop; `aria-expanded` on toggle
- [x] T010 [US1] Modify `lib/translations.ts` — EN keys: `dayGuideTitle`, `dayGuideWhatToSee`, `dayGuideFood`, `dayGuideOptional`, `dayGuideOptionBanner`, meal labels (`lunch`, `dinner`, `snack`)
- [x] T011 [US1] Modify `components/ItineraryCard.tsx` — mount `<DayGuidePanel dayNumber={...} defaultExpanded={todayDayNumber === day.dayNumber} />` above activity timeline in each day `CardContent`

---

## Phase 5: User Story 4 — Default itinerary refresh (P1)

> **Story:** Default schedule matches agreed week (Bergamo, Borghetto, Gardaland Mon, etc.).  
> **Maps to:** spec §3B, plan §2d.

**Independent test:** Fresh store — Day titles include Bergamo (2), Castellaro/Borghetto (3), Gardaland (5), Manerba (8); **no** Natura Viva Safari or Rimbalzello activity titles.

- [x] T012 [US4] Modify `lib/defaultItalyItinerary.ts` — rebuild Days **2–9** activities and `date` strings per plan §2d (Bergamo stop Fri 26, Castellaro+Borghetto+Sigurtà Sat 27, Verona/Monte Baldo Sun 28, Gardaland Mon 29, Sirmione+Aquaria Tue 30, CanevaWorld+Peschiera Wed 1, Manerba boat+Rocca Thu 2, Serravalle→Milan Fri 3)
- [x] T013 [US4] Modify `lib/defaultItalyItinerary.ts` — set `sourceAttractionId` on seeded activities where bank ids exist (Gardaland, Aquaria, etc.) for Feature 011 Planned matching

---

## Phase 6: Bank & Plan B sync (supports US4)

> **Goal:** Target Bank and Plan B backups align with refreshed itinerary.  
> **Maps to:** plan §8 risks, research R4.

**Independent test:** Locations — planned badges match new schedule; Day 3 Plan B no longer references Desenzano boat / Rimbalzello.

- [x] T014 [US4] Modify `lib/lakeGardaTargetBank.ts` — remove or demote ruled-out POIs (safari, Rimbalzello, Jungle as primary); update descriptions/dates for Bergamo, Castellaro, Peschiera, Manerba boat; sync planned hints
- [x] T015 [US4] Modify `lib/lakeGardaDayBackups.ts` — re-key `LAKE_GARDA_DAY_BACKUPS` for new day numbers (e.g. rain backup on Day 3 Borghetto nature day; Gardaland alternates on Day 5)
- [x] T016 [P] [US4] Modify `data/bank.json` — mirror `lib/lakeGardaTargetBank.ts` seed entries

---

## Phase 7: E2E, regression, verification

> **Maps to:** contract E2E expectations, quickstart §5, plan §5.

**Independent test:** `step26` + updated `step4h` green; constitution loop green.

- [x] T017 [P] Create `e2e/step26.calendar-day-guide.smoke.spec.ts` — Day 2 guide expand; Bergamo must-see text; food link `href` starts with `https://`; Day 4 banner + two options visible
- [x] T018 Modify `e2e/step4h.smoke.spec.ts` — update expected day title strings for Jun 26–29 replan (Bergamo, Castellaro/Borghetto, Verona/Monte Baldo, Gardaland, Sirmione)
- [x] T019 Run regression: `npx playwright test e2e/step26.calendar-day-guide.smoke.spec.ts e2e/step4h.smoke.spec.ts e2e/step25.bank-planned-plan-b.smoke.spec.ts`
- [x] T020 Run `node scripts/check-no-hebrew-chrome.mjs` after UI string changes
- [x] T021 Run constitution loop: `npm run lint && npm test && npm run build`; `npm run test:e2e -- step26 step4h`

---

## Parallel opportunities

| Tasks | Can run in parallel after |
| --- | --- |
| T006 | T003 (test file while content reviewed) |
| T010 + T007 | T002 (translations vs panel scaffold) |
| T016 | T014 (bank.json mirror while TS seed edits) |
| T017 | T011 (E2E spec draft while UI lands) |

---

## MVP scope (first shippable increment)

**Minimum:** Phase 2 + Phase 3 + Phase 4 (T002–T011) — Day Guide visible on Calendar with full curated content for Days 2–9, **before** itinerary refresh.  
**Full feature:** through T021 — replanned default itinerary + bank sync + E2E + constitution loop.

---

## Implementation steps ↔ tasks (plan §7)

| Plan step | Task IDs | Pause for `confirmed` |
| --- | --- | --- |
| 1 — Types + `tripDayGuides` | T002–T006 | after T006 |
| 2 — DayGuidePanel + mount | T007–T011 | after T011 |
| 3 — Default itinerary | T012–T013 | after T013 |
| 4 — Bank + Plan B | T014–T016 | after T016 |
| 5 — E2E + verify | T017–T021 | after T021 |

---

## Task summary

| Metric | Count |
| --- | --- |
| **Total tasks** | 21 (T001–T021) |
| US1 (must-see) | 6 tasks (T003, T006, T007, T010, T011, T017) |
| US2 (lunch/food) | 5 tasks (T003, T006, T008, T011, T017) |
| US3 (links) | 6 tasks (T003, T006, T007, T008, T011, T017) |
| US4 (itinerary) | 7 tasks (T012–T016, T018, T019) |
| US5 (optional) | 4 tasks (T004, T006, T009, T017) |
| US6 (dual Sun) | 4 tasks (T005, T006, T009, T017) |
| **Parallel-marked [P]** | 4 tasks (T006, T016, T017, plus T010∥T007) |

**Format validation:** All tasks use `- [ ] Tnnn [P?] [USn?] Description with file path`.
