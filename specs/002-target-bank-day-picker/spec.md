# Specification: Target Bank Day Picker & Activity-Nearby Discovery

## 1. Goal & Context

TripiAgent’s **Target Bank** (saved attractions and custom POIs in the group trip) already lets travelers bookmark places and schedule them from the sidebar list. Day planning still feels disconnected: adding bank items to a **specific day** requires extra navigation, and once an activity is on the itinerary there is no in-context way to discover dining or attractions **around that stop**.

This feature closes that gap:

1. Use the **Target Bank only** (group `savedAttractions` — not the admin curated `/admin/bank` repository).
2. Offer a **per-day picker** on the itinerary so planners can pull bank entries straight into that day’s timeline.
3. When a traveler focuses an itinerary **activity**, show **nearby discovery** anchored to that activity’s coordinates via the existing places discovery capability (`/api/places` with `lat` / `lng`).

**Target audience:** Small travel groups planning and executing an Italy trip on mobile (planner at home and traveler in-trip).

**Out of scope:**

- Admin Attraction Bank (`bankStore`, `/admin/bank`) — separate curated import pipeline; not a source for the day picker.
- Automatic AI day-fill from bank + anchors (may build on this later; see `.specify/step_4d_home_mode_explore_users_planner.md`).
- Replacing home-page `AttractionSearch` or `NearbyPlacesSection` (they remain for open-ended explore).
- User login / cross-device sync (see `specs/001-user-login-persistence`).

---

## 2. User Scenarios & Testing

### Scenario 1: Add from Target Bank to a chosen day

**Given** the group Target Bank has at least one saved attraction,  
**When** a traveler opens the day picker on **Day 3** and selects “Colosseum” with time 14:00,  
**Then** a new activity appears on Day 3 with that title, description/location from the bank entry, and time 14:00,  
**And** the activity is visible to any other group member viewing the shared itinerary.

### Scenario 2: Empty Target Bank

**Given** the Target Bank has no entries,  
**When** the traveler opens the day picker on any day,  
**Then** they see a clear empty state with guidance to bookmark places from Home or add a custom POI on the itinerary page,  
**And** no broken or loading-only UI.

### Scenario 3: Discover nearby from a selected activity

**Given** Day 2 has an activity “Uffizi Gallery” with a resolvable location (stored coordinates or geocoded `locationName`),  
**When** the traveler expands or selects that activity and chooses **Explore nearby**,  
**Then** they see a list of nearby attractions and/or dining options centered on that activity,  
**And** they can add a result to the same day or another day without leaving the itinerary context.

### Scenario 4: Activity without coordinates

**Given** an activity has only a text `locationName` (no lat/lng yet),  
**When** the traveler requests nearby discovery,  
**Then** the app resolves coordinates once (geocode), then loads nearby results,  
**And** shows a friendly message if geocoding fails (with option to edit location on the activity).

### Scenario 5: Planning mode restrictions

**Given** the app is in **Planning Mode** with itinerary edits frozen (same rules as today’s “add/edit activity”),  
**When** the traveler attempts to add from the bank picker or nearby results,  
**Then** the action is disabled or blocked with the same messaging used for other itinerary edits in planning mode.

### Scenario 6: Duplicate bank item on same day

**Given** “Colosseum” is already scheduled on Day 3,  
**When** the traveler adds “Colosseum” again from the day picker to Day 3,  
**Then** either a second activity is created (allowed) or a non-blocking confirmation is shown — default: **allow duplicate** with distinct activity ids (group may plan morning + evening visits).

---

## 3. User Stories

- **As a group planner**, I want to pick saved Target Bank places directly on each itinerary day so I can build the timeline without scrolling the sidebar for every add.
- **As a traveler**, I want to find restaurants and attractions near a scheduled stop so I can fill gaps around where I already am.
- **As a group member**, I want bank-driven activities to use the same shared data as the Target Bank list so votes and metadata stay consistent.
- **As a traveler on a shared phone**, I want nearby search to respect the activity I tapped, not my home GPS, when I am planning from the itinerary.

---

## 4. Functional Requirements

### Target Bank scope

- [x] **FR-1** Day picker and nearby flows use **only** group Target Bank entries (`savedAttractions` in trip state), including custom POIs and bookmarks from Home search.
- [ ] **FR-2** Admin curated bank (`/api/bank/places`, `bankStore`) is **not** listed in the day picker in v1.

### Per-day Target Bank picker

- [ ] **FR-3** Each itinerary day exposes a clear control (e.g. “Add from Target Bank”) visible on the day card in `/itinerary`.
- [ ] **FR-4** Opening the control shows a picker UI (sheet or popover) listing Target Bank entries: name, optional image/rating, vote summary if present.
- [ ] **FR-5** Traveler selects an entry and a **time** (default sensible value, e.g. 12:00, editable before confirm).
- [ ] **FR-6** Confirming adds an activity to **that day only** with title and fields mapped from the bank entry (same behavior as existing `addAttractionToItinerary`).
- [ ] **FR-7** Empty bank shows guided empty state; picker is not offered on days if product chooses — default: offer picker with empty state inside.
- [ ] **FR-8** Picker respects existing admin-only delete rules on bank entries (delete remains in Target Bank list, not inside picker).

