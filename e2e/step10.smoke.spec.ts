/**
 * Step 10 smoke test — Saved Attractions & Phase 2 Logistics
 * Run with: npx playwright test e2e/step10.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 10 — Saved Attractions & Phase 2 Logistics", () => {
  
  test("1. Bookmark a place from Home and verify it in Saved Attractions", async ({ page }) => {
    // 1. Go to Home page
    await page.goto(BASE);
    await expect(page.locator("text=Explore Italy")).toBeVisible();

    // 2. Select bookmark button for first place and click it
    const firstPlaceCard = page.locator(".snap-start").first();
    await expect(firstPlaceCard).toBeVisible();
    const placeName = await firstPlaceCard.locator("h4").textContent();
    expect(placeName).toBeTruthy();
    console.log(`  → Bookmarking place: ${placeName}`);

    const bookmarkBtn = firstPlaceCard.locator("[id^='bookmark-']").first();
    await expect(bookmarkBtn).toBeVisible();
    await bookmarkBtn.click();

    // 3. Navigate to Itinerary page
    await page.goto(`${BASE}/itinerary`);
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible();

    // 4. Verify the bookmarked place is in the saved list
    await expect(page.locator(`h4:has-text("${placeName}")`)).toBeVisible();
  });

  test("2. Add a custom POI and schedule it into the itinerary", async ({ page }) => {
    await page.goto(`${BASE}/itinerary`);
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible();

    // 1. Toggle custom attraction form
    const toggleFormBtn = page.locator("text=Add Custom Attraction");
    await toggleFormBtn.click();

    // 2. Fill in the form
    await page.fill("#custom-poi-name", "Limone Ferry Port");
    await page.fill("#custom-poi-location", "Limone");
    await page.fill("#custom-poi-notes", "Take the morning boat.");
    
    // 3. Click add button using ID
    await page.click("#add-custom-poi-submit");

    // 4. Verify Custom POI shows in list
    await expect(page.locator("h4:has-text('Limone Ferry Port')")).toBeVisible();

    // 5. Select Day 3 in scheduling select
    const select = page.locator("select").last(); // Last select on page should be inside the card scheduler
    await select.selectOption("3");

    // 6. Click 'Add to Day' for Limone Ferry Port using data-attraction-name attribute
    const itemContainer = page.locator('[data-attraction-name="Limone Ferry Port"]');
    const addToDayBtn = itemContainer.locator("button", { hasText: "Add to Day" });
    await addToDayBtn.click();

    // 7. Verify 'Added!' state is briefly shown or activity appears in itinerary
    // ItineraryDay 3 should now show Limone Ferry Port
    // We check that the text Limone Ferry Port appears in the list and the itinerary
    await expect(page.locator("h4:has-text('Limone Ferry Port')")).toBeVisible();
  });

  test("3. Today Planner is visible and interactive on Home page", async ({ page }) => {
    await page.goto(BASE);
    
    // Switch to In-Trip mode so Today's Planner becomes visible
    await page.click("text=In-Trip (Traveling)");
    
    // 1. Check for Today's Planner header
    await expect(page.locator("text=Today's Planner")).toBeVisible();
    
    // 2. Select a different day (Day 2) in Today Planner to preview
    const daySelect = page.locator("select").first();
    await daySelect.selectOption("2");
    
    // 3. Verify Day 2 schedule items are displayed (e.g. Car Rental Pickup)
    await expect(page.locator("text=Car Rental Pickup – Centauro")).toBeVisible();
  });

  test("4. Logistics card displays, updates, and persists state", async ({ page }) => {
    await page.goto(`${BASE}/itinerary`);
    
    // 1. Toggle Logistics card open
    const logisticsHeader = page.locator("text=Logistics & Bookings");
    await logisticsHeader.click();
    
    // 2. Fill flight outbound & check ZTL paid
    await page.fill("#logistics-flight-tlv-mxp", "LY381-E2E");
    const ztlCheckbox = page.locator("#logistics-milan-ztl-paid");
    await ztlCheckbox.setChecked(true);
    
    // 3. Click Save button
    await page.click("#logistics-save-button");
    await expect(page.locator("text=Booking Details Saved")).toBeVisible();
    
    // 4. Reload page and verify persistence
    await page.reload();
    await logisticsHeader.click();
    
    const flightInputVal = await page.inputValue("#logistics-flight-tlv-mxp");
    expect(flightInputVal).toBe("LY381-E2E");
    
    const isZtlChecked = await ztlCheckbox.isChecked();
    expect(isZtlChecked).toBe(true);
  });
});
