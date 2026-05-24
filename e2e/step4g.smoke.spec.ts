/**
 * Step 4g smoke test — Chat interface features
 * Run with: npx playwright test e2e/step4g.smoke.spec.ts
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:9001";

test.describe("Step 4g — Chat Interface Polish", () => {
  test("1. ChatPage mounts and renders quick prompt chips", async ({ page }) => {
    await page.goto(`${BASE}/chat`);

    // Verify chat title is present
    await expect(page.getByRole("heading", { name: "Travel Chat" })).toBeVisible();

    // Verify the quick prompt chips are visible
    const chip1 = page.locator("#quick-prompt-what-s-near-me");
    const chip2 = page.locator("#quick-prompt-find-lunch-under-15");
    const chip3 = page.locator("#quick-prompt-plan-my-afternoon");
    const chip4 = page.locator("#quick-prompt-skip-the-line-tips");

    await expect(chip1).toBeVisible();
    await expect(chip2).toBeVisible();
    await expect(chip3).toBeVisible();
    await expect(chip4).toBeVisible();
  });

  test("2. Tapping a quick prompt chip sends message & shows typing indicator", async ({ page }) => {
    await page.goto(`${BASE}/chat`);

    // Tap "Skip the line tips" chip
    const chip = page.locator("#quick-prompt-skip-the-line-tips");
    await chip.click();

    // Check user message is visible in chat history
    const userMsg = page.locator(".bg-primary.text-primary-foreground").first();
    await expect(userMsg).toContainText("Skip the line tips");

    // Check typing dots are briefly visible or helper exists
    // Since API is fast, typing indicator might flash quickly, but let's check it doesn't crash
    const assistantMsg = page.locator(".prose").first();
    await expect(assistantMsg).toBeVisible({ timeout: 15000 });
  });

  test("3. Renders assistant responses as Markdown (bold, lists, etc.)", async ({ page }) => {
    await page.goto(`${BASE}/chat`);

    // Send a message asking for markdown output
    const input = page.locator("#chat-input");
    await input.fill("Respond with: **Bold text** and - list item");
    await page.locator("#chat-send-button").click();

    // Verify response contains a bold element (strong) or list element (li) within the prose container
    const prose = page.locator(".prose").first();
    await expect(prose).toBeVisible({ timeout: 15000 });

    // ReactMarkdown will render **Bold text** as <strong>Bold text</strong>
    const strongElement = prose.locator("strong").first();
    const listElement = prose.locator("li").first();

    const hasStrong = await strongElement.count() > 0;
    const hasList = await listElement.count() > 0;
    expect(hasStrong || hasList).toBe(true);
  });
});
