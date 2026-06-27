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

const TRIP_STORAGE_KEY = "tripiagent-trip-storage";

/**
 * Seeds tripMode in Zustand persist storage before page load.
 * Must be called BEFORE page.goto().
 */
export async function seedTripMode(
  page: Page,
  tripMode: "planning" | "in-trip"
): Promise<void> {
  await page.addInitScript(
    ({ key, mode }) => {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      parsed.state = {
        ...parsed.state,
        tripMode: mode,
        // Prevent onRehydrate auto in-trip migration during planning-mode E2E
        ...(mode === "planning" ? { tripStartDate: "2099-01-01" } : {}),
      };
      localStorage.setItem(key, JSON.stringify(parsed));
    },
    { key: TRIP_STORAGE_KEY, mode: tripMode }
  );
}
