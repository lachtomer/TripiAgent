# Specification: Attraction & Dining Search Radius and Filtering Upgrades

## 1. Goal & Context
Currently, when users perform an Attraction or Dining search in the "Explore & Search Italy" section, they often receive very few results (only 1 or 2). This is caused by:
1. The server-side Google Places API helper slicing the results to a maximum of 5 *before* client-side filtering is applied.
2. The search radius being limited to 2.5 km (2500m), which is narrow for exploring a city.
3. Client-side filters (such as Gluten-Free, Diabetes-Friendly, Vegetarian, Vegan) being simulated client-side, which dramatically reduces the 5 returned results to 1-2.

The goal is to increase search result yield and improve filter responsiveness by returning all Google Places results (up to 20) from the server, applying client-side filters on this larger dataset, and expanding the default search radius to 5 km.

## 2. User Stories
* **As a Traveler,** when I search for restaurants in Rome and apply a "Gluten-Free" filter, I want to see up to 5 matching options, rather than only 1 or 2 options, so that I have a better selection of places to eat.
* **As a Traveler,** I want search results to cover a wider area (5 km radius) around the geocoded city center or my current location so that I can see options in the surrounding neighborhoods.

## 3. Functional Requirements
1. **Server-Side API Payload Expansion:**
   - Remove the `results.slice(0, 5)` restriction in `getGoogleNearbyPlaces` inside `lib/places.ts`. Allow the Google Places API call to return all results it retrieves (up to 20, which is the Google API default page size).
2. **Search Radius Expansion:**
   - In `components/AttractionSearch.tsx`, change the query radius in the fetch URL from `2500` to `5000` (5 km) to expand the default search range.
   - In `components/NearbyPlacesSection.tsx`, change the query radius in the fetch URL from `2500` to `5000` (5 km) to align the top picks and discover sections with the expanded radius.
3. **Filtering & Display Logic (Client-Side):**
   - The dietary options (Gluten-Free, Diabetic-Friendly, Vegetarian, Vegan) must continue to be filtered client-side, as they are simulated deterministically based on `place_id`.
   - The "Open Now" filter will continue to filter client-side.
   - The final filtered result set in `components/AttractionSearch.tsx` should be sliced to `5` items (just as before) to keep the UI clean and structured.
   - In `components/NearbyPlacesSection.tsx`, the top picks and discover sections should slice the incoming results to ensure the layout constraints are maintained (which it already does: `data.slice(0, 6)`).

## 4. UI & Form Factor Constraints
* **Viewport:** Optimized for 390px mobile viewport.
* **Style Guide:** No changes to existing design or colors.

## 5. Security & Edge Cases
* **Server-Only API Keys:** Google Places API key remains server-side.
* **Zod Validation:** Ensure the `PlacesQuerySchema` is still satisfied and coordinates are validated correctly.
