# Tasks: Target Bank Day Picker & Activity-Nearby

## Phase 1 — Data model

- [x] T1 Add `lat`/`lng` to `Activity` and `SavedAttraction` in `types/index.ts`
- [x] T2 Update `addAttractionToItinerary` to copy coordinates from bank entry
- [x] T3 Add `addPlaceToItinerary` for nearby place results

## Phase 2 — Core libs & components

- [x] T4 Create `lib/activityGeo.ts` + unit tests
- [x] T5 Create `TargetBankDayPicker.tsx`
- [x] T6 Create `ActivityNearbyPanel.tsx`

## Phase 3 — Integration

- [x] T7 Wire picker + nearby into `ItineraryCard.tsx`
- [x] T8 Add i18n strings (en/he)
- [x] T9 Pass lat/lng when bookmarking from Home search (when coords known)

## Phase 4 — Tests & validation

- [x] T10 E2E `e2e/step18.target-bank-day-picker.smoke.spec.ts`
- [x] T11 Run lint, unit, e2e, build
