/**
 * Step 4h smoke test — Itinerary management
 * Run with: npx playwright test e2e/step4h.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";
import { signInAs } from "./helpers/authFixture";

const BASE = "http://localhost:9001";

test.describe("Step 4h — Itinerary Planner", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
    await page.goto(`${BASE}/itinerary`);
    // Wait for the hydrated state to load
    await page.waitForSelector("#trip-start-date", { timeout: 10000 });
  });

  test("1. Seeding default 10-day Italy itinerary", async ({ page }) => {
    // Scroll down to load/show all day cards
    await page.evaluate(() => window.scrollTo(0, 1000));

    // Check that Day 1 to Day 5 headers are rendered
    await expect(page.locator("text=Jun 25 – Milan Arrival")).toBeVisible({ timeout: 10000 });
    await page.locator("text=Jun 26 – Lakeside or Bergamo & Desenzano").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Jun 26 – Lakeside or Bergamo & Desenzano")).toBeVisible({ timeout: 5000 });
    await page.locator("text=Jun 27 – Castellaro, Borghetto & Sigurtà").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Jun 27 – Castellaro, Borghetto & Sigurtà")).toBeVisible({ timeout: 5000 });
    await page.locator("text=Jun 28 – Manerba Boat & Rocca Walk").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Jun 28 – Manerba Boat & Rocca Walk")).toBeVisible({ timeout: 5000 });
    await page.locator("text=Jun 29 – Gardaland").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Jun 29 – Gardaland")).toBeVisible({ timeout: 5000 });
    await page.locator("text=Jun 30 – Verona (or Monte Baldo — see Day guide)").scrollIntoViewIfNeeded();
    await expect(page.locator("text=Jun 30 – Verona (or Monte Baldo — see Day guide)")).toBeVisible({ timeout: 5000 });

    // Verify Milan/Desenzano activities exist
    await expect(page.locator("text=Flight 6404 Departs TLV")).toBeVisible();
    await expect(page.locator("text=Car Rental Pickup – Centauro")).toBeVisible();
  });

  test("2. Edit day title inline", async ({ page }) => {
    // Tap the edit day title button for Day 1
    const editTrigger = page.locator("#edit-day-title-trigger-1");
    await editTrigger.click();

    // Input new title
    const input = page.locator("#edit-day-title-input-1");
    await input.fill("Day 1 - Ancient Rome");
    await page.locator("#save-day-title-btn-1").click();

    // Verify new title is rendered
    await expect(page.locator("#day-title-label-1")).toContainText("Day 1 - Ancient Rome");

    // Refresh and check persistence
    await page.reload();
    await page.waitForSelector("#trip-start-date", { timeout: 10000 });
    await expect(page.locator("#day-title-label-1")).toContainText("Day 1 - Ancient Rome");
  });

  test("3. Collapsible activity row, inline edit, and save", async ({ page }) => {
    // Click header to expand first activity on Day 1
    const activityHeader = page.locator("#activity-header-a1");
    await activityHeader.click();

    // Verify expanded details are visible
    const details = page.locator("#activity-details-a1");
    await expect(details).toBeVisible();
    await expect(details).toContainText("Depart Tel Aviv (TLV) on flight 6404.");

    // Click edit activity trigger
    await page.locator("#edit-activity-trigger-a1").click();

    // Edit fields
    const timeInput = page.locator("#edit-activity-time-a1");
    const titleInput = page.locator("#edit-activity-title-a1");
    const descInput = page.locator("#edit-activity-description-a1");
    
    await timeInput.fill("18:30");
    await titleInput.fill("Early Flight 6404");
    await descInput.fill("Depart TLV early on flight 6404.");
    
    await page.locator("#edit-activity-save-a1").click();

    // Verify values updated in list
    await expect(page.locator("#activity-header-a1")).toContainText("18:30");
    await expect(page.locator("#activity-header-a1")).toContainText("Early Flight 6404");

    // Verify desc is saved and visible (remains expanded)
    await expect(page.locator("#activity-details-a1")).toContainText("Depart TLV early on flight 6404.");
  });

  test("4. Add new activity to a day", async ({ page }) => {
    // Tap Add Activity on Day 1
    await page.locator("#add-activity-btn-1").click();

    // Fill form
    await page.locator("#new-activity-time-1").fill("20:00");
    await page.locator("#new-activity-title-1").fill("Gelato Stroll");
    await page.locator("#new-activity-location-1").fill("Trevi Fountain");
    await page.locator("#new-activity-description-1").fill("Grab a late night gelato by the fountain.");
    
    // Submit
    await page.locator("#new-activity-submit-1").click();

    // Verify it appears in list
    await expect(page.locator("text=Gelato Stroll")).toBeVisible({ timeout: 10000 });

    // Expand the newly added activity under Day 1
    const lastRow = page.locator("#day-card-1 [id^='activity-row-']").last();
    await lastRow.locator("[id^='activity-header-']").click();
    await expect(lastRow.locator("[id^='activity-details-']")).toContainText("Grab a late night gelato by the fountain.", { timeout: 10000 });
  });

  test("5. Delete an activity", async ({ page }) => {
    // Ensure "Check-in: Malpensa Jacuzzi House" is visible
    await expect(page.locator("text=Check-in: Malpensa Jacuzzi House")).toBeVisible();

    // Expand it (id is a3)
    await page.locator("#activity-header-a3").click();

    // Tap delete button
    await page.locator("#delete-activity-btn-a3").click();

    // Verify it is removed
    await expect(page.locator("text=Check-in: Malpensa Jacuzzi House")).not.toBeVisible();
  });

  test("6. Ask AI navigates to /chat with pre-filled prompt", async ({ page }) => {
    // Expand an activity (id is a2 - Arrive Malpensa (MXP))
    await page.locator("#activity-header-a2").click();

    // Tap Ask AI link
    await page.locator("#ask-ai-link-a2").click();

    // Verify navigation to /chat
    await expect(page).toHaveURL(`${BASE}/chat`);

    // Verify that the prompt is auto-sent and visible in the chat bubble
    const userMsg = page.locator(".bg-primary.text-primary-foreground").first();
    await expect(userMsg).toContainText("Arrive Malpensa (MXP)");
  });

  test("7. Trip start date sets 'Today' badge on corresponding day card", async ({ page }) => {
    // Select today's date formatted as YYYY-MM-DD from the browser's own clock
    const todayStr = await page.evaluate(() => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    });

    // Set trip start date input to today
    const dateInput = page.locator("#trip-start-date");
    await dateInput.fill(todayStr);
    await dateInput.blur();

    // Verify Day 1 shows "Today" badge
    const badge = page.locator("#today-badge-1");
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).toContainText("Today");

    // Calculate yesterday's date string in the browser context
    const yesterdayStr = await page.evaluate(() => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    });

    await dateInput.fill(yesterdayStr);
    await dateInput.blur();

    // Verify Day 2 shows "Today" badge
    const badge2 = page.locator("#today-badge-2");
    await expect(badge2).toBeVisible({ timeout: 5000 });
  });
});
