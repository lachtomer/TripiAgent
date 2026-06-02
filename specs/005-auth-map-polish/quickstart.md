# Quickstart — spec 005 (v2, post brutal-review)

## Prerequisites

- Spec 004 fully deployed (BottomNav 6 tabs, InvestigateSection, ActiveRouteMapCard).
- `npm run build` passes with zero TypeScript errors.
- All E2E specs green (run `npx playwright test` to verify baseline).

---

## Implementation Order

### Phase 0 — E2E auth fixture (Fix #1, FIRST so existing tests stay green)

**`e2e/helpers/authFixture.ts`**
- Implement `signInAs(page, userName?)` using `page.addInitScript` to seed `tripiagent-auth` localStorage.
- Add `await signInAs(page)` to `beforeEach` in **all** existing E2E spec files.
- Run: `npx playwright test` → must still be fully green before continuing.

### Phase 1 — `lib/userPasswords.ts` (Fix #6)

```typescript
export function checkPassword(userName: string, password: string): boolean {
  return password.trim().toLowerCase() === userName.trim().toLowerCase();
}
```

- Two args only. No `userId`.

### Phase 2 — `stores/authStore.ts`

- Implement `AuthState` interface as defined in `data-model.md`.
- `signIn`: resolve user from `tripStore.getState().users`, call `checkPassword(user.name, password)`.
- `signOut`: `set({ signedIn: false, currentUserId: null })` — does NOT call `tripStore.setCurrentUser`.
- Persist key: `tripiagent-auth`.

### Phase 3 — `stores/tripStore.ts` additions

