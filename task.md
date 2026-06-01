# Task Checklist: Italy Trip Bank Feature (Place Details + Weather Translation)

## Phase 1: API Schemas & Route Translations
- [x] Task 1.1: Update Zod validation schemas in `lib/schemas.ts` to include optional `locale` enum.
- [x] Task 1.2: Implement translation interceptor and Gemini batch translator inside `/api/weather` and `/api/places` routes.
- [x] Task 1.3: Add/update Vitest unit test coverage asserting translation payload structures.

## Phase 2: Frontend Integrations
- [x] Task 2.1: Pass dynamic `locale` query parameters from the `useTranslation()` state inside `<LocationCard />`.
- [x] [x] Task 2.2: Pass dynamic `locale` query parameters from `<NearbyPlacesSection />` and `<AttractionSearch />`.
- [x] [x] Task 2.3: Verify that changing the language dropdown correctly refetches the APIs with the updated `locale` values.

## Phase 3: Integration & E2E Validation
- [x] Task 3.1: Verify responsive layout alignments when Hebrew text is rendered in the place cards.
- [x] [x] Task 3.2: Create Playwright E2E smoke test `e2e/translation_details.smoke.spec.ts` asserting weather and place results appear in Hebrew on toggle.
- [x] [x] Task 3.3: Verify all unit, lint, build, and E2E tests pass cleanly.

## Phase 4: Italy Trip Bank Feature
- [x] Task 4.1: Add `placeCategoryEnum`, `placeSchema`, and `placesBatchSchema` to `lib/schemas.ts`.
- [x] Task 4.2: Implement POST `/api/bank/places` and GET `/api/bank/places` routes with validation and file‑based storage.
- [x] Task 4.3: Create `libs/aiParser.ts` utility that calls Gemini to parse itinerary text into `Place[]`.
- [x] Task 4.4: Add Zustand store `stores/bankStore.ts` (persisted to localStorage) with actions to load, add, and filter places.
- [x] Task 4.5: Build admin UI page `app/(admin)/bank/page.tsx` with textarea, “Generate Bank Entries” button, preview table, and submit to API.
- [x] Task 4.6: Update `components/PlaceCard.tsx` to show category badge and pre‑book button, using accent `#006400` and mobile‑first design.
- [x] [x] Task 4.7: Write unit tests for the new API routes (`tests/api/bank/places.test.ts`).
- [x] [x] Task 4.8: Write unit test for `libs/aiParser.ts` (`tests/util/aiParser.test.ts`).
- [ ] Task 4.9: Add Playwright smoke test for itinerary import (`e2e/bank/itinerary_import.smoke.spec.ts`).
- [ ] Task 4.10: Update `README.md` and `DESIGN.md` with “Bank” section and design notes.
- [ ] Task 4.11: Run full test suite, lint, and build; verify no API keys leak to client bundle.

