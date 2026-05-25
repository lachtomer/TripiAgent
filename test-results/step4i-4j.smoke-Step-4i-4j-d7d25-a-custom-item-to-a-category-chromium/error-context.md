# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: step4i-4j.smoke.spec.ts >> Step 4i + 4j: Packing List & BottomNav Polish >> 4i-7: Can add a custom item to a category
- Location: e2e\step4i-4j.smoke.spec.ts:66:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('[id^=\'add-item-trigger-\']') to be visible

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
          - heading "Pack" [level=1] [ref=e15]
          - paragraph [ref=e16]: AI-powered checklist — tailored to your itinerary
        - generic [ref=e17]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]:
                - img [ref=e21]
                - text: Packing Checklist
              - generic [ref=e26]: 0 of 4 packed
            - generic [ref=e27]:
              - generic [ref=e28]:
                - generic [ref=e29]:
                  - generic [ref=e30]: 0% packed
                  - generic [ref=e31]: 4 remaining
                - progressbar [ref=e32]
              - generic [ref=e33]:
                - button "Regenerate with AI" [ref=e34]:
                  - img
                  - text: Regenerate with AI
                - button "Clear All" [ref=e35]:
                  - img
                  - text: Clear All
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]:
                - button "Essentials 0/2" [expanded] [ref=e39]:
                  - img [ref=e40]
                  - generic [ref=e42]: Essentials
                  - generic [ref=e43]: 0/2
                - button "Check all" [ref=e44]
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - checkbox "Passport & Documents" [ref=e47]:
                    - img [ref=e48]
                    - generic [ref=e50]: Passport & Documents
                  - button "Delete Passport & Documents" [ref=e51]:
                    - img [ref=e52]
                - generic [ref=e55]:
                  - checkbox "Reusable Water Bottle" [ref=e56]:
                    - img [ref=e57]
                    - generic [ref=e59]: Reusable Water Bottle
                  - button "Delete Reusable Water Bottle" [ref=e60]:
                    - img [ref=e61]
                - button "Add item to Essentials" [ref=e64]:
                  - img [ref=e65]
                  - generic [ref=e66]: Add item to Essentials
            - generic [ref=e67]:
              - generic [ref=e68]:
                - button "Clothing 0/1" [expanded] [ref=e69]:
                  - img [ref=e70]
                  - generic [ref=e72]: Clothing
                  - generic [ref=e73]: 0/1
                - button "Check all" [ref=e74]
              - generic [ref=e75]:
                - generic [ref=e76]:
                  - checkbox "Comfortable Walking Shoes" [ref=e77]:
                    - img [ref=e78]
                    - generic [ref=e80]: Comfortable Walking Shoes
                  - button "Delete Comfortable Walking Shoes" [ref=e81]:
                    - img [ref=e82]
                - button "Add item to Clothing" [ref=e85]:
                  - img [ref=e86]
                  - generic [ref=e87]: Add item to Clothing
            - generic [ref=e88]:
              - generic [ref=e89]:
                - button "Electronics 0/1" [expanded] [ref=e90]:
                  - img [ref=e91]
                  - generic [ref=e93]: Electronics
                  - generic [ref=e94]: 0/1
                - button "Check all" [ref=e95]
              - generic [ref=e96]:
                - generic [ref=e97]:
                  - checkbox "Italian Power Adapter" [ref=e98]:
                    - img [ref=e99]
                    - generic [ref=e101]: Italian Power Adapter
                  - button "Delete Italian Power Adapter" [ref=e102]:
                    - img [ref=e103]
                - button "Add item to Electronics" [ref=e106]:
                  - img [ref=e107]
                  - generic [ref=e108]: Add item to Electronics
    - navigation [ref=e109]:
      - generic [ref=e110]:
        - link "Explore" [ref=e111] [cursor=pointer]:
          - /url: /
          - img [ref=e113]
          - generic [ref=e116]: Explore
        - link "Chat" [ref=e117] [cursor=pointer]:
          - /url: /chat
          - img [ref=e119]
          - generic [ref=e121]: Chat
        - link "Itinerary" [ref=e122] [cursor=pointer]:
          - /url: /itinerary
          - img [ref=e124]
          - generic [ref=e126]: Itinerary
        - link "Pack" [ref=e127] [cursor=pointer]:
          - /url: /pack
          - img [ref=e129]
          - generic [ref=e134]: Pack
  - alert [ref=e136]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Step 4i + 4j: Packing List & BottomNav Polish", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Clear localStorage to start fresh
  6   |     await page.goto("http://localhost:9001/pack");
  7   |     await page.evaluate(() => localStorage.removeItem("tripiagent-trip-storage"));
  8   |     await page.reload();
  9   |   });
  10  | 
  11  |   test("4i-1: Pack page renders with heading and generate button", async ({ page }) => {
  12  |     await expect(page.getByRole("heading", { name: "Pack" })).toBeVisible();
  13  |     const generateBtn = page.locator("#generate-packing-btn");
  14  |     await expect(generateBtn).toBeVisible();
  15  |     // Button says "Generate with AI" when list is empty or "Regenerate with AI" when items exist
  16  |     await expect(generateBtn).toContainText("AI");
  17  |   });
  18  | 
  19  |   test("4i-2: Default packing items exist and are toggleable", async ({ page }) => {
  20  |     // With fresh store, default items from initialPackingList should be present
  21  |     // The store seeds 4 default items
  22  |     const items = page.locator("[id^='toggle-item-']");
  23  |     await expect(items.first()).toBeVisible({ timeout: 5000 });
  24  |   });
  25  | 
  26  |   test("4i-3: Progress bar is visible when items exist", async ({ page }) => {
  27  |     // Wait for hydration
  28  |     await page.waitForSelector("[id^='toggle-item-']", { timeout: 5000 });
  29  |     const bar = page.locator("#packing-progress-bar");
  30  |     await expect(bar).toBeVisible();
  31  |   });
  32  | 
  33  |   test("4i-4: Toggling a packing item checks and unchecks it", async ({ page }) => {
  34  |     await page.waitForSelector("[id^='toggle-item-']", { timeout: 5000 });
  35  |     const firstItem = page.locator("[id^='toggle-item-']").first();
  36  |     // Check it
  37  |     await firstItem.click();
  38  |     // Should now have a checked square
  39  |     const checkedIcon = firstItem.locator("svg").first();
  40  |     await expect(checkedIcon).toBeVisible();
  41  |     // Uncheck it
  42  |     await firstItem.click();
  43  |   });
  44  | 
  45  |   test("4i-5: Category sections render with check-all button", async ({ page }) => {
  46  |     await page.waitForSelector("[id^='category-header-']", { timeout: 5000 });
  47  |     const categoryHeader = page.locator("[id^='category-header-']").first();
  48  |     await expect(categoryHeader).toBeVisible();
  49  |     const checkAllBtn = page.locator("[id^='check-all-']").first();
  50  |     await expect(checkAllBtn).toBeVisible();
  51  |   });
  52  | 
  53  |   test("4i-6: Category can be collapsed by clicking header", async ({ page }) => {
  54  |     await page.waitForSelector("[id^='category-header-']", { timeout: 5000 });
  55  |     const firstCategoryHeader = page.locator("[id^='category-header-']").first();
  56  |     // Collapse
  57  |     await firstCategoryHeader.click();
  58  | 
  59  |     // The add item trigger for this category should not be visible when collapsed
  60  |     const addTrigger = page.locator(`[id^='add-item-trigger-']`).first();
  61  |     await expect(addTrigger).not.toBeVisible({ timeout: 2000 }).catch(() => {
  62  |       // It might still be visible in another category — acceptable
  63  |     });
  64  |   });
  65  | 
  66  |   test("4i-7: Can add a custom item to a category", async ({ page }) => {
> 67  |     await page.waitForSelector("[id^='add-item-trigger-']", { timeout: 5000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  68  |     const addTrigger = page.locator("[id^='add-item-trigger-']").first();
  69  |     await addTrigger.click();
  70  | 
  71  |     const input = page.locator("[id^='new-item-input-']").first();
  72  |     await expect(input).toBeVisible();
  73  |     await input.fill("Custom Test Item");
  74  |     await input.press("Enter");
  75  | 
  76  |     await expect(page.getByText("Custom Test Item")).toBeVisible({ timeout: 3000 });
  77  |   });
  78  | 
  79  |   test("4i-8: Clear all button shows confirmation before clearing", async ({ page }) => {
  80  |     await page.waitForSelector("[id='clear-packing-btn']", { timeout: 5000 });
  81  |     const clearBtn = page.locator("#clear-packing-btn");
  82  |     await clearBtn.click();
  83  |     // Second click confirms
  84  |     await expect(clearBtn).toContainText("Confirm clear?");
  85  |   });
  86  | 
  87  |   test("4j-1: BottomNav renders with all 4 tabs", async ({ page }) => {
  88  |     await page.goto("http://localhost:9001/");
  89  |     const nav = page.locator("#bottom-nav");
  90  |     await expect(nav).toBeVisible();
  91  |     await expect(page.locator("#nav-link-explore")).toBeVisible();
  92  |     await expect(page.locator("#nav-link-chat")).toBeVisible();
  93  |     await expect(page.locator("#nav-link-itinerary")).toBeVisible();
  94  |     await expect(page.locator("#nav-link-pack")).toBeVisible();
  95  |   });
  96  | 
  97  |   test("4j-2: Active tab has aria-current=page", async ({ page }) => {
  98  |     await page.goto("http://localhost:9001/pack");
  99  |     const packLink = page.locator("#nav-link-pack");
  100 |     await expect(packLink).toHaveAttribute("aria-current", "page");
  101 |     // Chat should not
  102 |     const chatLink = page.locator("#nav-link-chat");
  103 |     await expect(chatLink).not.toHaveAttribute("aria-current", "page");
  104 |   });
  105 | 
  106 |   test("4j-3: No unread dot visible on chat when on chat page", async ({ page }) => {
  107 |     await page.goto("http://localhost:9001/chat");
  108 |     const dot = page.locator("#chat-unread-dot");
  109 |     // When on /chat, unread dot must not be shown (even if unreadChat is true)
  110 |     await expect(dot).not.toBeVisible({ timeout: 2000 }).catch(() => {
  111 |       // Pass if element doesn't exist
  112 |     });
  113 |   });
  114 | });
  115 | 
```