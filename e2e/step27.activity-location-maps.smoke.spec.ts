/**
 * Step 27 — Activity location pill opens Google Maps (not AI chat)
 * Run: npx playwright test e2e/step27.activity-location-maps.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";
const STORAGE_KEY = "tripiagent-trip-storage";

test.describe("Step 27 — Activity location maps link", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
    await page.addInitScript((key) => {
      localStorage.removeItem(key);
    }, STORAGE_KEY);
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#trip-start-date", { timeout: 15000 });
  });

  test("1. Location pill links to Google Maps search by place name", async ({ page }) => {
    await page.locator("#day-card-6").scrollIntoViewIfNeeded();
    await page.locator("#activity-header-a10").click();
    await expect(page.locator("#activity-details-a10")).toBeVisible({ timeout: 5000 });

    const locationLink = page.getByTestId("activity-location-link-a10");
    await expect(locationLink).toBeVisible();
    await expect(locationLink).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=Verona"
    );
    await expect(locationLink).toHaveAttribute("target", "_blank");
    await expect(locationLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(locationLink).toContainText("Verona");
  });

  test("2. Location pill does not navigate to chat; Ask AI Tips does", async ({ page, context }) => {
    await page.locator("#day-card-6").scrollIntoViewIfNeeded();
    await page.locator("#activity-header-a10").click();
    await expect(page.locator("#activity-details-a10")).toBeVisible({ timeout: 5000 });

    const locationLink = page.getByTestId("activity-location-link-a10");
    const [mapsPage] = await Promise.all([
      context.waitForEvent("page"),
      locationLink.click(),
    ]);
    await mapsPage.waitForLoadState("domcontentloaded");
    expect(mapsPage.url()).toContain("google.com/maps/search");
    expect(mapsPage.url()).toContain("query=Verona");
    await mapsPage.close();
    expect(page.url()).not.toContain("/chat");

    await page.locator("#ask-ai-link-a10").click();
    await expect(page).toHaveURL(`${BASE}/chat`, { timeout: 10000 });
  });
});
