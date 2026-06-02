# Technical Plan: User Auth + Map Live Data + Bookmark Toasts (spec 005)
**Version:** v2 (post brutal-review — 15 fixes applied)

**Spec sources:**
- F-1: `specs/001-user-login-persistence/spec.md`
- Items a–e: unimplemented gaps from `specs/004-nav-home-redesign/spec.md`

---

## 1. Architectural Overview

### F-1 — Layered Auth & Persistence

The store already has `users[]`, `currentUser`, and `userPackingLists` — the *data* is mostly there. What is missing is the **authentication gate**, a **`/login` page**, and the **common vs. personal packing split**.

| What | Approach |
|------|----------|
| Auth state | New `stores/authStore.ts` (Zustand + persist, key `tripiagent-auth`) |
| Password check | `lib/userPasswords.ts` — `checkPassword(userName, password)` (2 args, no dead `userId`) |
| Auth gate | `components/AuthGate.tsx` — client component in layout, syncs tripStore via `useEffect` (not `setTimeout`) |
| Login page isolation | `app/login/layout.tsx` — minimal full-screen layout with **no** TopAppBar or BottomNav |
| Common packing | Add `commonPackingList` + `commonCheckmarks` to tripStore; explicit migration removes duplicates |
| Non-admin bookmark toggle | New `toggleSearchBookmark(place)` action bypasses admin check |

### Items a–e — Map + Toasts

| Item | Approach |
|------|----------|
| a–c Live map pins | `components/LiveMapCard.tsx` — data-driven SVG with `Date.UTC` day calc; fallback to decorative |
| d–e Bookmark toasts | Two `setToast` calls in `AttractionSearch.tsx`; message string is `"נשמר ליעדים ✓"` / `"הוסר מיעדים"` (synced across all docs) |

---

## 2. Constitution Check

| Gate | Status |
|------|--------|
| Next.js App Router only | ✓ `/login` is a proper App Router page with its own minimal layout |
| No server DB | ✓ Auth uses localStorage via Zustand persist |
| Zustand + persist | ✓ `authStore` matches existing pattern |
| Mobile 390px | ✓ Login page: full-screen, large tap targets, dark background during hydration |
| API keys server-only | ✓ No new API routes |
| E2E smoke tests required | ✓ `step21.auth.spec.ts` + Playwright `globalSetup` fixture to keep existing tests green |
| SDD first | ✓ This plan |

---

## 3. Component & State Design

### 3a. New: `stores/authStore.ts`

```typescript
interface AuthState {
  signedIn: boolean;
  currentUserId: string | null;
  signIn: (userName: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
}
```

- Persisted under key `tripiagent-auth`
- `signIn(userName, password)`:
  1. Resolve user: `users.find(u => u.name.toLowerCase() === userName.toLowerCase())`
  2. If not found: return `{ ok: false, error: t.wrongPassword }` (no "user not found" distinction — FR-2)
  3. Call `checkPassword(userName, password)` — if false: return `{ ok: false, error: t.wrongPassword }`
  4. `setState({ signedIn: true, currentUserId: user.id })`
  5. `useTripStore.getState().setCurrentUser(user.id)` — direct call, no timeout
- `signOut()`: `setState({ signedIn: false, currentUserId: null })`
- **`onRehydrateStorage` does NOT call tripStore** — sync is handled in `AuthGate.useEffect` where both stores are confirmed hydrated

### 3b. New: `lib/userPasswords.ts`

```typescript
// Fix #6: two-arg signature, no dead userId param
export function checkPassword(userName: string, password: string): boolean {
  return password.trim().toLowerCase() === userName.trim().toLowerCase();
}
```

### 3c. Modified: `stores/tripStore.ts`

**New fields:**
```typescript
commonPackingList: PackingItem[];
commonCheckmarks: Record<string, string[]>; // userId → checkedItemIds[]
```

**New actions:**
```typescript
addCommonPackingItem: (item: Omit<PackingItem, "id">) => void;
removeCommonPackingItem: (id: string) => void;
toggleCommonCheckmark: (itemId: string) => void; // uses currentUser

// Fix #4: bookmark toggle that bypasses admin check
toggleSearchBookmark: (place: SavedAttraction) => void;

// Fix #2: safe signout action — does NOT null currentUser
clearCurrentUserOnSignout: () => void; // sets packingList to [] without changing currentUser
```

**Fix #2 — signOut safety:**
`authStore.signOut()` does NOT call `setCurrentUser(null)`. After signout, `tripStore.currentUser` remains set to the last user's ID. `AuthGate` blocks all UI, so the stale `currentUser` is never exposed. On next sign-in, `setCurrentUser(newUserId)` correctly updates.

