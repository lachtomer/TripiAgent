# Step 013 — Desenzano base: Villa Bella (VRBO)

**Status:** Implement  
**Trigger:** VRBO confirmation HA-HC6RCW — Villa Bella Desenzano replaces Villa Eunice, Monzambano.

## Booking facts (VRBO email, Jun 24 2026)

| Field | Value |
|-------|-------|
| Property | Villa Bella Desenzano |
| Town | Desenzano del Garda |
| Check-in | Fri Jun 26, 2026 — 17:00 |
| Check-out | Fri Jul 3, 2026 — before 10:00 |
| Nights | 7 (Jun 26 → Jul 3) |
| Guests | 3 adults + 4 children |
| Confirmation | HA-HC6RCW |
| Property ID | 10207760 |
| Balance due at property | €98 |
| Check-in instructions | Appear ~3 days before arrival (Jun 23) |

## Scope (this step)

1. `lib/defaultItalyItinerary.ts` — base town, villa name, check-in 17:00, drive times, Day 2 evening in Desenzano, checkout 10:00
2. `lib/itineraryTemplate.ts` — bump version **7 → 8**
3. `lib/tripDayGuides.ts` — Day 2 banner + Desenzano welcome dinner
4. `lib/translations.ts` — e3/e4 prep items (EN + HE)
5. `components/MapPreview.tsx` — base pin label
6. `lib/lakeGardaTargetBank.ts` + `data/bank.json` — base comment, dining descriptions, welcome dinner → Pace
7. Tests: `lib/itineraryTemplate.test.ts`, `e2e/step4h.smoke.spec.ts`, `app/api/copilot/route.test.ts`

## Out of scope (later step)

- `TravelLogistics` VRBO fields on Bookings page
- Full drive-time audit for every day guide
- Desenzano self-drive boat promotion in target bank

## Acceptance

- No remaining `Villa Eunice` or `Monzambano` in shipped app source (tests/specs/docs excluded)
- Day 2 check-in at 17:00 with VRBO ref in description
- `ITINERARY_TEMPLATE_VERSION === 8`
- Unit tests pass for itinerary template
