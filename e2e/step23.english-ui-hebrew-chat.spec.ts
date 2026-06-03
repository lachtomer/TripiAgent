/**

 * Step 23 E2E — Feature 009: English UI shell, Hebrew/English chat locale routing

 * Run with: npx playwright test e2e/step23.english-ui-hebrew-chat.spec.ts

 */

import { test, expect } from "@playwright/test";

import { signInAs } from "./helpers/authFixture";



const BASE = "http://localhost:9001";



const EN_REPLY = "Here are some lunch spots near you in Verona.";

const HE_REPLY = "הנה כמה המלצות לארוחת צהריים בוורונה.";



test.describe("Step 23 — English UI, Hebrew chat (009)", () => {

  test.beforeEach(async ({ page }) => {

    await signInAs(page);

  });



  test("1. English LTR shell on home and chat", async ({ page }) => {

    await page.goto(BASE);

    await page.waitForLoadState("domcontentloaded");



    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    await expect(page.locator('[data-testid="translations-loaded"][data-locale="en"]')).toBeAttached();

    await expect(page.locator("#nav-link-home")).toContainText("Home");



    await page.goto(`${BASE}/chat`, { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Travel Chat" })).toBeVisible({ timeout: 15000 });

    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible();

  });



  test("2. Quick prompt sends English locale and shows English reply", async ({ page }) => {

    test.setTimeout(45000);



    const capturedLocales: string[] = [];

    await page.route("**/api/ai**", async (route) => {

      if (route.request().method() !== "POST") {

        await route.continue();

        return;

      }

      const body = JSON.parse(route.request().postData() || "{}");

      const locale = body.context?.locale as string | undefined;

      if (locale) capturedLocales.push(locale);

      await route.fulfill({

        status: 200,

        contentType: "text/plain; charset=utf-8",

        body: EN_REPLY,

      });

    });



    await page.goto(`${BASE}/chat`);

    await page.waitForLoadState("domcontentloaded");



    const chip = page.locator("#quick-prompt-what-s-near-me");

    await expect(chip).toBeVisible({ timeout: 10000 });

    await chip.click();



    await expect.poll(() => capturedLocales.some((l) => l.startsWith("en")), { timeout: 15000 }).toBeTruthy();



    await page.waitForFunction(

      () => {

        const el = document.querySelector(".prose");

        return el && (el.textContent?.includes("lunch spots") ?? false);

      },

      { timeout: 20000 }

    );

    await expect(page.locator(".prose").first()).toContainText("lunch spots");

  });



  test("3. Hebrew-only message sends Hebrew locale and shows Hebrew reply", async ({ page }) => {

    test.setTimeout(45000);



    const capturedLocales: string[] = [];

    await page.route("**/api/ai**", async (route) => {

      if (route.request().method() !== "POST") {

        await route.continue();

        return;

      }

      const body = JSON.parse(route.request().postData() || "{}");

      const locale = body.context?.locale as string | undefined;

      if (locale) capturedLocales.push(locale);

      await route.fulfill({

        status: 200,

        contentType: "text/plain; charset=utf-8",

        body: HE_REPLY,

      });

    });



    await page.goto(`${BASE}/chat`);

    await page.waitForLoadState("domcontentloaded");



    const hebrewQuestion = "איפה כדאי לאכול ארוחת צהריים?";

    await page.locator("#chat-input").fill(hebrewQuestion);

    await page.locator("#chat-send-button").click();



    await expect.poll(() => capturedLocales.includes("he"), { timeout: 15000 }).toBeTruthy();



    await page.waitForFunction(

      () => {

        const el = document.querySelector(".prose");

        return el && (el.textContent?.includes("המלצות") ?? false);

      },

      { timeout: 20000 }

    );

    await expect(page.locator(".prose").first()).toContainText("המלצות");

  });

});


