# Technical Plan: 008 — Hebrew UI Only, English in Chat

**Feature spec:** `specs/008-hebrew-ui-english-chat/spec.md`  
**Research:** `specs/008-hebrew-ui-english-chat/research.md`  
**Data model:** `specs/008-hebrew-ui-english-chat/data-model.md`  
**Contracts:** `specs/008-hebrew-ui-english-chat/contracts/ui-and-chat-language.md`  
**Quickstart:** `specs/008-hebrew-ui-english-chat/quickstart.md`  
**Branch:** `main`

---

## 1. Architectural Changes

Behavioral simplification — **no new API routes**, no new dependencies.

```
BEFORE (Step 15)
  TopAppBar: EN ↔ עב  →  tripStore.locale  →  useTranslation() + document dir

AFTER (008)
  TopAppBar: (no toggle)  →  locale pinned "he"  →  Hebrew UI + permanent RTL
  Chat: dir="auto" + navigator.language  →  EN/HE conversation only in /chat
```

**In scope:** Remove toggle, pin UI Hebrew, migrate persisted `en` → `he`, chat BiDi tweak, E2E updates.  
**Out of scope:** Delete `translations.en`, Hebrew place-name API translation, 006 prep reorg.

---

## 2. Component Design & State

### 2a. State Store (`stores/tripStore.ts`)

| Change | Detail |
| --- | --- |
| Default | `locale: "he"` (was `"en"`) |
| Remove | `setLocale` action and interface member |
| Migrate | `onRehydrateStorage`: if `locale !== "he"`, set to `"he"` |
| `resetStore` | Reset `locale` to `"he"` |

### 2b. Translations (`lib/translations.ts`)

```typescript
export function useTranslation() {
  const t = translations.he;
  return { t, locale: "he" as const };
}
```

Optional: keep reading `locale` from store only if needed for migration telemetry — **not** for UI switching.

### 2c. Document direction (`components/DynamicDirectionHandler.tsx`)

```typescript
useEffect(() => {
  document.documentElement.dir = "rtl";
  document.documentElement.lang = "he";
}, []);
// data-locale="he" always
```

### 2d. Top app bar (`components/TopAppBar.tsx`)

- Remove `locale`, `setLocale`, toggle button, `data-testid="lang-toggle"`.
- Keep `UserProfileSwitcher` only.

### 2e. Chat (`components/ChatInterface.tsx`, `hooks/useChat.ts`)

| File | Change |
| --- | --- |
| `ChatInterface.tsx` | Outer shell `dir="rtl"`; user message `<p dir="auto">`; bubble corners use RTL constants (always `he`) |
| `useChat.ts` | **No change** if `context.locale` stays `navigator.language` — verify no `tripStore.locale` import |

### 2f. Login (`app/login/page.tsx`)

- Replace `translations[locale]` with `translations.he` or `useTranslation()`.

### 2g. Components with `locale === "he" ? ...`

No change required for correctness when locale is always `"he"`. Optional cleanup (not blocking): simplify conditionals to RTL defaults in a follow-up.

---

## 3. API Routes & Schemas

**None.** `POST /api/ai` payload unchanged; `TripContext.locale` remains optional string from client.

---

## 4. Proposed File Modifications

| Action | File |
| --- | --- |
| MODIFY | `stores/tripStore.ts` |
| MODIFY | `stores/tripStore.test.ts` |
| MODIFY | `lib/translations.ts` |
| MODIFY | `components/TopAppBar.tsx` |
| MODIFY | `components/DynamicDirectionHandler.tsx` |
| MODIFY | `components/ChatInterface.tsx` |
| MODIFY | `app/login/page.tsx` |
| MODIFY | `e2e/step15.smoke.spec.ts` |
| MODIFY | `e2e/step17.smoke.spec.ts` |
| MODIFY | `.specify/feature.json` |
| MODIFY | `.cursor/rules/specify-rules.mdc` |

**Verify only (no edit unless broken):** `hooks/useChat.ts`, `lib/gemini.ts`

---

## 5. Constitution Check

| Constraint | Status |
| --- | --- |
| Next.js App Router, TS, Tailwind | ✅ |
| Zustand + persist, no server DB | ✅ |
| Mobile 390px | ✅ Toggle removal frees top-bar space |
| API keys server-only | ✅ N/A |
| SDD spec before code | ✅ `specs/008-hebrew-ui-english-chat/spec.md` |
| Incremental delivery | ✅ quickstart steps; wait for `confirmed` |
| Layout/chrome change → E2E | ⚠️ step15 + step17 required |
| New API → Zod + Vitest | ✅ N/A |

**Gate result:** PASS.

### Post-design re-check

After pinning Hebrew, agent architecture and sync guards are unaffected. Chat English support does not add runtime agents.

---

## 6. Verification & Testing Plan

### Unit

```bash
npm test -- stores/tripStore.test.ts
```

- Default locale `he`.
- Rehydrate coercion (if testable via persist mock).
- Remove `setLocale` tests; add test that locale stays `he` after reset.

### E2E

```bash
npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts
```

| File | Change |
| --- | --- |
| `step15.smoke.spec.ts` | Assert `data-locale="he"` on load; remove toggle click; keep RTL checks |
| `step17.smoke.spec.ts` | Navigate to checklist route with Hebrew already active |

Optional new test: chat English round-trip with mocked `/api/ai`.

### Full loop

```bash
npm run lint && npm test && npm run test:e2e && npm run build
```

---

## 7. Implementation Order

See `quickstart.md` — five steps ending with full verification.

**Stop after verification; wait for user `confirmed` before implementation of other specs (e.g. 006).**
