# Quickstart: 010 Search by Attraction Name

## What this implements

- **Text Search retrieval** for venue names (fixes geocode→nearby missing the named place)
- **Two-phase orchestration:** geocode probe → location browse **or** text search
- Preserves **`keyword in city`** and **city browse** (`Verona`)
- National widen (Phase B) when biased text search returns empty

---

## Running locally

```bash
npm run dev
# http://localhost:9001
```

Requires `GOOGLE_PLACES_API_KEY` with Text Search + Nearby + Place Details.

---

## Implementation order

One step at a time; **`confirmed`** between steps.

### Step 1 — Intent helpers + text search library (TDD)

1. **NEW** `lib/searchIntent.ts` — `parseKeywordInLocation`, `parseNameWithArea`, `isLocationBrowseCandidate`, `ITALY_CITY_ALLOWLIST`
2. **NEW** `lib/searchIntent.test.ts` — include examples from contract table
3. **NEW** `searchPlacesByText()` in `lib/places.ts` — Phase A/B + sort
4. **NEW** `PlacesTextQuerySchema` in `lib/schemas.ts`

**Verify:** `npm test -- lib/searchIntent.test.ts lib/places.test.ts`

### Step 2 — API routes

1. **NEW** `app/api/places/text/route.ts` + `route.test.ts`
2. **MODIFY** `app/api/geocode/route.ts` — `placeTypes`, `matchedName`
3. **MODIFY/NEW** `app/api/geocode/route.test.ts`

**Verify:** `npm test -- app/api/places/text/route.test.ts app/api/geocode/route.test.ts`

### Step 3 — Investigate anchor

1. **MODIFY** `components/InvestigateSection.tsx` — `searchAnchor` with `ready`, loading testid

**Verify:** Target mode shows no errors; search disabled until anchor ready

### Step 4 — AttractionSearch state machine

1. **MODIFY** `components/AttractionSearch.tsx` — full contract state machine; `fetchPlacesByText`; `lastSearchMode`; radius on text path
2. **MODIFY** `lib/translations.ts` — placeholder + `searchNoResultsHint`

**Verify manual:** `Gardaland`, `Verona`, `Pizza in Milan`, `Colosseum Rome`

### Step 5 — E2E

1. **NEW** `e2e/step24.attraction-name-search.smoke.spec.ts` (Gardaland + Verona probe + empty hint)
2. **MODIFY** `e2e/helpers/apiMocks.ts`
3. Regression: `step13`, `step17`

**Verify:**

```bash
npx playwright test e2e/step24.attraction-name-search.smoke.spec.ts e2e/step13.smoke.spec.ts e2e/step17.smoke.spec.ts
```

### Step 6 — Full verification

```bash
npm run lint && npm test && npm run test:e2e && npm run build
```

---

## Manual smoke

1. Investigate Target → `Gardaland` → Gardaland (or equivalent) in results
2. `Verona` → nearby attractions (geocode probe → **not** text API)
3. `Pizza in Milan` + Dining → step13 parity
4. `Colosseum Rome` → Rome-biased text results
5. Radius chip on name result → re-query with new `radius` param on `/api/places/text`
6. Bookmark + external link from name-search row
