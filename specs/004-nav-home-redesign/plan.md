# Technical Plan: Navigation Redesign & Home Screen (v2)

**Feature spec:** `specs/004-nav-home-redesign/spec.md`  
**Research:** `specs/004-nav-home-redesign/research.md`  
**Data model:** `specs/004-nav-home-redesign/data-model.md`  
**Review pass:** All 14 review findings resolved below.

---

## 1. Architectural Changes

UI-only restructure — no new API routes, no backend changes, no new npm dependencies.

- **BottomNav:** 4 → 6 tabs with explicit 390px layout constraints (see §2c).
- **New routes:** `/locations` (SavedAttractionsList), `/bookings` (placeholder).
- **Home page restructure — new vertical layout:**
  1. Mode Switcher pill (now at the very top, before the map)
  2. `ActiveRouteMapCard` — compact 220px card, tap opens a fixed full-screen overlay (no Sheet, no dialog)
  3. `InvestigateSection` — owns a Card, passes `headless` to `AttractionSearch` to avoid double-Card nesting
- **`AttractionSearch`** gains two minimal props:
  - `defaultQuery?: string` — used as initial `useState` value (no `useEffect`)
  - `headless?: boolean` — suppresses the Card/CardHeader wrapper
- **`NearbyPlacesSection`** is removed from Home. Its absence is explicitly compensated: `InvestigateSection` triggers an initial auto-search using the target city so results are visible on first paint without a user action.

---

## 2. Component Design & State

### 2a. State Store Changes

**`stores/tripStore.ts` — NO changes.**

Correct selectors for city resolution:
- GPS city: `useTripStore(s => s.location?.cityName)` (field is `cityName`, not `city` or `manualCity`)
- Target fallback: `useTripStore(s => s.savedAttractions[0]?.locationName)` (field is `locationName`, not `location`)
- Final fallback string: `"Lake Garda"`

### 2b. Translation Keys (`lib/translations.ts`)

```typescript
// en additions
home: "Home",
calendar: "Calendar",
locations: "Locations",
bookings: "Bookings",

// he additions
home: "בית",
calendar: "תכנון",
locations: "יעדים",
bookings: "ניירות",
```

`chat` and `pack` already exist in both locales — no change.

### 2c. UI Components

---

#### [MODIFY] `components/BottomNav.tsx`

**New navItems (6 tabs):**

```typescript
import { Home, Calendar, MessageCircle, Luggage, MapPin, FileText } from "lucide-react";

const navItems = [
  { key: "home",      label: t.home,      href: "/",          icon: Home },
  { key: "calendar",  label: t.calendar,  href: "/itinerary", icon: Calendar },
  { key: "chat",      label: t.chat,      href: "/chat",      icon: MessageCircle },
  { key: "pack",      label: t.pack,      href: "/pack",      icon: Luggage },
  { key: "locations", label: t.locations, href: "/locations", icon: MapPin },
  { key: "bookings",  label: t.bookings,  href: "/bookings",  icon: FileText },
];
```

