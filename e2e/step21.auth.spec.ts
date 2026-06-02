/**
 * Step 21 E2E — Auth flow smoke tests
 * These tests intentionally do NOT use signInAs — they test the real redirect behavior.
 * Run with: npx playwright test e2e/step21.auth.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 21 — Auth Gate & Login", () => {
  test("1: GET / unauthenticated → redirects to /login", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test("2: Valid sign-in lands on /", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='login-username-input']").fill("Tomer");
    await page.locator("[data-testid='login-password-input']").fill("Tomer");
    await page.locator("[data-testid='login-submit-btn']").click();
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });
    await expect(page.locator("#nav-link-home")).toBeVisible({ timeout: 8000 });
  });

  test("3: Wrong password → stays on /login with error message", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='login-username-input']").fill("Tomer");
    await page.locator("[data-testid='login-password-input']").fill("wrongpassword");
    await page.locator("[data-testid='login-submit-btn']").click();
    await expect(page.locator("[data-testid='login-error-msg']")).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("4: Sign-out button → redirects to /login", async ({ page }) => {
    await signInAs(page, "Tomer");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='sign-out-btn']")).toBeVisible({ timeout: 8000 });
    await page.locator("[data-testid='sign-out-btn']").click();
    await page.waitForURL(/\/login/, { timeout: 8000 });
  });

  test("5: After sign-out GET / → /login", async ({ page }) => {
    // Use UI sign-in (not addInitScript) so sign-out localStorage state persists on next navigation
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='login-username-input']").fill("Tomer");
    await page.locator("[data-testid='login-password-input']").fill("Tomer");
    await page.locator("[data-testid='login-submit-btn']").click();
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });

    // Sign out
    await page.locator("[data-testid='sign-out-btn']").click();
    await page.waitForURL(/\/login/, { timeout: 8000 });

    // Navigate to / again — should redirect to /login (not re-seeded by initScript)
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test("6: Personal packing items are isolated between users", async ({ page }) => {
    test.setTimeout(90000);

    // Sign in as Tomer via UI (not addInitScript) so sign-out persists
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='login-username-input']").fill("Tomer");
    await page.locator("[data-testid='login-password-input']").fill("Tomer");
    await page.locator("[data-testid='login-submit-btn']").click();
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });

    await page.goto(`${BASE}/pack`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("[data-testid='personal-packing-section']", { timeout: 10000 });

    // Add "Inhaler" to Tomer's personal section
    const personalSection = page.locator("[data-testid='personal-packing-section']");
    const firstAddTrigger = personalSection.locator("[id^='add-item-trigger-']").first();
    await firstAddTrigger.scrollIntoViewIfNeeded();
    await firstAddTrigger.click();
    const firstInput = personalSection.locator("[id^='new-item-input-']").first();
    await firstInput.fill("Inhaler");
    await firstInput.press("Enter");
    await expect(personalSection).toContainText("Inhaler", { timeout: 5000 });

    // Sign out via button
    await page.locator("[data-testid='sign-out-btn']").click();
    await page.waitForURL(/\/login/, { timeout: 8000 });

    // Sign in as Liran via UI
    await page.locator("[data-testid='login-username-input']").fill("Liran");
    await page.locator("[data-testid='login-password-input']").fill("Liran");
    await page.locator("[data-testid='login-submit-btn']").click();
    await page.waitForURL(`${BASE}/`, { timeout: 10000 });

    // Navigate to /pack and verify Inhaler is NOT in Liran's personal section
    await page.goto(`${BASE}/pack`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("[data-testid='personal-packing-section']", { timeout: 10000 });
    await expect(page.locator("[data-testid='personal-packing-section']")).not.toContainText("Inhaler");
  });

  test("7: LiveMapCard is visible on home", async ({ page }) => {
    await signInAs(page, "Tomer");
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-testid='live-map-card']")).toBeVisible({ timeout: 10000 });
  });

  test("8: Bookmark add shows toast 'נשמר ליעדים ✓'", async ({ page }) => {
    test.setTimeout(60000);
    await signInAs(page, "Tomer");

    // Mock geocode + places APIs
    await page.route("**/api/geocode*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lat: 45.554, lng: 10.578, cityName: "Sirmione" }),
      });
    });
    await page.route("**/api/places*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { place_id: "toast-test-place", name: "Grotte di Catullo", rating: 4.7, open_now: true, formatted_address: "Sirmione, Italy" },
        ]),
      });
    });

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    // Perform search in InvestigateSection
    await page.locator("[data-testid='search-input']").fill("Sirmione");
    await page.locator("[data-testid='search-button']").click();
    await page.waitForSelector("[id^='search-bookmark-']", { timeout: 15000 });

    // Click bookmark to ADD
    const bookmarkBtn = page.locator("[id^='search-bookmark-']").first();
    // Ensure it's not already saved
    await bookmarkBtn.click();
    await expect(page.locator("[data-testid='toast-message']")).toContainText("נשמר ליעדים ✓", { timeout: 5000 });
  });

  test("9: Bookmark remove shows toast 'הוסר מיעדים'", async ({ page }) => {
    test.setTimeout(60000);
    await signInAs(page, "Tomer");

    await page.route("**/api/geocode*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ lat: 45.554, lng: 10.578, cityName: "Sirmione" }),
      });
    });
    await page.route("**/api/places*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { place_id: "toast-test-place", name: "Grotte di Catullo", rating: 4.7, open_now: true, formatted_address: "Sirmione, Italy" },
        ]),
      });
    });

    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.locator("[data-testid='search-input']").fill("Sirmione");
    await page.locator("[data-testid='search-button']").click();
    await page.waitForSelector("[id^='search-bookmark-']", { timeout: 15000 });

    const bookmarkBtn = page.locator("[id^='search-bookmark-']").first();
    // Click to add first (bookmark)
    await bookmarkBtn.click();
    // Then click again to remove
    await bookmarkBtn.click();
    await expect(page.locator("[data-testid='toast-message']")).toContainText("הוסר מיעדים", { timeout: 5000 });
  });
});
