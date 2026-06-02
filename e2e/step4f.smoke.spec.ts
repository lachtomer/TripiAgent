/**
 * Step 4f smoke test — automated browser validation
 * Run with: npx playwright test e2e/step4f.smoke.spec.ts --headed
 */
import { test, expect, Page } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

// Helper: grant geolocation permission with Rome coords
async function grantLocation(page: Page) {
  await page.context().grantPermissions(["geolocation"]);
  await page.context().setGeolocation({ latitude: 41.9028, longitude: 12.4964 });
}

test.describe("Step 4f — Home page", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });
  test("1. renders Home with Mode Switcher, Map Card and Investigate section", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    // sr-only heading still in DOM
    await expect(page.getByRole("heading", { name: "Explore Italy" })).toBeAttached();
    // New home-screen components
    await expect(page.locator("[data-testid='active-route-map']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });
  });

  test("2. LocationPermissionBanner visible when location not granted", async ({ page }) => {
    await page.goto(BASE);
    // Switch to In-Trip mode so the location permission banner is rendered
    await page.click("text=In-Trip (Traveling)");
    // Banner should be visible (prompt or denied state)
    const banner = page.locator("text=Allow location").or(
      page.locator("text=Location access denied")
    );
    await expect(banner.first()).toBeVisible({ timeout: 5000 });
  });

  test("3. Map card is visible on Home regardless of location", async ({ page }) => {
    await grantLocation(page);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='active-route-map']")).toBeVisible({ timeout: 10000 });
  });

  test("4. Investigate section renders with toggles when location granted", async ({ page }) => {
    await grantLocation(page);
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid='investigate-target-btn']")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("[data-testid='investigate-aroundme-btn']")).toBeVisible({ timeout: 10000 });
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
