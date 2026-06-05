# Contract: Search Intent & Text Places API (010)

**Revision:** 2026-06-03 — post brutal review (two-phase orchestration, national widen, sort order).

---

## Problem invariant

**Nearby Search ≠ named venue retrieval.** Location path (geocode → nearby) MUST NOT be the only path for queries classified as name-led after geocode probe.

---

## UI contract — Investigate search

| Element | ID / testid | Behavior |
| --- | --- | --- |
| Search input | `#attraction-search-input`, `[data-testid='search-input']` | Accepts city, `"keyword in city"`, or venue name |
| Search button | `#attraction-search-btn` | Disabled when query &lt; 3 chars, store not hydrated, or `searchAnchor` loading (Target mode) |
| Placeholder | — | English: “Search a place or city…” |
| Helper line | `[data-testid='search-helper-hint']` | **NEW** — “Try a city, a place name, or ‘pizza in Milan’.” |
| Example chips | `[data-testid='search-example-chip']` | **NEW** — tap fills input: Gardaland, Verona, Pizza in Milan |
| Investigate subtitle | `[data-testid='investigate-search-hint']` | **NEW** — one-line description visible in Investigate (not headless-hidden) |
| Anchor loading | `[data-testid='search-anchor-loading']` | **NEW** — Target mode while geocoding anchor |
| Result row | unchanged from 007 | `PlaceNameLink`, bookmark, direct-add, filters |
| Empty state | `[data-testid='search-empty-hint']` | Shown when text/nearby returns 0 after widen; suggests add city or check spelling |

---

## Client orchestration — `handleSearch` state machine

```
START(query, category, searchAnchor, selectedRadius)
│
├─ len(query) < 3 → STOP (no request)
│
├─ query contains " in " (case-insensitive)
│   └─ MODE = keyword_in_location
│       → geocode(locationPart) → nearby(keyword, geocodedLatLng, radius)
│
└─ else (ambiguous / name-led candidate)
    │
    ├─ parse name_with_area? (see rules below)
    │   └─ if area suffix: geocode(areaText) → areaBias
    │
    ├─ geocode PROBE(fullQuery OR nameText)
    │   → { lat, lng, cityName, placeTypes, matchedName }
    │
    ├─ if isLocationBrowseCandidate(query, probe) AND NOT name_with_area
    │   └─ MODE = location_browse → nearby(no keyword, probe.lat/lng, radius)
    │
    ├─ else if category = restaurant AND probe looks like locality
    │   └─ TRY text(nameText, anchorOrAreaBias, radius)
    │       └─ 404 → fallback location_browse (probe)
    │
    └─ else MODE = name_search | name_with_area
        └─ text(nameText|fullQuery, anchorOrAreaBias, radius)
            → server Phase A (biased) → Phase B (national) if empty
```

### `isLocationBrowseCandidate(query, probe)`

Returns `true` when:

1. `probe.placeTypes` ∩ `{ locality, administrative_area_level_1, administrative_area_level_2, administrative_area_level_3, political }` ≠ ∅
2. Normalized `query` equals `probe.cityName` OR `probe.matchedName` OR is in `ITALY_CITY_ALLOWLIST`
3. Query does not match `name_with_area` split (venue + trailing area)

### `name_with_area` parsing rules

| Input | Split | Bias coords |
| --- | --- | --- |
| `Colosseum Rome` | name=`Colosseum`, area=`Rome` | geocode(`Rome`) |
| `Gardaland Lake Garda` | name=`Gardaland`, area=`Lake Garda` | geocode(`Lake Garda`) |
| `Osteria Francescana Modena` | name=`Osteria Francescana`, area=`Modena` | geocode(`Modena`) |
| `Pizza in Milan` | **not** name_with_area — fast path `keyword_in_location` | geocode(`Milan`) |
| `Verona` | no split; probe → locality → `location_browse` | probe |
| `Gardaland` | no split; probe → non-locality → `name_search` | `searchAnchor` |
| `ab` | STOP (&lt; 3 chars) | — |

**Algorithm (v1):**

1. If `" in "` present → never `name_with_area`.
2. Tokens = query split on whitespace; if tokens.length &lt; 2 → skip split.
3. Try `area = last token`; geocode async in probe phase — if locality candidate, `nameText = join(tokens[0..-2])`.
4. If step 3 fails, try `area = last two tokens` (e.g. `Lake Garda`); same rule.
5. If no valid area split, use full query as `nameText` with trip/GPS anchor.

