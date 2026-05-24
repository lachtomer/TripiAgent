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
    await expect(page.locator("text=Explore Italy")).toBeVisible();
  });

  test("3. All 4 routes work correctly", async ({ page }) => {
    // Root
    const res1 = await page.goto(BASE);
    expect(res1?.status()).toBe(200);

    // Chat
    const res2 = await page.goto(`${BASE}/chat`);
    expect(res2?.status()).toBe(200);

    // Itinerary
    const res3 = await page.goto(`${BASE}/itinerary`);
    expect(res3?.status()).toBe(200);

    // Pack
    const res4 = await page.goto(`${BASE}/pack`);
    expect(res4?.status()).toBe(200);
  });
});
