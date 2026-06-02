/**
 * Step 20 E2E smoke test — Navigation Redesign & Home Screen
 * Run with: npx playwright test e2e/step20.nav-home-redesign.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 20 — Nav Redesign & Home Screen", () => {
  test("1. Nav bar has exactly 6 tabs", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    const tabs = page.locator("[id^='nav-link-']");
    await expect(tabs).toHaveCount(6);
  });

  test("2. Home tab is active on /", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#nav-link-home")).toHaveAttribute("aria-current", "page");
  });

  test("3. All 6 tabs navigate to correct routes", async ({ page }) => {
    test.setTimeout(60000);
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
      await page.locator(selector).click();
      await page.waitForURL(`**${expectedPath}`, { waitUntil: "domcontentloaded", timeout: 20000 });
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

  test("5. Map card expands and collapses", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("networkidle");
    const mapCard = page.locator("[data-testid='active-route-map']");
    await expect(mapCard).toBeVisible({ timeout: 10000 });

    await mapCard.click();
    const closeBtn = page.locator("button[aria-label*='Close'], button[aria-label*='סגור']").first();
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    await closeBtn.click();
    await expect(closeBtn).not.toBeVisible({ timeout: 5000 });
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

  test("9. Bookings page loads with placeholder", async ({ page }) => {
    await page.goto(`${BASE}/bookings`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='bookings-page']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=ניירות").first()).toBeVisible({ timeout: 5000 });
  });
});
