# Step 16 — Move Map to Home & Logistics to Bookings

## Date
2026-06-02

## Summary
Two UI reorganisation tasks:

### A. Active Route Map → Home only
- **Remove** `ActiveRouteMapCard` (and its import) from `app/page.tsx`.
- **Place** `MapPreview` directly on the home page (where the old card was), keeping the same wrapper `<div className="px-4 pt-3">`.
- **Remove** `MapPreview` from the planning sidebar (`app/itinerary/page.tsx`) — the planning page keeps ItineraryCard, EssentialsChecklist, LogisticsCard, SavedAttractionsList.

> Rationale: the user wants the full decorative route map exclusively on the home screen, not duplicated in planning.

### B. Logistics & Orders (לוגיסטיקה והזמנות) → Bookings tab
- **Remove** `LogisticsCard` (and its import) from `app/itinerary/page.tsx`.
- **Replace** the placeholder content in `app/bookings/page.tsx` with `<LogisticsCard />` (full component, expanded by default or collapsed per component default).
- **Update page title / heading** in `app/bookings/page.tsx` to `"לוגיסטיקה והזמנות"`.
- **Update translations** in `lib/translations.ts`:
  - Hebrew `bookings` key: `"ניירות"` → `"לוגיסטיקה"` (short form for nav label, as the full name is too long for a tab)
  - English `bookings` key: `"Bookings"` → `"Logistics"`
  - Alternatively keep the nav label short: `"לוג'"` — to be decided, see note below.

> **Note on nav label length**: `"לוגיסטיקה והזמנות"` is 18 chars — too wide for the 390 px nav. We will use `"לוגיסטיקה"` (9 chars) as the nav tab label and keep the full `"לוגיסטיקה והזמנות"` as the page heading.

## Files changed
| File | Change |
|---|---|
| `app/page.tsx` | Replace `ActiveRouteMapCard` with `MapPreview` |
| `app/itinerary/page.tsx` | Remove `MapPreview` import + JSX; remove `LogisticsCard` import + JSX |
| `app/bookings/page.tsx` | Replace placeholder with `LogisticsCard`; update page title/heading |
| `lib/translations.ts` | `bookings` → `"לוגיסטיקה"` (he) / `"Logistics"` (en) |

## Non-goals
- Do not change `ActiveRouteMapCard.tsx` or `LiveMapCard.tsx` — they are still valid components for potential future re-use.
- Do not alter any other planning sections (ItineraryCard, EssentialsChecklist, SavedAttractionsList).
- No data-model changes.
