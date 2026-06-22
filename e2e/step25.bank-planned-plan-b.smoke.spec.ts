/**
 * Step 25 — Target Bank Planned badge, sort/filter, Plan B panel
 * Run: npx playwright test e2e/step25.bank-planned-plan-b.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

test.describe("Step 25 — Planned bank & Plan B per day", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
  });

  test("1. Locations shows Planned badge, sort, and unplanned filter", async ({ page }) => {
    await page.goto(`${BASE}/locations`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("saved-attractions-ready")).toBeAttached({ timeout: 15000 });

    const gardaland = page.locator('[data-attraction-name="Gardaland"]');
    const movieland = page.locator('[data-attraction-name="Movieland Park"]');

    await expect(gardaland.getByTestId("bank-planned-badge")).toBeVisible({ timeout: 15000 });
    await expect(movieland.getByTestId("bank-planned-badge")).toHaveCount(0);

    const unplannedSection = page.getByTestId("bank-section-unplanned");
    const plannedSection = page.getByTestId("bank-section-planned");
    await expect(unplannedSection).toBeVisible();
    await expect(plannedSection).toBeVisible();
    await expect(movieland).toBeVisible();
    await expect(gardaland).toBeVisible();

    const movielandBox = await movieland.boundingBox();
    const gardalandBox = await gardaland.boundingBox();
    expect(movielandBox && gardalandBox && movielandBox.y < gardalandBox.y).toBeTruthy();

    const unplannedHeaderBox = await unplannedSection.boundingBox();
    const plannedHeaderBox = await plannedSection.boundingBox();
    expect(
      unplannedHeaderBox &&
        plannedHeaderBox &&
        movielandBox &&
        gardalandBox &&
        unplannedHeaderBox.y < movielandBox.y &&
        movielandBox.y < plannedHeaderBox.y &&
        plannedHeaderBox.y < gardalandBox.y
    ).toBeTruthy();

    await page.getByTestId("bank-filter-unplanned").click();
    await expect(gardaland).toHaveCount(0);
    await expect(movieland).toBeVisible();
  });

  test("2. Itinerary Day 3 Plan B adds rain backup activity", async ({ page }) => {
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#day-card-3")).toBeVisible({ timeout: 15000 });

    await page.getByTestId("plan-b-toggle-day-3").click();
    await expect(page.getByTestId("plan-b-panel-day-3")).toBeVisible();
    await expect(page.getByTestId("plan-b-option-bank-movieland")).toBeVisible();

    await page.getByTestId("plan-b-add-day-3-bank-movieland").click();
    await expect(
      page.locator("#day-card-3").getByText("Movieland Park", { exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  test("3. Planned row navigates to itinerary day anchor", async ({ page }) => {
    await page.goto(`${BASE}/locations`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("saved-attractions-ready")).toBeAttached({ timeout: 15000 });

    const gardalandHeader = page
      .locator('[data-attraction-name="Gardaland"]')
      .getByRole("button")
      .first();
    await expect(gardalandHeader).toBeVisible({ timeout: 15000 });
    await gardalandHeader.click();

    await expect(page).toHaveURL(/\/itinerary#day-card-5/, { timeout: 15000 });
    await expect(page.locator("#day-card-5")).toBeVisible();
  });
});
