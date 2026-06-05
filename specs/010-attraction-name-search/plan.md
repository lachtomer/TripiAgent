# Technical Plan: 010 — Search by Attraction Name

**Feature spec:** `specs/010-attraction-name-search/spec.md`  
**Research:** `specs/010-attraction-name-search/research.md`  
**Data model:** `specs/010-attraction-name-search/data-model.md`  
**Contracts:** `specs/010-attraction-name-search/contracts/search-intent-and-api.md`  
**Quickstart:** `specs/010-attraction-name-search/quickstart.md`  
**Tasks:** `specs/010-attraction-name-search/tasks.md`  
**Branch:** `main` (port **9001**; one step at a time per project contract)

---

## 0. Problem statement

Today `AttractionSearch.handleSearch` **always** geocodes, then calls **Nearby Search**. Nearby returns venues *near* the geocoded point—not the **named venue** the user typed. Feature 010 adds a **Text Search retrieval path** with trip/GPS bias and a **two-phase client orchestration** that preserves city browse (`Verona`) and `"keyword in city"` (`Pizza in Milan`).

---

## 1. Architectural Changes

### 1a. Data flow (two-phase orchestration)

```
User query (AttractionSearch.handleSearch)
│
├─ " in " ? → keyword_in_location → geocode → /api/places (UNCHANGED)
│
└─ else → geocode PROBE (+ optional name_with_area area geocode)
         → isLocationBrowseCandidate ?
              YES → location_browse → /api/places
              NO  → /api/places/text (Phase A biased → Phase B national if empty)
    → sort by distance (biased) or rating (national)
    → same result cards + filters + pagination
```

**No new npm dependencies.** Same `GOOGLE_PLACES_API_KEY`.

### 1b. In scope

| Surface | Change |
| --- | --- |
| `lib/searchIntent.ts` | **NEW** — `isLocationBrowseCandidate`, `parseNameWithArea`, `ITALY_CITY_ALLOWLIST` |
| `lib/places.ts` | **NEW** `searchPlacesByText()` with Phase A/B + sort |
| `app/api/places/text/route.ts` | **NEW** |
| `app/api/geocode/route.ts` | `placeTypes`, `matchedName` on forward geocode |
| `InvestigateSection` | `searchAnchor` + loading gate |
| `AttractionSearch` | State machine in `handleSearch`; text fetch; radius on text path |
| `lib/translations.ts` | Placeholder + empty hint |
| E2E | `step24` + geocode probe mock for `Verona` |

### 1c. Out of scope (v1)

- Fixing nearby server ignoring client `radius` (pre-existing)
- Saved Locations offline index search
- Hebrew transliteration E2E
- ML intent model

---

## 2. Component Design & State

### 2a. NEW `lib/searchIntent.ts`

```typescript
export type SearchIntentMode =
  | "keyword_in_location"
  | "location_browse"
  | "name_search"
  | "name_with_area";

export interface NameWithAreaSplit {
  nameText: string;
  areaText: string;
}

export function parseKeywordInLocation(query: string): { keyword: string; locationText: string } | null;
export function parseNameWithArea(query: string): NameWithAreaSplit | null; // sync heuristic; area validated at geocode probe
export function isLocationBrowseCandidate(
  query: string,
  probe: { cityName: string; matchedName?: string; placeTypes?: string[] }
): boolean;

export const ITALY_CITY_ALLOWLIST: ReadonlySet<string>;
```

**Note:** Final mode is chosen in `handleSearch` **after** geocode probe, not by a single sync `resolveSearchIntent()` export alone.

### 2b. NEW `lib/places.ts` — `searchPlacesByText`

```typescript
export async function searchPlacesByText(
  query: string,
  biasLat: number,
  biasLng: number,
  type: "tourist_attraction" | "restaurant" | undefined,
  apiKey: string,
  radiusMeters?: number
): Promise<PlaceDetail[]>;
```

- **Phase A:** `textsearch` with `location` + `radius` (default 50_000)
- **Phase B:** if empty, `textsearch` without location; query `q + ", Italy"` when needed
- Map → `PlaceDetail[]` with `distance` from bias point (Phase A)
- **Sort:** Phase A — distance asc, rating desc; Phase B — rating desc, name asc
- Enrichment cap 8

