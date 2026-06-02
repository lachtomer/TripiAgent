import { Page } from "@playwright/test";

// Keep in sync with stores/tripStore.ts initialUsers
const USER_IDS: Record<string, string> = {
  Tomer: "u7",
  Liran: "u1",
  Ilanit: "u2",
  Yoav: "u3",
  Maya: "u4",
  Noam: "u5",
  Mor: "u6",
};

/**
 * Seeds tripiagent-auth localStorage key before the first page load,
 * so AuthGate treats the test session as signed-in.
 * Must be called BEFORE page.goto().
 */
export async function signInAs(page: Page, userName = "Tomer"): Promise<void> {
  const userId = USER_IDS[userName] ?? "u7";
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    {
      key: "tripiagent-auth",
      value: JSON.stringify({
        state: { signedIn: true, currentUserId: userId },
        version: 0,
      }),
    }
  );
}
