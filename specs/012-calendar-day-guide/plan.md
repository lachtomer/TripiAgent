# Technical Plan: 012 — Calendar Day Guide & Jun 2026 Itinerary Refresh

**Feature spec:** `specs/012-calendar-day-guide/spec.md`  
**Research:** `specs/012-calendar-day-guide/research.md`  
**Data model:** `specs/012-calendar-day-guide/data-model.md`  
**Contracts:** `specs/012-calendar-day-guide/contracts/calendar-day-guide-ui.md`  
**Quickstart:** `specs/012-calendar-day-guide/quickstart.md`  
**Tasks:** `specs/012-calendar-day-guide/tasks.md` (after `/speckit-tasks`)  
**Branch:** `main` (port **9001**; one step at a time per project contract)

---

## 0. Problem statement

Calendar (`/itinerary`) shows timed activities only. Travelers lack **must-see highlights**, **casual lunch picks**, and **map/official links** per day. The default Jun 2026 itinerary is **out of date** vs the group replan (Bergamo stop, Borghetto Saturday, Gardaland Monday, Manerba boat, etc.).

Feature 012 adds a **collapsible Day Guide** per day (Days 2–9) and refreshes **default itinerary + bank/backups** to match the approved schedule.

---

## 1. Architectural Changes

### 1a. Data flow

```
lib/tripDayGuides.ts (static, read-only)
        │
        └─► getDayGuide(dayNumber) ──► DayGuidePanel
                    │
ItineraryCard ──────┴─► defaultExpanded = (todayDayNumber === dayNumber)

lib/defaultItalyItinerary.ts (updated activities)
        │
        ├─► tripStore seed / DEFAULT_ITALY_ITINERARY
        ├─► bankPlanned matching (Feature 011)
        └─► lakeGardaDayBackups (Plan B keys)
```

**No new API routes.** No new npm dependencies.

### 1b. In scope

| Surface | Change |
| --- | --- |
| `types/index.ts` | Export `DayGuide`, `DayGuideLocation`, `DayGuideFood`, `DayGuideSpot`, `DayGuideOption` |
| `lib/tripDayGuides.ts` | **NEW** — curated content Days 2–9, `getDayGuide()` |
| `lib/tripDayGuides.test.ts` | **NEW** — URL safety, required lunch, Day 4 dual options |
| `components/DayGuidePanel.tsx` | **NEW** — collapsible UI, PlaceNameLink |
| `components/ItineraryCard.tsx` | Mount `DayGuidePanel`; pass `defaultExpanded` |
| `lib/defaultItalyItinerary.ts` | Rebuild Days 2–9 per spec §3B |
| `lib/lakeGardaTargetBank.ts` | Remove/demote ruled-out POIs; add Bergamo/Castellaro/Peschiera hints |
| `lib/lakeGardaDayBackups.ts` | Re-key Plan B to new day numbers (e.g. rain on Borghetto day 3) |
| `data/bank.json` | Mirror bank seed |
| `lib/translations.ts` | EN keys: `dayGuideTitle`, `dayGuideWhatToSee`, `dayGuideFood`, `dayGuideOptional`, `dayGuideOptionBanner` |
| `e2e/step26.calendar-day-guide.smoke.spec.ts` | **NEW** |
| `e2e/step4h.smoke.spec.ts` | Update expected day title strings |

### 1c. Out of scope (v1)

- User-editable Day Guide text
- Sun Jun 28 vote/lock UI
- Hebrew translation of curated POI copy
- Live restaurant API / hours
- Home tab duplicate of Day Guide

---

## 2. Component Design & State

### 2a. NEW `lib/tripDayGuides.ts`

```typescript
export function getDayGuide(dayNumber: number): DayGuide | undefined;

export const TRIP_DAY_GUIDES: Readonly<Partial<Record<number, DayGuide>>>;
```

Content volume: ~8 days × (2–4 locations × 3–5 bullets + 2–4 food rows). Day 4 uses `options[]` instead of flat `locations`.

**Optional spots:**
- Day 6: `Grotte di Catullo` — `optional: true`
- Day 8: `Manerba village` — optional location or spot

### 2b. NEW `DayGuidePanel.tsx`

- Client component; props per contract
- `useState(expanded)` initialized from `defaultExpanded`
- Sections: banner → What to see → Food
- For `guide.options`: render each option block with own locations + food
- Uses `PlaceNameLink` for location names and food names

### 2c. `ItineraryCard.tsx`

Insert before timeline loop inside each day `CardContent`:

