# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: travelAgentPersona.spec.ts >> Travel Agent Persona E2E Validation (Giulia, Destination Planner) >> Plan client trip, customize logistics, and test live AI features
- Location: e2e\travelAgentPersona.spec.ts:15:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 20
Received:   7
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - button "Open menu" [ref=e5]:
          - img [ref=e6]
        - generic [ref=e7]: TripiAgent
      - img [ref=e9] [cursor=pointer]
    - main [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - heading "Travel Chat" [level=1] [ref=e15]
          - paragraph [ref=e16]: AI local recommendations & translation helper
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - img [ref=e21]
              - paragraph [ref=e25]: Tell me more about Private Vatican Museum Night Tour near Vatican City, Rome. What should I know before visiting? Any practical tips?
            - generic [ref=e26]:
              - img [ref=e28]
              - paragraph [ref=e33]: Ah, the
          - generic:
            - generic [ref=e34]:
              - button "What's near me?" [disabled] [ref=e35]
              - button "Find lunch under €15" [disabled] [ref=e36]
              - button "Plan my afternoon" [disabled] [ref=e37]
              - button "Skip the line tips" [disabled] [ref=e38]
            - generic [ref=e39]:
              - textbox "Ask where to go or translate something..." [ref=e40]
              - button [disabled]:
                - img
    - navigation [ref=e41]:
      - generic [ref=e42]:
        - link "Explore" [ref=e43] [cursor=pointer]:
          - /url: /
          - img [ref=e45]
          - generic [ref=e48]: Explore
        - link "Chat" [ref=e49] [cursor=pointer]:
          - /url: /chat
          - img [ref=e51]
          - generic [ref=e53]: Chat
        - link "Itinerary" [ref=e55] [cursor=pointer]:
          - /url: /itinerary
          - img [ref=e57]
          - generic [ref=e59]: Itinerary
        - link "Pack" [ref=e60] [cursor=pointer]:
          - /url: /pack
          - img [ref=e62]
          - generic [ref=e67]: Pack
  - alert [ref=e68]
```

# Test source

```ts
  1   | /**
  2   |  * E2E Test Suite — Travel Agent Persona (Giulia, Destination Planner)
  3   |  * Validates the full app workflow including UI controls, state persistence,
  4   |  * and real Gemini AI API calls for itinerary guide advice & packing list generation.
  5   |  *
  6   |  * Runs against: https://tripiagent.vercel.app/ by default (can be overridden via BASE_URL).
  7   |  * Run with: npx playwright test e2e/travelAgentPersona.spec.ts
  8   |  */
  9   | import { test, expect } from "@playwright/test";
  10  | 
  11  | const BASE = process.env.BASE_URL || "https://tripiagent.vercel.app";
  12  | 
  13  | test.describe("Travel Agent Persona E2E Validation (Giulia, Destination Planner)", () => {
  14  | 
  15  |   test("Plan client trip, customize logistics, and test live AI features", async ({ page }) => {
  16  |     // 1. Visit the Homepage and check layout elements
  17  |     console.log(`Navigating to target environment: ${BASE}`);
  18  |     await page.goto(BASE);
  19  |     await expect(page.locator("text=TripiAgent")).toBeVisible();
  20  |     await expect(page.locator("text=Today's Planner")).toBeVisible();
  21  | 
  22  |     // 2. Navigate to Itinerary and enter client booking logistics
  23  |     console.log("Navigating to Itinerary page...");
  24  |     await page.goto(`${BASE}/itinerary`);
  25  |     await expect(page.locator("text=Saved Attractions & POIs")).toBeVisible();
  26  | 
  27  |     console.log("Expanding Logistics card and entering flight/ZTL information...");
  28  |     const logisticsHeader = page.locator("text=Logistics & Bookings");
  29  |     await logisticsHeader.click();
  30  | 
  31  |     // Fill flight detail and milan ZTL status
  32  |     await page.fill("#logistics-flight-tlv-mxp", "AZ402-Giulia");
  33  |     const ztlCheckbox = page.locator("#logistics-milan-ztl-paid");
  34  |     await ztlCheckbox.setChecked(true);
  35  | 
  36  |     // Save and verify save notification
  37  |     await page.click("#logistics-save-button");
  38  |     await expect(page.locator("text=Booking Details Saved")).toBeVisible();
  39  | 
  40  |     // Reload page to verify local storage state persistence
  41  |     console.log("Reloading page to verify state persistence...");
  42  |     await page.reload();
  43  |     await logisticsHeader.click();
  44  |     expect(await page.inputValue("#logistics-flight-tlv-mxp")).toBe("AZ402-Giulia");
  45  |     expect(await ztlCheckbox.isChecked()).toBe(true);
  46  | 
  47  |     // 3. Add Custom Luxury Attraction for the client
  48  |     console.log("Adding a custom luxury attraction to the saved list...");
  49  |     const toggleFormBtn = page.locator("text=Add Custom Attraction");
  50  |     await toggleFormBtn.click();
  51  | 
  52  |     await page.fill("#custom-poi-name", "Private Vatican Museum Night Tour");
  53  |     await page.fill("#custom-poi-location", "Vatican City, Rome");
  54  |     await page.fill("#custom-poi-notes", "Luxury guided private night tour for clients.");
  55  |     await page.click("#add-custom-poi-submit");
  56  | 
  57  |     // Verify it is added to the list
  58  |     await expect(page.locator("h4:has-text('Private Vatican Museum Night Tour')")).toBeVisible();
  59  | 
  60  |     // 4. Schedule the custom attraction for Day 1
  61  |     console.log("Scheduling custom attraction to Day 1...");
  62  |     const select = page.locator("select").last(); // Last select on page should be inside the card scheduler
  63  |     await select.selectOption("1");
  64  | 
  65  |     const itemContainer = page.locator('[data-attraction-name="Private Vatican Museum Night Tour"]');
  66  |     const addToDayBtn = itemContainer.locator("button", { hasText: "Add to Day" });
  67  |     await addToDayBtn.click();
  68  | 
  69  |     // 5. Navigate to Home, select Day 1, and click 'Ask AI Guide'
  70  |     console.log("Navigating back to Home to check the Today's Planner timeline...");
  71  |     await page.goto(BASE);
  72  |     
  73  |     // Select Day 1 in Today's Planner
  74  |     const daySelect = page.locator("select").first();
  75  |     await daySelect.selectOption("1");
  76  | 
  77  |     // Verify the custom tour shows up on the Day 1 timeline
  78  |     const timelineItem = page.locator("div.relative.group", { hasText: "Private Vatican Museum Night Tour" });
  79  |     await expect(timelineItem).toBeVisible();
  80  | 
  81  |     // Trigger AI Guide chat assistant (real AI call)
  82  |     console.log("Clicking 'Ask AI Guide' to start live Gemini AI travel assistant session...");
  83  |     const askAIBtn = timelineItem.locator("button", { hasText: "Ask AI Guide" });
  84  |     await askAIBtn.click();
  85  | 
  86  |     // 6. Validate Live Chat Response (AI Real Call)
  87  |     console.log("Validating chat redirection and waiting for streamed AI response...");
  88  |     await expect(page).toHaveURL(/.*\/chat/);
  89  |     
  90  |     // Wait for the AI assistant response to stream in
  91  |     const lastMsgBubble = page.locator(".prose").last();
  92  |     await expect(lastMsgBubble).toBeVisible({ timeout: 20000 });
  93  |     
  94  |     const firstResponseText = await lastMsgBubble.textContent();
  95  |     console.log(`Live AI Response snippet: "${firstResponseText?.slice(0, 100)}..."`);
> 96  |     expect(firstResponseText?.length).toBeGreaterThan(20);
      |                                       ^ Error: expect(received).toBeGreaterThan(expected)
  97  | 
  98  |     // 7. Send follow-up query to the AI (AI Real Call)
  99  |     console.log("Sending a follow-up destination dining recommendation query to AI...");
  100 |     await page.fill("#chat-input", "Suggest a high-end dinner spot in Rome near the Vatican under €100 per person.");
  101 |     await page.click("#chat-send-button");
  102 | 
  103 |     // Wait for follow-up response
  104 |     const followUpMsgBubble = page.locator(".prose").last();
  105 |     await expect(followUpMsgBubble).toBeVisible({ timeout: 25000 });
  106 |     const followUpResponseText = await followUpMsgBubble.textContent();
  107 |     console.log(`Follow-up AI Response snippet: "${followUpResponseText?.slice(0, 100)}..."`);
  108 |     expect(followUpResponseText?.length).toBeGreaterThan(20);
  109 | 
  110 |     // 8. Generate Smart Packing List with AI (AI Real Call)
  111 |     console.log("Navigating to Pack page and generating list using Gemini...");
  112 |     await page.goto(`${BASE}/pack`);
  113 |     await expect(page.locator("text=Packing Checklist")).toBeVisible();
  114 | 
  115 |     // Click generate button
  116 |     await page.click("#generate-packing-btn");
  117 | 
  118 |     // Wait for AI generation progress and rendering (shows progress bar when done)
  119 |     console.log("Waiting for AI packing list generation to complete...");
  120 |     const progressBar = page.locator("#packing-progress-bar");
  121 |     await expect(progressBar).toBeVisible({ timeout: 30000 });
  122 | 
  123 |     // Verify packing items populated and test checkboxes
  124 |     const firstCheckItem = page.locator("[id^=toggle-item-]").first();
  125 |     await expect(firstCheckItem).toBeVisible();
  126 |     
  127 |     // Toggle packing checklist item checked
  128 |     await firstCheckItem.click();
  129 |     console.log("E2E Travel Agent Persona validation test completed successfully!");
  130 |   });
  131 | });
  132 | 
```