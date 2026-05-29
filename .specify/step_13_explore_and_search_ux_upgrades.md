# Specification: Step 13 - Explore & Search Precision & UX Upgrades

## 1. Goal & Context
Optimize the search experience of TripiAgent's attraction/dining search by introducing progressive radius scaling (100-point rule compliance), keyword-aware Google Places queries, direct itinerary day binding, and active trip warning indicators. This aims to maximize search quality and usability under the "100-Point Rule" constraints without adding external DB logic.

## 2. User Stories
*   **As a traveler**, I want my search for restaurants or attractions to yield highly relevant local results matching specific keywords (e.g., "Gelato", "Pizza", "Duomo"), so that I don't get generic category dumps.
*   **As a traveler**, I want to quickly schedule an attraction or dining spot directly into a specific day of my itinerary from the search result card, so that I don't have to double-navigate through the Attraction Bank.
*   **As an in-trip traveler**, I want to see warnings about ZTL zones or active rain forecasts directly on search results, so that I make smart scheduling choices.

## 3. Functional Requirements
- [ ] **Keyword-Aware API Querying:** Upgrade `/api/places` to accept a `keyword` parameter and forward it to the Google Places API `nearbysearch` to filter precisely on tags like "Gelato", "Duomo", etc.
- [ ] **Smart Progressive Radius scaling:** If a query yields $< 3$ results, dynamically retry on the server at `1000m` -> `2500m` -> `5000m` to keep searches as localized and walkability-focused as possible.
- [ ] **Direct Timeline Binding (Quick-Add):** Add a dropdown button on each search result card that lists the available itinerary days and allows directly adding the item as an activity.
- [ ] **Active Context-Aware Badges:** Display inline warnings on search result cards:
    - Milan Area C warning if the restaurant is within Milan and the user has a Milan day scheduled.
    - Weather alert if the destination has active rain forecast for the active itinerary days.

## 4. UI & Form Factor Constraints
*   **Viewport:** Optimized for 390px mobile viewport.
*   **UX Elements:** Floating popover or sheet dropdown for quick day selection, glassmorphic indicator tags.

## 5. Security & Edge Cases
*   **Security:** Server-only API keys, input validation with Zod (validating the new `keyword` parameter).
*   **Edge Cases:** If progressive queries return zero results after max radius, output a user-friendly suggestion. Handle coordinates that don't match any ZTL zones gracefully.
