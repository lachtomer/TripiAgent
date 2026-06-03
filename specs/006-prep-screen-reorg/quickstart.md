# Quickstart: 006 Prep Screen Reorganization

## What this implements

- **Itinerary (`/itinerary`):** day schedule only — no checklist, no saved places sidebar
- **Logistics (`/bookings`):** logistics form + trimmed 5-item reservations checklist (dedup B)
- **Locations (`/locations`):** sole home for saved attractions (unchanged)
- Nav tab 6 stays **`לוגיסטיקה`**

---

## Running locally

```bash
npm run dev
# http://localhost:9001
```

---

## Implementation order

One step at a time; confirm between steps per project contract.

### Step 1 — Trim checklist + translations

**Files:** `components/EssentialsChecklist.tsx`, `lib/translations.ts`

- Remove e1, e2, e3, e5 from `ESSENTIALS_ITEMS`.
- Update `essentialsTitle` / `essentialsDesc` for reservations-only copy.
- Add `logisticsPageTitle` / `logisticsPageSubtitle` keys (HE + EN).

### Step 2 — Bookings page layout

**File:** `app/bookings/page.tsx`

- Import `EssentialsChecklist`.
- Order: header → `LogisticsCard` → `EssentialsChecklist`.
- Use translation keys for page title/subtitle and metadata.

### Step 3 — Itinerary simplification

**File:** `app/itinerary/page.tsx`

- Remove `EssentialsChecklist` and `SavedAttractionsList`.
- Single-column full-width `ItineraryCard` (drop grid).

### Step 4 — E2E fixes

**Files:** `e2e/step10.smoke.spec.ts`, `e2e/step17.smoke.spec.ts`, `e2e/travelAgentPersona.spec.ts`

- Redirect Saved Attractions assertions to `/locations`.
- Redirect checklist assertions to `/bookings`.
- Update text matchers if checklist title changed.

### Step 5 — Validation

```bash
npm run lint
npm test
npx playwright test e2e/step10.smoke.spec.ts e2e/step17.smoke.spec.ts e2e/travelAgentPersona.spec.ts
npm run build
```

---

## Acceptance checklist

- [ ] `/bookings` shows logistics form then 5-item checklist
- [ ] No "Passports & Flights" in checklist
- [ ] `/itinerary` has no Saved Attractions section
- [ ] `/locations` still manages bookmarks and Add to Day
- [ ] Nav tab 6 reads `לוגיסטיקה`
- [ ] E2E targeted specs pass
