# Specification: Clickable Place Suggestion Links

## 1. Goal & Context

When TripiAgent surfaces an attraction, restaurant, or other place — whether from Google Places search, Home explore cards, itinerary nearby panel, or the AI chat — the user should be able to tap the place name and open its **official website** in the device browser.

Today, place cards route taps to the chat assistant (`handlePlaceTap`), and `PlaceDetail` only carries a Google Maps URL (`maps_url`), not the venue site. Chat recommendations are plain text with no outbound links.

**Target personas:** Planner (researching before the trip) and In-Trip (deciding where to eat or visit on the spot).

---

## 2. User Stories

- **As a traveler**, I want to tap a suggested restaurant or attraction name and open its official website, **so that** I can check menus, hours, tickets, or booking without leaving TripiAgent context permanently.
- **As a traveler**, when a place has no official website, I want a sensible fallback link (Google Maps listing), **so that** I still get useful directions and reviews.
- **As a traveler**, I want chat recommendations that mention specific venues to include clickable links, **so that** AI suggestions are as actionable as search results.
- **As a traveler**, I want external links to open in a new browser tab without breaking the PWA session, **so that** I can return to TripiAgent easily.

---

## 3. Functional Requirements

### A. Link target priority

- [ ] Primary link target: **official website** from Google Place Details (`website` field).
- [ ] Fallback when `website` is absent: existing **`maps_url`** (Google Maps place page via `place_id`).
- [ ] Never render a broken or empty link; if neither URL exists, show place name as plain text (non-clickable).

### B. Surfaces in scope (API-driven place cards)

- [ ] **Home — NearbyPlacesSection** (`components/NearbyPlacesSection.tsx`): place name on Top Picks and Discover More cards links out; card body tap no longer hijacks the whole card to chat-only flow.
- [ ] **Home — AttractionSearch** (`components/AttractionSearch.tsx`): place name in search results is a link; bookmark / add-to-day actions unchanged.
- [ ] **Itinerary — ActivityNearbyPanel** (`components/ActivityNearbyPanel.tsx`): place name in nearby results is a link; Add to Day / Save to Bank unchanged.

### C. Chat AI recommendations

- [ ] Update the travel assistant system prompt so that when the model **names a specific venue** (restaurant, museum, attraction), it formats the name as a markdown link.
- [ ] Chat links MUST use either (a) a verified URL from context, or (b) a **Google Maps search URL** built from `place name + city` — never hallucinated custom domains.
- [ ] `ChatInterface` already renders markdown links via `ReactMarkdown`; ensure links open in a new tab with `rel="noopener noreferrer"`.

### D. Link behavior & security

- [ ] All outbound place links use `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] URLs must be validated server-side and client-side: only `http:` or `https:` schemes allowed.
- [ ] Optional visual affordance: external-link icon next to clickable names (accent `#006400`).

### E. Data & API

- [ ] Extend `PlaceDetail` with optional `website_url?: string`.
- [ ] Enrich `/api/places` responses by fetching Place Details for returned `place_id` values (fields: `website`, `url`).
- [ ] Cache enriched results in the existing in-memory places cache (10 min TTL unchanged).
- [ ] Mock/fixture responses in tests include `website_url` where applicable.

### F. Saved places (secondary)

- [ ] When bookmarking a place from search, persist `website_url` on `SavedAttraction` if available.
- [ ] **SavedAttractionsList**: render saved place name as link when `website_url` or derivable `maps_url` exists (optional v1 stretch — see Out of Scope if deferred).

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile; link tap targets ≥ 44px where the name row is tappable.
- **RTL:** Place names remain LTR (`dir="ltr"`); link styling uses accent green.
- **Accessibility:** Links have `aria-label` including "opens in new tab" semantics; bookmark buttons remain separate controls (no nested interactive elements).
- **Dark mode:** Link color `#86df72` in dark theme (match existing prose link tokens).

---

## 5. Security & Edge Cases

- Reject `javascript:`, `data:`, and non-http(s) URLs at API enrichment and UI render layers.
- Places without website: fallback to Google Maps only — no error state.
- Google Places API quota: limit Details lookups to places returned in the current response (max ~8 per request); parallel fetch with graceful per-place failure.
- Offline / API failure: show names as plain text; existing bookmark and itinerary actions still work.

---

## 6. Assumptions

1. **"Site of the place"** means the venue's official website when Google provides it; Google Maps is an acceptable fallback, not a replacement when website exists.
2. **Chat links** use Google Maps search URLs for venues without a known `place_id` — avoids hallucinated URLs per constitution accuracy rules.
3. **Whole-card tap → chat** behavior is replaced by explicit "Ask AI" / "Explore guide" buttons where they already exist; name tap opens external site.
4. Existing `GOOGLE_PLACES_API_KEY` has Place Details permission enabled on the Google Cloud project.

---

## 7. Success Criteria

1. **Search results:** Tapping a place name in AttractionSearch opens official website (or Google Maps fallback) in a new tab — verifiable in browser devtools.
2. **Home cards:** Top Picks place name is clickable; bookmark button still toggles save without navigating away.
3. **Itinerary nearby:** ActivityNearbyPanel result names link out; Add to Day still works.
4. **Chat:** Assistant message recommending "Osteria Francescana in Modena" includes a clickable markdown link opening a valid http(s) URL.
5. **Security:** No link renders with `javascript:` scheme in unit or E2E tests.
6. **Regression:** Bookmark, Add to Day, and search pagination behaviors unchanged.

---

## 8. Key Entities

| Entity | New/changed fields | Storage |
| --- | --- | --- |
| `PlaceDetail` | `website_url?: string` | API response only (cached server-side) |
| `SavedAttraction` | `website_url?: string`, `maps_url?: string` | Zustand `tripStore.savedAttractions` (persisted) |

---

## 9. Out of Scope

- In-app WebView / embedded browser for external sites
- Deep integration with booking platforms (TheFork, Tiqets, etc.)
- Auto-fetching websites for custom POIs without `place_id`
- Replacing Google Maps fallback with Apple Maps or OpenStreetMap
- Live link validation (HTTP HEAD checks) on every render
