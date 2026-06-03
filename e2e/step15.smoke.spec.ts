/**

 * Step 15 E2E test — English UI & LTR (feature 009: English-only chrome)

 * Run with: npx playwright test e2e/step15.smoke.spec.ts

 */

import { test, expect } from "@playwright/test";

import { signInAs } from "./helpers/authFixture";



const BASE = "http://localhost:9001";



test.describe("Step 15 — English UI & LTR", () => {

  test.beforeEach(async ({ page }) => {

    await signInAs(page);

  });



  test("1. Verify English LTR is active by default and translations load correctly", async ({ page }) => {

    test.setTimeout(45000);

    await page.goto(BASE);

    await page.waitForLoadState("domcontentloaded");



    const html = page.locator("html");

    await expect(html).toHaveAttribute("lang", "en", { timeout: 10000 });

    await expect(html).toHaveAttribute("dir", "ltr");



    await expect(page.locator('[data-testid="translations-loaded"][data-locale="en"]')).toBeAttached({

      timeout: 5000,

    });



    await expect(page.locator("[data-testid='lang-toggle']")).not.toBeAttached();



    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });



    const itineraryNav = page.locator("#nav-link-calendar");

    await itineraryNav.click({ timeout: 15000 });

    await page.waitForURL("**/itinerary", { timeout: 20000 });

    await page.waitForLoadState("domcontentloaded");



    await expect(page.getByText("Trip Start Date:")).toBeVisible({ timeout: 15000 });



    const firstActivityRow = page.locator("#activity-row-a1");

    await expect(firstActivityRow).toBeVisible();



    const activityHeader = page.locator("#activity-header-a1");

    await expect(activityHeader).toHaveClass(/text-start/);

    await activityHeader.click();



    const details = page.locator("#activity-details-a1 p").first();

    await expect(details).toHaveAttribute("dir", "ltr");

    await expect(details).toHaveClass(/text-start/);



    const bookingsNav = page.locator("#nav-link-bookings");

    await bookingsNav.click();

    await page.waitForURL("**/bookings", { timeout: 20000 });

    await page.waitForLoadState("domcontentloaded");



    const logisticsHeader = page.getByText("Logistics & Bookings", { exact: true }).first();

    await expect(logisticsHeader).toBeVisible({ timeout: 15000 });

    await logisticsHeader.click();



    const flightInput = page.locator("#logistics-flight-tlv-mxp");

    await expect(flightInput).toBeVisible({ timeout: 10000 });

    await expect(flightInput).toHaveAttribute("dir", "ltr");

    await expect(flightInput).toHaveClass(/text-start/);



    const packNav = page.locator("#nav-link-pack");

    await packNav.click();

    await page.waitForURL("**/pack");

    await expect(page.getByText("Packing Checklist")).toBeVisible({ timeout: 15000 });

    await expect(page.locator("text=Essentials").first()).toBeVisible();

  });

});


