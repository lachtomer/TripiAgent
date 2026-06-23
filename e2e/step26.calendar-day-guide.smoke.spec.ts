/**
 * Step 26 — Calendar Day Guide on /itinerary
 * Run: npx playwright test e2e/step26.calendar-day-guide.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

test.describe("Step 26 — Calendar Day Guide", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#trip-start-date", { timeout: 15000 });
  });

  test("1. Day 2 guide shows dual-option banner and both drive stops", async ({ page }) => {
    await expect(page.getByTestId("day-guide-2")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("day-guide-spot-bergamo-piazza-vecchia")).not.toBeVisible();

    await page.locator("#day-guide-toggle-2").click();
    await expect(page.getByTestId("day-guide-banner-2")).toContainText("Pick one drive stop");
    await expect(page.getByTestId("day-guide-option-option-a-virgilio")).toBeVisible();
    await expect(page.getByTestId("day-guide-option-option-b-bergamo")).toBeVisible();
    await expect(page.getByTestId("day-guide-option-option-a-virgilio")).toContainText(
      "Option A: Lungolago Virgilio"
    );
    await expect(page.getByTestId("day-guide-option-option-b-bergamo")).toContainText(
      "Option B: Bergamo Upper Town"
    );
    await expect(page.getByTestId("day-guide-spot-bergamo-piazza-vecchia")).toBeVisible({
      timeout: 5000,
    });

    const foodLink = page
      .getByTestId("day-guide-food-item-food-la-bruschetta")
      .getByTestId("place-name-link-food-la-bruschetta");
    await expect(foodLink).toBeVisible();
    await expect(foodLink).toHaveAttribute("href", /^https:\/\//);

    await page.locator("#day-guide-toggle-2").click();
    await expect(page.getByTestId("day-guide-spot-bergamo-piazza-vecchia")).not.toBeVisible();
  });

  test("2. Day 6 shows dual-option banner and both option blocks", async ({ page }) => {
    await page.locator("#day-card-6").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("day-guide-6")).toBeVisible({ timeout: 15000 });

    await page.locator("#day-guide-toggle-6").click();
    await expect(page.getByTestId("day-guide-banner-6")).toContainText("Group vote");
    await expect(page.getByTestId("day-guide-option-option-a-verona")).toBeVisible();
    await expect(page.getByTestId("day-guide-option-option-b-baldo")).toBeVisible();
    await expect(page.getByTestId("day-guide-option-option-a-verona")).toContainText(
      "Option A: Verona"
    );
    await expect(page.getByTestId("day-guide-option-option-b-baldo")).toContainText(
      "Option B: Monte Baldo"
    );
  });
});
