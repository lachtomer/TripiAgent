/**

 * Step 17 E2E test — Checklist i18n & Adjustable Search Radius

 * Feature 009: English-only UI — no language toggle; English is always active.

 * Run with: npx playwright test e2e/step17.smoke.spec.ts

 */

import { test, expect } from "@playwright/test";

import { signInAs } from "./helpers/authFixture";



const BASE = "http://localhost:9001";



test.describe("Step 17 — Checklist i18n & Search Radius E2E Smoke Tests", () => {

  test.beforeEach(async ({ page }) => {

    await signInAs(page);

  });



  test("1. Verify Reservations checklist renders in English by default with correct dir attribute", async ({ page }) => {

    await page.goto(`${BASE}/bookings`);

    await page.waitForLoadState("networkidle");



    await expect(page.getByText("Reservations to Verify", { exact: true })).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Portable CO/Smoke Detector", { exact: true })).toBeVisible();



    const checklistHeader = page.getByText("Reservations to Verify", { exact: true });

    const checklistCard = checklistHeader.locator("xpath=ancestor::div[contains(@class, 'bg-card')][1]");

    await expect(checklistCard).toHaveAttribute("dir", "ltr");



    await expect(page.locator("[data-testid='lang-toggle']")).not.toBeAttached();

  });



  test("2. Verify adjustable search radius chips exist and update request parameters", async ({ page }) => {

    await page.route("**/api/geocode*", async (route) => {

      await route.fulfill({

        status: 200,

        contentType: "application/json",

        body: JSON.stringify({

          lat: 45.4384,

          lng: 10.9916,

          cityName: "Verona",

          matchedName: "Verona",

          placeTypes: ["locality", "political"],

        }),

      });

    });



    const requestedRadii: string[] = [];

    await page.route("**/api/places?**", async (route) => {

      const url = new URL(route.request().url());

      if (url.pathname.includes("/places/text")) {
        await route.continue();
        return;
      }

      const radius = url.searchParams.get("radius");

      if (radius) requestedRadii.push(radius);

      await route.fulfill({

        status: 200,

        contentType: "application/json",

        body: JSON.stringify([

          {

            place_id: "place-1",

            name: "Test Spot 1",

            rating: 4.5,

            formatted_address: "123 Main St, Italy",

          },

        ]),

      });

    });



    await page.goto(BASE);

    await page.waitForLoadState("networkidle");



    const radius5Btn = page.locator("#search-radius-5km");

    await expect(radius5Btn).toBeVisible();



    const radius10Btn = page.locator("#search-radius-10km");

    await expect(radius10Btn).toBeVisible();



    const searchInput = page.locator("#attraction-search-input");

    await searchInput.fill("Verona");



    const searchBtn = page.locator("#attraction-search-btn");

    await expect(searchBtn).toBeEnabled();

    await searchBtn.click();



    await expect.poll(() => requestedRadii.includes("5000"), { timeout: 15000 }).toBeTruthy();



    await expect(searchBtn).toBeEnabled();

    await radius10Btn.click();

    await searchBtn.click();

    await expect.poll(() => requestedRadii.includes("10000"), { timeout: 15000 }).toBeTruthy();



    const radius50Btn = page.locator("#search-radius-50km");

    await expect(searchBtn).toBeEnabled();

    await radius50Btn.click();

    await searchBtn.click();

    await expect.poll(() => requestedRadii.includes("50000"), { timeout: 15000 }).toBeTruthy();

  });

});