### 2c. `InvestigateSection.tsx`

```typescript
interface SearchAnchor {
  lat: number;
  lng: number;
  label: string;
  source: "target_saved" | "target_geocoded" | "gps";
  ready: boolean;
}
```

- Target: first saved attraction with coords; else `useEffect` geocode `targetCity`
- Pass `searchAnchor`, `investigateMode` to `AttractionSearch`
- Show `data-testid="search-anchor-loading"` until `ready`

### 2d. `AttractionSearch.tsx`

Implement contract state machine in `handleSearch`:

1. Min length 3; disable submit while anchor not `ready` (Target)
2. Fast path `" in "` → existing flow
3. Optional `parseNameWithArea` → area geocode for bias
4. Geocode probe → `isLocationBrowseCandidate` → nearby **or** `fetchPlacesByText`
5. Dining locality fallback: text 404 → nearby
6. `fetchPlacesByText` — shared post-processing (filters, weather, `lastSearchCoords`, `lastSearchMode: 'text'`)
7. Radius chip click re-runs active path (`lastSearchMode`)
8. Empty: `data-testid="search-empty-hint"`

### 2e. State store

**No `tripStore` changes.**

---

## 3. API Routes & Schemas

### 3a. NEW `GET /api/places/text`

```typescript
export const PlacesTextQuerySchema = z.object({
  q: z.string().min(3).max(120),
  lat: z.string().transform(Number).refine((n) => !isNaN(n)),
  lng: z.string().transform(Number).refine((n) => !isNaN(n)),
  type: z.enum(["tourist_attraction", "restaurant"]).optional(),
  radius: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50_000)),
});
```

- Cache 10 min: `text:{roundedLat},{roundedLng},{type},{radius},{q}`
- 404 after Phase A + B empty

### 3b. MODIFY `GET /api/geocode`

Add on forward geocode: `placeTypes`, `matchedName` from first Text Search hit.

### 3c. Tests

| File | Coverage |
| --- | --- |
| `lib/searchIntent.test.ts` | **NEW** — allowlist, locality candidate, name_with_area parse, `Pizza in Milan` exclusion |
| `lib/places.test.ts` | **EXTEND** — Phase A/B, sort order |
| `app/api/places/text/route.test.ts` | **NEW** |
| `app/api/geocode/route.test.ts` | **EXTEND** — `placeTypes`, `matchedName` |

---

## 4. Proposed File Modifications

| Action | Path |
| --- | --- |
| NEW | `lib/searchIntent.ts` |
| NEW | `lib/searchIntent.test.ts` |
| NEW | `app/api/places/text/route.ts` |
| NEW | `app/api/places/text/route.test.ts` |
| NEW | `e2e/step24.attraction-name-search.smoke.spec.ts` |
| MODIFY | `lib/places.ts` |
| MODIFY | `lib/places.test.ts` |
| MODIFY | `lib/schemas.ts` |
| MODIFY | `app/api/geocode/route.ts` |
| MODIFY | `app/api/geocode/route.test.ts` (create if missing) |
| MODIFY | `components/InvestigateSection.tsx` |
| MODIFY | `components/AttractionSearch.tsx` |
| MODIFY | `lib/translations.ts` |
| MODIFY | `e2e/helpers/apiMocks.ts` |

---

## 5. Verification & Testing Plan

### Unit

```bash
npm test -- lib/searchIntent.test.ts lib/places.test.ts app/api/places/text/route.test.ts app/api/geocode/route.test.ts
```

### E2E

```bash
npx playwright test e2e/step24.attraction-name-search.smoke.spec.ts
npx playwright test e2e/step13.smoke.spec.ts e2e/step17.smoke.spec.ts
```

**step24:**

1. `Gardaland` → text API → result card
2. `Verona` probe locality → places API only (no text)
3. Empty text → `search-empty-hint`

### Constitution loop

```bash
npm run lint && npm test && npm run test:e2e && npm run build
```

---

## 6. Implementation order

See `quickstart.md` and `tasks.md`. One step at a time; user **`confirmed`** between steps.
