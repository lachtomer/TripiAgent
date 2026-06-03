# Technical Plan: 007 — Clickable Place Suggestion Links

**Version:** v2 (post brutal-review — 13 fixes applied)

**Feature spec:** `specs/007-place-suggestion-links/spec.md`  
**Research:** `specs/007-place-suggestion-links/research.md`  
**Data model:** `specs/007-place-suggestion-links/data-model.md`  
**UI contracts:** `specs/007-place-suggestion-links/contracts/place-suggestions-ui.md`  
**Branch:** `main` (local dev on port 9001 — no feature branch; incremental commits on `main` when user asks)

---

## 0. Brutal-review fixes encoded in this plan

| # | Issue | Fix in this plan |
| --- | --- | --- |
| 1 | `buildSystemPrompt` in `lib/gemini.ts` is **never called** | Wire prompt into `lib/agentGraph.ts` `assistantNode` (+ planner text rules) |
| 2 | Discover More rows lose Ask-AI when card tap removed | Add explicit Ask-AI icon button on Discover rows |
| 3 | `MOCK_PICKS` / E2E mocks lack `maps_url` → Top Picks dead ends | Update client mocks + `e2e/helpers/apiMocks.ts` |
| 4 | Unbounded Place Details N× cost | Cap enrichment at **8 places** per response |
| 5 | SavedAttractionsList scope ambiguous | **In v1** — confirmed |
| 6 | Other “proposal” surfaces ignored | Explicit **phase-2 out of scope** list (§1b) |
| 7 | Constitution check too soft | Response Zod + route tests **required**; chat prompt wired |
| 8 | `toggleSearchBookmark` not listed | Included in store + bookmark payload updates |
| 9 | 44px tap target vs `text-xs` link | `PlaceNameLink` uses min-h-11 touch row |
| 10 | Details `fields=website` only | Use `fields=website,url`; prefer Google `url` for `maps_url` when present |
| 11 | E2E plan thin | Expanded scenarios + shared mock updates |
| 12 | `data-testid` with raw `place_id` | Add `data-place-id`; sanitize testid slug |
| 13 | Branch discipline | Work on `main` locally — no feature branch (user confirmed) |

---

## 1. Architectural Changes

Extend the Google Places pipeline to fetch official websites and surface them as clickable links on **in-scope** place-suggestion UI. Chat recommendations gain deterministic markdown links by wiring the existing `buildSystemPrompt()` into the **LangGraph runtime** (not the unused stub path alone).

### 1a. Data flow

```
Nearby Search (existing, 1–3 radius attempts)
    → final PlaceDetail[] (may be 20+ from Google)
    → slice(0, ENRICHMENT_CAP) where ENRICHMENT_CAP = 8   [NEW]
    → Place Details per capped result (fields=website,url) [NEW]
    → merge website_url + canonical maps_url
    → enrichPlacesWithWebsites (only uncapped places pass through without website_url)
    → /api/places (cached 10 min)
    → PlaceNameLink in UI surfaces
```

**Enrichment runs once** at the end of `getProgressiveNearbyPlaces` on the **final returned array**, not on intermediate radius attempts.

### 1b. In scope vs phase-2 (explicit)

| Surface | v1 |
| --- | --- |
| `NearbyPlacesSection` (Top Picks + Discover More) | ✅ |
| `AttractionSearch` search results | ✅ |
| `ActivityNearbyPanel` nearby results | ✅ |
| `SavedAttractionsList` (when URLs stored on bookmark) | ✅ |
| Chat assistant markdown (via `agentGraph`) | ✅ |
| Replan drawer activity titles (`ChatInterface`) | ❌ phase 2 |
| Copilot serendipity card (`CopilotCards`) | ❌ phase 2 |
| Target bank static POIs (`lakeGardaTargetBank.ts`) | ❌ phase 2 |
| Itinerary scheduled activity titles (`ItineraryCard`) | ❌ phase 2 |

### 1c. Interaction changes

| Surface | Before | After |
| --- | --- | --- |
| NearbyPlacesSection **Top Picks** | Whole card → chat | Name → external site; `#place-card-{id}` Explore button → chat |
| NearbyPlacesSection **Discover More** | Whole row → chat | Name → external site; **new** `#discover-ask-ai-{id}` button → chat |
| AttractionSearch row | Plain name; Sparkles → chat | Name → external site; Sparkles unchanged |
| ActivityNearbyPanel row | Plain name | Name → external site; Add/Save unchanged |
| SavedAttractionsList | Plain name | Name → link when `website_url` or `maps_url` stored |
| Chat assistant | Raw `generateContent(message)` — no system prompt | `buildSystemPrompt(context)` + venue link rule |

**No new npm dependencies.**

---

## 2. Component Design & State

### 2a. New: `lib/urlSafety.ts`

