# Tasks: User Auth + Live Map + Bookmark Toasts (spec 005)

**Feature directory:** `specs/005-auth-map-polish`
**Spec source:** `specs/001-user-login-persistence/spec.md` (F-1) + `specs/004-nav-home-redesign` gaps (items a–e)
**Plan:** `specs/005-auth-map-polish/plan.md` (v2, post brutal-review)

> **CRITICAL ORDERING:** Phase 1 (E2E fixture) must be committed BEFORE any auth code is
> written. If auth redirects land first, all 57 existing tests will fail immediately.

---

## Dependencies

```
Phase 1 (E2E fixture) → unlocks Phase 3, 4, 5, 6 (existing tests stay green)
Phase 2 (foundational stores) → required by Phase 3, 4, 5
Phase 2 → Phase 3 (auth gate needs authStore)
Phase 3 → Phase 4 (packing needs currentUser from auth)
Phase 2 → Phase 5 (toggleSearchBookmark needs tripStore)
Phase 3 + Phase 5 → Phase 6 (E2E tests need both)
```

---

## Phase 1: E2E Auth Fixture (FIRST — keep existing tests green)

> **Story goal:** Protect all 57 existing E2E tests from the upcoming AuthGate redirect.

- [x] T001 Create `e2e/helpers/authFixture.ts` — implement `signInAs(page, userName?)` using `page.addInitScript` to seed `tripiagent-auth` key in localStorage before first page load; user-ID map: `{ Tomer: "u7", Liran: "u1", Mia: "u2" }`
- [x] T002 Add `import { signInAs } from "./helpers/authFixture"` and `await signInAs(page)` in `beforeEach` to every existing E2E spec: `e2e/step4f.smoke.spec.ts`, `step4h.smoke.spec.ts`, `step4i-4j.smoke.spec.ts`, `step6.smoke.spec.ts`, `step10.smoke.spec.ts`, `step13.smoke.spec.ts`, `step14.smoke.spec.ts`, `step15.smoke.spec.ts`, `step16.smoke.spec.ts`, `step20.nav-home-redesign.spec.ts` (and any other specs in `e2e/`)
- [x] T003 Run `npx playwright test` — must be fully green (baseline) before proceeding to Phase 2

---

## Phase 2: Foundational — Stores & Translations

> **Story goal:** Lay the data layer that all auth and packing features depend on.

- [x] T004 [P] Create `lib/userPasswords.ts` — export `checkPassword(userName: string, password: string): boolean` that returns `password.trim().toLowerCase() === userName.trim().toLowerCase()`; exactly 2 args, no `userId` param
- [x] T005 [P] Create `stores/authStore.ts` — `AuthState` interface (`signedIn`, `currentUserId`, `signIn`, `signOut`); `signIn` resolves user from `useTripStore.getState().users`, calls `checkPassword(user.name, password)`, sets `{ signedIn: true, currentUserId: user.id }`, returns `{ ok: true/false, error? }`; `signOut` sets `{ signedIn: false, currentUserId: null }` only — does NOT call `tripStore.setCurrentUser`; persist key: `tripiagent-auth`
- [x] T006 Modify `stores/tripStore.ts` — add fields `commonPackingList: PackingItem[]` (initial: `initialPackingList`), `commonCheckmarks: Record<string, string[]>` (initial: `{}`); add actions `addCommonPackingItem`, `removeCommonPackingItem`, `toggleCommonCheckmark(itemId)`; add `toggleSearchBookmark(place: SavedAttraction)` that adds/removes from `savedAttractions` and sets the canonical toast message (`"נשמר ליעדים ✓"` / `"הוסר מיעדים"`) without admin check; implement idempotent `onRehydrateStorage` migration that seeds `commonPackingList` from `initialPackingList` and strips those IDs from all `userPackingLists` entries and from `packingList`; never call `setCurrentUser(null)` anywhere
- [x] T007 [P] Modify `lib/translations.ts` — add keys: `loginTitle`, `loginUsernamePlaceholder`, `loginPasswordPlaceholder`, `loginSubmitBtn`, `wrongPassword`, `signOut`, `commonPackingSection`, `personalPackingSection`, `bookmarkAdded` (`"נשמר ליעדים ✓"`), `bookmarkRemoved` (`"הוסר מיעדים"`) in both `en` and `he` locales (see `specs/005-auth-map-polish/data-model.md §New Translation Keys` for exact values)

