# Step 025 — Lake Garda location-browse search fix

**Date:** 2026-06-25  
**Branch:** main  
**Port:** 9001

## Goal

Fix Investigate search so **"Lake Garda"** (and similar allowlisted regions) route to **location browse** and return nearby Italian attractions within a useful regional radius — not a misrouted text search for `"Lake"`.

---

## Problem (root cause)

### Bug A — Wrong intent routing

`parseNameWithArea("Lake Garda")` matched the last token `"Garda"` on the Italy allowlist and split:

| Field | Wrong value |
| --- | --- |
| `nameText` | `"Lake"` |
| `areaText` | `"Garda"` |

That skipped `isLocationBrowseCandidate()` and called `/api/places/text?q=Lake` instead of nearby browse at Lake Garda coords.

**Correct path:** whole query `"Lake Garda"` is allowlisted → geocode probe → `location_browse` → `/api/places`.

### Bug B — Radius cap on nearby API

Even when location browse ran, `/api/places` ignored client `radius` and always used `getProgressiveNearbyPlaces` (1 km → 2.5 km → **5 km max**). Lake Garda is ~50 km long; 5 km misses Gardaland, Verona, Sirmione, etc.

### Not in scope (user confusion, not bugs)

- **Nearby mode** uses device GPS — US users get US results by design.
- **Default 5 km chip** is fine for manual re-search; location browse should force **50 km**.

---

## Architecture — before vs after

### Before

```
"Lake Garda"
  → parseNameWithArea → { name: "Lake", area: "Garda" }
  → /api/places/text?q=Lake&lat=<Garda town>
  → irrelevant "Lake …" venues (often near GPS bias)
```

### After

```
"Lake Garda"
  → parseNameWithArea → null (whole query is known area)
  → geocode("Lake Garda") → natural_feature coords
  → isLocationBrowseCandidate → true (allowlist)
  → /api/places?lat=…&lng=…&radius=50000&type=tourist_attraction
  → Gardaland, Sirmione, etc. within 50 km
```

**Unchanged paths:**

| Query | Mode | API |
| --- | --- | --- |
| `Gardaland Lake Garda` | `name_with_area` | `/api/places/text?q=Gardaland` |
| `Gardaland` | `name_search` | `/api/places/text` |
| `Verona` | `location_browse` | `/api/places` @ 50 km |
| `Pizza in Milan` | `keyword_in_location` | `/api/places` + keyword |

---

## Implementation plan

### 1. `lib/searchIntent.ts`

| Change | Detail |
| --- | --- |
| Guard in `parseNameWithArea` | If `isKnownArea(trimmed)` on **whole query**, return `null` so browse path runs |
| Export `LOCATION_BROWSE_RADIUS_KM = 50` | Single constant for UI + tests |
| Relax `isLocationBrowseCandidate` | Allow allowlisted regions even when geocode returns `natural_feature` (no `locality` type) |

### 2. `components/AttractionSearch.tsx`

On `location_browse` branch (and restaurant fallback to nearby):

- Call `fetchPlacesNearCoords(..., LOCATION_BROWSE_RADIUS_KM * 1000)`
- Sync UI: `setSelectedRadius(LOCATION_BROWSE_RADIUS_KM)` so chip shows 50 KM

### 3. `app/api/places/route.ts`

```typescript
radius > 5000
  ? enrichPlacesWithDetails(getGoogleNearbyPlaces(lat, lng, radius, …))
  : getProgressiveNearbyPlaces(…)  // unchanged for ≤5 km
```

Progressive scan stays for small-radius UX; large-radius requests honor client param.

---

## Acceptance criteria

- [ ] `"Lake Garda"` → geocode probe → `/api/places` (never `/api/places/text`)
- [ ] Location-browse requests use **50 km** (`radius=50000`)
- [ ] `"Gardaland Lake Garda"` still splits as name+area (text search path)
- [ ] `"Colosseum Rome"` unchanged (name+area)
- [ ] `"Verona"` location browse unchanged
- [ ] Unit tests in `lib/searchIntent.test.ts` and `app/api/places/route.test.ts`
- [ ] E2E test in `e2e/step24.attraction-name-search.smoke.spec.ts`

---

## Files

| File | Change |
| --- | --- |
| `lib/searchIntent.ts` | Whole-query allowlist guard; `LOCATION_BROWSE_RADIUS_KM`; natural-feature browse |
| `lib/searchIntent.test.ts` | Regression tests for Lake Garda, Riva del Garda, natural_feature probe |
| `components/AttractionSearch.tsx` | 50 km on location-browse paths; sync radius chip |
| `app/api/places/route.ts` | Honor radius > 5 km |
| `app/api/places/route.test.ts` | Large-radius direct-call test |
| `e2e/helpers/apiMocks.ts` | `mockLakeGardaLocationBrowse` |
| `e2e/step24.attraction-name-search.smoke.spec.ts` | Test 4: Lake Garda browse @ 50 km |

---

## Verification plan

```bash
npm test -- lib/searchIntent.test.ts
npm test -- app/api/places/route.test.ts
npx playwright test e2e/step24.attraction-name-search.smoke.spec.ts
npm run lint && npm run build
```

Manual smoke (Target mode, Italy trip):

1. Search **Lake Garda** → Italian attractions (Gardaland-class), radius chip shows **50 KM**
2. Search **Gardaland** → single theme-park result via text API
3. Search **Verona** → Arena / city POIs via nearby API

---

## Out of scope

- Geocode `, Italy` suffix hardening
- Nearby/GPS mode behavior (uses device location by design)
- Auto-search on page load with pre-filled `defaultQuery`

---

## Risk

| Risk | Level | Mitigation |
| --- | --- | --- |
| `"Lake Como"` not allowlisted → still splits as `Lake` + `Como` | Low | Add `"lake como"` to allowlist in follow-up if reported |
| 50 km Google nearby may hit API result limits | Low | Same pattern as text search Phase A default |
| Regression on `"Something Garda"` 2-token queries | Low | Only whole-query guard; `"Foo Garda"` still splits if `Garda` is last token |

---

## Status

Implementation complete in working tree; pending full validation loop and user **confirmed** before merge/deploy.
