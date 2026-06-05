# Specification: Search by Attraction Name

## 1. Goal & Context

TripiAgent’s **Investigate** search today treats the user’s query primarily as a **location**: the app geocodes a city or area, then lists nearby places (optionally filtered by a keyword when the user types patterns like “Pizza in Milan”). Travelers who already know **which attraction or venue they want** must guess the right city spelling or use awkward “name in city” phrasing.

This feature adds the ability to **search directly by attraction or venue name** (e.g. “Colosseum”, “Gardaland”, “Osteria Francescana”) and receive relevant place results in the same result list used today—without requiring the user to lead with a location.

### Root cause (why today fails)

Investigate search **always** geocodes the query, then calls **Nearby Search** around those coordinates. Nearby returns *other* venues near the point—not necessarily the **named place** the user typed. Example: `Gardaland` may geocode correctly to the park’s coordinates, but nearby `tourist_attraction` results can omit Gardaland itself and show only neighboring sights. Name-led search must use **Text Search** (venue retrieval), not geocode → nearby alone.

**Target personas:** Planner researching specific sights before the trip; in-trip traveler who heard a recommendation and wants to find it quickly.

**Relationship to prior work:** Extends the existing Investigate / search experience (Feature 004 nav redesign, Feature 007 place links). Does not replace location-based or “near me” search; it **augments** the same search field with smarter interpretation.

---

## 2. User Stories

- **As a planner**, I want to type an attraction name and see matching places, **so that** I can bookmark or schedule a specific sight without knowing exact city syntax.
- **As an in-trip traveler**, I want to search a restaurant or museum by name near my trip area, **so that** I can act on a tip from family or the AI assistant.
- **As a traveler**, I want “Pizza in Milan” and similar location-led queries to keep working, **so that** I am not forced to learn a new search pattern.
- **As a traveler**, when several venues share a similar name, I want clear results (name, area, rating) **so that** I can pick the right one.
- **As a traveler**, I want to open official or map links from name-search results the same way as today, **so that** research flow stays consistent.

---

## 3. Functional Requirements

### A. Unified search entry (Investigate)

- [ ] The existing Investigate search input accepts **attraction/venue names** in addition to location strings.
- [ ] No separate “name vs location” mode toggle is required in v1—the system **infers intent** from the query and trip context.
- [ ] Search is available in both **Target** (trip anchor area) and **Nearby** (current location) Investigate modes.

### B. Name-led search behavior

- [ ] When the user enters a query that reads as a **place name** (not only a city/region), the app searches for matching attractions or venues **by name**.
- [ ] Name search returns the **same result card format** as location search (name, rating, address/area, bookmark, add-to-day, outbound links per Feature 007).
- [ ] Name search respects the user’s selected category (e.g. Dining vs Attractions) and active filters (open now, dietary) where applicable.
- [ ] On the **text-search path**, the selected **radius chip** sets the geographic bias radius passed to `/api/places/text`. Radius chips do not change server-side progressive nearby scan (pre-existing behavior on the location path).
- [ ] If the query includes explicit location context (e.g. “Colosseum Rome” or “Gardaland Lake Garda”), results prioritize matches in that area.
- [ ] If the query is **name-only** (no city/region in the text), results are **biased toward the trip geographic anchor** (Target mode: trip base area; Nearby mode: current coordinates), then broaden to a wider Italy-relevant area if no strong local matches exist.

### C. Location-led search (preserved)

- [ ] Queries that are clearly **locations** (city, town, region) continue to geocode and list nearby places as today.
- [ ] The **“keyword in location”** pattern (e.g. “Pizza in Milan”) continues to work: keyword filters results near the geocoded location.
- [ ] “Use current location” / GPS-based nearby search behavior is unchanged.

### D. Query interpretation & disambiguation

- [ ] The system distinguishes **name-led** vs **location-led** queries using reasonable heuristics (e.g. known city patterns, “in” syntax, single-token famous names).
- [ ] When multiple places match a name, show **all plausible matches** in the result list (not a single silent best guess), ordered by relevance to trip anchor and rating.
- [ ] When no matches are found, show a **clear empty state** suggesting refinements (add city, check spelling, try broader category).
- [ ] Ambiguous queries that could be either a small town or a venue name should prefer **venue name search first** when category is Attractions; location search when the string matches a well-known geographic name.

### E. Results actions (unchanged scope)

- [ ] Bookmark to Locations, add to itinerary day, Ask AI, and external place links behave the same as for location search results.
- [ ] Search does not auto-navigate away from Investigate; results stay inline.