---

## Phase 3: User Story 1 — Auth Gate & Login Page (FR-1–FR-5, FR-17–FR-18)

> **Story goal:** Users must sign in to access any trip feature; identity is visible in chrome; sign-out works.

- [x] T008 [US1] Create `app/login/layout.tsx` — server component (no `"use client"`); renders a full-screen `div` with `min-h-screen w-full max-w-[390px] mx-auto bg-background flex flex-col items-center justify-center`; no `TopAppBar`, no `BottomNav`
- [x] T009 [US1] Create `app/login/page.tsx` — must have `"use client"` at top; renders `data-testid="login-form"` with `data-testid="login-username-input"` (`type="text"`, free-text, NOT a dropdown — FR-2), `data-testid="login-password-input"` (`type="password"`), `data-testid="login-submit-btn"`; on submit: call `authStore.signIn(userName.trim(), password)`, on `{ ok: true }` call `router.replace("/")`, on `{ ok: false }` show `data-testid="login-error-msg"` with the `wrongPassword` translation; error message does not distinguish username-not-found vs. wrong-password (FR-2); styled for 390px with large tap targets and dark-mode accent
- [x] T010 [US1] Create `components/AuthGate.tsx` — `"use client"`; implements `useIsHydrated` hook to wait for Zustand rehydration; while `!isHydrated` render branded dark screen: `<div data-testid="auth-loading" className="min-h-screen bg-background flex items-center justify-center"><span className="text-[#006400] ...">TripiAgent</span></div>` (no white flash); `useEffect(() => { if (isHydrated && signedIn && authUserId) setCurrentUser(authUserId); }, [isHydrated, signedIn, authUserId, setCurrentUser])` (not `setTimeout`); when `isHydrated && !signedIn` call `router.replace("/login")` and return `null`; when signed-in render `<>{children}</>`
- [x] T011 [US1] Modify `app/layout.tsx` — move `<TopAppBar />`, `<main className="...">`, `<BottomNav />` inside `<AuthGate>`; `<AuthGate>` and `<Toaster />` remain outside so they do not block the login redirect; `<ThemeProvider>` stays as outermost wrapper
- [x] T012 [US1] Modify `components/UserProfileSwitcher.tsx` — replace free-switching user dropdown with an identity chip (`data-testid="user-identity-chip"`) showing avatar + display name for the signed-in user; add sign-out icon button (`data-testid="sign-out-btn"`) using `LogOut` icon from lucide; on click: `authStore.signOut()` then `router.push("/login")`; do not expose the user list to unauthenticated views

---

## Phase 4: User Story 2 — Common + Personal Packing (FR-9–FR-12)

> **Story goal:** Packing page shows group essentials and personal items in separate sections; check-off is per-user on common items.

- [x] T013 [US2] Modify `components/PackingList.tsx` — split render into two ordered sections: (1) `data-testid="common-packing-section"` titled by `t.commonPackingSection` ("Group Essentials" / "ציוד קבוצתי") sourced from `commonPackingList`, check-off calls `toggleCommonCheckmark(itemId)`, add-item calls `addCommonPackingItem`; (2) `data-testid="personal-packing-section"` titled by `t.personalPackingSection` ("My Items" / "הפריטים שלי") sourced from `packingList` (per-user), uses existing `togglePackingItem` and AI-generate flow; visual divider between sections; both sections scroll independently within the page

---

