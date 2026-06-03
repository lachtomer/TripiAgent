# Technical Plan: 009 — English UI Only, Hebrew in Chat

**Feature spec:** `specs/009-english-ui-hebrew-chat/spec.md`  
**Research:** `specs/009-english-ui-hebrew-chat/research.md`  
**Data model:** `specs/009-english-ui-hebrew-chat/data-model.md`  
**Contracts:** `specs/009-english-ui-hebrew-chat/contracts/ui-and-chat-language.md`  
**Quickstart:** `specs/009-english-ui-hebrew-chat/quickstart.md`  
**Branch:** `main` (local dev port **9001**; incremental commits when user asks)

---

## 1. Architectural Changes

Behavioral reversal of Feature 008 — **no new API routes**, no new npm dependencies.

```
BEFORE (008)
  locale pinned "he"  →  translations.he  →  document rtl/lang=he
  useChat: context.locale = navigator.language

AFTER (009)
  locale pinned "en"  →  translations.en  →  document ltr/lang=en
  useChat: context.locale = resolveChatContextLocale(message)
           quick-prompt → always "en"
           typed Hebrew (overwhelming) → "he"
           mixed HE+EN → "en" (+ gemini rule)
```

**In scope:** Pin English UI, LTR shell, Hebrew-capable chat, hardcoded Hebrew cleanup, locale migration `he`→`en`, E2E updates.  
**Out of scope:** Delete `translations.he`, translate Google Places strings, per-user locale, language toggle, voice input.

---

## 2. Component Design & State

### 2a. State store (`stores/tripStore.ts`)

| Change | Detail |
| --- | --- |
| Type | `locale: "en"` (was `"he"`) |
| Default | `locale: "he"` → `"en"` |
| Rehydrate | If `locale !== "en"`, set `"en"` (inverse of 008) |
| `resetStore` | `locale: "en"` |
| Toasts | `bookmarkAdded` / `bookmarkRemoved` → English strings matching `translations.en` |

No `setLocale` (still removed in 008).

### 2b. Translations (`lib/translations.ts`)

```typescript
export function useTranslation() {
  return { t: translations.en, locale: "en" as const };
}
```

**Fix data bug:** `translations.en.bookmarkAdded` / `bookmarkRemoved` currently Hebrew — set to English (e.g. `Saved to Locations ✓`, `Removed from Locations`).

Keep `translations.he` object for tests/dev; not used in production `useTranslation()`.

### 2c. Document direction (`components/DynamicDirectionHandler.tsx`)

```typescript
document.documentElement.dir = "ltr";
document.documentElement.lang = "en";
// data-locale="en"
```

### 2d. Chat locale (`lib/chatLocale.ts` — NEW)

```typescript
const HEBREW_SCRIPT = /[\u0590-\u05FF]/;

export function isOverwhelminglyHebrew(text: string): boolean {
  // e.g. ≥50% of letter chars are Hebrew, or all non-whitespace is Hebrew
}

export function resolveChatContextLocale(
  message: string,
  options?: { isQuickPrompt?: boolean }
): string {
  if (options?.isQuickPrompt) return "en";
  return isOverwhelminglyHebrew(message) ? "he" : "en";
}
```

Unit tests: quick-prompt → `en`; pure Hebrew → `he`; pure English → `en`; mixed → `en`; empty → `en`.

### 2e. Chat hook (`hooks/useChat.ts`)

| Before | After |
| --- | --- |
| `locale: navigator.language` | `locale: resolveChatContextLocale(text, { isQuickPrompt })` |

`sendMessage(text, options?: { isQuickPrompt?: boolean })` — **required** signature change:

- `handleSend` → `{ isQuickPrompt: false }`
- `handleQuickPrompt` → `{ isQuickPrompt: true }` (do **not** infer from English text alone — avoids misclassifying user-typed English prompts)
- `pendingPrompt` effect in `ChatInterface` → `isQuickPrompt: true` when consuming store-driven English chips

**Do not** read `tripStore.locale` for AI context.

### 2f. Gemini prompt (`lib/gemini.ts`)

