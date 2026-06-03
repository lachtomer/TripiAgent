/**
 * Step 15 E2E test — Hebrew & RTL Support (feature 008: Hebrew-only UI)
 * Run with: npx playwright test e2e/step15.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 15 — Hebrew & RTL Support", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("1. Verify Hebrew RTL is active by default and translations load correctly", async ({ page }) => {
    test.setTimeout(45000);
    // 1. Go to Home page
    await page.goto(BASE);
    await page.waitForLoadState("domcontentloaded");

    // 2. Verify document is Hebrew RTL without any toggle click
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "he", { timeout: 10000 });
    await expect(html).toHaveAttribute("dir", "rtl");

    // Translation readiness marker must be present with he locale
    await expect(page.locator('[data-testid="translations-loaded"][data-locale="he"]')).toBeAttached({ timeout: 5000 });

    // No language toggle button should exist
    await expect(page.locator("[data-testid='lang-toggle']")).not.toBeAttached();

    // Check investigate section is present
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Itinerary page and verify Hebrew translations and LTR isolation
    const itineraryNav = page.locator("#nav-link-calendar");
    await itineraryNav.click({ timeout: 15000 });
    await page.waitForURL("**/itinerary", { timeout: 20000 });
    await page.waitForLoadState("domcontentloaded");

    // Check Hebrew labels in Itinerary Card
    await expect(page.getByText("תאריך התחלת הטיול:")).toBeVisible({ timeout: 15000 });

    // Verify activity row exists and LTR details isolation is preserved
    const firstActivityRow = page.locator("#activity-row-a1");
    await expect(firstActivityRow).toBeVisible();

    const activityHeader = page.locator("#activity-header-a1");
    await expect(activityHeader).toHaveClass(/text-start/);
    await activityHeader.click();

    const details = page.locator("#activity-details-a1 p").first();
    await expect(details).toHaveAttribute("dir", "ltr");
    await expect(details).toHaveClass(/text-start/);

    // 4. Verify Logistics Card inputs are LTR-isolated
    const logisticsHeader = page.locator("text=לוגיסטיקה והזמנות");
    await expect(logisticsHeader).toBeVisible();
    await logisticsHeader.click();

    const flightInput = page.locator("#logistics-flight-tlv-mxp");
    await expect(flightInput).toHaveAttribute("dir", "ltr");
    await expect(flightInput).toHaveClass(/text-start/);

    // 5. Navigate to Packing page and verify Hebrew categories
    const packNav = page.locator("#nav-link-pack");
    await packNav.click();
    await page.waitForURL("**/pack");
    await expect(page.getByText("רשימת אריזה")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=חיוני").first()).toBeVisible();
  });
});
