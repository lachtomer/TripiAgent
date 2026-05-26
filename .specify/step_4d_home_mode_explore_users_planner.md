# Specification: Advanced Travel Controls, Multi-User Profiles & Smart Planner

## 1. Goal & Context
Optimize TripiAgent's UX for both the **Planning Mode** (at home preparing) and **In-Trip Mode** (on-the-go in Italy). Remove redundant UI elements to simplify the Home screen, partition state (like packing lists) by user profile, restrict deletions in the Target Bank to Admins, and introduce daily anchor-based itinerary planning and validation (incorporating weather and crowd load).

---

## 2. User Stories
*   **As a Planner (at home),** I want the Home screen to display Italy (target destination) and its forecast rather than my current home location, keeping me focused on the trip.
*   **As a Traveler (in Italy),** I want the Home screen to automatically switch to my active location, live weather, and show the morning briefing.
*   **As a Travel Group Member,** I want to switch between user profiles (`User 1`, `User 2`, `User 3`) with a single tap so that my personal packing list is persisted independently.
*   **As an Admin,** I want the exclusive right to remove items from our group's target attraction bank, while allowing everyone to vote (thumbs up/down) on interest.
*   **As a Planner,** I want to set a daily "anchor location" and receive intelligent AI suggestions based on our target bank, current weather forecasts, and crowd density.
*   **As a Planner,** I want to easily swap itinerary days with automatic AI/heuristic validation.

---

## 3. Functional Requirements

### A. Trip Phase Detection (Planning vs. In-Trip)
*   **At Home (Planning Mode):**
    *   Active when the current date is before the trip start date, or manually toggled via a settings switch.
    *   `LocationCard` displays target region (e.g. "Lake Garda, Italy") and its forecast instead of home coordinates.
    *   `NearbyPlacesSection` displays attractions/restaurants searched for the target region.
    *   Remove `CopilotCards` (Morning Briefing / Serendipity) from the Home screen (chat prompts belong in the `/chat` route).
*   **In-Trip Mode:**
    *   Active when dates overlap with the trip schedule or manual override is active.
    *   Shows active GPS/local coordinates and live weather.
    *   Shows `CopilotCards` (Morning Briefing & Serendipity) at the top of the Home feed.

### B. Explore & Dining Filters
*   Inside the Explore Attraction/Dining search:
    *   Add multi-select filters for dining: `Open Now`, `Gluten-Free Available`, `Diabetes-Friendly`, and `More Options`.
    *   Combine selected filters to filter results returned from `/api/places` or local fallback lists.

### C. Multi-User Profile & Admin Constraints
*   **User Profiles:**
    *   List of names: `User 1` (Role: User), `User 2` (Role: User), `User 3` (Role: Admin).
    *   Passwordless dropdown switcher in the top bar.
    *   Packing lists are stored per-user (keyed in Zustand by `userId`).
*   **Target Bank Collaborative Feedback:**
    *   Keep a single, shared Target Bank of saved attractions.
    *   Add Thumbs Up and Thumbs Down rating counters or flags to each saved attraction.
    *   "Remove" trash icon is hidden/disabled if the active user's role is not `Admin`.

### D. Daily Anchor Planner & Day Swapping
*   **Anchor Location:** Add an input field for each day in `/itinerary` (e.g., "Day Anchor: Milan").
*   **AI Recommendations:** When requesting suggestions, Gemini utilizes the Day Anchor + Weather + Crowd load levels to recommend itinerary items from the Target Bank.
*   **Day Swap:** Button to swap Day A and Day B. Check constraints (e.g., ZTL weekend vs weekday, ferry scheduling, outdoor vs rainy day weather).

---

## 4. UI & Form Factor Constraints
*   **Mobile First:** Optimized for 390px mobile view. Dropdowns and chips should have large tap targets (minimum 48px).
*   **UI Simplification:** Main home page is cleaner: Hero card, explore section, and a simple toggle between planning/in-trip modes. Copilot cards move to chat or only display in-trip.
*   **Drawer Review:** Itinerary modifications continue to use the before/after review drawer.

---

## 5. Security & Edge Cases
*   **No DB Persistence:** Use Zustand `persist` (localStorage) mapped per user ID.
*   **Rate Limits:** Rate limiter must apply to API planning queries to protect API keys.
*   **Admin Bypass Protection:** Validate roles on client-side state mutation helpers.
