/**
 * Step 17 E2E test — Checklist i18n & Adjustable Search Radius
 * Run with: npx playwright test e2e/step17.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 17 — Checklist i18n & Search Radius E2E Smoke Tests", () => {
  test("1. Verify Hebrew locale updates Trip Essentials Checklist text and dir attribute", async ({ page }) => {
    await page.goto(`${BASE}/itinerary`);
    await page.waitForLoadState("networkidle");

    // 1. Verify English defaults
    await expect(page.locator("text=Trip Essentials Checklist")).toBeVisible();
    await expect(page.locator("text=Passports & Flights")).toBeVisible();

    // 2. Toggle to Hebrew
    const toggleBtn = page.locator("#lang-toggle-btn");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // 3. Verify Hebrew translations load
    await expect(page.locator("text=רשימת חיוני נסיעה")).toBeVisible();
    await expect(page.locator("text=דרכונים וטיסות")).toBeVisible();

    // 4. Verify card dir attribute is updated to rtl
    const checklistHeader = page.locator("text=רשימת חיוני נסיעה");
    const checklistCard = checklistHeader.locator("xpath=ancestor::div[contains(@class, 'bg-card')][1]");
    await expect(checklistCard).toHaveAttribute("dir", "rtl");
  });

  test("2. Verify adjustable search radius chips exist and update request parameters", async ({ page }) => {
    // Mock Geocode API route
    await page.route("**/api/geocode*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          lat: 45.4384,
          lng: 10.9916,
          cityName: "Verona",
        }),
      });
    });

    // Mock Places API route
    const requestedRadii: string[] = [];
    await page.route("**/api/places*", async (route) => {
      const url = new URL(route.request().url());
      const radius = url.searchParams.get("radius");
      if (radius) requestedRadii.push(radius);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            place_id: "place-1",
            name: "Test Spot 1",
            rating: 4.5,
            formatted_address: "123 Main St, Italy",
          }
        ]),
      });
    });

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    // Verify default radius buttons are present
    const radius5Btn = page.locator("#search-radius-5km");
    await expect(radius5Btn).toBeVisible();

    const radius10Btn = page.locator("#search-radius-10km");
    await expect(radius10Btn).toBeVisible();

    // Type query
    const searchInput = page.locator("#attraction-search-input");
    await searchInput.fill("Verona");

    // Submit search
    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled();
    await searchBtn.click();

    // Wait for the first request to be observed
    await expect.poll(() => requestedRadii.includes("5000"), { timeout: 15000 }).toBeTruthy();

    // Click 10 KM button and trigger a search to assert the updated request radius
    await expect(searchBtn).toBeEnabled();
    await radius10Btn.click();
    await searchBtn.click();
    await expect.poll(() => requestedRadii.includes("10000"), { timeout: 15000 }).toBeTruthy();

    // Click 50 KM button and trigger a search to assert the updated request radius
    const radius50Btn = page.locator("#search-radius-50km");
    await expect(searchBtn).toBeEnabled();
    await radius50Btn.click();
    await searchBtn.click();
    await expect.poll(() => requestedRadii.includes("50000"), { timeout: 15000 }).toBeTruthy();
  });
});