```tsx
<DayGuidePanel
  dayNumber={day.dayNumber}
  defaultExpanded={todayDayNumber === day.dayNumber}
/>
```

No Zustand changes.

### 2d. `defaultItalyItinerary.ts` — activity outline

| Day | Key activities (times illustrative) |
| --- | --- |
| 2 | 10:00 Car pickup · 12:00 Bergamo Città Alta · 15:00 Check-in Monzambano · 19:00 Welcome dinner |
| 3 | 09:30 Castellaro · 10:15 Borghetto · 12:00 Taverna lunch · 13:30 Sigurtà |
| 4 | 09:00 Verona OR Monte Baldo summary activity + note in description |
| 5 | 09:30–18:00 Gardaland |
| 6 | 10:00 Sirmione castle · 12:15 Lunch · 14:00 Aquaria Spa ✅ |
| 7 | 10:00 CanevaWorld · 15:30 Peschiera |
| 8 | 09:30 Manerba boat · 12:30 Lunch · 14:00 Rocca di Manerba |
| 9 | 09:30 Checkout · 10:00 Serravalle · 18:00 Car return · 20:00 Milan dinner |

Days 1 & 10: minimal or no Day Guide.

---

## 3. API Routes & Schemas

**None.** Static bundled content only.

Constitution: no new server routes; existing `/api/places` unchanged.

---

## 4. Proposed File Modifications

| Action | Path |
| --- | --- |
| NEW | `lib/tripDayGuides.ts` |
| NEW | `lib/tripDayGuides.test.ts` |
| NEW | `components/DayGuidePanel.tsx` |
| NEW | `e2e/step26.calendar-day-guide.smoke.spec.ts` |
| MODIFY | `types/index.ts` |
| MODIFY | `components/ItineraryCard.tsx` |
| MODIFY | `lib/defaultItalyItinerary.ts` |
| MODIFY | `lib/lakeGardaTargetBank.ts` |
| MODIFY | `lib/lakeGardaDayBackups.ts` |
| MODIFY | `data/bank.json` |
| MODIFY | `lib/translations.ts` |
| MODIFY | `e2e/step4h.smoke.spec.ts` |
| MODIFY | `.cursor/rules/specify-rules.mdc` |

---

## 5. Verification & Testing Plan

### Unit (Vitest)

```bash
npm test -- tripDayGuides
```

| Case | Assert |
| --- | --- |
| Days 2–9 | `getDayGuide(n)` defined |
| URLs | all links pass `isSafeExternalUrl` |
| Lunch | each day has ≥1 food with `when: "lunch"` |
| Day 4 | `options.length === 2` |
| Optional | Grotte + Manerba village flagged |

### E2E (Playwright)

```bash
npm run test:e2e -- step26.calendar-day-guide step4h
```

| Spec | Scenario |
| --- | --- |
| step26 | Day guide expand, Bergamo spot visible, external href |
| step4h | Updated Jun 26–29 titles |

### Broader (after all steps)

```bash
npm run lint && npm test && npm run test:e2e && npm run build
```

---

## 6. Constitution Check

| Rule | Status |
| --- | --- |
| SDD spec before code | ✅ `specs/012-calendar-day-guide/spec.md` |
| One step at a time | ✅ delivery split below |
| No server DB | ✅ static modules |
| API keys server-only | ✅ no new APIs |
| 390px mobile | ✅ contract §390px |
| Zod on API routes | N/A — no new routes |
| E2E on layout change | ✅ step26 + step4h update |

**Post-design:** PASS — no violations.

---

## 7. Incremental delivery (await `confirmed` between steps)

| Step | Deliverable |
| --- | --- |
| **1** | Types + `lib/tripDayGuides.ts` + unit tests |
| **2** | `DayGuidePanel.tsx` + translations + ItineraryCard mount |
| **3** | `defaultItalyItinerary.ts` refresh Days 2–9 |
| **4** | Target bank + `lakeGardaDayBackups` + `data/bank.json` |
| **5** | E2E step26 + step4h updates; lint/test/build |

---

## 8. Risk & mitigations

| Risk | Mitigation |
| --- | --- |
| Plan B references old activity names | Update `LAKE_GARDA_DAY_BACKUPS` in Step 4 |
| step4h brittle title strings | Update assertions in Step 5 |
| Large content file | Keep data in `tripDayGuides.ts`; no UI perf issue (collapsible) |
| Dual-option Day 4 confusion | Banner + single timeline summary activity |

---

## 9. Agent context

After plan approval, active feature pointer → `specs/012-calendar-day-guide/plan.md` (see `.cursor/rules/specify-rules.mdc`).
