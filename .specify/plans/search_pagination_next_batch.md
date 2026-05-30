# Implementation Plan: Search Results Pagination ("Next Batch")

To improve discovery in the Attraction & Dining Search component, we will transition the results listing from a static slice of 5 to a dynamic progressive listing ("Next Batch" pagination). 

Instead of discarding all results beyond the top 5, we will store the full list of search results returned from `/api/places` and render a custom **"Show More Results"** action button. This button will progressively load the next batch of 5 results at a time.

---

## Proposed Changes

### Component: AttractionSearch
Modify [`components/AttractionSearch.tsx`](file:///C:/TripiAgent/components/AttractionSearch.tsx):

1. **State Addition:**
   * Introduce a new state `allResults: PlaceDetail[]` to store the complete filtered array (up to 20 items) returned by the Google Places backend query.
   * Introduce `visibleCount: number` to track the current pagination offset (defaulting to 5).
2. **Derive Results List:**
   * Remove the `results` state to avoid redundant state sync. Instead, derive the currently rendered results list inline from the state variables:
     ```typescript
     const results = allResults.slice(0, visibleCount);
     ```
3. **Trigger Updates:**
   * In `fetchPlacesNearCoords`, replace `setResults(filtered.slice(0, 5))` with:
     ```typescript
     setAllResults(filtered);
     setVisibleCount(5);
     ```
4. **Interactive Pagination UI:**
   * Render a **"Show More Results"** button at the bottom of the results card list whenever `allResults.length > visibleCount`.
   * The button should use Stitch styling: borders matching `border-outline-variant/30`, green text matching `#006400` / `#86df72`, an animated `ChevronDown` icon, and a counter showing `(Showing X of Y)`.
   * Bind the `onClick` handler of this button to increment `visibleCount` by 5:
     ```typescript
     const handleLoadMore = () => {
       setVisibleCount((prev) => Math.min(prev + 5, allResults.length));
     };
     ```

---

## Verification Plan

### Automated Tests
- Create a new Playwright smoke test `e2e/step16.smoke.spec.ts` asserting:
  1. Performing a search displays the first 5 results.
  2. The "Show More Results" button displays showing the correct `(Showing 5 of X)` count badge.
  3. Clicking "Show More Results" increments the count to 10 and displays additional results cards.
  4. The button hides automatically once all items are visible.

### Manual Verification
- Deploy to local port 9001 and perform a dining search in Venice. Verify pagination expands the list seamlessly.
