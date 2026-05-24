/**
 * Step 5 smoke test — PWA Configuration
 * Run with: npx playwright test e2e/step5.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 5 — PWA Configuration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test("1. manifest.json is served at /manifest.json and contains 'TripiAgent'", async ({ page }) => {
    const json = await page.evaluate(async (url) => {
      const res = await fetch(url);
      return res.json();
    }, `${BASE}/manifest.json`);
    expect(json.name).toContain("TripiAgent");
    expect(json.short_name).toBe("TripiAgent");
  });

  test("2. Layout has <link rel='manifest'> tag", async ({ page }) => {
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/manifest.json");
  });

  test("3. Layout has <meta name='theme-color' content='#006400'>", async ({ page }) => {
    const themeColorMeta = page.locator('meta[name="theme-color"]');
    await expect(themeColorMeta).toHaveAttribute("content", "#006400");
  });
});
