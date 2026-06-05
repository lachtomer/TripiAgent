/**
 * Step 24 E2E — Attraction name search (Feature 010)
 * Run with: npx playwright test e2e/step24.attraction-name-search.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import {
  mockGardalandTextSearch,
  mockGardalandTextSearchEmpty,
  mockVeronaLocationBrowse,
} from "./helpers/apiMocks";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 24 — Attraction name search", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. Gardaland name search returns a result via text API", async ({ page }) => {
    test.setTimeout(60000);
    await mockGardalandTextSearch(page);

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator("#attraction-search-input");
    await searchInput.fill("Gardaland");

    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled({ timeout: 10000 });
    await searchBtn.click();

    await expect(page.locator("[data-place-id]").filter({ hasText: "Gardaland" })).toBeVisible({
      timeout: 15000,
    });
  });

  test("2. Verona locality browse uses nearby API, not text search", async ({ page }) => {
    test.setTimeout(60000);
    const textSearchUrls: string[] = [];

    await page.route("**/api/places/text**", async (route) => {
      textSearchUrls.push(route.request().url());
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "No places found for this name" }),
      });
    });

    await mockVeronaLocationBrowse(page);

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator("#attraction-search-input");
    await searchInput.fill("Verona");

    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled({ timeout: 10000 });
    await searchBtn.click();

    await expect(page.locator("[data-place-id]").filter({ hasText: "Arena di Verona" })).toBeVisible({
      timeout: 15000,
    });
    expect(textSearchUrls).toHaveLength(0);
  });

  test("3. Zero text matches show search-empty-hint", async ({ page }) => {
    test.setTimeout(60000);
    await mockGardalandTextSearchEmpty(page);

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    const searchInput = page.locator("#attraction-search-input");
    await searchInput.fill("Gardaland");

    const searchBtn = page.locator("#attraction-search-btn");
    await expect(searchBtn).toBeEnabled({ timeout: 10000 });
    await searchBtn.click();

    await expect(page.locator("[data-testid='search-empty-hint']")).toBeVisible({ timeout: 15000 });
  });
});