Extend rule **#5 Language Matching**:

- Respond in the user's query language when monolingual.
- **Mixed Hebrew and English** in one message → respond in **English**.
- **Overwhelmingly Hebrew** message → respond in **Hebrew**.
- When `Preferred Locale/Language` is `en`, do not default replies to Hebrew unless the user message is overwhelmingly Hebrew.

### 2g. Chat UI (`components/ChatInterface.tsx`)

| Change | Detail |
| --- | --- |
| Shell | `dir="rtl"` → `dir="ltr"` |
| Input / bubbles | Keep `dir="auto"` on message content |
| Quick prompts | Pass `isQuickPrompt: true` into `sendMessage` |

### 2h. Hardcoded Hebrew chrome — full inventory (MANDATORY, not optional)

**Gate:** `rg '[\u0590-\u05FF]' app components stores lib --glob '!lib/translations.ts'` must return **zero** matches in production paths (or only inside `translations.he` after splitting file — see Step 2 script below).

| File | Issue | Fix |
| --- | --- | --- |
| `lib/translations.ts` | `translations.en.bookmarkAdded/Removed` are Hebrew | English; must match `tripStore` toasts |
| `stores/tripStore.ts` | Hebrew bookmark toasts in `toggleSearchBookmark` | English |
| `components/InvestigateSection.tsx` | `חקר / Investigate`, `יעד` / `סביבי`, location hint | English only |
| `components/ActiveRouteMapCard.tsx` | `המסלול שלי`, bilingual `aria-label` | English only |
| `app/bookings/page.tsx` | `metadata.title` Hebrew | `Logistics & Bookings — TripiAgent` |
| `app/locations/page.tsx` | `metadata.title` Hebrew | `Locations — TripiAgent` |
| `app/login/page.tsx` | `translations.he` import | `useTranslation()` / `translations.en` |

**Out of grep gate (allowed):** `translations.he` object only; user-generated `localStorage` content; chat message bodies typed by user.

**Not in repo scope:** `jobmatcher-fix/` (untracked sibling project — ignore for TripiAgent CI).

### 2i. Locale-conditional layout (MANDATORY in Step 4 — dead `he` branches are Hebrew leakage risk)

Files with `locale === "he" ? "rtl" : "ltr"` — default to LTR:

- `components/NearbyPlacesSection.tsx` (`formatDistance`, rating row `dir`)
- `components/AttractionSearch.tsx`
- `components/EssentialsChecklist.tsx`
- `components/SavedAttractionsList.tsx`
- `components/LogisticsCard.tsx`

Remove ` מ'` / `ק"מ` branches and `locale === "he" ? "rtl" : "ltr"` — use `"m"`, `"km"`, `"ltr"` only so Hebrew unit glyphs cannot resurface if locale typing regresses.

### 2j. Login (`app/login/page.tsx`)

- `translations.he` → `useTranslation()` or `translations.en`.

### 2k. Top app bar

- **No change** — toggle already removed in 008; verify still absent.

---

## 3. API Routes & Schemas

**None.** `POST /api/ai` shape unchanged; client sends updated `TripContext.locale` per contract.

---

## 4. Proposed File Modifications

| Action | File |
| --- | --- |
| MODIFY | `lib/translations.ts` |
| NEW | `lib/chatLocale.ts` |
| NEW | `lib/chatLocale.test.ts` |
| MODIFY | `lib/gemini.ts` |
| MODIFY | `hooks/useChat.ts` |
| MODIFY | `stores/tripStore.ts` |
| MODIFY | `stores/tripStore.test.ts` |
| MODIFY | `components/DynamicDirectionHandler.tsx` |
| MODIFY | `components/ChatInterface.tsx` |
| MODIFY | `components/InvestigateSection.tsx` |
| MODIFY | `components/ActiveRouteMapCard.tsx` |
| MODIFY | `app/login/page.tsx` |
| MODIFY | `app/bookings/page.tsx` |
| MODIFY | `app/locations/page.tsx` |
| MODIFY | `e2e/step15.smoke.spec.ts` |
| MODIFY | `e2e/step17.smoke.spec.ts` |
| MODIFY | `e2e/step21.auth.spec.ts` |
| NEW | `e2e/step23.english-ui-hebrew-chat.spec.ts` |
| MODIFY | `.cursor/rules/specify-rules.mdc` |

