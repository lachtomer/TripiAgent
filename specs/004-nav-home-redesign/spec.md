# Specification: Navigation Redesign & Home Screen

## 1. Goal & Context

TripiAgent currently uses a 4-tab bottom navigation bar. This feature expands navigation to 6 tabs with Hebrew labels to match the target audience (Hebrew-speaking travelers), and restructures the Home screen into two purpose-built sections: an **Active Route Map** and an **Investigate** discovery panel.

The goal is to make the app immediately useful the moment it opens — showing where the traveler is headed and letting them discover nearby or target-area points of interest without switching screens.

**Target personas:** Both Planner (pre-trip, at home) and Traveler (in Italy, on-the-go).

---

## 2. User Stories

- **As a traveler**, I want a bottom navigation bar with clearly labeled tabs in Hebrew so I can quickly jump between the app's main areas.
- **As a traveler on the go**, I want the Home screen to show an active route/map overview so I understand where I am relative to my trip plan.
- **As a planner or traveler**, I want an "Investigate" section on Home where I can search for places by target inputs or around my current location, and bookmark any result directly.
- **As a planner**, I want the Investigate section to default to searching around my saved target destination when I am not yet in Italy.
- **As a traveler in Italy**, I want the Investigate section to default to "Around Me" (my GPS location) so I see what is nearby right now.

---

## 3. Functional Requirements

### A. Bottom Navigation Bar — 6 Tabs

- [ ] Replace the current bottom nav with 6 tabs in the following order:
  1. **Home** — icon: house/home · label: `בית`
  2. **Calendar** — icon: calendar · label: `תכנון`
  3. **Chat** — icon: chat bubble · label: `צ'אט`
  4. **Pack** — icon: backpack/luggage · label: `אריזה`
  5. **Locations** — icon: map pin · label: `יעדים`
  6. **Bookings** — icon: document/ticket · label: `ניירות`

- [ ] Each tab renders its label in Hebrew (RTL-safe text), with an icon above the label.
- [ ] The active tab highlights with the accent color (`#006400`).
- [ ] Tapping a tab navigates to the corresponding route: `/`, `/itinerary`, `/chat`, `/pack`, `/locations`, `/bookings`.
- [ ] The nav bar is fixed to the bottom of the viewport, above the OS safe area.

### B. Home Screen — Section 1: Active Route Map

- [ ] Display a map card at the top of the Home screen labeled "המסלול שלי" (My Route).
- [ ] The map shows the current day's itinerary stops as numbered markers connected by a route line.
- [ ] If no active itinerary exists for today, the map shows the saved target destination region (e.g., Lake Garda area) as a centered overview.
- [ ] The map is non-interactive in its default compact view (no pan/zoom); tapping it expands to a full-screen interactive map.
- [ ] In Planning Mode (pre-trip): map shows the destination region with saved target-bank locations as pins.
- [ ] In In-Trip Mode: map shows the user's current GPS position and today's planned stops.

### C. Home Screen — Section 2: Investigate

- [ ] Below the map card, display an "Investigate" discovery section labeled "חקר" (Investigate).
- [ ] A segmented toggle allows switching between two modes:
  - **Target** (יעד) — searches for places in the saved target destination area.
  - **Around Me** (סביבי) — searches for places around the user's current GPS coordinates.
- [ ] Default mode is determined by trip phase:
  - Planning Mode → defaults to **Target**.
  - In-Trip Mode → defaults to **Around Me**.
- [ ] A search/filter bar allows free-text filtering of results (e.g., by attraction name or category).
- [ ] Results are displayed as scrollable cards identical in style to the existing Explore section (name, category, distance/area, photo thumbnail).
- [ ] Each result card has a **bookmark icon**; tapping it saves the place to the Target Bank (Locations tab), with a visual confirmation toast.
- [ ] Already-bookmarked places show the bookmark icon in a filled/active state.
- [ ] The section reuses the existing `/api/places` backend and local fallback data (no new API required).

### D. Routing

- [ ] `/locations` route replaces or maps to the current Target Bank page.
- [ ] `/bookings` route is a new placeholder page (scaffold only in this spec; content defined in a future spec).
- [ ] All existing routes (`/`, `/chat`, `/itinerary`, `/pack`) remain fully functional.

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile, dark mode first.
- **Bottom Nav Height:** 64px fixed bar + OS safe-area inset; icons 24px, labels 10px.
- **Hebrew labels:** All 6 tab labels are Hebrew strings; the nav bar supports RTL text rendering without flipping tab order (tab order stays LTR: Home → Bookings, left to right).
- **Map Card:** ~220px tall in compact view, full-screen on tap.
- **Investigate Toggle:** Pill-style segmented control, full-width, accent color for active segment.
- **Bookmark feedback:** Toast notification ("נשמר ליעדים" — Saved to Locations) lasting 2 seconds.
- **No modal overlays for this feature** — all interactions happen inline on the Home screen.

---

## 5. Security & Edge Cases

- **GPS Permission Denied:** If location permission is not granted, the "Around Me" mode falls back to the saved target destination silently, with a soft info message ("הפעל מיקום לחיפוש סביבך").
- **No Active Itinerary:** Map section shows destination overview (see Section B above); no error state shown.
- **No Target Destination Set:** Both Investigate modes show an onboarding prompt to set a destination first; links to the `/itinerary` planning flow.
- **Duplicate Bookmark:** If a place is already in the Target Bank, tapping bookmark shows "כבר נשמר" (Already saved) toast instead of re-adding.
- **API Failure / Offline:** Investigate section falls back to cached/local fixture data; a subtle "תצוגה מקומית" (local view) label appears.
- **Bookings route:** Renders a "בקרוב" (Coming Soon) placeholder — no functionality exposed.

---

## 6. Assumptions

- The existing Explore section logic (places search, radius, filters) is reused as-is for the Investigate section; no new API endpoints needed.
- "Calendar" tab maps to the existing `/itinerary` route.
- "Pack" tab maps to the existing `/pack` route.
- Tab order is visually left-to-right (Home first, Bookings last) even though labels are Hebrew.
- The map component used is the existing map integration already present in the codebase (Leaflet or equivalent).
- Trip phase detection (Planning vs. In-Trip) uses the existing logic from step_4d spec.
