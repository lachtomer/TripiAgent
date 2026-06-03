# Research — 007 Clickable Place Suggestion Links

**Status:** COMPLETE — all technical unknowns resolved.

---

## Decision 1: Link target — official website with Maps fallback

- **Decision:** Primary = Google Place Details `website` field → exposed as `website_url` on `PlaceDetail`. Fallback = existing `maps_url` (`buildGoogleMapsUrl(place_id)`).
- **Rationale:** User asked for "site of the place"; Google Maps is not the venue site but is the best deterministic fallback when no website is published (common for small trattorias).
- **Alternatives considered:** Maps-only links (rejected — doesn't meet "site" intent); always open Maps (rejected).

---

## Decision 2: Enrichment strategy for `/api/places`

- **Decision:** After `getProgressiveNearbyPlaces` returns results, call Place Details (legacy JSON API) per `place_id` with `fields=website,url` in parallel (`Promise.allSettled`), merge `website` into `website_url`.
- **Rationale:** Nearby Search never returns `website`; Details is the documented source. Parallel calls for ≤8 results stay within latency budget; failures degrade gracefully (Maps fallback only).
- **Alternatives considered:** Place Details (New) batch API — not used yet in codebase; legacy keeps one integration pattern. Synchronous single Details call per user click — rejected (extra round-trip on tap).

---

## Decision 3: UI interaction model

- **Decision:** Place **name** is an external `<a>` link. Separate buttons retain existing actions (bookmark, Add to Day, Explore with AI). Remove whole-card `onClick → handlePlaceTap` from NearbyPlacesSection cards; keep explicit CTA button for chat.
- **Rationale:** Avoid conflict between "open website" and "ask AI"; meets accessibility (no nested buttons inside link).
- **Alternatives considered:** Long-press for website / tap for chat — rejected (undiscoverable on mobile).

---

## Decision 4: Shared component

- **Decision:** New `components/PlaceNameLink.tsx` — accepts `name`, `websiteUrl?`, `mapsUrl?`, validates URL, renders link or plain text.
- **Rationale:** Three surfaces + SavedAttractionsList need identical fallback logic and styling.
- **Alternatives considered:** Inline `<a>` in each file — rejected (duplicate validation).

---

## Decision 5: Chat markdown links without hallucination

- **Decision:** Extend `buildSystemPrompt` in `lib/gemini.ts` (and agent graph prompt if duplicated) with rule: when naming a specific venue, wrap in markdown link using `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(name + ' ' + city)}` unless a verified URL is in context.
- **Rationale:** Constitution forbids hallucinated addresses/URLs; Maps search URL is deterministic from name + city from user context.
- **Alternatives considered:** Post-process chat text to inject links via NLP entity extraction — over-engineered for v1.

---

## Decision 6: Chat link rendering hardening

- **Decision:** Custom `ReactMarkdown` `components.a` renderer in `ChatInterface.tsx`: force `target="_blank"`, `rel="noopener noreferrer"`, and client-side scheme check (http/https only).
- **Rationale:** Defense in depth even if model outputs a bad URL; matches security skill patterns.
- **Alternatives considered:** `remark` plugin — unnecessary for one renderer override.

---

## Decision 7: SavedAttraction persistence

- **Decision:** Add optional `website_url` and `maps_url` to `SavedAttraction`; populate when bookmarking from enriched search results.
- **Rationale:** Locations tab can link out later without re-fetching Details; minimal store migration (optional fields, no breaking change).
- **Alternatives considered:** Always re-fetch on Locations view — extra API calls.

---

## Decision 8: URL validation helper

- **Decision:** `lib/urlSafety.ts` with `isSafeExternalUrl(url: string): boolean` — parses via `URL` constructor, allows only http/https.
- **Rationale:** Shared between server enrichment (strip bad website values from Google) and client render.
- **Alternatives considered:** Zod `.url()` only — doesn't block javascript: scheme by default in all cases.

---

## Decision 9: Testing & mocking

- **Decision:** Extend Vitest fixtures in `lib/places.test.ts` for enrichment; new E2E spec `e2e/step22.place-links.spec.ts` with mocked `/api/places` returning `website_url`; intercept external navigation via `page.context().waitForEvent('page')` or href assertion only.
- **Rationale:** Constitution requires E2E for layout/routing changes; mock external APIs per AGENTS.md.
- **Alternatives considered:** Live Google API in CI — rejected.

---

## Decision 10: SavedAttractionsList links (v1 scope)

- **Decision:** Include in v1 — render `PlaceNameLink` when saved attraction has `website_url` or `maps_url`.
- **Rationale:** Low effort once shared component exists; completes "any proposed place" story for bookmarked venues.
- **Alternatives considered:** Defer to v2 — rejected (small incremental change).
