/**
 * Step 15 E2E test — Hebrew & RTL Support
 * Run with: npx playwright test e2e/step15.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 15 — Hebrew & RTL Support", () => {
  test("1. Verify lang toggle switches HTML dir/lang attributes and translations load correctly", async ({ page }) => {
    test.setTimeout(45000);
    // 1. Go to Home page
    await page.goto(BASE);
    await page.waitForLoadState("domcontentloaded");

    // 2. Check initial English state
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
    
    // Check that new investigate section is present (replaces old AttractionSearch header)
    await expect(page.locator("[data-testid='investigate-section']")).toBeVisible({ timeout: 10000 });

    // 3. Switch language to Hebrew
    const toggleBtn = page.locator("[data-testid=\"lang-toggle\"]");
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // 4. Verify HTML is updated to Hebrew RTL
    await expect(html).toHaveAttribute("lang", "he", { timeout: 5000 });
    await expect(html).toHaveAttribute("dir", "rtl");

    // Wait for translation readiness signal (locale applied on document + handler)
    await expect(page.locator('[data-testid="translations-loaded"][data-locale="he"]')).toBeAttached({ timeout: 5000 });

    // Verify translated Hebrew header
    await expect(page.locator("text=חקר / Investigate")).toBeVisible({ timeout: 5000 });

    // 5. Navigate to Itinerary page and verify translations and LTR isolation
    const itineraryNav = page.locator("#nav-link-calendar");
    await itineraryNav.click({ timeout: 15000 });
    await page.waitForURL("**/itinerary", { timeout: 20000 });
    await page.waitForLoadState("domcontentloaded");

    // Check that Hebrew labels are loaded in Itinerary Card (needs hydration time)
    await expect(page.getByText("תאריך התחלת הטיול:")).toBeVisible({ timeout: 15000 });

    // Verify that the Day 1 activities list exists
    const firstActivityRow = page.locator("#activity-row-a1");
    await expect(firstActivityRow).toBeVisible();
    
    const activityHeader = page.locator("#activity-header-a1");
    // Verify it is aligned to start logically
    await expect(activityHeader).toHaveClass(/text-start/);
    
    // Click header to expand
    await activityHeader.click();
    
    // The details element should have dir="ltr" text-start
    const details = page.locator("#activity-details-a1 p").first();
    await expect(details).toHaveAttribute("dir", "ltr");
    await expect(details).toHaveClass(/text-start/);

    // 6. Verify Logistics Card text inputs are LTR-isolated
    const logisticsHeader = page.locator("text=לוגיסטיקה והזמנות");
    await expect(logisticsHeader).toBeVisible();
    // Expand if collapsed
    await logisticsHeader.click();

    const flightInput = page.locator("#logistics-flight-tlv-mxp");
    await expect(flightInput).toHaveAttribute("dir", "ltr");
    await expect(flightInput).toHaveClass(/text-start/);

    // 7. Navigate to Packing page and verify Hebrew categories
    const packNav = page.locator("#nav-link-pack");
    await packNav.click();
    await page.waitForURL("**/pack");
    await expect(page.getByText("רשימת אריזה")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=חיוני").first()).toBeVisible();
  });
});
