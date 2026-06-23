# Step: Swap Sun Jun 28 ↔ Thu Jul 2 (approved schedule)

## Goal
Align default itinerary with the group's approved week:

| Day | Date | Plan |
|-----|------|------|
| 4 | Sun Jun 28 | Manerba family boat → Rocca walk → Lido Azzurro lunch |
| 8 | Thu Jul 2 | Sirmione castle + old town → Aquaria Thermal Spa (afternoon, booked) |

## Scope (this step only)
- `lib/defaultItalyItinerary.ts` — swap day 4 & 8 activities; Sun order: boat → rocca → lunch
- `lib/tripDayGuides.ts` — swap DAY_4 & DAY_8 guide content
- `lib/lakeGardaTargetBank.ts` + `data/bank.json` — update date references in descriptions
- `components/EssentialsChecklist.tsx` + `lib/translations.ts` — Aquaria Thu / Manerba Sun
- `lib/itineraryTemplate.ts` — bump template version to **6**
- Tests + `e2e/step4h.smoke.spec.ts` — expect new day titles

## Out of scope (next step)
- Fri Jun 26 dual option: Lungolago Virgilio vs Bergamo Città Alta

## Acceptance
- Calendar shows **Jun 28 – Manerba Boat & Rocca Walk**
- Calendar shows **Jul 2 – Sirmione & Aquaria Spa**
- Day guide 4 = Manerba; day guide 8 = Sirmione (+ optional Grotte)
- Stale localStorage re-seeds via template v6
