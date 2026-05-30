# Specification: Step 14 - View All Navigation

## 1. Goal & Context
Currently, in `NearbyPlacesSection.tsx` on the main Home dashboard, the "View all" link in the "Top Picks for You" section header is static and does not trigger any action when clicked. Clicking "View all" should scroll to and focus on the `AttractionSearch` search input (`#attraction-search-input`) on the same page, allowing the user to search for more destinations or dining options smoothly on both mobile and desktop views.

## 2. User Stories
*   **As a traveler**, I want clicking "View all" in the "Top Picks for You" section to focus and scroll me to the search card, so that I can immediately search and explore other attractions or dining spots in Italy.

## 3. Functional Requirements
- [ ] Bind an `onClick` event listener to the "View all" button in `NearbyPlacesSection.tsx`.
- [ ] The click handler should locate the attraction search input element with ID `attraction-search-input`.
- [ ] If the element exists, scroll to it smoothly (using `scrollIntoView({ behavior: "smooth", block: "center" })`) and call `.focus()` to focus it.

## 4. UI & Form Factor Constraints
*   **Viewport:** Optimized for 390px mobile viewport (where the search input stacks above or below other cards and requires scrolling).
*   **UX Elements:** Smooth scroll transitions to avoid layout jumps.

## 5. Security & Edge Cases
*   **Security:** Client-side only DOM query, no security concerns.
*   **Edge Cases:** If the element is not found in the DOM (e.g. if the search component is loading/unmounted), handle it gracefully without throwing runtime errors.