1. Add `commonPackingList: PackingItem[]` field (initial: `initialPackingList`).
2. Add `commonCheckmarks: Record<string, string[]>` field (initial: `{}`).
3. Add `addCommonPackingItem`, `removeCommonPackingItem`, `toggleCommonCheckmark` actions.
4. Add `toggleSearchBookmark(place)` — see `plan.md §3c` for exact implementation (Fix #4).
5. Implement migration in `onRehydrateStorage` (Fix #5) — deduplicate on first migration.

### Phase 4 — `app/login/layout.tsx` (Fix #3)

```tsx
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-[390px] mx-auto bg-background
                    flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
```

No `TopAppBar`, no `BottomNav`.

### Phase 5 — `app/login/page.tsx` ("use client") (Fix #15)

```
"use client"

data-testid: login-form
Inputs:
  - login-username-input  → type="text"  (Fix #7: free-text, not dropdown)
  - login-password-input  → type="password"
Button: login-submit-btn
Error span: login-error-msg (hidden when no error)

On submit:
  1. authStore.signIn(userName.trim(), password)
  2. If { ok: true }  → router.replace("/")
  3. If { ok: false } → set error state, do NOT navigate
```

### Phase 6 — `components/AuthGate.tsx` (Fixes #2, #8, #9)

- `"use client"`
- Render branded dark loading screen (`data-testid="auth-loading"`) while `!isHydrated` (Fix #9).
- `useEffect` syncs `tripStore.setCurrentUser(authUserId)` when `isHydrated && signedIn && authUserId` (Fix #8).
- Redirect to `/login` (via `router.replace`) when `isHydrated && !signedIn`.
- Does NOT call `setCurrentUser(null)` on signout (Fix #2).

### Phase 7 — `app/layout.tsx` update

Move `<TopAppBar />`, `<main>`, `<BottomNav />` inside `<AuthGate>`. The `<AuthGate>` itself and `<Toaster />` stay outside:

```tsx
<ThemeProvider ...>
  <AuthGate>
    <TopAppBar />
    <main className="...">
      {children}
    </main>
    <BottomNav />
  </AuthGate>
  <Toaster />
</ThemeProvider>
```

### Phase 8 — `components/UserProfileSwitcher.tsx`

- Replace free-switching dropdown with **identity chip** (name + avatar, `data-testid="user-identity-chip"`).
- Add `<button data-testid="sign-out-btn">` with `LogOut` icon.
- `signOut()` → `authStore.signOut()` then `router.push("/login")`.

### Phase 9 — `components/AttractionSearch.tsx` (Fixes #4, #10)

- Import `toggleSearchBookmark` from tripStore.
- Replace `saveAttraction` / `removeSavedAttraction` calls with `toggleSearchBookmark(placeAsAttraction)`.
- Remove manual `setToast(...)` calls — toast is set inside the store action.

### Phase 10 — `components/LiveMapCard.tsx` (Fix #11)

- Implement timezone-safe `daysSinceStart` using `Date.UTC(...)` (see `plan.md §3j`).
- Props: `{ className?: string }`.
- `data-testid="live-map-card"`.
- Renders as SVG; pins from `itinerary[todayDay].stops` + `savedAttractions`.
- Falls back to `<MapPreview />` when `tripStartDate` is null or itinerary is empty.

### Phase 11 — `components/ActiveRouteMapCard.tsx`

- Replace `<MapPreview />` with `<LiveMapCard />`.

### Phase 12 — `components/PackingList.tsx` (Fix #12)

Split render into two sections (Fix #12 — confirmed target is `components/PackingList.tsx`):

```
Section 1: "Group Essentials"
  data-testid="common-packing-section"
  Items: commonPackingList
  Toggle: toggleCommonCheckmark(itemId)
  Add: addCommonPackingItem

Section 2: "My Items"
  data-testid="personal-packing-section"
  Items: packingList (per-user)
  Toggle: existing togglePackingItem
  Add: existing add flow / AI generate
```

### Phase 13 — `lib/translations.ts`

Add all keys from `data-model.md §New Translation Keys`.

### Phase 14 — `e2e/step21.auth.spec.ts` (Fix #14)

Create new spec. Tests run **without** `signInAs` fixture. Explicit selectors per `data-model.md §Component data-testid Map`. Exact item name for packing isolation: `"Inhaler"`.

**Test 6 (Fix #14 — explicit selectors):**
```typescript
test("6: personal packing items are isolated between users", async ({ page }) => {
  await signInAs(page, "Tomer");
  await page.goto("/pack");
  // Add personal item
  await page.locator('[data-testid="personal-packing-section"] input[placeholder*="item"]')
    .fill("Inhaler");
  await page.locator('[data-testid="personal-packing-section"] button[type="submit"]').click();
  await expect(page.locator('[data-testid="personal-packing-section"]'))
    .toContainText("Inhaler");

  // Sign out and sign in as different user
  await page.locator('[data-testid="sign-out-btn"]').click();
  await page.waitForURL("**/login");
  await page.locator('[data-testid="login-username-input"]').fill("Liran");
  await page.locator('[data-testid="login-password-input"]').fill("Liran");
  await page.locator('[data-testid="login-submit-btn"]').click();
  await page.waitForURL("/");
  await page.goto("/pack");

  await expect(page.locator('[data-testid="personal-packing-section"]'))
    .not.toContainText("Inhaler");
});
```

**Test 8–9 (Fix #10 — exact toast strings):**
```typescript
// Test 8: bookmark adds
await expect(page.locator('[data-testid="toast-message"]'))
  .toContainText("נשמר ליעדים ✓");

// Test 9: bookmark removes
await expect(page.locator('[data-testid="toast-message"]'))
  .toContainText("הוסר מיעדים");
```

---

## Critical Implementation Notes

1. **Phase 0 FIRST** — The auth fixture must be added to all existing E2E tests before any auth code is deployed. If you implement auth first, the existing tests will all fail and you'll be debugging the wrong thing.

2. **`app/login/layout.tsx` is required** — Without it, `TopAppBar` and `BottomNav` will render on the login page. The root layout chrome must be inside `AuthGate`.

3. **`"use client"` on `app/login/page.tsx`** — The page uses `useRouter`, `useState`, and `useAuthStore`. It MUST be marked `"use client"`. (Fix #15)

4. **No `setCurrentUser(null)` anywhere** — Search the codebase for `setCurrentUser(null)` and remove all occurrences. (Fix #2)

5. **`checkPassword` is 2 args** — `checkPassword(userName, password)`. Never pass `userId`. (Fix #6)

6. **Username input is free-text** — The login form uses `<input type="text">`, NOT `<select>`. (Fix #7)

7. **Toast messages are exact strings** — All code must use exactly `"נשמר ליעדים ✓"` and `"הוסר מיעדים"`. Do not vary punctuation or spacing. (Fix #10)

8. **`LiveMapCard` uses `Date.UTC`** — See `plan.md §3j` for the exact snippet. (Fix #11)

9. **Migration is idempotent** — Check `!state.commonPackingList` before running. If the field exists, skip entirely. (Fix #5)

10. **`AuthGate` sync is in `useEffect`** — Not `setTimeout`, not `onRehydrateStorage`. The `useEffect` fires when both Zustand stores have hydrated on the client. (Fix #8)