## Phase 5: User Story 3 — Live Map Card + Bookmark Toasts (Items a–e)

> **Story goal:** Home screen map shows actual trip pins; bookmarking from search triggers toast feedback.

- [x] T014 [US3] Create `components/LiveMapCard.tsx` — `data-testid="live-map-card"`; reads `itinerary`, `savedAttractions`, `tripStartDate` from tripStore; timezone-safe day calc: `const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())` — see `specs/005-auth-map-polish/plan.md §3j` for full snippet; renders SVG viewport 390×220; today's itinerary stops as green pins `●`, saved attractions as yellow pins `★`, GPS location as blue dot if geolocation permitted; falls back to `<MapPreview />` if `tripStartDate` is null or itinerary is empty; accepts optional `className` prop
- [x] T015 [US3] Modify `components/ActiveRouteMapCard.tsx` — replace `<MapPreview />` import with `<LiveMapCard />` import; pass `className` if needed; no other logic changes
- [x] T016 [US3] Modify `components/AttractionSearch.tsx` — import `toggleSearchBookmark` from tripStore; replace the two `saveAttraction` / `removeSavedAttraction` + `setToast` call sites in the bookmark handler with a single `toggleSearchBookmark(placeAsAttraction)` call; remove manual `setToast` invocations from this component (toast is set inside the store action); the `placeAsAttraction` mapping: `{ id: place.place_id, name: place.name, lat: place.lat, lng: place.lng, category: place.type ?? "attraction", upvotes: [], downvotes: [] }`

---

## Phase 6: E2E + TypeScript + Build

> **Story goal:** All existing tests remain green; new auth smoke tests pass; build succeeds.

- [x] T017 Create `e2e/step21.auth.spec.ts` — 9 tests, no `signInAs` fixture (tests real unauth state); scenarios per `specs/005-auth-map-polish/quickstart.md §Phase 14`; test 1: `GET /` unauthenticated → redirects to `/login`; test 2: valid sign-in → lands on `/`; test 3: wrong password → stays on `/login` with `[data-testid="login-error-msg"]` visible; test 4: sign-out button → redirects to `/login`; test 5: after sign-out `GET /` → `/login`; test 6: packing isolation between Tomer and Liran using item `"Inhaler"` and `data-testid="personal-packing-section"` (see `quickstart.md` for full test body); test 7: `[data-testid="live-map-card"]` visible on home; test 8: bookmark add toast `"נשמר ליעדים ✓"`; test 9: bookmark remove toast `"הוסר מיעדים"`
- [x] T018 Run `npx tsc --noEmit` — fix all TypeScript errors before running E2E
- [x] T019 Run `npx playwright test` — target: zero failures across all specs; fix any regressions in existing specs (must not use `test.skip` to hide failures)
- [x] T020 Run `npm run build` — production build must succeed with zero errors; fix any build-time type or import issues

---

## Parallel Execution Map

| Can run in parallel | Tasks |
|---|---|
| Phase 2 independent files | T004, T005, T007 (separate files); T006 depends on T005 (tripStore additions) |
| Phase 3 independent files | T008, T009 (separate files, depend on T005 completing) |
| Phase 5 independent files | T014 (after T015 placeholder exists), T016 (after T006) |

---

## Format Validation

All tasks follow: `- [x] T### [P?] [US?] Description with exact file path`. ✓
Total tasks: **20**
Tasks per story:
- US1 (Auth): T008–T012 = 5 tasks
- US2 (Packing): T013 = 1 task
- US3 (Map + Toasts): T014–T016 = 3 tasks

Parallel opportunities: T004+T005+T007, T008+T009, T014+T016

---

## MVP Scope

Minimum viable: **Phase 1 + Phase 2 + Phase 3** (T001–T012)
This delivers the auth gate, login page, sign-out, and identity chip — the core of F-1.
Phase 4 (packing split) and Phase 5 (map/toasts) are independent increments that can follow.
