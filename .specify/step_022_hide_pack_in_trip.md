# Specification: Hide Pack During In-Trip Mode

## 1. Goal & Context

Packing is a **pre-trip** activity. When the user switches to **In-Trip (Traveling)** mode, the Pack tab and `/pack` route should be hidden so the bottom bar stays focused on on-the-go tools (home, calendar, chat, locations, bookings).

**Base:** `tripMode` in Zustand (`"planning" | "in-trip"`), toggled on Home.

---

## 2. User Stories

- **As a traveler in Italy**, I do not want a Pack tab in the bottom nav — I have already packed.
- **As a planner at home**, I still want full access to Pack from the bottom nav.

---

## 3. Functional Requirements

### A. Bottom navigation
- [ ] When `tripMode === "in-trip"`, omit the Pack tab from `BottomNav` (5 tabs visible).
- [ ] When `tripMode === "planning"`, show all 6 tabs including Pack (unchanged).

### B. Pack route guard
- [ ] When `tripMode === "in-trip"`, visiting `/pack` redirects to `/` (replace, no flash of packing UI).

### C. Regression
- [ ] Pack page and nav link work normally in planning mode.
- [ ] E2E: planning mode still has 6 tabs; in-trip mode has 5 tabs and no `#nav-link-pack`.

---

## 4. Files

| File | Change |
| --- | --- |
| `components/BottomNav.tsx` | Filter `pack` when in-trip |
| `components/PackPageClient.tsx` | **NEW** — pack UI + in-trip redirect |
| `app/pack/page.tsx` | Server shell → `PackPageClient` |
| `e2e/step20.nav-home-redesign.spec.ts` | Assert 5 tabs in-trip, pack hidden |
