# Technical Plan: Step 16 — Map to Home & Logistics to Bookings

> Spec: `.specify/step_16_map_to_home_logistics_to_bookings.md`
> Research: `.specify/plans/step_16_research.md`
> Branch: `main`

---

## 1. Architectural Changes

Pure component relocation. No new libraries, no API changes, no store changes.

**Before:**
```
Home          → ActiveRouteMapCard (→ LiveMapCard → MapPreview fallback)
/itinerary    → MapPreview  +  LogisticsCard  (in sidebar)
/bookings     → placeholder ("בקרוב")
```

**After:**
```
Home          → MapPreview  (direct, no expand wrapper)
/itinerary    → [MapPreview removed]  [LogisticsCard removed]  (sidebar: EssentialsChecklist + SavedAttractionsList only)
/bookings     → LogisticsCard  (full page, with heading "לוגיסטיקה והזמנות")
```

---

## 2. Component Design & State

### State Store Changes
None. `LogisticsCard` reads/writes `tripStore.logistics` — no store modification needed.

### UI Components — changes only
| Component | Change |
|---|---|
| `app/page.tsx` | Remove `ActiveRouteMapCard` import & JSX; add `MapPreview` import & JSX in same wrapper |
| `app/itinerary/page.tsx` | Remove `MapPreview` import & JSX; remove `LogisticsCard` import & JSX |
| `app/bookings/page.tsx` | Replace placeholder with `LogisticsCard`; update metadata title + page heading |
| `lib/translations.ts` | `bookings` key: `"ניירות"` → `"לוגיסטיקה"` (he), `"Bookings"` → `"Logistics"` (en) |

No new components created. No deletions.

---

## 3. API Routes & Schemas

None — no API routes involved.

---

## 4. Proposed File Modifications

- [MODIFY] `app/page.tsx`
- [MODIFY] `app/itinerary/page.tsx`
- [MODIFY] `app/bookings/page.tsx`
- [MODIFY] `lib/translations.ts`

---

## 5. Constitution Check

| Constraint | Status |
|---|---|
| No new runtime agents | ✅ N/A |
| No timetable hallucination | ✅ N/A |
| State sync guards | ✅ No store changes |
| SDD spec present before code | ✅ `.specify/step_16_map_to_home_logistics_to_bookings.md` |
| Incremental delivery / confirm gate | ✅ User confirmed with `/speckit-plan` then awaiting `/speckit-implement` |
| API routes paired with Zod | ✅ N/A — no new routes |
| Layout changes → E2E smoke | ⚠️  Minor — nav label change + bookings page restructure warrant a smoke check |

**Gate result:** PASS. E2E smoke recommended post-implementation (nav label + bookings page layout).

---

## 6. Verification & Testing Plan

### Manual smoke (local dev, port 9001)
1. Home: `MapPreview` visible at top; no expand-to-fullscreen wrapper.
2. Planning `/itinerary`: no route map, no logistics card in sidebar; ItineraryCard + EssentialsChecklist + SavedAttractionsList remain.
3. Bookings `/bookings`: `LogisticsCard` renders with heading "לוגיסטיקה והזמנות"; can save/load from Zustand.
4. BottomNav: 6th tab shows `"לוגיסטיקה"` (he) / `"Logistics"` (en); navigates to `/bookings`.

### Unit Tests
No new logic — no new unit tests required. Existing Vitest suite should pass unchanged.

### E2E (Playwright)
Existing booking / nav smoke tests may reference old label `"ניירות"`. Update any such selectors if they exist.

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```
