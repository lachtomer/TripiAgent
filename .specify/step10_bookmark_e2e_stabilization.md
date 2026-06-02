# Step 10 Bookmark E2E Stabilization (Task 5.4)

## Problem
`e2e/step10.smoke.spec.ts` test 1 flakes under parallel workers (2 locally): bookmark on Home does not appear in Saved Attractions on Itinerary.

## Root causes
1. Selector `.snap-start` matches loading skeleton cards before real place cards render.
2. Live `/api/places` responses are nondeterministic; first card name varies.
3. Zustand persist may not flush to `localStorage` before client navigation to `/itinerary`.
4. `SavedAttractionsList` renders a hydration placeholder until client rehydrate completes.

## Fix
1. Mock `/api/places` with deterministic top picks (`place1` = Colosseum).
2. Clear `tripiagent-trip-storage` before test for isolation.
3. Target `#bookmark-place1` instead of CSS class chains.
4. Wait for `localStorage` to contain saved Colosseum before navigating.
5. Add `data-testid="saved-attractions-ready"` when list is hydrated.
6. Assert saved item via `[data-attraction-name="Colosseum"]`.

## Acceptance
- `npx playwright test e2e/step10.smoke.spec.ts` passes 4/4 on first run with `--workers=2` (3 consecutive runs).
