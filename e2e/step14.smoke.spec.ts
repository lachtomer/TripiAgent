/**
 * Step 14 E2E test — View All Navigation
 * Run with: npx playwright test e2e/step14.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 14 — View All Navigation", () => {
  test("1. Investigate section shows search input; search focuses correctly", async ({ page }) => {
    // 1. Go to Home page
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // 2. Locate and check the search input is not focused initially
    const searchInput = page.locator("#attraction-search-input");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await expect(searchInput).not.toBeFocused();

    // 3. Click the search input to focus it
    await searchInput.click();

    // 4. Verify that the search input becomes focused
    await expect(searchInput).toBeFocused();
  });
});