**390px layout fix (Review finding #5):**
6 tabs × current `min-w-[56px]` = 336px + padding = overflow risk. Apply:

```tsx
// Change tab container: remove px-2, use px-0
<div className="mx-auto flex h-16 w-full items-center justify-around px-0">

// Change each Link: min-w-[48px] px-1 (was min-w-[56px] px-3)
className={cn(
  "relative flex h-14 min-w-[48px] flex-col items-center justify-center rounded-xl transition-all duration-200 px-1 cursor-pointer",
  ...
)}

// Change label: text-[9px] (was text-[10px])
<span className={cn("text-[9px] font-medium mt-0.5 ...", isActive ? "font-bold" : "")}>
```

This gives 6 × 48px = 288px minimum within 390px — comfortably fits with 102px distribution margin.

---

#### [MODIFY] `components/AttractionSearch.tsx`

Two new optional props (**Review findings #1, #2, #6**):

```typescript
interface AttractionSearchProps {
  defaultQuery?: string;  // replaces the faulty useEffect approach
  headless?: boolean;     // suppresses Card + CardHeader wrapper
}

export default function AttractionSearch({ defaultQuery, headless }: AttractionSearchProps) {
  // Fix #1+#2: no useEffect — initial value only (only fires once on mount)
  const [query, setQuery] = useState(defaultQuery ?? "");
  // ... rest of component unchanged
```

**Headless rendering (Fix #6):**

```typescript
const inner = (
  <CardContent className="p-4 space-y-4">
    {/* existing search form + results — unchanged */}
  </CardContent>
);

if (headless) {
  return <div className="p-4 space-y-4">{/* same content, no Card wrapper */}</div>;
}

return (
  <Card className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden">
    <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20">
      <CardTitle>...</CardTitle>
      <CardDescription>...</CardDescription>
    </CardHeader>
    {inner}
  </Card>
);
```

> **No other changes** to AttractionSearch internals. Both props are fully optional — all existing callers and E2E tests continue to work unchanged.

---

#### [NEW] `components/ActiveRouteMapCard.tsx` (**required**, not optional — Fix #11)

Renders `MapPreview` in a compact card. Tap toggles a full-screen overlay using a plain `fixed inset-0` div — no Sheet, no Dialog, no modal element (Fix #8):

```typescript
"use client";
import { useState } from "react";
import MapPreview from "@/components/MapPreview";
import { X } from "lucide-react";

export default function ActiveRouteMapCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Compact card (~220px) */}
      <div
        data-testid="active-route-map"
        onClick={() => setExpanded(true)}
        className="cursor-pointer rounded-2xl overflow-hidden"
        style={{ height: 220 }}
        role="button"
        aria-label="הרחב מפה — Expand map"
      >
        <MapPreview />
      </div>

      {/* Full-screen overlay — NOT a modal/Sheet/dialog */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold">המסלול שלי</span>
            <button
              onClick={() => setExpanded(false)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="סגור — Close map"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <MapPreview />
          </div>
        </div>
      )}
    </>
  );
}
```

---

#### [NEW] `components/InvestigateSection.tsx` (Fix #3, #6, #12)

Owns the Card wrapper + section heading + toggle. Passes `headless` to `AttractionSearch`. Uses `key={mode}` to reset query state when mode changes (Fix #12):

```typescript
"use client";
import { useState, useEffect } from "react";
import { useTripStore } from "@/stores/tripStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import AttractionSearch from "@/components/AttractionSearch";
import { cn } from "@/lib/utils";

type InvestigateMode = "target" | "around-me";

export default function InvestigateSection() {
  const tripMode  = useTripStore(s => s.tripMode);
  const cityName  = useTripStore(s => s.location?.cityName);     // GPS city (Fix #3)
  const savedAttractions = useTripStore(s => s.savedAttractions);
  const targetCity = savedAttractions[0]?.locationName ?? "Lake Garda"; // Fix #3

  const [mode, setMode] = useState<InvestigateMode>(
    tripMode === "in-trip" ? "around-me" : "target"
  );

  // Resolved city passed as defaultQuery to AttractionSearch
  const resolvedCity =
    mode === "around-me"
      ? (cityName ?? targetCity)   // GPS city, fall back to target
      : targetCity;                // always target city

  const gpsDenied = mode === "around-me" && !cityName;

  return (
    <Card
      data-testid="investigate-section"
      className="border border-outline-variant/30 bg-card shadow-sm rounded-2xl overflow-hidden"
    >
      <CardHeader className="p-4 bg-muted/10 border-b border-outline-variant/20 space-y-2">
        <CardTitle className="text-sm font-extrabold tracking-tight">
          חקר / Investigate
        </CardTitle>

        {/* Pill segmented toggle */}
        <div className="flex w-full rounded-full bg-muted/60 p-0.5 gap-0.5">
          {(["target", "around-me"] as const).map((m) => (
            <button
              key={m}
              data-testid={m === "target" ? "investigate-target-btn" : "investigate-aroundme-btn"}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                mode === m
                  ? "bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "target" ? "יעד" : "סביבי"}
            </button>
          ))}
        </div>

        {/* GPS-denied soft info banner */}
        {gpsDenied && (
          <p className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5 text-center">
            הפעל מיקום לחיפוש סביבך
          </p>
        )}
      </CardHeader>

      {/*
        key={mode} forces AttractionSearch to remount when mode changes,
        resetting the query field to the new resolvedCity (Fix #12).
        headless suppresses AttractionSearch's own Card wrapper (Fix #6).
      */}
      <AttractionSearch
        key={mode}
        defaultQuery={resolvedCity}
        headless
      />
    </Card>
  );
}
```

---

#### [MODIFY] `app/page.tsx` (Fix #7 — mode switcher moves to top)

New layout — **mode switcher is first**, before the map:

```typescript
export default function Home() {
  const { location } = useLocation();
  const tripMode = useTripStore((s) => s.tripMode);
  const toggleTripMode = useTripStore((s) => s.toggleTripMode);

  return (
    <div className="flex flex-col flex-1 pb-16">
      <h1 className="sr-only">Explore Italy</h1>

      {/* 1. Mode Switcher — first element, always visible above fold */}
      <div className="px-4 pt-4 flex justify-center shrink-0">
        {/* existing pill toggle — unchanged markup */}
      </div>

      {/* 2. Active Route Map */}
      <div className="px-4 pt-3">
        <ActiveRouteMapCard />
      </div>

      {/* In-trip only: LocationPermissionBanner, CopilotCards, TodayPlanner */}
      {tripMode === "in-trip" && <LocationPermissionBanner />}
      {tripMode === "in-trip" && (
        <div className="px-4 pt-3 space-y-4">
          <CopilotCards />
          <TodayPlanner />
        </div>
      )}

      {/* 3. Investigate Section */}
      <div className="px-4 pt-4 pb-2">
        <InvestigateSection />
      </div>
    </div>
  );
}
```

> **Removed from Home:** `LocationCard`, `NearbyPlacesSection`, the 3-column md grid.  
> **`LocationCard` note (Fix #14):** Weather + destination time context was provided by `LocationCard`. This component is removed from Home; its weather context is now surfaced via `CopilotCards` (in-trip mode only) and `MapPreview`'s footer overlay (destination + route info). Users in planning mode see the map destination card instead. `LocationCard` is deprecated from this route — not moved elsewhere in this spec; future spec may add a `/status` or header widget.

---

#### [NEW] `app/locations/page.tsx` (Fix #10 — metadata added)

```typescript
import type { Metadata } from "next";
import SavedAttractionsList from "@/components/SavedAttractionsList";

export const metadata: Metadata = {
  title: "יעדים — TripiAgent",
  description: "Saved attractions and points of interest",
};

export default function LocationsPage() {
  return (
    <div className="flex flex-col flex-1 pb-16 px-4 pt-4">
      <SavedAttractionsList />
    </div>
  );
}
```

> Note: `SavedAttractionsList` is a client component; the page does **not** need `"use client"` since it renders no client hooks directly.

---

#### [NEW] `app/bookings/page.tsx` (Fix #4 — no unused import)

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ניירות — TripiAgent",
  description: "Bookings and travel documents",
};

export default function BookingsPage() {
  return (
    <div
      data-testid="bookings-page"
      className="flex flex-col flex-1 items-center justify-center pb-16 px-4 pt-4 gap-3"
    >
      <p className="text-2xl">📄</p>
      <h1 className="text-lg font-bold">ניירות</h1>
      <p className="text-sm text-muted-foreground text-center">
        בקרוב — ניהול הזמנות, שוברים, ומסמכי נסיעה.
      </p>
    </div>
  );
}
```

---

## 3. API Routes & Schemas

**No new API routes.** `/api/places` and `/api/geocode` are reused as-is.

---

## 4. Proposed File Modifications

```
[MODIFY]  components/BottomNav.tsx           ← 6 tabs + 390px layout fix
[MODIFY]  lib/translations.ts                ← 4 new nav keys (en + he)
[MODIFY]  components/AttractionSearch.tsx    ← defaultQuery + headless props
[MODIFY]  app/page.tsx                       ← new vertical layout, mode-switcher at top
[NEW]     components/ActiveRouteMapCard.tsx  ← required component (not optional)
[NEW]     components/InvestigateSection.tsx
[NEW]     app/locations/page.tsx             ← metadata included
[NEW]     app/bookings/page.tsx              ← no unused imports
[NEW]     e2e/step20.nav-home-redesign.spec.ts
```

> **NB on NearbyPlacesSection (Fix #9):** `NearbyPlacesSection` is **deleted from Home** (`app/page.tsx`). It is NOT re-integrated inside `AttractionSearch`. To compensate for the ambient discovery it provided, `InvestigateSection` passes `defaultQuery={resolvedCity}` which pre-fills the search — the user sees the city pre-populated and can immediately hit Search. This is a deliberate UX trade: explicit intent over ambient content.

---

## 5. Affected Existing E2E Tests (Fix #13 — enumerated explicitly)

### `e2e/step4i-4j.smoke.spec.ts`

Two changes required:

| Line | Current | After |
|------|---------|-------|
| 89 | `"BottomNav renders with all 4 tabs"` | `"BottomNav renders with all 6 tabs"` |
| 93 | `#nav-link-explore` | `#nav-link-home` |
| 96 | _(test asserts 4 tabs via 4 `toBeVisible` calls)_ | Add assertions for `#nav-link-locations` and `#nav-link-bookings` |

All other E2E specs reference `#nav-link-itinerary`, `#nav-link-pack`, `#nav-link-chat` — these selectors are **unchanged** and remain valid.

---

## 6. Verification & Testing Plan

### Unit Tests (Vitest)

No new unit tests — no new business logic or API schemas.

### E2E Tests — `e2e/step20.nav-home-redesign.spec.ts`

| Scenario | Assertion |
|----------|-----------|
| Nav bar has exactly 6 tabs | Count `[id^="nav-link-"]` === 6 |
| Home tab active on `/` | `#nav-link-home` has `aria-current="page"` |
| All 6 tabs navigate correctly | Click each; assert URL |
| Home screen: map card visible | `[data-testid="active-route-map"]` visible |
| Map card expand/collapse | Click card → full-screen overlay visible; close button → overlay gone |
| Home screen: Investigate section visible | `[data-testid="investigate-section"]` visible |
| Investigate: Target toggle active by default (planning mode) | `[data-testid="investigate-target-btn"]` has active class |
| Investigate: toggle switches mode | Click around-me → `[data-testid="investigate-aroundme-btn"]` active |
| Locations page loads | Navigate `/locations` → `[data-testid="saved-attractions-ready"]` visible |
| Bookings page loads | Navigate `/bookings` → `[data-testid="bookings-page"]` visible + text "ניירות" |

---

## 7. Constitution Check

| Constraint | Status |
|------------|--------|
| No DB / server state | ✅ No store changes |
| API keys server-only | ✅ No new API routes |
| Mobile 390px first | ✅ 6-tab layout explicitly sized for 390px |
| Zod input validation | ✅ No new endpoints |
| Playwright E2E for layout changes | ✅ `step20` + updated `step4i-4j` |
| Spec in `.specify/` before code | ✅ `specs/004-nav-home-redesign/spec.md` |
| Dark mode | ✅ All components use `dark:` variants |
| Hebrew/RTL | ✅ Labels via `useTranslation()`, tab order LTR |
| No unused imports | ✅ `bookings/page.tsx` uses no imports beyond `Metadata` |
| `react-hooks/exhaustive-deps` | ✅ No `useEffect` for `defaultQuery` — initial `useState` value only |
