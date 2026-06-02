# Research & Design Decisions — spec 005 (v2, post brutal-review)

## R-1: Auth State Separation

`authStore` is a separate Zustand persist store (key `tripiagent-auth`) rather than a field in `tripStore`.

**Why separate:** Auth lifecycle (sign-in/out, redirect) should be independent of trip data. A single store mixing both creates coupling that makes testing difficult and risks data loss if the auth key changes.

**Why not server session:** v1 has no server DB. localStorage persist is sufficient for a trusted family group.

---

## R-2: Password Scheme

`checkPassword(userName, password)` — password equals username (case-insensitive).

**Design note (Fix #6):** The original plan had `checkPassword(userId, userName, password)` with an unused `userId` parameter. The function only needs `userName` and `password`. The caller resolves the user object before calling, using `users.find(u => u.name.toLowerCase() === userName.toLowerCase())`.

**Security note:** We deliberately do not distinguish "user not found" vs "wrong password" in the error message — both return the same generic `t.wrongPassword` message to avoid username enumeration.

---

## R-3: Auth Gate Approach

`AuthGate` is a client component placed in the root layout, wrapping `<TopAppBar>`, `<main>`, and `<BottomNav>`.

**Why not middleware:** Next.js edge middleware would run server-side and cannot read client-side localStorage. Middleware-based auth requires cookies or JWTs, which is over-engineering for v1.

**Fix #8 — no `setTimeout` for store sync:** The original plan used `setTimeout(0)` to sync `tripStore.currentUser` after auth rehydration, which is non-deterministic. The fix: sync happens inside `AuthGate.useEffect`, which runs after both stores have rehydrated on the client. This is deterministic.

**Fix #9 — no white flash:** While the store is hydrating (SSR/initial render), `AuthGate` renders a dark branded screen instead of `null` (which causes a white flash in dark mode).

---

## R-4: Login Page Isolation (Fix #3)

The root layout mounts `TopAppBar` and `BottomNav` outside of `AuthGate`. If `AuthGate` is in the root layout but only wraps `<main>`, the nav chrome would still appear on `/login`.

**Solution:** `app/login/layout.tsx` — a route-segment layout that overrides the root layout for the `/login` path group. This layout renders nothing but a full-screen centered container. The root layout's `TopAppBar` and `BottomNav` are moved inside `AuthGate`, so they only mount when `signedIn === true`.

The login route never enters `AuthGate` because routing happens before `AuthGate` renders.

---

## R-5: Username Input (Fix #7)

The original plan had a `<select>` dropdown of usernames for the login page. This violates the FR-2 requirement to not reveal the list of group members to unauthenticated visitors.

**Solution:** Free-text `<input type="text">` for username. Users know their own username. Error message is the same regardless of whether the username exists or the password is wrong.

---

## R-6: `setCurrentUser(null)` Safety (Fix #2)

`UserProfileSwitcher` and other components call `tripStore.currentUser` and assume it is a valid user ID. Setting it to `null` on sign-out crashes these components.

**Solution:** `authStore.signOut()` does NOT call `setCurrentUser(null)`. After sign-out, `tripStore.currentUser` retains the last signed-in user's ID, but `AuthGate` immediately redirects to `/login`, so the stale ID is never used. On the next sign-in, `AuthGate.useEffect` calls `setCurrentUser(newUserId)` which correctly overwrites the stale value.

---

## R-7: Non-Admin Bookmark Toggle (Fix #4)

`removeSavedAttraction` in `tripStore` guards removal behind an admin check (`currentUser === adminUserId`). Non-admin users clicking the "remove bookmark" button in `AttractionSearch` results would silently fail.

**Solution:** New `toggleSearchBookmark(place)` action that bypasses the admin check and directly adds/removes from `savedAttractions`. This is appropriate because bookmarking from search is a personal action (the place is in your personal target bank, not a shared itinerary item).

---

## R-8: Packing List Migration (Fix #5)

When `commonPackingList` is introduced, users who already have data in `userPackingLists` will see items in *both* the common section and their personal section.

**Solution:** `onRehydrateStorage` in `tripStore` runs a one-time migration:
1. Seeds `commonPackingList` from `initialPackingList` (the hard-coded template).
2. Removes those same item IDs from every user's `userPackingLists` entry.
3. Also removes them from the active `packingList` array.
4. Sets `commonCheckmarks: {}` if absent.

This is idempotent: if `commonPackingList` already exists (non-null), the migration is skipped.

---

## R-9: LiveMapCard Date Calculation (Fix #11)

JavaScript `new Date()` without a timezone specifier gives local time. `tripStartDate` (e.g., `"2026-06-26"`) parsed as `new Date("2026-06-26")` is treated as UTC midnight, while `new Date()` for "today" is in local timezone. Subtracting the two gives incorrect `daysSinceStart` values for users in non-UTC timezones (e.g., Israel UTC+3).

**Solution:** Use `Date.UTC(year, month, day)` for both operands so the subtraction is timezone-neutral:
```typescript
const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
```

---

## R-10: E2E Regression Prevention (Fix #1)

`AuthGate` redirects every unauthenticated page load to `/login`. All 57 existing E2E tests hit the home page or other protected routes without being signed in — they would all fail at the redirect.

**Solution:** `e2e/helpers/authFixture.ts` exposes `signInAs(page, userName?)` which uses Playwright's `page.addInitScript` to seed `tripiagent-auth` in localStorage *before* the first page load. This is the correct approach (vs. actually navigating to `/login` in every test), because:
- It does not add RTT / navigation overhead.
- It is deterministic — localStorage is set before React renders.
- It mirrors how a real returning user's browser behaves.

All existing specs add `await signInAs(page)` in `beforeEach`. New auth specs (`step21`) do NOT use this fixture so they test the real redirect behavior.

---

## R-11: Toast Message Standardization (Fix #10)

The three spec documents had three different variants of the "removed from saved" toast:
- plan.md: `"הוסר מיעדים ✓"` (with checkmark)
- data-model.md: `"הוסר מהיעדים"` (with ה prefix)
- quickstart.md: `"הוסר"` (truncated)

**Canonical values (used in all docs and code):**
- Add: `"נשמר ליעדים ✓"` (type: `"success"`)
- Remove: `"הוסר מיעדים"` (type: `"info"`, no checkmark)
