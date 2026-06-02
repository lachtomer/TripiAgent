# Research: Navigation Redesign & Home Screen

## Summary

All design questions resolved. No external dependencies required. This feature is a
UI restructure of existing surfaces; no new APIs, no new data model entities.

---

## Decision 1: "Around Me" search mode implementation

**What was chosen:** The `InvestigateSection` component passes the user's GPS city
(reverse-geocoded label or `manualCity` from `tripStore`) as the pre-filled city for
`AttractionSearch` when in **Around Me** mode. When GPS is unavailable, it falls
back to the target destination city.

**Rationale:** `/api/places` accepts a `city` string parameter. Re-using the existing
API contract avoids any backend change. The `useLocation` hook already returns
`location.city` (reverse-geocoded label) and the store exposes `manualCity`. The
`AttractionSearch` component already supports an optional pre-filled city prop via its
internal state; we expose it as a controlled `defaultCity` prop.

**Alternatives considered:**
- Pass raw lat/lng to `/api/places` and geocode server-side — adds backend complexity, deferred.
- Use a new `/api/nearby` route — unnecessary for this spec scope.

---

## Decision 2: Map card — MapPreview vs. interactive Leaflet map

**What was chosen:** Retain the existing `MapPreview` SVG-based decorative map
component as the "Active Route Map" compact card. Add a full-screen overlay modal on
tap (using a `<dialog>` or shadcn `Sheet`) that renders the same MapPreview at larger
scale. No Leaflet/MapBox dependency added in this spec.

**Rationale:**
- `MapPreview.tsx` already matches the visual language and shows Lake Garda route with
  stop pins and animated route line — exactly the "route overview" pattern in the spec.
- Adding a real tile-based map is a future-spec item (network dependency, API key,
  license). The decorative SVG satisfies the spec's compact/overview goal.
- The "expand to full screen" behavior is achieved with a simple modal wrapper.

**Alternatives considered:**
- Leaflet (react-leaflet) — heavier bundle, extra API key, deferred.
- react-simple-maps — no route drawing support out of the box.

---

## Decision 3: `/locations` route content

**What was chosen:** `app/locations/page.tsx` renders `SavedAttractionsList`, the
existing component that already shows all bookmarked places, voting, and admin delete.
This makes "Locations" (יעדים) the dedicated Target Bank tab.

**Rationale:** The component exists and is fully functional. The route just needs a
new page file that renders it. No logic changes required in this phase.

**Alternatives considered:**
- Redirect `/locations` → `/itinerary` sidebar — poor UX, sidebar not visible on mobile.
- Build a new page from scratch — unnecessary when the component already exists.

---

## Decision 4: Tab order and Hebrew label binding

**What was chosen:** Tab order is fixed left-to-right: Home → Calendar → Chat → Pack →
Locations → Bookings, regardless of UI locale. Hebrew label strings are added to
`lib/translations.ts` under new keys: `home`, `calendar`, `locations`, `bookings`.
Existing keys `chat` and `pack` already have Hebrew translations — no change needed.

**Rationale:** The app uses RTL direction for Hebrew text but the bottom nav visual
order is always LTR (standard mobile pattern — e.g., iOS/Android native apps keep tab
order LTR even in RTL locales). This avoids confusing muscle-memory changes when
switching languages.

**Alternatives considered:**
- Mirror tab order in RTL mode — disruptive, inconsistent with spec requirement.
- Use a single label object per tab instead of translation keys — more brittle.

---

## Decision 5: `InvestigateSection` as new component vs. modifying `AttractionSearch`

**What was chosen:** Create `components/InvestigateSection.tsx` which:
1. Owns the Card wrapper, section heading, and Toggle.
2. Passes `headless` to `AttractionSearch` to suppress its own Card/CardHeader (avoids double-card nesting).
3. Passes `defaultQuery` as the `useState` initial value inside `AttractionSearch` (NOT a `useEffect` — avoids lint violation).
4. Uses `key={mode}` on `<AttractionSearch>` to force remount when the toggle changes, which resets `query` state to the new `defaultQuery`.

`AttractionSearch` receives two new optional props: `defaultQuery?: string` and `headless?: boolean`.

**Rationale:** `AttractionSearch` is 728 lines with multiple tested E2E paths. Adding minimal
opt-in props is safer than restructuring it. `key` remount is the canonical React pattern for
resetting controlled state when a logical "session" changes (mode switch = new search intent).

**Alternatives considered:**
- Add `useEffect(() => setQuery(defaultCity), [defaultCity])` — rejected: wrong variable name (`city` vs `query`), missing deps linting violation.
- Merge toggle into `AttractionSearch` directly — rejected: risks breaking existing tests.
- Full extract/rewrite — rejected: out of scope.

---

## Conclusion

All NEEDS CLARIFICATION items resolved. No new dependencies required. All design
decisions build exclusively on existing components, routes, and API contracts.
The feature is low-risk (UI-only restructure, no new API surface).
