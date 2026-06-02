# Research — Step 16: Map to Home & Logistics to Bookings

## Status: COMPLETE — no unknowns

All decisions below are resolved from existing codebase analysis.

---

## Decision 1: Map component to use on Home

- **Decision:** Replace `ActiveRouteMapCard` with `MapPreview` directly on `app/page.tsx`.
- **Rationale:** `ActiveRouteMapCard` wraps `LiveMapCard` → `MapPreview` fallback. Since most sessions have no live itinerary data, users see `MapPreview` anyway but inside an extra click-to-expand shell. Placing `MapPreview` directly gives a cleaner, always-visible route overview without the extra wrapper. `ActiveRouteMapCard` and `LiveMapCard` remain in the codebase for future re-use.
- **Alternatives considered:** Keep `ActiveRouteMapCard` on home → rejected per user request; remove map from both pages → rejected.

---

## Decision 2: Remove MapPreview from planning sidebar

- **Decision:** Remove `<MapPreview />` and its import from `app/itinerary/page.tsx`.
- **Rationale:** User explicitly requested the route map only on Home, not duplicated in Planning. The sidebar remains functional with ItineraryCard, EssentialsChecklist, LogisticsCard (temporarily), and SavedAttractionsList.

---

## Decision 3: LogisticsCard destination

- **Decision:** Move `LogisticsCard` from `app/itinerary/page.tsx` to `app/bookings/page.tsx`.
- **Rationale:** The bookings page (`/bookings`) is currently a placeholder ("בקרוב"). The LogisticsCard (flights, car rental, lockbox, ZTL) is logistically oriented, not itinerary-day oriented, making `/bookings` the correct semantic home.
- **Alternatives considered:** New dedicated route → overkill for one component.

---

## Decision 4: Nav label for bookings tab

- **Decision:** `"לוגיסטיקה"` (Hebrew) / `"Logistics"` (English) for the nav tab label.
- **Rationale:** Full string `"לוגיסטיקה והזמנות"` (18 chars) overflows 390 px 6-tab nav at 9px font. Shortened to `"לוגיסטיקה"` (9 chars) for the tab; full heading `"לוגיסטיקה והזמנות"` used on the page.
- **Alternatives considered:** `"הזמנות"` → less descriptive; `"לוג'"` → informal.
