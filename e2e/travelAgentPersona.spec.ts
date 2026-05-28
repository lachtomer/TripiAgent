/**
 * E2E Test Suite — Travel Agent Persona (Giulia, Destination Planner)
 * Validates the full app workflow including UI controls, state persistence,
 * and real Gemini AI API calls for itinerary guide advice & packing list generation.
 *
 * Runs against: https://tripiagent.vercel.app/ by default (can be overridden via BASE_URL).
 * Run with: npx playwright test e2e/travelAgentPersona.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:9001";

test.describe("Travel Agent Persona E2E Validation (Giulia, Destination Planner)", () => {

  test("Plan client trip, customize logistics, and test live AI features", async ({ page }) => {
    test.setTimeout(90_000);
    // 1. Visit the Homepage and check layout elements
    console.log(`Navigating to target environment: ${BASE}`);
    await page.goto(BASE);
    await expect(page.locator("text=TripiAgent")).toBeVisible();
    
    // Switch to In-Trip mode so Today's Planner becomes visible
    await page.click("text=In-Trip (Traveling)");
    await expect(page.locator("text=Today's Planner")).toBeVisible();

    // 2. Navigate to Itinerary and enter client booking logistics
    console.log("Navigating to Itinerary page...");
    await page.goto(`${BASE}/itinerary`);
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible();

    console.log("Expanding Logistics card and entering flight/ZTL information...");
    const logisticsHeader = page.locator("text=Logistics & Bookings");
    await logisticsHeader.click();

    // Fill flight detail and milan ZTL status
    await page.fill("#logistics-flight-tlv-mxp", "AZ402-Giulia");
    const ztlCheckbox = page.locator("#logistics-milan-ztl-paid");
    await ztlCheckbox.setChecked(true);

    // Save and verify save notification
    await page.click("#logistics-save-button");
    await expect(page.locator("text=Booking Details Saved")).toBeVisible();

    // Reload page to verify local storage state persistence
    console.log("Reloading page to verify state persistence...");
    await page.reload();
    await logisticsHeader.click();
    expect(await page.inputValue("#logistics-flight-tlv-mxp")).toBe("AZ402-Giulia");
    expect(await ztlCheckbox.isChecked()).toBe(true);

    // 3. Add Custom Luxury Attraction for the client
    console.log("Adding a custom luxury attraction to the saved list...");
    const toggleFormBtn = page.locator("text=Add Custom Attraction");
    await toggleFormBtn.click();

    await page.fill("#custom-poi-name", "Private Vatican Museum Night Tour");
    await page.fill("#custom-poi-location", "Vatican City, Rome");
    await page.fill("#custom-poi-notes", "Luxury guided private night tour for clients.");
    await page.click("#add-custom-poi-submit");

    // Verify it is added to the list
    await expect(page.locator("h4:has-text('Private Vatican Museum Night Tour')")).toBeVisible();

    // 4. Schedule the custom attraction for Day 1
    console.log("Scheduling custom attraction to Day 1...");
    const select = page.locator("select").last(); // Last select on page should be inside the card scheduler
    await select.selectOption("1");

    const itemContainer = page.locator('[data-attraction-name="Private Vatican Museum Night Tour"]');
    const addToDayBtn = itemContainer.locator("button", { hasText: "Add to Day" });
    await addToDayBtn.click();

    // 5. Navigate to Home, select Day 1, and click 'Ask AI Guide'
    console.log("Navigating back to Home to check the Today's Planner timeline...");
    await page.goto(BASE);
    
    // Select Day 1 in Today's Planner
    const daySelect = page.locator("select").first();
    await daySelect.selectOption("1");

    // Verify the custom tour shows up on the Day 1 timeline
    const timelineItem = page.locator("div.relative.group", { hasText: "Private Vatican Museum Night Tour" });
    await expect(timelineItem).toBeVisible();

    // Trigger AI Guide chat assistant (real AI call)
    console.log("Clicking 'Ask AI Guide' to start live Gemini AI travel assistant session...");
    const askAIBtn = timelineItem.locator("button", { hasText: "Ask AI Guide" });
    await askAIBtn.click();

    // 6. Validate Live Chat Response (AI Real Call)
    console.log("Validating chat redirection and waiting for streamed AI response...");
    await expect(page).toHaveURL(/.*\/chat/);
    
    // Wait for the AI assistant response to stream in
    const lastMsgBubble = page.locator(".prose").last();
    await expect(lastMsgBubble).toBeVisible({ timeout: 20000 });
    
    const firstResponseText = await lastMsgBubble.textContent();
    console.log(`Live AI Response snippet: "${firstResponseText?.slice(0, 100)}..."`);
    expect(firstResponseText?.length).toBeGreaterThan(20);

    // 7. Send follow-up query to the AI (AI Real Call)
    console.log("Sending a follow-up destination dining recommendation query to AI...");
    await page.fill("#chat-input", "Suggest a high-end dinner spot in Rome near the Vatican under €100 per person.");
    await page.click("#chat-send-button");

    // Wait for follow-up response
    const followUpMsgBubble = page.locator(".prose").last();
    await expect(followUpMsgBubble).toBeVisible({ timeout: 25000 });
    const followUpResponseText = await followUpMsgBubble.textContent();
    console.log(`Follow-up AI Response snippet: "${followUpResponseText?.slice(0, 100)}..."`);
    expect(followUpResponseText?.length).toBeGreaterThan(20);

    // 8. Generate Smart Packing List with AI (AI Real Call)
    console.log("Navigating to Pack page and generating list using Gemini...");
    await page.goto(`${BASE}/pack`);
    await expect(page.locator("text=Packing Checklist")).toBeVisible();

    // Click generate button
    await page.click("#generate-packing-btn");

    // Wait for AI generation progress and rendering (shows progress bar when done)
    console.log("Waiting for AI packing list generation to complete...");
    const progressBar = page.locator("#packing-progress-bar");
    await expect(progressBar).toBeVisible({ timeout: 30000 });

    // Verify packing items populated and test checkboxes
    const firstCheckItem = page.locator("[id^=toggle-item-]").first();
    await expect(firstCheckItem).toBeVisible();
    
    // Toggle packing checklist item checked
    await firstCheckItem.click();
    console.log("E2E Travel Agent Persona validation test completed successfully!");
  });
});
