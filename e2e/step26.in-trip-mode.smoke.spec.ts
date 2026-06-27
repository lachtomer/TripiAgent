/**
 * Step 26 E2E — In-trip mode: hide planning switcher + GPS for Nearby
 * Run with: npx playwright test e2e/step26.in-trip-mode.smoke.spec.ts
 */
import { test, expect, Page } from "@playwright/test";
import { signInAs, seedTripMode } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

async function grantLakeGardaLocation(page: Page) {
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 45.605, longitude: 10.521 });
}

test.describe("Step 26 — In-trip mode UX", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. In-trip hides planning mode switcher and shows badge", async ({ page }) => {
    await seedTripMode(page, "in-trip");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("in-trip-badge")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("trip-mode-switcher")).not.toBeVisible();
    await expect(page.getByText("Planning (At Home)")).not.toBeVisible();
  });

  test("2. Planning mode still shows mode switcher", async ({ page }) => {
    await seedTripMode(page, "planning");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("trip-mode-switcher")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("in-trip-badge")).not.toBeVisible();
  });

  test("3. In-trip defaults Investigate to Nearby when GPS granted", async ({ page }) => {
    await grantLakeGardaLocation(page);
    await seedTripMode(page, "in-trip");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    const aroundBtn = page.getByTestId("investigate-aroundme-btn");
    await expect(aroundBtn).toBeVisible({ timeout: 10000 });
    await expect(aroundBtn).toHaveClass(/bg-\[#006400\]|bg-\[#86df72\]/, { timeout: 5000 });
  });

  test("4. Switching to in-trip requests location banner when denied", async ({ page }) => {
    await seedTripMode(page, "planning");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    await page.getByTestId("trip-mode-switcher").getByText("In-Trip (Traveling)").click();
    await expect(page.getByTestId("in-trip-badge")).toBeVisible({ timeout: 5000 });

    const banner = page
      .getByText("Enable location for better local picks")
      .or(page.getByText("Location access denied"));
    await expect(banner.first()).toBeVisible({ timeout: 10000 });
  });
});