**Fix #5 — packing migration (`onRehydrateStorage`):**
```typescript
if (!state.commonPackingList) {
  // Seed common list from initialPackingList
  state.commonPackingList = initialPackingList;

  // Remove those same IDs from every user's personal packing list to avoid duplication
  const commonIds = new Set(initialPackingList.map(i => i.id));
  for (const uid of Object.keys(state.userPackingLists)) {
    state.userPackingLists[uid] = state.userPackingLists[uid].filter(i => !commonIds.has(i.id));
  }
  // Also clear the active packingList
  state.packingList = state.packingList.filter(i => !commonIds.has(i.id));
}
if (!state.commonCheckmarks) {
  state.commonCheckmarks = {};
}
```

**Fix #4 — `toggleSearchBookmark`:**
```typescript
toggleSearchBookmark: (place) => set((state) => {
  const exists = state.savedAttractions.some(a => a.id === place.id);
  if (exists) {
    return {
      savedAttractions: state.savedAttractions.filter(a => a.id !== place.id),
      toast: { message: "הוסר מיעדים", type: "info" },
    };
  }
  return {
    savedAttractions: [...state.savedAttractions, { ...place, upvotes: [], downvotes: [] }],
    toast: { message: "נשמר ליעדים ✓", type: "success" },
  };
}),
```
This replaces the call to `saveAttraction`/`removeSavedAttraction` in the search bookmark handler.

### 3d. New: `app/login/layout.tsx` — **minimal layout, no chrome** (Fix #3)

```tsx
// "use client" NOT needed — pure server layout
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-[390px] mx-auto bg-background flex flex-col items-center justify-center">
      {children}
    </div>
  );
}
```

`TopAppBar` and `BottomNav` are **not** included here — they only appear in the root layout, which is wrapped by `AuthGate`.

### 3e. New: `app/login/page.tsx` — `"use client"` (Fix #15)

- Full-screen, 390px-optimized sign-in form
- **Fix #7: Free-text username input** (not a dropdown) — does not reveal the user list (FR-2)
- Password input (type=password)
- Submit → `authStore.signIn(userName, password)` → on success `router.replace("/")`
- Inline error (not a toast — user stays on form)
- `data-testid`: `login-form`, `login-username-input`, `login-password-input`, `login-submit-btn`, `login-error-msg`

### 3f. New: `components/AuthGate.tsx` (Fixes #2, #8, #9)

```tsx
"use client";
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const isHydrated = useIsHydrated();
  const signedIn = useAuthStore(s => s.signedIn);
  const authUserId = useAuthStore(s => s.currentUserId);
  const setCurrentUser = useTripStore(s => s.setCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  // Fix #8: sync in useEffect, not setTimeout
  useEffect(() => {
    if (isHydrated && signedIn && authUserId) {
      setCurrentUser(authUserId);
    }
  }, [isHydrated, signedIn, authUserId, setCurrentUser]);

  // Fix #9: dark background during hydration, not null/white flash
  if (!isHydrated) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="text-[#006400] dark:text-[#86df72] font-bold text-lg">TripiAgent</span>
    </div>;
  }

  if (!signedIn) {
    router.replace("/login");
    return null;
  }

  return <>{children}</>;
}
```

Insert in `app/layout.tsx` wrapping only `<TopAppBar />`, `<main>`, `<BottomNav />` — so these are hidden when not signed in.

### 3g. Modified: `components/UserProfileSwitcher.tsx`

- Replace free-switching dropdown with **identity chip** showing avatar + name
- Add sign-out icon button (`LogOut` from lucide)
- On sign-out: call `authStore.signOut()` then `router.push("/login")`
- `data-testid="user-identity-chip"`, `data-testid="sign-out-btn"`

### 3h. Modified: `components/PackingList.tsx` (Fix #12 — confirmed target file)

Split into two sections rendered in order:
1. **"Group Essentials"** (`data-testid="common-packing-section"`) — renders `commonPackingList`; check-off calls `toggleCommonCheckmark`; add item calls `addCommonPackingItem`
2. **"My Items"** (`data-testid="personal-packing-section"`) — renders `packingList` (per-user); existing UI unchanged

Visual separator between sections. The AI-generate button still generates into personal section.

### 3i. Modified: `components/AttractionSearch.tsx` (Fixes #4, #10)

Replace `saveAttraction`/`removeSavedAttraction` calls in bookmark handler with `toggleSearchBookmark`:

```typescript
// Fix #4 + #10: single action, toast is set inside the store action
const toggleSearchBookmark = useTripStore(s => s.toggleSearchBookmark);
// ...
onClick={handleBookmarkToggle}
// handleBookmarkToggle just calls:
toggleSearchBookmark(placeAsAttraction);
```

Remove the manual `setToast` calls — `toggleSearchBookmark` sets the toast internally.

### 3j. New: `components/LiveMapCard.tsx` (Fix #11)

