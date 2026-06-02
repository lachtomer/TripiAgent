# Data Model — spec 005 (v2, post brutal-review)

## New Store: `stores/authStore.ts`

```typescript
interface AuthState {
  signedIn: boolean;
  currentUserId: string | null;

  signIn: (userName: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
}
```

**Persist key:** `tripiagent-auth`

**`signIn` call chain (Fix #13):**
1. Look up user: `const user = useTripStore.getState().users.find(u => u.name.toLowerCase() === userName.trim().toLowerCase())`
2. If not found: `return { ok: false, error: t.wrongPassword }` (no user-not-found distinction)
3. Call `checkPassword(user.name, password)` — if false: `return { ok: false, error: t.wrongPassword }`
4. `set({ signedIn: true, currentUserId: user.id })`
5. `return { ok: true }`

Note: `tripStore.setCurrentUser` is called by `AuthGate.useEffect` after hydration — NOT inside `signIn`.

---

## Modified Store: `stores/tripStore.ts`

### New Fields

```typescript
// Shared/group packing items (visible to all users)
commonPackingList: PackingItem[];

// Per-user checkmarks for commonPackingList items
// Key: userId, Value: array of PackingItem ids checked by that user
commonCheckmarks: Record<string, string[]>;
```

### New Actions

```typescript
// Common packing
addCommonPackingItem: (item: Omit<PackingItem, "id">) => void;
removeCommonPackingItem: (id: string) => void;
toggleCommonCheckmark: (itemId: string) => void; // applies to currentUser

// Fix #4: bypass admin check for search results bookmarking
// Sets toast internally — callers do not call setToast separately
toggleSearchBookmark: (place: SavedAttraction) => void;
```

### Removed / Changed Actions

**`setCurrentUser`**: remains unchanged. It is called by `AuthGate.useEffect` with the real userId after sign-in. It is NEVER called with `null` — signOut does not touch tripStore directly.

### Migration in `onRehydrateStorage` (Fix #5)

```typescript
onRehydrateStorage: () => (state) => {
  if (!state) return;
  // Deduplicate common vs personal packing on first migration
  if (!state.commonPackingList) {
    state.commonPackingList = initialPackingList;
    const commonIds = new Set(initialPackingList.map(i => i.id));
    for (const uid of Object.keys(state.userPackingLists ?? {})) {
      state.userPackingLists[uid] = (state.userPackingLists[uid] ?? [])
        .filter(i => !commonIds.has(i.id));
    }
    state.packingList = (state.packingList ?? []).filter(i => !commonIds.has(i.id));
  }
  if (!state.commonCheckmarks) {
    state.commonCheckmarks = {};
  }
}
```

---

## New File: `lib/userPasswords.ts` (Fix #6)

```typescript
// Fix #6: two-arg signature — userId is not needed
export function checkPassword(userName: string, password: string): boolean {
  return password.trim().toLowerCase() === userName.trim().toLowerCase();
}
```

---

## New File: `e2e/helpers/authFixture.ts` (Fix #1)

```typescript
import { Page } from "@playwright/test";

// userId map — keep in sync with stores/tripStore.ts initialState.users
const USER_IDS: Record<string, string> = {
  Tomer: "u7",
  Liran: "u1",
  Mia: "u2",
};

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
```

---

## New Translation Keys — `lib/translations.ts`

```typescript
// English (en)
loginTitle: "Sign In",
loginUsernamePlaceholder: "Your name",  // free-text input (Fix #7)
loginPasswordPlaceholder: "Password",
loginSubmitBtn: "Sign In",
wrongPassword: "Incorrect name or password",
signOut: "Sign Out",
commonPackingSection: "Group Essentials",
personalPackingSection: "My Items",
bookmarkAdded: "נשמר ליעדים ✓",   // Fix #10: canonical toast message (kept in Hebrew for brand consistency)
bookmarkRemoved: "הוסר מיעדים",   // Fix #10: canonical, no checkmark

// Hebrew (he)
loginTitle: "כניסה",
loginUsernamePlaceholder: "השם שלך",   // free-text input (Fix #7)
loginPasswordPlaceholder: "סיסמא",
loginSubmitBtn: "כניסה",
wrongPassword: "שם או סיסמא שגויים",
signOut: "יציאה",
commonPackingSection: "ציוד קבוצתי",
personalPackingSection: "הפריטים שלי",
bookmarkAdded: "נשמר ליעדים ✓",
bookmarkRemoved: "הוסר מיעדים",
```

---

## Component `data-testid` Map

| Component | `data-testid` |
|---|---|
| `app/login/page.tsx` form | `login-form` |
| Username input | `login-username-input` |
| Password input | `login-password-input` |
| Submit button | `login-submit-btn` |
| Error message | `login-error-msg` |
| `UserProfileSwitcher` chip | `user-identity-chip` |
| Sign-out button | `sign-out-btn` |
| Common packing section | `common-packing-section` |
| Personal packing section | `personal-packing-section` |
| `LiveMapCard` wrapper | `live-map-card` |
| `AuthGate` loading screen | `auth-loading` |
