# Technical Plan: Lake Garda Teen Itinerary & Target Bank Refresh

## 1. Architectural Changes

Extract default itinerary to `lib/defaultItalyItinerary.ts`; re-export from `ItineraryCard.tsx`. Expand `lib/lakeGardaTargetBank.ts` with nature, shopping, and dining POIs. Mirror in `data/bank.json`.

## 2. Component Design & State

- **ItineraryCard:** import `DEFAULT_ITALY_ITINERARY` from lib; no UI logic change.
- **tripStore:** already seeds from `LAKE_GARDA_TEEN_TARGET_BANK`.
- **EssentialsChecklist:** add Gardaland tickets, Taverna del Silenzio, Desenzano boat rental items.

## 3. API Routes & Schemas

No API changes. Admin GET `/api/bank/places` serves updated `data/bank.json`.

## 4. Proposed File Modifications

* [NEW] `lib/defaultItalyItinerary.ts`
* [MODIFY] `components/ItineraryCard.tsx`
* [MODIFY] `lib/lakeGardaTargetBank.ts`
* [MODIFY] `data/bank.json`
* [MODIFY] `components/EssentialsChecklist.tsx`
* [MODIFY] `.specify/feature.json`
* [NEW] `specs/003-lake-garda-itinerary-refresh/research.md`
* [NEW] `specs/003-lake-garda-itinerary-refresh/data-model.md`
* [NEW] `specs/003-lake-garda-itinerary-refresh/quickstart.md`
* [NEW] `specs/003-lake-garda-itinerary-refresh/e2e-target-env-plan.md`

## 5. Verification & Testing Plan

* **Unit:** `npm test -- stores/tripStore.test.ts`
* **Lint:** `npm run lint`
* **E2E:** `npx playwright test e2e/step4h.smoke.spec.ts e2e/step18.target-bank-day-picker.smoke.spec.ts`
* **Build:** `npm run build`
* **Post-deploy:** smoke on https://tripiagent.vercel.app/itinerary

## Constitution Check

- No server DB; static seed data only — PASS
- No client API keys — PASS
- Zod/API unchanged — PASS
