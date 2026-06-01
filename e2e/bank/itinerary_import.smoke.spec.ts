/**
 * Playwright smoke test – Itinerary Import (Bank feature)
 * Run with: npx playwright test e2e/bank/itinerary_import.smoke.spec.ts --headed
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Bank – Itinerary Import", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/admin/bank`);
  });

  test("1. UI renders textarea, generate button and preview table", async ({ page }) => {
    const textarea = page.locator("textarea#itinerary-input");
    const generateBtn = page.locator("button:has-text('Generate Bank Entries')");
    const previewTable = page.locator("table#preview-table");

    await expect(textarea).toBeVisible();
    await expect(generateBtn).toBeVisible();
    await expect(previewTable).toBeHidden();
  });

  test("2. Generates preview rows after clicking Generate", async ({ page }) => {
    const textarea = page.locator("textarea#itinerary-input");
    const generateBtn = page.locator("button:has-text('Generate Bank Entries')");
    const previewRows = page.locator("table#preview-table tbody tr");

    // Simple itinerary example
    await textarea.fill("Day 1 – Visit Sirmione; Day 2 – Explore Verona");
    await generateBtn.click();

    // Wait for at least one row in preview table
    await expect(previewRows.first()).toBeVisible({ timeout: 15000 });
    const rowCount = await previewRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("3. Submits preview and receives 201 response", async ({ page }) => {
    const textarea = page.locator("textarea#itinerary-input");
    const generateBtn = page.locator("button:has-text('Generate Bank Entries')");
    const submitBtn = page.locator("button:has-text('Submit')");

    await textarea.fill("Day 1 – Visit Sirmione; Day 2 – Explore Verona");
    await generateBtn.click();
    await expect(page.locator("table#preview-table tbody tr").first()).toBeVisible({ timeout: 15000 });
    await submitBtn.click();

    // Intercept network request to ensure 201
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes("/api/bank/places") && resp.status() === 201),
      // Click triggers request
    ]);
    expect(response.ok()).toBeTruthy();
  });
});