```typescript
export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolvePlaceHref(websiteUrl?: string, mapsUrl?: string): string | null {
  if (websiteUrl && isSafeExternalUrl(websiteUrl)) return websiteUrl;
  if (mapsUrl && isSafeExternalUrl(mapsUrl)) return mapsUrl;
  return null;
}

/** Stable slug for data-testid (Google place_ids may contain awkward chars) */
export function placeTestIdSlug(placeId: string): string {
  return placeId.replace(/[^a-zA-Z0-9_-]/g, "_");
}
```

### 2b. Modified: `lib/places.ts`

**Constants:**

```typescript
export const PLACE_DETAILS_ENRICHMENT_CAP = 8;
```

**Extend `PlaceDetail`:**

```typescript
export interface PlaceDetail {
  // ...existing fields
  website_url?: string;
}
```

**Place Details fetch (website + Google Maps canonical URL):**

```typescript
async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{ website_url?: string; maps_url?: string }> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}&fields=website,url&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const data = await res.json();
  const website = data?.result?.website as string | undefined;
  const googleUrl = data?.result?.url as string | undefined;
  return {
    website_url: website && isSafeExternalUrl(website) ? website : undefined,
    maps_url:
      googleUrl && isSafeExternalUrl(googleUrl)
        ? googleUrl
        : buildGoogleMapsUrl(placeId),
  };
}

async function enrichPlacesWithDetails(
  places: PlaceDetail[],
  apiKey: string
): Promise<PlaceDetail[]> {
  const toEnrich = places.slice(0, PLACE_DETAILS_ENRICHMENT_CAP);
  const rest = places.slice(PLACE_DETAILS_ENRICHMENT_CAP);

  const settled = await Promise.allSettled(
    toEnrich.map(async (p) => {
      const details = await fetchPlaceDetails(p.place_id, apiKey);
      return {
        ...p,
        website_url: details.website_url,
        maps_url: details.maps_url ?? p.maps_url ?? buildGoogleMapsUrl(p.place_id),
      };
    })
  );

  const enriched = settled.map((r, i) =>
    r.status === "fulfilled" ? r.value : { ...toEnrich[i], maps_url: toEnrich[i].maps_url ?? buildGoogleMapsUrl(toEnrich[i].place_id) }
  );

  // Places beyond cap: ensure maps_url only (no Details call)
  const tail = rest.map((p) => ({
    ...p,
    maps_url: p.maps_url ?? buildGoogleMapsUrl(p.place_id),
  }));

  return [...enriched, ...tail];
}
```

Call `enrichPlacesWithDetails` **once** at the end of `getProgressiveNearbyPlaces`, after the progressive radius loop resolves the final list.

### 2c. New: `components/PlaceNameLink.tsx`

```typescript
interface PlaceNameLinkProps {
  placeId: string;
  name: string;
  websiteUrl?: string;
  mapsUrl?: string;
  className?: string;
}

// resolvePlaceHref → <a> or <span>
// Touch row: min-h-11 (44px) inline-flex items-center for mobile tap target
// data-place-id={placeId}  (full id for debugging)
// data-testid={`place-name-link-${placeTestIdSlug(placeId)}`} | place-name-text-...
// aria-label from t.viewOfficialSite + t.opensInNewTab
// target="_blank" rel="noopener noreferrer"
// Optional ExternalLink icon 12px
```

### 2d. Modified UI surfaces

| File | Change |
| --- | --- |
| `NearbyPlacesSection.tsx` | Top Picks: remove card `onClick`; `PlaceNameLink` on name; keep `#place-card-{id}` Explore CTA. Discover: remove row `onClick`; `PlaceNameLink` on name; **add** `#discover-ask-ai-{id}` Sparkles/Ask-AI button calling `handlePlaceTap`. Update `MOCK_PICKS` to include `maps_url: buildGoogleMapsUrl(...)` on place1–place3. |
| `AttractionSearch.tsx` | Replace name `<h4>` with `PlaceNameLink`; Sparkles Ask-AI unchanged |
| `ActivityNearbyPanel.tsx` | Replace name `<p>` with `PlaceNameLink` |
| `SavedAttractionsList.tsx` | **v1:** `PlaceNameLink` when saved record has URLs; else plain text |

### 2e. Modified: `types/index.ts` — `SavedAttraction`

```typescript
export interface SavedAttraction {
  // ...existing
  website_url?: string;
  maps_url?: string;
}
```

**Bookmark payloads** must pass URLs in all three handlers:
- `AttractionSearch` → `toggleSearchBookmark`
- `NearbyPlacesSection` → `saveAttraction`
- `ActivityNearbyPanel` → `saveAttraction`

**Verify** `stores/tripStore.ts` `toggleSearchBookmark` / `saveAttraction` spread extended fields without stripping unknown keys (no code change expected if spread preserves payload).

