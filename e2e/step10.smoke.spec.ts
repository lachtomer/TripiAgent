/**
 * Step 10 smoke test — Saved Attractions & Phase 2 Logistics
 * Run with: npx playwright test e2e/step10.smoke.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import { mockNearbyTopPicks } from "./helpers/apiMocks";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

async function waitForSavedAttractionInStorage(page: Page, name: string) {
  await page.waitForFunction(
    ([key, attractionName]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw) as { state?: { savedAttractions?: { name: string }[] } };
        const saved = parsed.state?.savedAttractions ?? [];
        return saved.some((item) => item.name === attractionName);
      } catch {
        return false;
      }
    },
    [STORAGE_KEY, name] as const,
    { timeout: 10000 }
  );
}

test.describe("Step 10 — Saved Attractions & Phase 2 Logistics", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. Bookmark a place from search results and verify it in Saved Attractions", async ({ page }) => {
    test.setTimeout(45000);

    await mockNearbyTopPicks(page);
    await page.goto(BASE);
    await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
    await page.reload({ waitUntil: "networkidle" });

    // Wait for investigate section to hydrate
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // Submit the pre-filled search
    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled({ timeout: 10000 });
    await searchBtn.click();

    const placeName = "Colosseum";
    const bookmarkBtn = page.locator("#search-bookmark-place1");
    await expect(bookmarkBtn).toBeVisible({ timeout: 15000 });
    console.log(`  → Bookmarking place: ${placeName}`);
    await bookmarkBtn.click();

    await expect(bookmarkBtn).toHaveAttribute(
      "aria-label",
      new RegExp(`Remove ${placeName}`),
      { timeout: 10000 }
    );

    await waitForSavedAttractionInStorage(page, placeName);

    await Promise.all([
      page.waitForURL(/\/itinerary/, { waitUntil: "domcontentloaded", timeout: 15000 }),
      page.locator("#nav-link-calendar").click(),
    ]);

    await expect(page.getByTestId("saved-attractions-ready")).toBeAttached({ timeout: 10000 });
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-attraction-name="Colosseum"]')).toBeVisible({ timeout: 10000 });
  });

  test("2. Add a custom POI and schedule it into the itinerary", async ({ page }) => {
    await page.goto(`${BASE}/itinerary`);
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible();

    const toggleFormBtn = page.locator("text=Add Custom Attraction");
    await toggleFormBtn.click();

    await page.fill("#custom-poi-name", "Limone Ferry Port");
    await page.fill("#custom-poi-location", "Limone");
    await page.fill("#custom-poi-notes", "Take the morning boat.");
    await page.click("#add-custom-poi-submit");

    await expect(page.locator("h4:has-text('Limone Ferry Port')")).toBeVisible();

    const select = page.locator("select").last();
    await select.selectOption("3");

    const itemContainer = page.locator('[data-attraction-name="Limone Ferry Port"]');
    const addToDayBtn = itemContainer.locator("button", { hasText: "Add to Day" });
    await addToDayBtn.click();

    await expect(page.locator("h4:has-text('Limone Ferry Port')")).toBeVisible();
  });

  test("3. Today Planner is visible and interactive on Home page", async ({ page }) => {
    await page.goto(BASE);
    await page.click("text=In-Trip (Traveling)");

    await expect(page.locator("text=Today's Planner")).toBeVisible();

    const daySelect = page.locator("select").first();
    await daySelect.selectOption("2");

    await expect(page.locator("text=Car Rental Pickup – Centauro")).toBeVisible();
  });

  test("4. Logistics card displays, updates, and persists state", async ({ page }) => {
    await page.goto(`${BASE}/bookings`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-testid='bookings-page']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Logistics & Bookings")).toBeVisible({ timeout: 10000 });

    await page.fill("#logistics-flight-tlv-mxp", "LY381-E2E");
    const ztlCheckbox = page.locator("#logistics-milan-ztl-paid");
    await ztlCheckbox.setChecked(true);

    await page.click("#logistics-save-button");
    await expect(page.locator("text=Booking Details Saved")).toBeVisible();

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Wait for Zustand to rehydrate and sync into local form state (toHaveValue retries internally)
    await expect(page.locator("#logistics-flight-tlv-mxp")).toHaveValue("LY381-E2E", { timeout: 10000 });
    await expect(ztlCheckbox).toBeChecked({ timeout: 5000 });
  });
});
