/**
 * Step 18 — Target Bank day picker & activity-nearby discovery
 * Run: npx playwright test e2e/step18.target-bank-day-picker.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { mockNearbyTopPicks } from "./helpers/apiMocks";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

const SEED_STATE = {
  state: {
    savedAttractions: [
      {
        id: "bank-colosseum",
        name: "Colosseum",
        locationName: "Rome",
        lat: 41.8902,
        lng: 12.4922,
        upvotes: [],
        downvotes: [],
      },
    ],
    itinerary: null,
    tripStartDate: "2026-06-25",
  },
  version: 0,
};

test.describe("Step 18 — Target bank day picker & activity nearby", () => {
  test.beforeEach(async ({ page }) => {
    await mockNearbyTopPicks(page);
    await page.route("**/api/geocode**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lat: 41.8902, lng: 12.4922, cityName: "Rome" }),
      });
    });
    await page.addInitScript(
      ([key, seed]) => {
        localStorage.setItem(key, JSON.stringify(seed));
      },
      [STORAGE_KEY, SEED_STATE] as const
    );
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-attraction-name="Colosseum"]')).toBeVisible({ timeout: 15000 });
  });

  test("1. Add from Target Bank picker schedules activity on chosen day", async ({ page }) => {
    test.setTimeout(45000);
    await expect(page.getByTestId("add-from-target-bank-day-1")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("add-from-target-bank-day-1").click();
    await expect(page.getByTestId("target-bank-picker-sheet-day-1")).toBeVisible();
    await expect(page.getByTestId("target-bank-picker-row-bank-colosseum")).toBeVisible({ timeout: 15000 });
    await page.getByTestId("target-bank-picker-row-bank-colosseum").click();
    await page.getByTestId("target-bank-picker-confirm-day-1").click();

    await expect(page.getByText("Colosseum", { exact: true }).first()).toBeVisible({ timeout: 10000 });
  });

  test("2. Explore nearby on expanded activity shows results", async ({ page }) => {
    const firstActivity = page.locator("[id^='activity-header-']").first();
    await firstActivity.click();

    const exploreBtn = page.locator("[data-testid^='explore-nearby-']").first();
    await expect(exploreBtn).toBeVisible({ timeout: 10000 });
    await exploreBtn.click();

    const panel = page.locator("[data-testid^='activity-nearby-panel-']").first();
    await expect(panel).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid^='activity-nearby-results-']").first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Colosseum").first()).toBeVisible();
  });
});
