# Step 016 (finish) — Logistics nav labels

**Status:** Implement  
**Depends on:** Step 016 layout (map on home, logistics on `/bookings`) — already shipped

## Goal

Rename bottom-nav tab and page heading so `/bookings` reads as **logistics** (flights, car, VRBO), not generic “Bookings”.

## Scope

1. `lib/translations.ts` — `bookings` nav: `"Logistics"` / `"לוגיסטיקה"`; `logisticsPageTitle`: full page heading EN/HE
2. `app/bookings/page.tsx` — metadata title aligned
3. E2E: `step10`, `step15`, `step20` — heading/nav text assertions

## Acceptance

- Nav tab shows Logistics / לוגיסטיקה
- Page `<h1>` shows Logistics & Bookings / לוגיסטיקה והזמנות
- Targeted E2E green; lint + build pass

## Non-goals

- Rename route `/bookings` or testids
