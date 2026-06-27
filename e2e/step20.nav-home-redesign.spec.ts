/**
 * Step 20 E2E smoke test — Navigation Redesign & Home Screen
 * Run with: npx playwright test e2e/step20.nav-home-redesign.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs, seedTripMode } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 20 — Nav Redesign & Home Screen", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });
  test("1. Nav bar has exactly 6 tabs in planning mode", async ({ page }) => {
    await seedTripMode(page, "planning");
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    const tabs = page.locator("[id^='nav-link-']");
    await expect(tabs).toHaveCount(6);
    await expect(page.locator("#nav-link-pack")).toBeVisible();
  });

  test("1b. Nav bar hides Pack tab in in-trip mode", async ({ page }) => {
    await seedTripMode(page, "planning");
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await page.getByTestId("trip-mode-switcher").getByText("In-Trip (Traveling)").click();
    await expect(page.getByTestId(/today-planner/)).toBeVisible({ timeout: 10000 });
    const tabs = page.locator("[id^='nav-link-']");
    await expect(tabs).toHaveCount(5);
    await expect(page.locator("#nav-link-pack")).not.toBeVisible();
  });

  test("2. Home tab is active on /", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#nav-link-home")).toHaveAttribute("aria-current", "page");
  });

  test("3. All 6 tabs navigate to correct routes", async ({ page }) => {
    test.setTimeout(60000);
    await seedTripMode(page, "planning");
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");

    const routes: Array<[string, string]> = [
      ["#nav-link-calendar",  "/itinerary"],
      ["#nav-link-chat",      "/chat"],
      ["#nav-link-pack",      "/pack"],
      ["#nav-link-locations", "/locations"],
      ["#nav-link-bookings",  "/bookings"],
    ];

    for (const [selector, expectedPath] of routes) {
      const tab = page.locator(selector);
      await tab.scrollIntoViewIfNeeded();
      await expect(tab).toBeVisible({ timeout: 10000 });
      await tab.click();
      await expect(page).toHaveURL(new RegExp(`${expectedPath.replace("/", "\\/")}$`), {
        timeout: 20000,
      });
      await page.waitForLoadState("domcontentloaded");
    }

    await page.locator("#nav-link-home").click();
    await page.waitForURL(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
  });

  test("4. Active Route Map visible on home", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='active-route-map']")).toBeVisible({ timeout: 10000 });
  });

  test("6. Investigate section visible on home", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });
  });

  test("7. Investigate toggle switches between Target and Around Me", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");

    const targetBtn = page.locator("[data-testid='investigate-target-btn']");
    const aroundBtn = page.locator("[data-testid='investigate-aroundme-btn']");
    await expect(targetBtn).toBeVisible({ timeout: 10000 });
    await expect(aroundBtn).toBeVisible({ timeout: 10000 });

    await aroundBtn.click();
    await expect(aroundBtn).toHaveClass(/bg-\[#006400\]|bg-\[#86df72\]/, { timeout: 5000 });

    await targetBtn.click();
    await expect(targetBtn).toHaveClass(/bg-\[#006400\]|bg-\[#86df72\]/, { timeout: 5000 });
  });

  test("8. Locations page loads with saved attractions list", async ({ page }) => {
    await page.goto(`${BASE}/locations`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='saved-attractions-ready']")).toBeVisible({ timeout: 10000 });
  });

  test("9. Bookings page loads with logistics card", async ({ page }) => {
    await page.goto(`${BASE}/bookings`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='bookings-page']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Logistics & Bookings").first()).toBeVisible({ timeout: 5000 });
  });
});