### Activity location for nearby discovery

- [ ] **FR-9** Activities may store optional `lat` and `lng` when created from bank items or nearby results that include coordinates.
- [ ] **FR-10** When `lat`/`lng` are missing, nearby discovery attempts one-time geocode of `locationName` (or activity title if no location) before querying places.
- [ ] **FR-11** Successful geocode may persist coordinates on the activity for subsequent nearby searches (group-shared itinerary).

### Activity-scoped nearby discovery

- [ ] **FR-12** Expanded or selected activity shows **Explore nearby** (or equivalent label) distinct from “Ask AI”.
- [ ] **FR-13** Nearby results are loaded using the places discovery endpoint with the activity’s `lat` and `lng`, optional `type` (attraction vs restaurant), optional `keyword`, and radius consistent with app defaults (e.g. progressive 1 km → 5 km behavior already used elsewhere).
- [ ] **FR-14** Results display in an itinerary-context panel or sheet (name, address/vicinity, rating where available).
- [ ] **FR-15** User can add a nearby result to the itinerary (same day default, optional day selector) and optionally save to Target Bank.
- [ ] **FR-16** Loading, empty, and error states are explicit (network failure, zero results, geocode failure).
- [ ] **FR-17** API keys for places remain server-only; client passes coordinates and query parameters only.

### Consistency & accessibility

- [ ] **FR-18** All new controls have accessible names (`aria-label` or visible text) and meet 48px minimum tap targets on mobile.
- [ ] **FR-19** Strings go through existing i18n (`useTranslation`) including Hebrew RTL layouts.
- [ ] **FR-20** E2E tests use `data-testid` for picker open, bank row select, nearby panel, and add-to-day actions.

---

## 5. Success Criteria

- **SC-1** A traveler can add a Target Bank item to a chosen day in **under 15 seconds** (open picker → select → confirm) with no required visit to the sidebar list.
- **SC-2** **100%** of picker-added activities on a device appear on that day for a second group member viewing the shared itinerary (same persistence rules as today).
- **SC-3** For activities with valid coordinates, **≥ 80%** of nearby requests return at least one result within **5 seconds** on a typical mobile connection (mocked in CI).
- **SC-4** When geocoding fails, users always see an actionable message (no infinite spinner > 10 seconds).
- **SC-5** Pilot users can complete “fill lunch near this museum” without navigating to Home search (task success in moderated test).

---

## 6. Key Entities

| Entity | Description |
|--------|-------------|
| **Target Bank entry** | Shared `SavedAttraction`: id, name, description, locationName, optional image/rating, votes, createdBy. |
| **Itinerary activity** | Shared `Activity` on a day; gains optional `lat`, `lng` for geo-anchored nearby search. |
| **Day picker session** | Transient UI state: target day number, selected bank id, chosen time. |
| **Nearby query context** | Activity id, resolved coordinates, type/keyword/radius for one places request. |

---

## 7. Assumptions

- Target Bank remains group-shared in `tripStore` (local persistence v1; login feature may later formalize sync).
- Bank entries from Home search may already include coordinates in metadata; mapping into `Activity.lat`/`lng` on add is best-effort.
- Default nearby categories mirror existing app: `tourist_attraction` and `restaurant` (toggle or tabs in UI).
- Planning mode lock matches `ItineraryCard` `isPlanning` behavior today.
- Duplicate activities on the same day are allowed unless planning changes this.
- Rate limiting and caching on `/api/places` continue to apply; activity-scoped queries use the same endpoint contract (`lat`, `lng`, `type`, `keyword`, `radius`).

---

## 8. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; day picker as bottom sheet or compact popover on day header.
- **Accent:** `#006400` for primary actions; dark mode via `next-themes`.
- **Itinerary page:** Picker lives on each **day card** in `ItineraryCard`; nearby panel attaches to **activity expand** region.
- **Do not remove** `SavedAttractionsList` sidebar — it remains for voting, custom POI, and admin delete; day picker is an additional fast path.

---

## 9. Edge Cases

- **Bank entry missing location:** Activity still created; nearby explore prompts to add/edit location or geocode from title.
- **Very long bank list:** Picker scrolls with search/filter by name (v1: scroll only; filter optional in planning).
- **Activity deleted while nearby sheet open:** Sheet closes or shows stale guard message.
- **Offline / PWA:** Nearby and geocode show offline-friendly message; picker add still works locally if itinerary state is available.
- **Internationalization:** Activity titles may stay Italian/English; UI chrome is translated.

---

## 10. Dependencies

- Existing `savedAttractions`, `addAttractionToItinerary`, `SavedAttractionsList`, `ItineraryCard`.
- Existing `/api/places` and `/api/geocode` (or equivalent forward geocode).
- Existing `AttractionSearch` patterns for result cards and schedule-to-day (reuse UX patterns, not duplicate full search page).
- Optional future: `specs/001-user-login-persistence` for explicit group-shared bank semantics.

---

## 11. Out of Scope

- Admin bank import and `bankStore` integration.
- Map visualization of bank clusters (see `.specify/plans/step_17_checklist_users_radius.md` idea list).
- AI auto-suggest day plan from bank + weather + anchor.
- New external APIs beyond current Google Places / geocode stack.
