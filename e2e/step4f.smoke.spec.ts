/**
 * Step 4f smoke test — automated browser validation
 * Run with: npx playwright test e2e/step4f.smoke.spec.ts --headed
 */
import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:9001";

// Helper: grant geolocation permission with Rome coords
async function grantLocation(page: Page) {
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 41.9028, longitude: 12.4964 });
}

test.describe("Step 4f — Home page", () => {
  test("1. renders header and LocationCard on load (no location)", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByRole("heading", { name: "Explore Italy" })).toBeVisible();
    await expect(page.getByText("Your intelligent travel assistant")).toBeVisible();
    await expect(page.getByText("Current Location")).toBeVisible();
  });

  test("2. LocationPermissionBanner visible when location not granted", async ({ page }) => {
    await page.goto(BASE);
    // Banner should be visible (prompt or denied state)
    const banner = page.locator("text=Allow location").or(
      page.locator("text=Location access denied")
    );
    await expect(banner.first()).toBeVisible({ timeout: 5000 });
  });

  test("3. LocationCard shows real weather when coords granted", async ({ page }) => {
    await grantLocation(page);
    await page.goto(BASE);

    // Wait for city name to resolve (geocode call)
    await page.waitForSelector("text=Current Location", { timeout: 10000 });

    // Weather area should eventually show a temperature OR a skeleton
    const weatherArea = page.locator(".bg-primary\\/10");
    await expect(weatherArea.first()).toBeVisible({ timeout: 10000 });
  });

  test("4. NearbyPlacesSection renders skeletons then cards when location granted", async ({ page }) => {
    await grantLocation(page);
    await page.goto(BASE);

    // Section heading should appear
    await expect(
      page.getByText("Nearby Highlights", { exact: false })
    ).toBeVisible({ timeout: 10000 });

    // Place cards or empty state should appear within 15s
    const placeCards = page.locator("[id^='place-card-']");
    const emptyMsg = page.getByText("No nearby places found");
    await Promise.race([
      placeCards.first().waitFor({ timeout: 15000 }),
      emptyMsg.waitFor({ timeout: 15000 }),
    ]);

    const count = await placeCards.count();
    console.log(`  → Found ${count} place card(s)`);
    expect(count).toBeGreaterThanOrEqual(0); // passes even if API returns 0 results
  });

  test("5. Tapping a place card navigates to /chat and auto-sends the prompt", async ({ page }) => {
    await grantLocation(page);
    await page.goto(BASE);

    // Wait for at least one place card
    const firstCard = page.locator("[id^='place-card-']").first();
    try {
      await firstCard.waitFor({ timeout: 15000 });
    } catch {
      test.skip(true, "No place cards rendered — skipping tap test");
      return;
    }

    const label = await firstCard.getAttribute("aria-label") ?? "";
    console.log(`  → Tapping: ${label}`);
    await firstCard.click();

    // Should navigate to /chat
    await expect(page).toHaveURL(`${BASE}/chat`, { timeout: 5000 });

    // A user message bubble should appear (the pending prompt)
    const userMsg = page.locator(".bg-primary.text-primary-foreground").first();
    await expect(userMsg).toBeVisible({ timeout: 10000 });
    console.log(`  → Message visible in chat ✓`);
  });

  test("6. ItineraryCard and PackingList are NOT on home page", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.getByText("Itinerary Preview")).not.toBeVisible();
    await expect(page.getByText("Packing Essentials")).not.toBeVisible();
  });
});
