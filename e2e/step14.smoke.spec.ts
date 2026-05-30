/**
 * Step 14 E2E test — View All Navigation
 * Run with: npx playwright test e2e/step14.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 14 — View All Navigation", () => {
  test("1. Click 'View all' and verify it scrolls/focuses the attraction search input", async ({ page }) => {
    // 1. Go to Home page
    await page.goto(BASE);
    await expect(page.locator("text=Explore & Search Italy")).toBeVisible();

    // 2. Locate and check the search input is not focused initially
    const searchInput = page.locator("#attraction-search-input");
    await expect(searchInput).not.toBeFocused();

    // 3. Click the View all button
    const viewAllBtn = page.locator("#view-all-nearby");
    await expect(viewAllBtn).toBeVisible();
    await viewAllBtn.click();

    // 4. Verify that the search input becomes focused
    await expect(searchInput).toBeFocused();
  });
});