### 2f. Chat — wire `buildSystemPrompt` into LangGraph (required)

**Problem:** `assistantNode` currently calls `model.generateContent(latestMessage)` with no system prompt. Editing `lib/gemini.ts` alone does nothing.

**Fix #1 — `lib/gemini.ts`:** Append venue-link rule to CORE DIRECTIONS (rule 8):

```
8. **Venue Links**: When you recommend a specific named restaurant, attraction, or shop, format the name as a markdown link. Use:
   [Venue Name](https://www.google.com/maps/search/?api=1&query={URL-encoded name + city from USER CONTEXT})
   Never invent custom domain URLs.
```

**Fix #2 — `lib/agentGraph.ts` `assistantNode`:** When generating a fresh response (no `state.response`), build context from graph state and call Gemini with system instruction:

```typescript
import { buildSystemPrompt } from "./gemini";

// Inside assistantNode, when calling generateContent:
const ctx: TripContext = {
  coords: state.location?.coords
    ? { latitude: state.location.coords.latitude, longitude: state.location.coords.longitude }
    : null,
  cityName: state.location?.cityName ?? null,
  weather: state.weather,
  itinerarySummary: state.itinerary ? JSON.stringify(state.itinerary) : null,
  locale: undefined, // pass from API body if threaded into AgentState in follow-up
};
const systemPrompt = buildSystemPrompt(ctx);
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: latestMessage }] }],
  systemInstruction: systemPrompt,
});
```

**Fix #3 — `app/api/ai/route.ts`:** Ensure `context` from request (city, weather, locale) is available on `AgentStateAnnotation` if not already — extend state + invoke payload so `buildSystemPrompt` receives `cityName` for Maps search URLs.

**Fix #4 — `plannerNode`:** Add one line to inline prompt: “When mentioning specific venues in explanatory text, use markdown links per venue-link rule (Maps search URL + city).”

### 2g. Modified: `components/ChatInterface.tsx`

Custom `ReactMarkdown` `components.a` renderer (unchanged intent):

```typescript
components={{
  a: ({ href, children, ...props }) => {
    if (!href || !isSafeExternalUrl(href)) {
      return <span>{children}</span>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
}}
```

### 2h. Translation keys (`lib/translations.ts`)

```typescript
// en
opensInNewTab: "opens in new tab",
viewOfficialSite: "View official site",
askAiAboutPlace: "Ask AI about this place",

// he
opensInNewTab: "נפתח בלשונית חדשה",
viewOfficialSite: "לאתר הרשמי",
askAiAboutPlace: "שאל את העוזר על המקום",
```

---

## 3. API Routes & Schemas

### GET `/api/places`

- **Query:** unchanged (`PlacesQuerySchema`)
- **Response:** enriched `PlaceDetail[]`; enrichment capped at 8 Details calls
- **Cache:** unchanged key/TTL; cached payload includes `website_url`

**Required — add to `lib/schemas.ts`:**

```typescript
export const PlaceDetailSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  rating: z.number().optional(),
  open_now: z.boolean().optional(),
  types: z.array(z.string()).optional(),
  distance: z.number().optional(),
  maps_url: z.string().optional(),
  website_url: z.string().optional(),
  address: z.string().optional(),
  formatted_address: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const PlacesResponseSchema = z.array(PlaceDetailSchema);
```

Use in **`app/api/places/route.test.ts`** (required) and optionally assert shape after enrichment in `lib/places.test.ts`.

---

## 4. Proposed File Modifications

| Action | File |
| --- | --- |
| NEW | `lib/urlSafety.ts` |
| NEW | `lib/urlSafety.test.ts` |
| NEW | `components/PlaceNameLink.tsx` |
| NEW | `e2e/step22.place-links.spec.ts` |
| MODIFY | `lib/places.ts` |
| MODIFY | `lib/places.test.ts` |
| MODIFY | `lib/gemini.ts` — venue-link rule in CORE DIRECTIONS |
| MODIFY | `lib/agentGraph.ts` — wire `buildSystemPrompt`; extend state for context if needed |
| MODIFY | `app/api/ai/route.ts` — thread locale/city into graph state (if missing) |
| MODIFY | `lib/schemas.ts` — `PlaceDetailSchema`, `PlacesResponseSchema` |
| MODIFY | `app/api/places/route.test.ts` — enrichment + cap + unsafe URL strip |
| MODIFY | `types/index.ts` |
| MODIFY | `stores/tripStore.ts` — verify bookmark actions preserve URL fields |
| MODIFY | `components/NearbyPlacesSection.tsx` — Top Picks + Discover + MOCK_PICKS |
| MODIFY | `components/AttractionSearch.tsx` |
| MODIFY | `components/ActivityNearbyPanel.tsx` |
| MODIFY | `components/SavedAttractionsList.tsx` |
| MODIFY | `components/ChatInterface.tsx` |
| MODIFY | `lib/translations.ts` |
| MODIFY | `e2e/helpers/apiMocks.ts` — add `website_url` / `maps_url` to mocks |