---

## Intent routing table (expected outcomes)

| User input | Mode | API sequence |
| --- | --- | --- |
| `Pizza in Milan` | `keyword_in_location` | geocode → `/api/places` |
| `Verona` | `location_browse` | geocode (probe) → `/api/places` |
| `Gardaland` | `name_search` | geocode (probe, non-locality) → `/api/places/text` (anchor bias) |
| `Colosseum Rome` | `name_with_area` | geocode(`Rome`) → `/api/places/text` (Rome bias) |
| `Colosseum` (Garda trip, no local match) | `name_search` + widen | text Phase A (anchor) → Phase B (national) |
| `ab` | — | No request |

### Investigate modes

| Mode | Anchor source |
| --- | --- |
| Target | First `savedAttractions[]` with lat/lng; else geocoded `targetCity`; search disabled until ready |
| Nearby | `useLocation()` coords; denied → existing permission message |

---

## API contract — `GET /api/places/text`

**Request**

```
GET /api/places/text?q=Gardaland&lat=45.44&lng=10.71&type=tourist_attraction&radius=50000
```

| Param | Required | Notes |
| --- | --- | --- |
| `q` | yes | min 3, max 120 |
| `lat`, `lng` | yes for Phase A | Bias center |
| `type` | no | `tourist_attraction` \| `restaurant` |
| `radius` | no | Bias meters; default 50000; from UI chip × 1000 |

**Server execution**

1. **Phase A:** Text Search(`q`, location=`lat,lng`, radius=`radius`)
2. **Phase B (if Phase A empty):** Text Search(`q'`) where `q' = q` + `, Italy` if needed; **no** location/radius params
3. Map → `PlaceDetail[]`; enrich ≤8; **sort** (see below)
4. Return 404 only if both phases empty

**Response 200:** `PlaceDetail[]` (same shape as `/api/places`)

**Response 400:** `{ "error": "Invalid query parameters format" }`

**Response 404:** `{ "error": "No places found for this name" }`

**Response 502:** Provider failure

**Sort order (200 responses)**

| Phase | Primary | Secondary |
| --- | --- | --- |
| A (biased) | `distance` from (`lat`,`lng`) ascending | `rating` descending |
| B (national) | `rating` descending | `name` ascending |

**Invariants**

- URLs pass `PlaceDetailSchema` (http/https only)
- Enrichment cap 8 (Feature 007)
- Server-only API key

---

## API contract — `GET /api/geocode` (extended)

**Added fields** (backward compatible):

```json
{
  "lat": 45.4384,
  "lng": 10.9916,
  "cityName": "Verona",
  "formattedAddress": "Verona, VR, Italy",
  "placeTypes": ["locality", "political"],
  "matchedName": "Verona"
}
```

**Tests:** extend `app/api/geocode/route.test.ts` (or add) for `placeTypes` / `matchedName` on forward geocode.

---

## Radius contract

| Path | UI chips | Server behavior |
| --- | --- | --- |
| `location_browse` / `keyword_in_location` | Re-run nearby with `radius=chipKm*1000` | Progressive 1k/2.5k/5k scan (**unchanged** pre-010) |
| `name_search` / `name_with_area` | Re-run text with `radius=chipKm*1000` | Phase A honors radius; Phase B ignores |

step17 regression: nearby path still sends `radius` query param when chips clicked.

---

## E2E expectations

1. Mock `/api/places/text` — `Gardaland` → ≥1 card with name visible.
2. Mock geocode probe — `Verona` + `placeTypes: [locality]` → `/api/places` called, **not** `/api/places/text`.
3. Empty text mock → `search-empty-hint` visible.
4. Regression: `step13` “Pizza in Milan” (fast path).
5. Regression: `step17` radius param on nearby path.

---

## Mock fixture (Playwright)

```typescript
// e2e/helpers/apiMocks.ts
export const MOCK_GARDALAND_TEXT = [{
  place_id: "mock-gardaland-1",
  name: "Gardaland",
  rating: 4.6,
  formatted_address: "Castelnuovo del Garda, Italy",
  maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=mock-gardaland-1",
}];

export async function mockGardalandTextSearch(page: Page) {
  await page.route("**/api/places/text**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_GARDALAND_TEXT) });
  });
}
```
