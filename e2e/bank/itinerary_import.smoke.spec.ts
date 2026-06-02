/**
 * Playwright smoke test – Itinerary Import (Bank feature)
 * Run with: npx playwright test e2e/bank/itinerary_import.smoke.spec.ts --headed
 */
import { test, expect } from "@playwright/test";
import { mockBankParse, mockBankPlacesSubmit } from "../helpers/apiMocks";

const BASE = "http://localhost:9001";

test.describe("Bank – Itinerary Import", () => {
  test.setTimeout(45000);

  test.beforeEach(async ({ page }) => {
    await mockBankParse(page);
    await page.goto(`${BASE}/admin/bank`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("bank-page-ready")).toBeAttached({ timeout: 15000 });
    await expect(page.getByTestId("generate-bank-btn")).toBeVisible();
  });

  test("1. UI renders textarea, generate button and preview table", async ({ page }) => {
    const generateBtn = page.getByTestId("generate-bank-btn");
    const previewTable = page.locator("table#preview-table");

    await expect(page.getByTestId("bank-return-home")).toBeVisible();
    await expect(generateBtn).toBeVisible();
    await expect(previewTable).toBeHidden();

    const textarea = page.locator("textarea#itinerary-input");
    await textarea.fill("Test Place");
    await expect(textarea).toHaveValue("Test Place");
    await generateBtn.click();

    await expect(page.getByTestId("preview-row").first()).toBeVisible({ timeout: 10000 });
    await expect(previewTable).toBeVisible();
  });

  test("2. Generates preview rows after clicking Generate", async ({ page }) => {
    const textarea = page.locator("textarea#itinerary-input");
    const generateBtn = page.getByTestId("generate-bank-btn");

    await textarea.fill("Day 1 – Visit Sirmione; Day 2 – Explore Verona");
    await expect(textarea).toHaveValue("Day 1 – Visit Sirmione; Day 2 – Explore Verona");
    await generateBtn.click();

    await expect(page.getByTestId("preview-row")).toHaveCount(2, { timeout: 15000 });
  });

  test("3. Submits preview and receives 201 response", async ({ page }) => {
    const textarea = page.locator("textarea#itinerary-input");
    const generateBtn = page.getByTestId("generate-bank-btn");
    const submitBtn = page.getByTestId("submit-bank-btn");

    await mockBankPlacesSubmit(page);

    await textarea.fill("Day 1 – Visit Sirmione; Day 2 – Explore Verona");
    await generateBtn.click();
    await expect(page.getByTestId("preview-row").first()).toBeVisible({ timeout: 15000 });

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/bank/places") &&
          resp.request().method() === "POST" &&
          resp.status() === 201
      ),
      submitBtn.click(),
    ]);

    expect(response.ok()).toBeTruthy();
    await expect(page.getByTestId("submit-success")).toBeVisible({ timeout: 10000 });
  });
});
