# Quickstart: Navigation Redesign & Home Screen (v2)

## What this implements

- 6-tab bottom navigation bar (390px-safe layout) with Hebrew labels
- Home screen: Mode Switcher (first) → Active Route Map card → Investigate section
- New `/locations` route (Saved Attractions / Target Bank)
- New `/bookings` route (placeholder)

---

## Running locally

```bash
npm run dev
# Open http://localhost:9001
```

---

## Implementation order

Execute one step at a time, confirm between each. The steps are ordered to minimise
cascading failures — props are defined before consumers are written.

### Step 1 — Translation keys
**File:** `lib/translations.ts`  
Add `home`, `calendar`, `locations`, `bookings` to both `en` and `he` locale objects.

### Step 2 — `AttractionSearch` props (pre-req for InvestigateSection)
**File:** `components/AttractionSearch.tsx`  
- Add `defaultQuery?: string` and `headless?: boolean` props.
- Change `useState("")` → `useState(defaultQuery ?? "")`.
- Wrap render in `if (headless) return <div className="p-4 space-y-4">...</div>`.
- Run `npm run lint` to confirm `react-hooks/exhaustive-deps` still passes.

### Step 3 — BottomNav (6 tabs + 390px layout)
**File:** `components/BottomNav.tsx`  
- Replace 4-item `navItems` with 6 items per plan §2c.
- Update icon imports: add `Home`, `FileText`.
- Apply layout fix: `px-0` container, `min-w-[48px] px-1` per tab, `text-[9px]` labels.
- Update `e2e/step4i-4j.smoke.spec.ts` test "4j-1": change to 6 tabs, add new nav-link assertions, update `#nav-link-explore` → `#nav-link-home`.

### Step 4 — New route pages
**Files:** `app/locations/page.tsx`, `app/bookings/page.tsx`  
- Locations: server component (no `"use client"`), exports `metadata`, renders `SavedAttractionsList`.
- Bookings: server component, exports `metadata`, renders "בקרוב" placeholder with `data-testid="bookings-page"`.

### Step 5 — `ActiveRouteMapCard` component (required)
**File:** `components/ActiveRouteMapCard.tsx`  
- Compact 220px wrapper around `MapPreview` with `data-testid="active-route-map"`.
- Tap → `fixed inset-0 z-50 bg-background` full-screen overlay (no Sheet, no Dialog).
- Close button (X icon) collapses the overlay.

### Step 6 — `InvestigateSection` component
**File:** `components/InvestigateSection.tsx`  
- Owns the Card wrapper + "חקר / Investigate" heading + pill toggle.
- Resolves `defaultQuery` using `location?.cityName` (around-me) or `savedAttractions[0]?.locationName ?? "Lake Garda"` (target).
- Renders `<AttractionSearch key={mode} defaultQuery={resolvedCity} headless />`.
- Shows GPS-denied soft info banner when `mode === "around-me"` and `!cityName`.

### Step 7 — Home page restructure
**File:** `app/page.tsx`  
- Move mode switcher pill to top (before map).
- Remove: `LocationCard`, `NearbyPlacesSection`, 3-column grid.
- Add: `<ActiveRouteMapCard />`, `<InvestigateSection />`.
- Keep in-trip-only: `LocationPermissionBanner`, `CopilotCards`, `TodayPlanner`.

### Step 8 — E2E smoke test
**File:** `e2e/step20.nav-home-redesign.spec.ts`  
Write 10-scenario spec (see plan §6). Add `data-testid` attributes to new
components as listed below if not already applied in Steps 5–6.

---

## Verifying the feature

```bash
npm run lint
npm run test
npx playwright test e2e/step20.nav-home-redesign.spec.ts
npx playwright test e2e/step4i-4j.smoke.spec.ts
npm run build
```

All five commands must pass before the feature is considered complete.

---

## Key `data-testid` attributes

| Component | `data-testid` | Applied in step |
|-----------|---------------|----------------|
| `ActiveRouteMapCard` wrapper | `active-route-map` | Step 5 |
| `InvestigateSection` root Card | `investigate-section` | Step 6 |
| Toggle — Target | `investigate-target-btn` | Step 6 |
| Toggle — Around Me | `investigate-aroundme-btn` | Step 6 |
| Bookings page root | `bookings-page` | Step 4 |

---

## Existing E2E changes required

| File | Change |
|------|--------|
| `e2e/step4i-4j.smoke.spec.ts` | Test name: "4 tabs" → "6 tabs"; `#nav-link-explore` → `#nav-link-home`; add assertions for `#nav-link-locations`, `#nav-link-bookings` |