### F. Scope boundaries

- [ ] v1 does **not** add voice search or barcode/QR lookup.
- [ ] v1 does **not** search the user’s saved Locations list as a primary index (saved list search may be a future enhancement).
- [ ] v1 does **not** change Target Bank curation—only **live search** in Investigate.
- [ ] Translating place names or forcing English display of third-party place data is out of scope.
- [ ] v1 does **not** replace simulated dietary filters (`place_id` hash heuristics)—they continue to apply client-side on all result paths.

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; no new full-screen flows.
- **Entry point:** Existing Investigate search field and Search button.
- **Discoverability (v1):** Users learn via inline guidance—no separate tutorial:
  - **Placeholder** mentions both place names and cities (e.g. “Search a place or city…”).
  - **Helper line** under the input: e.g. “Try a city, a place name, or ‘pizza in Milan’.”
  - **Example chips** (tap to fill): at least `Gardaland`, `Verona`, `Pizza in Milan`.
  - **Investigate header** shows one-line search description (not hidden in headless mode).
  - **Empty state** suggests refinements when zero results.
- **Loading & errors:** Same loading and error patterns as current search (spinner, retry-friendly message).
- **Accessibility:** Search button and result rows remain keyboard and screen-reader friendly; link labels unchanged from Feature 007 patterns.

---

## 5. Security & Edge Cases

- **Injection:** User queries are treated as plain text; no executable content in search strings.
- **Privacy:** Name search does not expose one traveler’s queries to other group members beyond existing on-device storage rules.
- **Offline:** Name search requires network; offline state shows the same failure guidance as location search.
- **Empty / whitespace:** Submitting blank search does nothing harmful (no request).
- **Very short queries** (1–2 characters): no search or debounced minimum length to avoid noisy API usage.
- **Non-Italy places:** Results remain Italy-travel relevant; queries clearly outside Italy show empty state or “no results in trip area” messaging.
- **Hebrew or English input:** Free-text names in either language are accepted in the search field (consistent with Feature 009 chat/UI language split).

---

## 6. Assumptions

1. **Single search box** in Investigate—no duplicate search UI on other tabs in v1.
2. **Trip geographic anchor** for name-only queries: Target mode uses the trip’s primary area (e.g. first saved attraction location or default Lake Garda base); Nearby mode uses last known GPS with fallback messaging if denied.
3. **Italy focus:** The product remains an Italy travel assistant; name search optimizes for Italian destinations.
4. **External place data** comes from the same provider family as today’s nearby search (no new data vendor requirement in the spec).
5. **Rate limits** follow existing search API throttling; name search does not bypass limits.
6. **“Name-led” detection** may use simple rules in v1 (syntax, geocode confidence, category); ML-based intent classification is out of scope.

---

## 7. Success Criteria

1. **Name search works:** User types “Gardaland” (or another well-known attraction name) in Investigate and receives at least one relevant result card without typing a city name.
2. **Location search preserved:** User types “Verona” or “Pizza in Milan” and receives results comparable to pre-feature behavior.
3. **Trip bias:** With a Lake Garda–anchored trip, name-only query “Sirmione Castle” (or similar local name) ranks local matches above distant homonyms when both exist.
4. **Disambiguation:** Query that matches multiple venues (e.g. common chain or generic name) shows multiple distinct rows with area/address visible.
5. **Actions intact:** From a name-search result, user can bookmark, add to a day, and open an external link successfully.
6. **Empty state:** Nonsense or zero-match query shows helpful guidance within 5 seconds of submit.
7. **Regression:** Nearby GPS search, category chips, radius filters, and pagination (“Show more”) still work after name search ships.

---

## 8. Key Entities

| Entity | Description | Persistence |
| --- | --- | --- |
| Search query | User-entered text (name, location, or combined) | Ephemeral per session unless cached for repeat |
| Search intent | Inferred name-led vs location-led interpretation | Ephemeral per request |
| Trip geographic anchor | Bias point for name-only search (target city or coords) | From existing trip/location store |
| Place result | Venue record (name, area, rating, links) | Returned from search provider; bookmark copies to device store |

---

## 9. Out of Scope

- Searching only within saved Locations / Target Bank offline index
- Global search across itinerary activities, packing list, or chat history
- Auto-scheduling an attraction from name search without user confirmation
- New map-first search UI or AR “point at building” discovery
- Per-user search history sync across devices
- Replacing geocode-first flow entirely—location-led search remains first-class