```typescript
// Fix #11: timezone-safe day calculation using UTC
const today = new Date();
const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
const tripStartUTC = tripStartDate
  ? Date.UTC(...(new Date(tripStartDate + "T00:00:00Z")
      .toISOString().split("T")[0].split("-").map(Number) as [number, number, number]))
  : null;
const daysSinceStart = tripStartUTC !== null
  ? Math.floor((todayUTC - tripStartUTC) / 86400000)
  : -1;
const todayDay = itinerary?.find(d => d.dayNumber === daysSinceStart + 1);
```

Coordinate mapping, pin rendering, GPS dot, and fallback to `<MapPreview />` are unchanged from the v1 plan.

### 3k. New: `e2e/globalSetup.ts` + `playwright.config.ts` update (Fix #1)

To prevent all 57 existing tests from breaking behind the auth gate:

```typescript
// e2e/helpers/authFixture.ts
export async function signInAs(page: Page, userName = "Tomer") {
  await page.addInitScript(({ userName }) => {
    localStorage.setItem("tripiagent-auth", JSON.stringify({
      state: { signedIn: true, currentUserId: userName === "Tomer" ? "u7" : "u1" },
      version: 0,
    }));
  }, { userName });
}
```

All existing E2E specs add `await signInAs(page)` in their `beforeEach` or at the top of each test (or a shared fixture auto-applies it). The `step21.auth.spec.ts` tests do **not** use this fixture — they test the actual auth flow from unauthenticated state.

---

## 4. Proposed File Modifications

| Action | File |
|--------|------|
| [NEW] | `stores/authStore.ts` |
| [NEW] | `lib/userPasswords.ts` |
| [NEW] | `app/login/layout.tsx` |
| [NEW] | `app/login/page.tsx` |
| [NEW] | `components/AuthGate.tsx` |
| [NEW] | `components/LiveMapCard.tsx` |
| [NEW] | `e2e/helpers/authFixture.ts` |
| [MODIFY] | `stores/tripStore.ts` — `commonPackingList`, `commonCheckmarks`, `toggleSearchBookmark`, migration, remove `setCurrentUser(null)` path |
| [MODIFY] | `app/layout.tsx` — wrap chrome in `<AuthGate>` |
| [MODIFY] | `components/UserProfileSwitcher.tsx` — identity chip + sign-out |
| [MODIFY] | `components/AttractionSearch.tsx` — use `toggleSearchBookmark`; remove manual toasts |
| [MODIFY] | `components/ActiveRouteMapCard.tsx` — swap `<MapPreview />` for `<LiveMapCard />` |
| [MODIFY] | `components/PackingList.tsx` — split Common + Personal sections |
| [MODIFY] | `lib/translations.ts` — new keys |
| [MODIFY] | All existing E2E specs — add `signInAs(page)` call |
| [NEW] | `e2e/step21.auth.spec.ts` — auth flow smoke tests |

---

## 5. Verification & Testing Plan

### TypeScript check
`npx tsc --noEmit` — zero errors required before E2E.

### E2E — `e2e/step21.auth.spec.ts` (does NOT use `signInAs` fixture)

| # | Scenario | Selectors |
|---|---|---|
| 1 | `GET /` unauthenticated → redirected to `/login` | `page.url().includes("/login")` |
| 2 | Sign in `Tomer` / `Tomer` → lands on `/` | `#nav-link-home[aria-current=page]` |
| 3 | Wrong password → stays on `/login`, shows error | `[data-testid="login-error-msg"]` visible |
| 4 | Sign out → redirected to `/login` | `[data-testid="sign-out-btn"]` click → url `/login` |
| 5 | After sign out, `GET /` → `/login` | redirect verified |
| 6 | Tomer adds personal item "Inhaler"; sign out; sign in Liran; `[data-testid="personal-packing-section"]` does not contain "Inhaler" | explicit item name + testid |
| 7 | `[data-testid="live-map-card"]` visible on `/` | `toBeVisible()` |
| 8 | Search result bookmark → toast `"נשמר ליעדים ✓"` | `[data-testid="toast-message"]` |
| 9 | Same bookmark click (remove) → toast `"הוסר מיעדים"` | `[data-testid="toast-message"]` |

### Regression protection
All **existing** E2E specs updated with `await signInAs(page)` in `beforeEach` (or per-test). Run `npx playwright test` — target: 0 new failures.

---

## 6. Open Questions / Deferred

| Item | Decision |
|------|----------|
| Rate-limit failed sign-ins | Add 500ms artificial delay on failure — no lockout counter in v1 |
| Leaflet real map | Deferred; SVG data-driven is v1 |
| Cross-device sync | Out of scope v1 |
| `locale` per-user in store | Currently single value shared; per-user locale deferred to F-2 |
