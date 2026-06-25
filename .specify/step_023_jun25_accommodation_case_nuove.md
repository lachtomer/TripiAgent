# Step 023 — Jun 25 overnight: C'era una volta room (Case Nuove)

**Status:** Implement

## Goal

Correct Day 1 (Jun 25) accommodation from the placeholder **Malpensa Jacuzzi House (Ferno)** to the actual booking:

- **C'era una volta room**
- Via Bellaria, 39, 21019 Case Nuove VA, Italy
- Night of **Jun 25 → Jun 26** (before Malpensa car pickup)

## Scope

1. `lib/defaultItalyItinerary.ts` — Day 1 arrive + check-in activities; Day 2 car pickup mentions checkout
2. `lib/itineraryTemplate.ts` — bump `ITINERARY_TEMPLATE_VERSION` to **9**
3. `lib/itineraryTemplate.test.ts` — expect version 9
4. `e2e/step4h.smoke.spec.ts` — update delete-activity test title

## Acceptance

- Calendar Day 1 shows C'era una volta room with full address
- Stale persisted itineraries re-seed on version bump
- E2E step 4h delete test passes
