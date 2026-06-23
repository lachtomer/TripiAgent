# Step: Fri Jun 26 dual drive stop (Virgilio vs Bergamo)

## Goal
Day 2 matches approved plan: after car pickup, group picks **one** en-route stop:

| Option | Stop | Lunch |
|--------|------|-------|
| A | Lungolago Virgilio (Peschiera lakeside) | Pizza/panini on the lake |
| B | Bergamo Città Alta (walls, Piazza Vecchia, basilica) | Pizza/panini in upper town |

Both continue to Monzambano check-in; **dinner: Trattoria del Ponte** (in both option food lists).

## Scope
- `lib/tripDayGuides.ts` — DAY_2 → dual `options` + banner (like Day 6)
- `lib/defaultItalyItinerary.ts` — timeline stop title/description + day header
- `lib/itineraryTemplate.ts` — bump to **v7**
- Tests + `e2e/step26.calendar-day-guide.smoke.spec.ts`

## Acceptance
- Day guide 2 shows Option A (Virgilio) and Option B (Bergamo) with banner
- Timeline stop references both options
- Template v7 re-seeds stale clients
