/**
 * Step 19 — Lake Garda teen itinerary refresh smoke
 * Run: npx playwright test e2e/step19.itinerary-garda-refresh.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

test.describe("Step 19 — Garda itinerary refresh", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
  });

  test("1. Default itinerary shows Gardaland and Monte Baldo days", async ({ page }) => {
    await expect(page.locator("text=Jun 30 – Gardaland")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=Jul 1 – Monte Baldo Nature Day")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Jul 3 – Shopping & Milan Transition")).toBeVisible({ timeout: 10000 });
  });

  test("2. Target Bank lists Serravalle outlet", async ({ page }) => {
    // Open the Day 1 picker sheet to inspect the bank (data-attraction-name is on /locations, not /itinerary)
    await expect(page.getByTestId("add-from-target-bank-day-1")).toBeVisible({ timeout: 15000 });
    await page.getByTestId("add-from-target-bank-day-1").click();
    await expect(page.getByTestId("target-bank-picker-sheet-day-1")).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('[data-testid^="target-bank-picker-row-"]').filter({ hasText: "Serravalle" })
    ).toBeVisible({ timeout: 15000 });
  });
});
