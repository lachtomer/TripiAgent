# Technical Plan: Target Bank Day Picker & Activity-Nearby Discovery

## 1. Architectural Changes

- Extend `Activity` and `SavedAttraction` with optional `lat` / `lng`.
- Reuse `addAttractionToItinerary` with coordinate passthrough; add `addPlaceToItinerary` for nearby place results.
- New `lib/activityGeo.ts` for geocode-before-places resolution.
- Two client components: `TargetBankDayPicker` (Sheet), `ActivityNearbyPanel` (inline expand).
- No new API routes; `/api/geocode` + `/api/places` unchanged.

## 2. Component Design & State

| Component | Role |
|-----------|------|
| `TargetBankDayPicker` | Per-day Sheet listing `savedAttractions`, time input, confirm → `addAttractionToItinerary` |
| `ActivityNearbyPanel` | Geocode activity → fetch places → add/save results |
| `ItineraryCard` | Mount picker button per day; mount nearby panel in activity expand |

## 3. API Routes & Schemas

Existing contracts only:

- `GET /api/geocode?address=...` → `{ lat, lng, cityName }`
- `GET /api/places?lat=&lng=&type=&keyword=&radius=`

## 4. Proposed File Modifications

- [MODIFY] `types/index.ts`
- [MODIFY] `stores/tripStore.ts`
- [NEW] `lib/activityGeo.ts`
- [NEW] `lib/activityGeo.test.ts`
- [NEW] `components/TargetBankDayPicker.tsx`
- [NEW] `components/ActivityNearbyPanel.tsx`
- [MODIFY] `components/ItineraryCard.tsx`
- [MODIFY] `lib/translations.ts`
- [MODIFY] `components/AttractionSearch.tsx` (optional lat on save)
- [MODIFY] `components/NearbyPlacesSection.tsx` (optional lat on save)
- [NEW] `e2e/step18.target-bank-day-picker.smoke.spec.ts`
- [MODIFY] `stores/tripStore.test.ts`

## 5. Verification & Testing Plan

- `npm test -- lib/activityGeo.test.ts stores/tripStore.test.ts`
- `npx playwright test e2e/step18.target-bank-day-picker.smoke.spec.ts`
- `npm run lint && npm run build`
