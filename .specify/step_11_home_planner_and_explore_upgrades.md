# Specification: Home Planner Visibility & Attraction Search Upgrades

## 1. Goal & Context
Refine the Home screen UX to hide the Today Planner timeline in "Planning Mode" (keeping the focus purely on target-destination preparation) and enable it only during "In-Trip Mode". Make the "Top Picks" cards fully interactive rather than having unclickable regions. Enhance the Attraction & Dining Search with visible location details (address/vicinity) and a modern, high-precision "Use Current Location" option to directly search spots around the user's GPS position.

## 2. User Stories
*   **As a Planner (at home),** I want the Today Planner timeline to be hidden on the Home screen so that I am not distracted by an inactive itinerary schedule before my trip starts.
*   **As a Traveler (in Italy),** I want the Today Planner timeline to be visible on the Home screen so that I can see my day's agenda.
*   **As a Traveler/Planner,** I want to click anywhere on a Top Picks card to ask the AI guide about it, rather than only being able to click the small "Explore Guide" button.
*   **As a Traveler/Planner,** I want to see the physical addresses of restaurants and attractions in my search results so that I can judge their locations.
*   **As a Traveler/Planner,** I want to click a location icon in the search box to automatically query restaurants and attractions near my current physical location without having to type a city name.

## 3. Functional Requirements
- [ ] **Today Planner Visibility:**
  - `TodayPlanner` component on the Home page is rendered only when `tripMode === "in-trip"`.
- [ ] **Top Picks Interactivity:**
  - In `NearbyPlacesSection.tsx`, the card container elements inside the Top Picks horizontal list must have `onClick={() => handlePlaceTap(place)}` and class `cursor-pointer`.
  - Ensure the bookmark button maintains `e.stopPropagation()` so that bookmarking doesn't trigger the page navigation.
- [ ] **Search Result Locations:**
  - Update `lib/places.ts` (the server-side resolver) to extract `vicinity` as `address` in the `PlaceDetail` interface returned by `/api/places`.
  - In `components/AttractionSearch.tsx`, display `place.address` (with a small MapPin icon) in each search result card.
- [ ] **Use Current Location Option:**
  - In `components/AttractionSearch.tsx`, place a clickable `MapPin` icon button inside the city input field as a trailing element.
  - Clicking the current location icon triggers `useLocation`'s `refreshLocation` method if coordinates are not yet available.
  - Display a loading spinner in place of the icon while location coordinates are being resolved.
  - Once coordinates (`lat`, `lng`) are resolved, automatically populate the search input with the resolved city name (or "Current Location") and trigger the API query `/api/places?lat={lat}&lng={lng}&radius=2500&type={searchType}` directly, skipping the geocoding stage.
  - If location access is denied, clear the pending state and show a clear error message: "Location permission denied. Please search by city name."

## 4. UI & Form Factor Constraints
*   **Viewport:** Optimized for 390px mobile viewport.
*   **Tap Targets:** MapPin icon inside the input should have a comfortable tap target. Cards have clear hover transitions and scale adjustments (`active:scale-[0.98]`).
*   **Style Guide:** Use primary accent colors (`#006400` / `#86df72` in dark mode) for icons and loader states.

## 5. Security & Edge Cases
*   **Server-Only API Keys:** Continue to keep all API queries going through the Next.js routes (`/api/places` and `/api/geocode`), keeping the Google Places API key server-only.
*   **Location Pending State:** If a user clicks the current location icon, the search input shows a placeholder/loading state until coordinates are resolved. The user cannot submit another search while loading is active.
