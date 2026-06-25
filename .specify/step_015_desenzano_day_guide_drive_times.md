# Step 015 — Day guides: Desenzano drive-time pass

**Status:** Implement  
**Depends on:** Step 013 (Desenzano base)

## Goal

Align Calendar **Day Guide** banners and target-bank distance hints with **Villa Bella, Desenzano** drive times (matching `defaultItalyItinerary.ts`).

## Scope

1. `lib/tripDayGuides.ts` — `bannerNote` on days 3–5, 7–9; enrich days 2 & 6; drive hints on key must-see details
2. `lib/lakeGardaTargetBank.ts` + `data/bank.json` — Castellaro / Manerba / Gardaland distance copy
3. `lib/tripDayGuides.test.ts` — assert every activity day has a Desenzano-aware banner

## Drive-time reference (from Desenzano)

| Day | Destinations | Drive |
|-----|-------------|-------|
| 2 | Peschiera stop → villa | ~15 min · Bergamo stop → villa ~1.5–2 hr · check-in 17:00 |
| 3 | Castellaro → Borghetto → Sigurtà | ~35 / ~10 / ~20 min legs |
| 4 | Manerba | ~40 min each way |
| 5 | Gardaland | ~20 min |
| 6 | Verona / Malcesine | ~40 min / ~1 hr |
| 7 | CanevaWorld → Peschiera | ~25 / ~10 min |
| 8 | Sirmione | ~15 min |
| 9 | Serravalle → Milan | ~1 hr 45 / ~1 hr 15 |

## Acceptance

- Days 2–9 day guides include drive-time banner referencing Desenzano base
- Castellaro bank entry no longer says "10 min from villa"
- Unit tests pass
