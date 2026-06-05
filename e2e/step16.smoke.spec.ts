/**
 * Step 16 E2E test — Search Results Pagination ("Next Batch")
 * Run with: npx playwright test e2e/step16.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

// 12 mock places to test pagination (5 -> 10 -> 12)
const MOCK_PLACES = Array.from({ length: 12 }, (_, i) => ({
  place_id: `mock-place-${i + 1}`,
  name: `Mock Attraction ${i + 1}`,
  rating: 4.0 + (i % 10) * 0.1,
  open_now: true,
  distance: 100 * (i + 1),
  vicinity: `123 Italy St, Venice`,
  formatted_address: `123 Italy St, Venice`,
  address: `123 Italy St, Venice`,
}));

test.describe("Step 16 — Search Results Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. Verify 5 results are shown initially, clicking Show More loads next batch, then hides button", async ({ page }) => {
    // Mock the Places and Geocode APIs to keep the test offline-friendly and robust
    await page.route("**/api/geocode*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lat: 45.4408,
          lng: 12.3155,
          cityName: "Venice",
          formattedAddress: "Venice, Italy",
          placeTypes: ["locality", "political"],
          matchedName: "Venice",
        }),
      });
    });

    await page.route(/\/api\/places(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PLACES),
      });
    });

    // 1. Go to Home page
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // 2. Fill search input and submit
    const searchInput = page.locator("#attraction-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Venice");

    const searchBtn = page.locator("#attraction-search-btn");
    await searchBtn.click();

    // 3. Wait for results to render (semantic cards, not form layout)
    const resultCards = page.locator("[data-testid='investigate-section'] [data-place-id]");
    await expect(resultCards.first()).toBeVisible({ timeout: 10000 });

    // 4. Assert exactly 5 results are rendered initially
    await expect(resultCards).toHaveCount(5);

    // 5. Verify the "Show More Results" button is visible and shows the correct text
    const showMoreBtn = page.locator("#show-more-results-btn");
    await expect(showMoreBtn).toBeVisible();
    await expect(showMoreBtn).toContainText("Show More Results");
    await expect(showMoreBtn).toContainText("(Showing 5 of 12)");

    // 6. Click the button to load the next batch
    await showMoreBtn.click();

    // 7. Assert exactly 10 results are rendered now
    await expect(resultCards).toHaveCount(10);
    await expect(showMoreBtn).toContainText("(Showing 10 of 12)");

    // 8. Click again to load the final batch
    await showMoreBtn.click();

    // 9. Assert all 12 results are rendered, and the button is hidden
    await expect(resultCards).toHaveCount(12);
    await expect(showMoreBtn).not.toBeVisible();
  });
});
