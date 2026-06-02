/**
 * Step 6 smoke test — Security Headers & Routes Verification
 * Run with: npx playwright test e2e/step6.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 6 — Security Headers & Routes Verification", () => {
  test("1. Security headers are present on root response", async ({ page }) => {
    const response = await page.goto(BASE);
    expect(response).not.toBeNull();
    
    const headers = response!.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toContain("geolocation=(self)");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("2. App loads correctly and nav is functional", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#bottom-nav")).toBeVisible();
    await expect(page.locator("#nav-link-home")).toBeVisible();
  });

  test("3. All 6 routes work correctly", async ({ page }) => {
    const routes = ["/", "/chat", "/itinerary", "/pack", "/locations", "/bookings"];
    for (const route of routes) {
      const res = await page.goto(`${BASE}${route}`);
      expect(res?.status()).toBe(200);
    }
  });
});
