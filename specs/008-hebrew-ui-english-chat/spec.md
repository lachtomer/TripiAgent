# Specification: Hebrew UI Only — English in Chat

## 1. Goal & Context

TripiAgent currently exposes a global **EN / עב** language toggle in the top app bar (Step 15). That lets users switch the entire app between English and Hebrew UI, RTL/LTR layout, and translated chrome.

Product direction: **Hebrew is the only app language.** Travelers should not switch the whole UI to English. **English remains supported only in the AI chat** — users may type in English (or Hebrew), and the assistant replies in the language of the query (existing Gemini behavior).

**Target personas:** Hebrew-speaking planners and in-trip travelers (primary). English in chat supports mixed-language families and technical questions.

**Relationship to prior work:** Reverses the user-facing part of `.specify/step_15_rtl_hebrew_support.md` (global toggle + bilingual UI) while **keeping** RTL layout, Hebrew translations, BiDi isolation for place names/codes, and `dir="auto"` on chat input.

---

## 2. User Stories

- **As a Hebrew-speaking traveler**, I want the app chrome (nav, headers, buttons, checklists) always in Hebrew with RTL layout, **so that** I never need to hunt for a language switcher.
- **As a traveler**, I want to ask the AI assistant questions in **English or Hebrew**, **so that** I can use the language that fits the moment without changing the rest of the app.
- **As a traveler**, I want place names, flight codes, and Italian addresses to stay LTR inside the Hebrew UI, **so that** mixed-direction text stays readable (unchanged from Step 15).

---

## 3. Functional Requirements

### A. Remove global language toggle

- [ ] Remove the **EN / עב** button from `TopAppBar.tsx` (including `data-testid="lang-toggle"`).
- [ ] No other screen exposes a UI-locale switcher (login, settings, pack, etc.).

### B. Pin application UI to Hebrew

- [ ] All UI strings rendered via `useTranslation()` use the **Hebrew** dictionary (`translations.he`).
- [ ] Root document is always **`dir="rtl"`** and **`lang="he"`** (via `DynamicDirectionHandler` or equivalent).
- [ ] Default / persisted app locale is **`he`**. Users who previously chose `en` in `localStorage` are migrated to `he` on rehydrate (no user prompt).
- [ ] Remove or stop exporting **`setLocale`** from the public store API (internal migration may still read legacy `locale` once).

### C. Chat — English (and Hebrew) supported

- [ ] Chat input keeps **`dir="auto"`** so English and Hebrew typing align correctly.
- [ ] User message bubbles use **`dir="auto"`** (or equivalent) so English paragraphs render LTR inside the RTL shell.
- [ ] Assistant bubbles keep **`dir="auto"`** on markdown content (already present).
- [ ] AI trip context sent from `useChat` uses **browser / message language** (e.g. `navigator.language`), **not** the removed global UI locale.
- [ ] Gemini system prompt **continues** “respond in the user's query language” — no change required unless tests prove regression.

### D. Unchanged from Step 15

- [ ] BiDi: dynamic values (addresses, codes, coordinates) remain in LTR wrappers where already implemented.
- [ ] Tailwind logical properties and RTL mirroring for nav/FAB remain.
- [ ] `translations.en` may remain in the codebase for tests or dev-only fallbacks but is **not** user-selectable in production UI.

### E. Login page

- [ ] Login screen uses Hebrew strings (same as rest of app); no dependency on togglable `locale`.

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile; top bar gains horizontal space when toggle is removed (profile switcher only).
- **RTL:** Permanent RTL for all main routes except isolated LTR islands for codes/names.
- **Chat:** Hebrew chrome (title, placeholder, quick prompts); message body language follows user input.

---

## 5. Security & Edge Cases

- **Persistence:** Legacy `locale: "en"` in `tripiagent-trip-storage` must not leave the app in English UI after upgrade.
- **E2E:** Tests that click `#lang-toggle` or assert `data-locale="en"` must be rewritten for Hebrew-only defaults.
- **Search / Investigate:** Search inputs that already use `dir="auto"` stay as-is; no global EN UI.

---

## 6. Assumptions

1. **No server-side user locale** in v1 (client-only store).
2. **No per-user locale** in auth store for this feature — group trip shares Hebrew UI.
3. **Places/weather APIs** are not required to return Hebrew place names in this spec (see FEATURE_AUDIT future work).
4. **006 prep-screen reorg** is independent; this spec does not change screen IA.

---

## 7. Success Criteria

1. **No toggle:** Top app bar has no language control; visual inspection on mobile confirms.
2. **Hebrew chrome:** Bottom nav and page titles show Hebrew on cold load without visiting settings.
3. **RTL document:** `document.documentElement.dir === "rtl"` and `lang === "he"` on all main routes after hydration.
4. **English chat:** User can send an English message on `/chat` and receive an English reply; Hebrew message receives Hebrew reply (manual or E2E smoke).
5. **Migration:** User with persisted `locale: "en"` opens app and sees Hebrew nav labels without using a toggle.
6. **Regression:** Bookmark, itinerary, and logistics flows unchanged aside from language pinning.

---

## 8. Key Entities

| Entity | Description | Storage |
| --- | --- | --- |
| UI locale (removed as user choice) | Was `"en" \| "he"` in tripStore | Deprecated; pin `he` |
| Chat message | User/model text; language per message | `tripStore.chatMessages` |
| Trip context.locale | Hint for AI language | Request payload from browser / input, not UI toggle |

---

## 9. Out of Scope

- Removing `translations.en` from the repo entirely
- Translating Google Places / weather strings to Hebrew
- Per-traveler locale in auth (001 spec future)
- Voice input or automatic language detection beyond existing AI behavior
