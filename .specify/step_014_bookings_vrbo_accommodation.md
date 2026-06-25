# Step 014 — Bookings: VRBO accommodation section

**Status:** Implement  
**Depends on:** Step 013 (Villa Bella Desenzano)

## Goal

Surface Lake Garda VRBO booking on `/bookings` alongside flights and car rental — editable and persisted in Zustand.

## Data (defaults)

| Field | Default |
|-------|---------|
| Property | Villa Bella Desenzano |
| Town | Desenzano del Garda |
| Check-in | Fri Jun 26, 2026 · 17:00 |
| Check-out | Fri Jul 3, 2026 · before 10:00 |
| VRBO confirmation | HA-HC6RCW |
| Property ID | 10207760 |
| Balance due at property | €98 |

## Scope

1. `types/index.ts` — extend `TravelLogistics`
2. `lib/defaultAccommodationBooking.ts` — static display constants + defaults
3. `stores/tripStore.ts` — seed + persist migration merge
4. `components/LogisticsCard.tsx` — accommodation section + save
5. `lib/translations.ts` — EN/HE labels
6. `lib/defaultAccommodationBooking.test.ts` — defaults smoke
7. `e2e/step10.smoke.spec.ts` — VRBO field visible + persists on save/reload

## Acceptance

- Bookings page shows Villa Bella summary, VRBO code, property ID, €98 balance field
- Save persists all logistics fields including accommodation
- Unit test green for defaults
