# Research — 010 Search by Attraction Name

**Status:** COMPLETE — technical approach resolved for v1 (post brutal review 2026-06-03).

---

## Decision 1: Provider — Google Places Text Search (existing key)

- **Decision:** Use **Google Places Text Search** as the **name-retrieval** path with optional location bias; keep geocode + nearby for **location browse** and **keyword in location**.
- **Rationale:** Nearby Search returns venues *near* a point, not the named entity itself (root cause). Text Search returns ranked venue matches. Same API key as `/api/geocode` forward geocode.
- **Alternatives considered:** Nearby + `keyword` only (rejected — poor for famous names); Geocoding API alone (rejected — single centroid, no list).

---

## Decision 2: Two-phase client orchestration (not sync-only classifier)

- **Decision:** `handleSearch` uses a **state machine**, not a single synchronous `resolveSearchIntent()` branch:
  1. **Fast path (sync):** `" in "` → `keyword_in_location` → geocode + nearby (unchanged).
  2. **Probe path (async):** all other queries ≥3 chars → `/api/geocode?query=` → read `placeTypes`, `matchedName`.
  3. **Route after probe:**
     - `isLocationBrowseCandidate(query, geocode)` → `location_browse` → nearby at geocoded coords.
     - Else → `name_search` (or `name_with_area` if area suffix parsed) → `/api/places/text`.
  4. **Dining ambiguous:** text first; on 404 → fallback to `location_browse` using same geocode probe.
- **Rationale:** `location_browse` vs `name_search` cannot be decided without geocode metadata. Sync-only classifier was a plan defect.
- **Alternatives considered:** Italy city allowlist only (rejected as sole signal — incomplete); always text search (rejected — breaks `Verona` browse).

---

## Decision 3: `isLocationBrowseCandidate` rules (v1)

- **Decision:** After geocode probe, treat as **location browse** when **all** hold:
  - `placeTypes` intersects `{ locality, administrative_area_level_1, administrative_area_level_2, administrative_area_level_3, political }`
  - Query (case-folded, trimmed) equals `cityName` OR `matchedName` OR is in static **Italy city allowlist** (~50 entries: Milan, Verona, Venice, Florence, Rome, Naples, Bologna, Turin, Genoa, Padua, Brescia, Como, Sirmione, Riva del Garda, Desenzano del Garda, …)
  - Query does **not** contain `" in "`
- **Category override:** Attractions + probe says locality → **location_browse** (spec §3.D). Dining + probe says locality → **location_browse** unless user clearly typed a restaurant brand (no override in v1).
- **Rationale:** `Verona` geocodes to `locality`; `Gardaland` geocodes to `amusement_park` / point_of_interest — routes to text.
- **Alternatives considered:** LLM classifier — out of scope.

---

## Decision 4: Geographic anchor for name-only queries

- **Decision:** Pass `searchAnchor` from `InvestigateSection`:
  - **Target:** first `savedAttractions[]` with `lat`/`lng`; else async geocode `targetCity`; disable search until anchor ready (or show “Preparing search area…”).
  - **Nearby:** `useLocation()` coords; denied → block name text path with existing GPS copy.
- **Rationale:** Spec §3.B trip/GPS bias for name-only queries.
- **Alternatives considered:** Italy centroid (rejected — weak local relevance).

---

## Decision 5: API shape — `GET /api/places/text`

- **Decision:** New route with `q`, `lat`, `lng`, optional `type`, optional `radius` (bias meters). Server: `searchPlacesByText()` → `PlaceDetail[]` → enrich cap 8.
- **Rationale:** Stable nearby contract; mockable E2E.
- **Alternatives considered:** `mode=text` on `/api/places` — rejected (cache key confusion).

---

## Decision 6: Widen when biased search is empty (fixed)

- **Decision:** Two server phases inside `/api/places/text`:
  1. **Phase A (biased):** Text Search with `query`, `location=lat,lng`, `radius` (from chip, default 50km).
  2. **Phase B (national):** If Phase A returns 0, retry Text Search with **same `query`**, **no `location`/`radius`**, append `, Italy` to query if not already present.
- **Rationale:** Suffix-only retry with same bias does **not** broaden (brutal review finding). National retry satisfies spec “wider Italy-relevant area.”
- **Alternatives considered:** Unlimited radius expansion loop — rejected (cost + latency).

---

## Decision 7: Result ordering (fixed)

- **Decision:** After mapping to `PlaceDetail[]`, sort by **ascending `distance` from search anchor** (biased path) or **ascending distance from probe geocode** (`name_with_area`); ties broken by **descending `rating`**. National widen path: sort by rating desc, then name asc.
- **Rationale:** Spec success criterion #3 (local homonyms above distant). Provider order alone is insufficient.
- **Alternatives considered:** Rating-only secondary sort — rejected.

---

## Decision 8: Geocode response enrichment

- **Decision:** Extend `/api/geocode?query=` JSON with `placeTypes: string[]`, `matchedName: string` from first Text Search hit.
- **Rationale:** Powers `isLocationBrowseCandidate` without duplicate probe.
- **Alternatives considered:** `/api/search/classify` — over-engineered.

---

## Decision 9: `name_with_area` parsing

- **Decision:** If query has ≥2 tokens, no `" in "`, and **last token** (or last two tokens joined) geocodes as locality/admin area → split `nameText` + `areaText`; text search uses **area geocode** as bias (not trip anchor).
- **Examples:** `Colosseum Rome` → name `Colosseum`, area `Rome`; `Gardaland Lake Garda` → name `Gardaland`, area `Lake Garda` (two-token area).
- **Rationale:** Spec §3.B explicit location in query.
- **Alternatives considered:** Always trip anchor — rejected for `Colosseum Rome`.

---

## Decision 10: Radius chips

- **Decision:** Text path passes `selectedRadius * 1000` to `/api/places/text`. Re-clicking radius re-runs last search on active path. Nearby path unchanged (client sends radius; server progressive 1k/2.5k/5k scan — pre-existing, out of scope for 010).
- **Rationale:** Spec §3.B + step17 regression (param still sent on nearby); text path actually honors radius.

---

## Deferred (documented, not blocking v1)

- Hebrew transliteration: pass through to Google as-is; no dedicated E2E in v1.
- `next_page_token` pagination for Text Search: cap at 20 results; reuse Show More on client slice.