**Also MODIFY (§2i):** `NearbyPlacesSection.tsx`, `AttractionSearch.tsx`, `EssentialsChecklist.tsx`, `SavedAttractionsList.tsx`, `LogisticsCard.tsx` (if `locale` branches remain).

**Verify only:** `lib/agentGraph.ts` (inherits locale from API payload), `components/TopAppBar.tsx`

### 2l. Pre-merge Hebrew audit (CI-minded)

```powershell
# PowerShell — fail if Hebrew outside translations.he block
rg '[\u0590-\u05FF]' app components stores lib -g '!lib/translations.ts'
# Manual: open lib/translations.ts — only `he:` block may contain Hebrew
rg '[\u0590-\u05FF]' e2e
```

Consider adding `scripts/check-no-hebrew-chrome.mjs` in Step 2 (optional but recommended) invoked before `npm test` in Step 6.

---

## 5. Constitution Check

| Constraint | Status |
| --- | --- |
| Next.js App Router, TS, Tailwind | ✅ |
| Zustand + persist, no server DB | ✅ |
| Mobile 390px | ✅ English nav labels fit (006/008 validated six-tab bar) |
| API keys server-only | ✅ N/A |
| SDD spec before code | ✅ `specs/009-english-ui-hebrew-chat/spec.md` + clarify session |
| Incremental delivery | ✅ `quickstart.md` steps 1–6; wait for `confirmed` |
| Layout/chrome change → E2E | ⚠️ step15, step17, step21 + step23 required |
| Port 9001 | ✅ |
| No unnecessary interaction | ✅ Clarifications complete (5 decisions) |

**Gate:** PASS — proceed to implementation via `quickstart.md`.

---

## 6. Verification & Testing Plan

### Unit (Vitest)

| Suite | Cases |
| --- | --- |
| `lib/chatLocale.test.ts` | quick-prompt, pure EN, pure HE, mixed, empty |
| `stores/tripStore.test.ts` | locale always `en`, rehydrate `he`→`en`, reset |
| `lib/gemini.test.ts` (optional) | `buildSystemPrompt` includes mixed-language rule |

### E2E (Playwright)

| Spec | Focus |
| --- | --- |
| `step15.smoke.spec.ts` | English headings, `ltr`, no toggle |
| `step17.smoke.spec.ts` | English checklist copy on `/bookings` |
| `step21.auth.spec.ts` | English bookmark toasts |
| `step23.english-ui-hebrew-chat.spec.ts` | `data-locale="en"`, quick-prompt EN reply, Hebrew message reply (mocked AI) |

### Full loop (Step 6)

```bash
npm run lint && npm test && npm run test:e2e && npm run build
```

---

## 7. Risk & Rollback

| Risk | Mitigation |
| --- | --- |
| Missed Hebrew string in UI | §2h inventory + §2l grep gate; step15/17/21 + full `e2e/` Hebrew grep |
| `translations.en` still Hebrew | Fix bookmark keys in Step 1 (known bug today) |
| Quick-prompt sends `navigator.language` | Explicit `isQuickPrompt` on `sendMessage` (§2e) |
| `he` metadata titles in browser tab | Fix `app/bookings`, `app/locations` (§2h) |
| Hebrew chat regression | `chatLocale` tests + step23 mock |
| Stale `localStorage` locale | Rehydrate coercion + migration test |
| Mixed-message AI drift | Gemini rule + English locale hint on mixed input |

**Rollback:** Revert commit; restore `translations.he` pin (Feature 008 state).

---

## 8. Implementation Steps Summary

See **`quickstart.md`** for ordered steps 1–6 and manual smoke checklist.

**Next command after user `confirmed`:** Implement **Step 1** only (pin EN + LTR + store migration).
