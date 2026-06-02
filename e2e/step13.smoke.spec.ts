/**
 * Step 13 E2E test — Explore & Search Precision & UX Upgrades
 * Run with: npx playwright test e2e/step13.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { mockMilanRestaurantSearch } from "./helpers/apiMocks";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 13 — Explore & Search Precision & UX Upgrades", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. Parse 'Pizza in Milan', query places, check warning badge, and direct timeline bind", async ({ page }) => {
    test.setTimeout(60000);
    await mockMilanRestaurantSearch(page);

    // 1. Go to Home page and wait for Investigate section to load
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // 2. Type 'Pizza in Milan' in search input
    const searchInput = page.locator("#attraction-search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Pizza in Milan");

    // 3. Click Dining category filter
    const diningBtn = page.locator("button:has-text('Dining')");
    await diningBtn.click();

    // 4. Click Search — wait for button to be enabled first (depends on store hydration)
    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled({ timeout: 10000 });
    await searchBtn.click();
    
    // Wait for the loading spinner/skeletons to disappear and result cards to render
    const firstResultCard = page.locator("div.group.animate-in").first();
    await expect(firstResultCard).toBeVisible({ timeout: 15000 });

    // 5. Verify the place details include the ZTL Area C warning badge
    const ztlBadge = firstResultCard.locator("text=ZTL Area C");
    await expect(ztlBadge).toBeVisible();

    // Get the name of the place for verification
    const placeName = await firstResultCard.locator("h4").textContent();
    expect(placeName).toBeTruthy();
    console.log(`  → Direct-scheduling place: ${placeName}`);

    // 6. Click the direct-add calendar button
    const directAddBtn = firstResultCard.locator("[id^='direct-add-']").first();
    await expect(directAddBtn).toBeVisible();
    await directAddBtn.click();

    // 7. Select Day 2 in the scheduling dropdown
    const day2Option = page.locator("[id^='direct-add-day-2-']").first();
    await expect(day2Option).toBeVisible();
    await day2Option.click();

    // 8. Verify the Toast alert displays confirming addition
    await expect(page.getByTestId("toast-message")).toContainText(`Added "${placeName}" to Day 2`, { timeout: 10000 });

    // 9. Navigate to Itinerary page and verify the activity is listed under Day 2
    await page.goto(`${BASE}/itinerary`);
    await page.waitForLoadState("domcontentloaded");
    const day2Card = page.locator("#day-card-2");
    await expect(day2Card.locator(`text=${placeName}`).first()).toBeVisible({ timeout: 15000 });
  });
});
