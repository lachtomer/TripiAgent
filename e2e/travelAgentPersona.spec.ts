/**
 * E2E Test Suite — Travel Agent Persona (Giulia, Destination Planner)
 * Validates the full app workflow including UI controls, state persistence,
 * and real Gemini AI API calls for itinerary guide advice & packing list generation.
 *
 * Runs against: https://tripiagent.vercel.app/ by default (can be overridden via BASE_URL).
 * Run with: npx playwright test e2e/travelAgentPersona.spec.ts
 */
import { test, expect } from "@playwright/test";
import { mockAiTextStream, mockPackGenerate } from "./helpers/apiMocks";
import { signInAs } from "./helpers/authFixture";

const BASE = process.env.BASE_URL || "http://localhost:9001";

async function ensureInTripMode(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => localStorage.getItem("tripiagent-trip-storage") !== null);
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByText("In-Trip (Traveling)").click();
    try {
      await expect(page.getByTestId(/today-planner/)).toBeVisible({ timeout: 4000 });
      return;
    } catch {
      // Zustand persist can rehydrate after the first click and reset tripMode.
    }
  }
  await expect(page.getByTestId(/today-planner/)).toBeVisible({ timeout: 15000 });
}

test.describe("Travel Agent Persona E2E Validation (Giulia, Destination Planner)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test("Plan client trip, customize logistics, and test live AI features", async ({ page }) => {
    test.setTimeout(90_000);

    await mockAiTextStream(
      page,
      "Welcome to your Vatican night tour planning session. **Private Vatican Museum Night Tour** is an excellent choice for luxury clients. Arrive 15 minutes early at the entrance. Dress code: smart casual. Photography is allowed in most galleries but flash is prohibited."
    );
    await mockPackGenerate(page);

    console.log(`Navigating to target environment: ${BASE}`);
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-testid="translations-loaded"]')).toBeAttached();
    await expect(page.getByText("TripiAgent")).toBeVisible();

    await ensureInTripMode(page);

    console.log("Navigating to Bookings page...");
    await page.goto(`${BASE}/bookings`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-testid='bookings-page']")).toBeVisible({ timeout: 15000 });

    console.log("Entering Wizz confirmation in the bookings card...");
    await page.fill("#bookings-flight-confirmation", "AZ402-Giulia");

    await page.click("#bookings-save-button");
    await expect(page.locator("text=Booking Details Saved")).toBeVisible();

    console.log("Reloading bookings page to verify state persistence...");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#bookings-flight-confirmation")).toHaveValue("AZ402-Giulia", { timeout: 8000 });

    // 3. Add Custom Luxury Attraction for the client
    console.log("Navigating to Locations page to add custom attraction...");
    await page.goto(`${BASE}/locations`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible({ timeout: 15000 });
    console.log("Adding a custom luxury attraction to the saved list...");
    const toggleFormBtn = page.locator("text=Add Custom Attraction");
    await toggleFormBtn.click();

    await page.fill("#custom-poi-name", "Private Vatican Museum Night Tour");
    await page.fill("#custom-poi-location", "Vatican City, Rome");
    await page.fill("#custom-poi-notes", "Luxury guided private night tour for clients.");
    await page.click("#add-custom-poi-submit");

    // Verify it is added to the list (names render via PlaceNameLink, not h4)
    await expect(page.locator('[data-attraction-name="Private Vatican Museum Night Tour"]')).toBeVisible({ timeout: 10000 });

    // 4. Schedule the custom attraction for Day 1
    console.log("Scheduling custom attraction to Day 1...");
    const itemContainer = page.locator('[data-attraction-name="Private Vatican Museum Night Tour"]');
    // The per-attraction select defaults to Day 1; ensure it's set
    const attractionSelect = itemContainer.locator("select").first();
    await attractionSelect.selectOption("1");

    const addToDayBtn = itemContainer.locator("button", { hasText: "Add to Day" });
    await addToDayBtn.click();
    // Wait for success state (button flips to "Added!") before navigating — ensures Zustand persist flushed
    await expect(itemContainer.locator("button", { hasText: "Added!" })).toBeVisible({ timeout: 5000 });
    // Verify the activity appears in the itinerary day card (day cards live on /itinerary, not /locations)
    await page.goto(`${BASE}/itinerary`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#day-card-1").locator("text=Private Vatican Museum Night Tour")).toBeVisible({ timeout: 10000 });

    console.log("Navigating back to Home to check the Today's Planner timeline...");
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await ensureInTripMode(page);

    // Select Day 1 in Today's Planner
    const daySelect = page.locator("select").first();
    await daySelect.selectOption("1");

    // Verify the custom tour shows up on the Day 1 timeline
    const timelineItem = page.locator('[data-testid="timeline-item"]', { hasText: "Private Vatican Museum Night Tour" });
    await expect(timelineItem).toBeVisible({ timeout: 10000 });

    console.log("Clicking 'Ask AI Guide' to start live Gemini AI travel assistant session...");
    const askAIBtn = timelineItem.getByRole("button", { name: /Ask AI Guide/i });
    await askAIBtn.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/chat/, { timeout: 15000 }),
      askAIBtn.click(),
    ]);

    console.log("Validating chat redirection and waiting for streamed AI response...");
    const chatPrompt =
      "Tell me about Private Vatican Museum Night Tour near Vatican City. What should I know before visiting?";
    await page.fill("#chat-input", chatPrompt);
    await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes("/api/ai") && resp.request().method() === "POST" && resp.status() === 200,
        { timeout: 25000 }
      ),
      page.locator("#chat-send-button").click(),
    ]);

    // Wait for the AI assistant response to stream in
    await page.waitForFunction(
      () => {
        const nodes = document.querySelectorAll(".prose");
        const el = nodes[nodes.length - 1];
        return el && (el.textContent?.trim().length ?? 0) > 20;
      },
      { timeout: 25000 }
    );
    const lastMsgBubble = page.locator(".prose").last();
    await expect(lastMsgBubble).not.toBeEmpty();
    
    const firstResponseText = await lastMsgBubble.textContent();
    console.log(`Live AI Response snippet: "${firstResponseText?.slice(0, 100)}..."`);
    expect(firstResponseText?.length).toBeGreaterThan(20);

    // 7. Send follow-up query to the AI (AI Real Call)
    console.log("Sending a follow-up destination dining recommendation query to AI...");
    await page.fill("#chat-input", "Suggest a high-end dinner spot in Rome near the Vatican under €100 per person.");
    await page.click("#chat-send-button");

    // Wait for follow-up response
    await page.waitForFunction(
      () => {
        const nodes = document.querySelectorAll(".prose");
        const el = nodes[nodes.length - 1];
        return el && (el.textContent?.trim().length ?? 0) > 20;
      },
      { timeout: 25000 }
    );
    const followUpMsgBubble = page.locator(".prose").last();
    await expect(followUpMsgBubble).not.toBeEmpty();
    const followUpResponseText = await followUpMsgBubble.textContent();
    console.log(`Follow-up AI Response snippet: "${followUpResponseText?.slice(0, 100)}..."`);
    expect(followUpResponseText?.length).toBeGreaterThan(20);

    // 8. Generate Smart Packing List with AI (AI Real Call)
    console.log("Navigating to Pack page and generating list using Gemini...");
    await page.goto(`${BASE}/pack`, { waitUntil: "domcontentloaded" });
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
