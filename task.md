# Task Checklist: Search Results Pagination ("Next Batch")

## 1. Implement Pagination State & Logic
- [x] Add state variables `allResults` and `visibleCount` in `components/AttractionSearch.tsx`
- [x] Derive the rendering list `results` inline: `const results = allResults.slice(0, visibleCount);`
- [x] Update `fetchPlacesNearCoords` to save the full filtered array and reset `visibleCount` to 5
- [x] Handle empty list checks and errors using the derived `allResults` rather than `results`

## 2. Interactive Pagination UI
- [x] Render a "Show More Results" button at the bottom of the list when `allResults.length > visibleCount`
- [x] Style the button using the Stitch layout constraints (outlined border, primary green text, chevron-down icon)
- [x] Bind `onClick` handler to increment `visibleCount` by 5 (capped at `allResults.length`)

## 3. Verification & Testing
- [x] Create E2E test `e2e/step16.smoke.spec.ts` asserting pagination behavior
- [x] Verify unit tests and lint checks run cleanly (`npm run lint && npm run test`)
- [x] Verify production compilation (`npm run build`)