**Not in v1:** `CopilotCards.tsx`, replan drawer, `ItineraryCard.tsx`, `lakeGardaTargetBank.ts`

---

## 5. Constitution Check

| Constraint | Status |
| --- | --- |
| Next.js App Router | ✅ |
| API keys server-only | ✅ Details fetch in server-side `lib/places.ts` |
| Zod + Vitest for API routes | ✅ **Required** — `PlaceDetailSchema` + `route.test.ts` |
| No DB v1 | ✅ |
| Mobile 390px | ✅ `PlaceNameLink` min-h-11 touch row |
| No hallucinated chat URLs | ✅ System prompt + client scheme filter |
| Single runtime agent | ✅ Prompt-only change to existing LangGraph |
| E2E smoke | ⚠️ `step22` + update shared mocks |
| SDD spec present | ✅ |
| Incremental delivery | ✅ |
| Mock external APIs in E2E | ✅ |

**Gate result:** PASS **after v2 fixes** (v1 plan would have failed chat + Discover regression).

**Post-design re-check:** LangGraph assistant node gains system instruction — still single agent, no new runtime personas.

---

## 6. Verification & Testing Plan

### Unit tests

| File | Scenarios |
| --- | --- |
| `lib/urlSafety.test.ts` | http/https pass; `javascript:` / `data:` fail; `resolvePlaceHref` priority; `placeTestIdSlug` |
| `lib/places.test.ts` | Enrichment attaches `website_url`; Details fail → `maps_url` only; **cap at 8** Details fetches when input is 20 |
| `app/api/places/route.test.ts` | Response validates against `PlacesResponseSchema`; unsafe website stripped |

### E2E — `e2e/step22.place-links.spec.ts`

| # | Scenario | Approach |
| --- | --- | --- |
| 1 | Search result with `website_url` → correct href | `mockMilanRestaurantSearch` extended with URLs |
| 2 | Place without website → `maps_url` href | Mock fixture `mock-cafe-2` |
| 3 | Bookmark toggle still works | `#search-bookmark-*` |
| 4 | Top Picks fallback mock has clickable name | `mockNearbyTopPicks` includes `maps_url` |
| 5 | Discover row: name links out; Ask-AI button → chat | `#discover-ask-ai-*` + route to `/chat` |
| 6 | Chat link `target="_blank"` | `mockAiTextStream(page, 'Try [Osteria Mock](https://www.google.com/maps/search/?api=1&query=Osteria+Modena)')` |
| 7 | Unsafe URL stripped in UI | Mock `website_url: "javascript:alert(1)"` → renders span, not `<a>` |

Use `signInAs(page)` from `e2e/helpers/authFixture.ts`.

### Regression

Run existing specs that mock `/api/places` after updating `apiMocks.ts` — spot-check `step16`, `step17`, `step21` still green.

### Commands

```bash
npm run lint
npm test
npx playwright test e2e/step22.place-links.spec.ts
npx playwright test e2e/step16.smoke.spec.ts e2e/step17.smoke.spec.ts e2e/step21.auth.spec.ts
npm run build
```

---

## 7. Implementation Order

1. `urlSafety` + capped `enrichPlacesWithDetails` in `lib/places.ts` + unit tests  
2. `PlaceDetailSchema` + `app/api/places/route.test.ts`  
3. `PlaceNameLink` component (44px touch row)  
4. `NearbyPlacesSection` (Top Picks + Discover Ask-AI + MOCK_PICKS)  
5. `AttractionSearch`, `ActivityNearbyPanel`, `SavedAttractionsList`  
6. `SavedAttraction` fields + bookmark / `toggleSearchBookmark` payloads  
7. **`agentGraph.ts` + `gemini.ts` + `app/api/ai/route.ts`** — chat system prompt (not gemini-only)  
8. `ChatInterface` markdown link hardening  
9. Update `e2e/helpers/apiMocks.ts` + `step22` + regression spot-check  
10. lint + unit + targeted E2E + build  

**Stop after step 10; wait for user `confirmed` before merge/deploy.**

---

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Place Details quota / latency | Cap 8; parallel `allSettled`; 10 min cache |
| AttractionSearch shows >8 results without website | Results 9+ get `maps_url` only — acceptable v1 |
| Discover UX change | Explicit Ask-AI button replaces row tap |
| Old saved attractions lack URLs | Plain text; re-bookmark optional |
| `AgentState` missing locale/city | Thread from `/api/ai` body in step 7 |
| Existing E2E mocks break | Update `apiMocks.ts` in same PR as feature |
