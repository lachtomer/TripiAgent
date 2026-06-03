# Technical Plan: 006 — Prep Screen Reorganization

**Feature spec:** `specs/006-prep-screen-reorg/spec.md`  
**Research:** `specs/006-prep-screen-reorg/research.md`  
**Data model:** `specs/006-prep-screen-reorg/data-model.md`  
**UI contracts:** `specs/006-prep-screen-reorg/contracts/ui-screens.md`  
**Branch:** `main`

---

## 1. Architectural Changes

UI-only reorganization — no new API routes, no `tripStore` changes, no new npm dependencies.

**Before → After:**

```
/itinerary   ItineraryCard + EssentialsChecklist + SavedAttractionsList (sidebar)
/bookings    LogisticsCard only
/locations   SavedAttractionsList

/itinerary   ItineraryCard only (full width)
/bookings    LogisticsCard + EssentialsChecklist (5 items, dedup B)
/locations   SavedAttractionsList (unchanged)
```

**User decisions locked:**
- Nav tab 6: **`לוגיסטיקה`** / **`Logistics`** (no rename)
- Dedup **B:** remove checklist rows e1, e2, e3, e5
- Section order on `/bookings`: logistics form **then** checklist

---

## 2. Component Design & State

### 2a. State Store Changes

**None.** `tripStore.logistics`, `savedAttractions`, `itinerary` unchanged.

Checklist checked state remains in `localStorage` key `tripiagent-essentials-checklist`.

### 2b. Translation Keys (`lib/translations.ts`)

Update checklist copy to reflect reservations-only scope (dedup B):

```typescript
// en — replace or add alongside essentialsTitle/essentialsDesc
essentialsTitle: "Reservations to Verify",
essentialsDesc: "Activities, dining, and safety items to confirm before the trip",

// he
essentialsTitle: "הזמנות לבדיקה",
essentialsDesc: "פעילויות, מסעדות ופריטי בטיחות לאישור לפני הנסיעה",
```

Add page-level keys for `/bookings` metadata (avoid hardcoded Hebrew-only strings):

```typescript
// en
logisticsPageTitle: "Logistics & Bookings",
logisticsPageSubtitle: "Flights, vouchers, lockbox — plus reservations to verify before the trip",

// he
logisticsPageTitle: "לוגיסטיקה והזמנות",
logisticsPageSubtitle: "טיסות, שוברים, כספת — והזמנות לבדוק לפני הנסיעה",
```

**Nav `bookings` key:** keep `"Logistics"` / `"לוגיסטיקה"` — no change.

### 2c. UI Components

#### [MODIFY] `components/EssentialsChecklist.tsx`

- Remove items e1, e2, e3, e5 from `ESSENTIALS_ITEMS` array.
- Keep e4, e6, e7, e8, e9 (5 items).
- Progress counter automatically uses `ESSENTIALS_ITEMS.length`.
- Card title/description from `t.essentialsTitle` / `t.essentialsDesc` (updated translations).

#### [MODIFY] `app/bookings/page.tsx`

- Import `EssentialsChecklist`.
- Render order: page header → `<LogisticsCard />` → `<EssentialsChecklist />`.
- Use translation keys for title/subtitle (or metadata aligned with spec strings).
- Keep `data-testid="bookings-page"`.

#### [MODIFY] `app/itinerary/page.tsx`

- Remove imports and JSX for `EssentialsChecklist`, `SavedAttractionsList`.
- Remove `md:grid-cols-3` grid; single-column layout with `ItineraryCard` full width.
- Subtitle already schedule-focused — verify no logistics/saved-places wording.

#### [NO CHANGE] `app/locations/page.tsx`

- SavedAttractionsList remains sole places UI.

#### [NO CHANGE] `components/LogisticsCard.tsx`

- Already expanded by default on dedicated page (Step 16).

#### [NO CHANGE] `components/BottomNav.tsx`

- Tab 6 already uses `t.bookings` → `לוגיסטיקה`.

---

## 3. API Routes & Schemas

**None.**

---

## 4. Proposed File Modifications

| Action | File |
| --- | --- |
| MODIFY | `components/EssentialsChecklist.tsx` |
| MODIFY | `lib/translations.ts` |
| MODIFY | `app/bookings/page.tsx` |
| MODIFY | `app/itinerary/page.tsx` |
| MODIFY | `e2e/step10.smoke.spec.ts` |
| MODIFY | `e2e/step17.smoke.spec.ts` |
| MODIFY | `e2e/travelAgentPersona.spec.ts` |

Optional if assertions reference removed checklist items:
| MODIFY | `e2e/step20.nav-home-redesign.spec.ts` (add checklist visibility on `/bookings`) |

---

## 5. Constitution Check

| Constraint | Status |
| --- | --- |
| No new runtime agents | ✅ N/A |
| No timetable hallucination | ✅ N/A |
| State sync guards | ✅ No store changes |
| SDD spec present | ✅ `specs/006-prep-screen-reorg/spec.md` |
| Incremental delivery | ✅ One step; confirm gate before next |
| API + Zod for new routes | ✅ N/A |
| Layout changes → E2E smoke | ⚠️ Required — 3+ E2E files must update |

**Gate result:** PASS.

---

## 6. Verification & Testing Plan

### Manual smoke (port 9001)

1. `/bookings`: logistics form + 5-item checklist; no "Passports & Flights" row.
2. `/itinerary`: schedule only; no saved attractions block.
3. `/locations`: saved places + add custom POI works.
4. Bookmark from Home → verify on `/locations`.
5. Add to Day from `/locations` → verify on `/itinerary`.

### E2E updates (required)

| File | Change |
| --- | --- |
| `e2e/step10.smoke.spec.ts` | Tests 1–2: navigate to `/locations` (or `#nav-link-locations`) instead of `/itinerary` for Saved Attractions |
| `e2e/step17.smoke.spec.ts` | Test 1: open `/bookings` for checklist i18n; update assertions if title changes to "Reservations to Verify" |
| `e2e/travelAgentPersona.spec.ts` | After logistics on `/bookings`, go to `/locations` for saved POI flow |

### Commands

```bash
npm run lint
npm test
npx playwright test e2e/step10.smoke.spec.ts e2e/step17.smoke.spec.ts e2e/travelAgentPersona.spec.ts
npm run build
```

---

## 7. Implementation Order (for quickstart)

1. Trim `EssentialsChecklist` items + update translations  
2. Update `app/bookings/page.tsx` (add checklist, section order)  
3. Simplify `app/itinerary/page.tsx` (remove sidebar components, full width)  
4. Fix E2E specs  
5. Lint + targeted E2E + build

**Stop after step 5; wait for user `confirmed` before deploy.**
