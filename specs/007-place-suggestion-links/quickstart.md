# Quickstart: 007 Clickable Place Suggestion Links

## What this implements

- Place names link to **official website** (or Google Maps fallback) across search, Home explore, itinerary nearby, saved places, and chat markdown.
- Shared `PlaceNameLink` component with URL safety checks.
- `/api/places` enriches results via Google Place Details.

---

## Running locally

```bash
npm run dev
# http://localhost:9001
```

Requires `GOOGLE_PLACES_API_KEY` with Nearby Search + Place Details enabled.

---

## Implementation order

One step at a time; confirm between steps per project contract.

### Step 1 — URL safety + Place Details enrichment

**Files:** `lib/urlSafety.ts`, `lib/places.ts`, `lib/places.test.ts`

- Add `isSafeExternalUrl`, `resolvePlaceHref`.
- Add `enrichPlaceWithDetails(place, apiKey)` calling Details API.
- Extend `getGoogleNearbyPlaces` / cache path to attach `website_url`.

### Step 2 — Shared UI component

**File:** `components/PlaceNameLink.tsx`

- Render link with fallback logic and testids.

### Step 3 — Wire into place suggestion surfaces

**Files:** `NearbyPlacesSection.tsx`, `AttractionSearch.tsx`, `ActivityNearbyPanel.tsx`, `SavedAttractionsList.tsx`

- Replace plain `<h4>` / `<p>` names with `PlaceNameLink`.
- Remove whole-card chat navigation from NearbyPlacesSection; keep Explore CTA.

### Step 4 — Bookmark persistence

**Files:** `types/index.ts`, bookmark handlers in search/nearby components

- Pass `website_url` and `maps_url` into `saveAttraction` / `toggleSearchBookmark`.

### Step 5 — Chat links

**Files:** `lib/gemini.ts` (and agent prompt if separate), `components/ChatInterface.tsx`

- System prompt rule for markdown venue links (Maps search URL template).
- Custom markdown `a` renderer with security attrs.

### Step 6 — Tests

**Files:** `e2e/step22.place-links.spec.ts`, update mocks in existing E2E if needed

```bash
npm run lint
npm test
npx playwright test e2e/step22.place-links.spec.ts
npm run build
```

---

## Acceptance checklist

- [ ] Search result name opens `website_url` in new tab (mocked E2E)
- [ ] Place without website opens `maps_url`
- [ ] Bookmark flow unchanged
- [ ] Chat assistant link uses https and opens new tab
- [ ] No `javascript:` href in DOM
