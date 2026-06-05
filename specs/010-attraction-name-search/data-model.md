# Data Model — 010 Search by Attraction Name

## Search intent (ephemeral)

| Field | Type | Notes |
| --- | --- | --- |
| `mode` | enum | `keyword_in_location` \| `location_browse` \| `name_search` \| `name_with_area` |
| `rawQuery` | string | User input trimmed |
| `keyword` | string? | For `keyword_in_location` |
| `locationText` | string? | City/region segment |
| `nameText` | string? | Venue name segment |
| `areaText` | string? | For `name_with_area` trailing area |

**Producer:** `lib/searchIntent.ts` + geocode probe in `AttractionSearch.handleSearch`  
**Consumer:** API routing (nearby vs text)

**Mode selection:** async — requires geocode probe except fast path `" in "`.

---

## Geocode probe (ephemeral)

| Field | Type | Source |
| --- | --- | --- |
| `lat`, `lng` | number | `/api/geocode?query=` |
| `cityName` | string | geocode response |
| `matchedName` | string? | geocode response (new) |
| `placeTypes` | string[]? | geocode response (new) |

Used by `isLocationBrowseCandidate()` before choosing nearby vs text.

---

## Search anchor (ephemeral, from trip context)

| Field | Type | Source |
| --- | --- | --- |
| `lat` | number | Target: saved attraction / geocoded base; Nearby: GPS |
| `lng` | number | Same |
| `label` | string | `"Lake Garda"`, `"Current Location"` |
| `source` | enum | `target_saved` \| `target_geocoded` \| `gps` |
| `ready` | boolean | `false` while Target anchor geocoding in flight |

**Producer:** `InvestigateSection` → prop `searchAnchor`  
**Consumer:** `AttractionSearch` name-search Phase A bias (when not `name_with_area`)

---

## Text search request (API)

`GET /api/places/text`

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `q` | string | yes | Venue or name query (min 3 chars) |
| `lat` | number | yes | Phase A bias latitude |
| `lng` | number | yes | Phase A bias longitude |
| `type` | string | no | `tourist_attraction` \| `restaurant` |
| `radius` | number | no | Phase A bias meters (UI chip × 1000; default 50000) |

**Server phases:** A (biased) → B (national, no lat/lng) if A empty.

---

## Geocode response extension (backward compatible)

| Field | Type | Description |
| --- | --- | --- |
| `placeTypes` | string[]? | Google `types` from first forward-geocode hit |
| `matchedName` | string? | `result.name` from first hit |

---

## Place result

No schema change — reuses `PlaceDetail` / `PlaceDetailSchema` from Feature 007.

**Sort after text search:**

| Phase | Primary key | Secondary |
| --- | --- | --- |
| A (biased) | `distance` ↑ | `rating` ↓ |
| B (national) | `rating` ↓ | `name` ↑ |

---

## Client state (`AttractionSearch`)

| State | Change |
| --- | --- |
| `lastSearchCoords` | Set for nearby and text paths (weather warning) |
| `lastSearchMode` | `'nearby' \| 'text'` — radius chip re-run |
| `error` | Generic + empty hint via `search-empty-hint` testid |

**Store:** No `tripStore` changes.

---

## Cache keys

| Route | Key pattern | TTL |
| --- | --- | --- |
| `/api/places/text` | `text:{roundedLat},{roundedLng},{type},{radius},{q}` | 10 min |
