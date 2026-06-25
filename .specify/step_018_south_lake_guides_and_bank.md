# Step 018 — South Lake Garda guide enrichments & optional towns

**Status:** Implement  
**Source:** Johlene Orton Lake Garda article gap analysis

## Goal

Add must-see detail for **planned** south-lake stops and add **optional** south-shore / article towns to Target Bank + day guides — **no removals**.

## Scope

1. `lib/tripDayGuides.ts` — enrich Sirmione, Malcesine, Peschiera; Day 7 dual option (Caneva vs village loop)
2. `lib/lakeGardaTargetBank.ts` + `data/bank.json` — Bardolino, Garda, Lonato, Moniga, Limone, Lazise centro, Navigarda
3. `lib/lakeGardaTargetBank.test.ts` — guard no stale base terms; assert new entries
4. `lib/tripDayGuides.test.ts` — Day 7 dual-option test

## Acceptance

- All existing bank/itinerary entries preserved
- Day guides show new must-see rows and Day 7 Option B
- Unit tests green
