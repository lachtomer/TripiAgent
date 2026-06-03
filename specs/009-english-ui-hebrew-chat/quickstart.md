# Quickstart — 009 English UI, Hebrew in Chat

## Prerequisites

- Spec: `specs/009-english-ui-hebrew-chat/spec.md`
- Plan: `specs/009-english-ui-hebrew-chat/plan.md`
- Baseline: `npm run lint && npm test && npm run build` green on `main`

## Implementation order (one step at a time — confirm after each)

### Step 1 — Pin English UI and LTR document

1. `lib/translations.ts` — `useTranslation()` returns `{ t: translations.en, locale: "en" }`; fix `translations.en` bookmark toasts to English.
2. `components/DynamicDirectionHandler.tsx` — `ltr` / `en`, `data-locale="en"`.
3. `stores/tripStore.ts` — default `locale: "en"`; rehydrate coerce `he` → `en`; update hardcoded Hebrew bookmark toasts to English.
4. `app/login/page.tsx` — `translations.en` or `useTranslation()`.

**Verify:** `npm test -- stores/tripStore.test.ts`

### Step 2 — Remove hardcoded Hebrew chrome (zero-tolerance)

1. `components/InvestigateSection.tsx`, `ActiveRouteMapCard.tsx`.
2. `app/bookings/page.tsx`, `app/locations/page.tsx` — English `metadata.title`.
3. Audit gate (must be empty except `translations.he` block):

```powershell
rg '[\u0590-\u05FF]' app components stores lib -g '!lib/translations.ts'
rg '[\u0590-\u05FF]' e2e
```

4. Optional: add `scripts/check-no-hebrew-chrome.mjs` for Step 6.

**Verify:** `npm run lint` + grep gate clean

### Step 3 — Chat locale helper and hook

1. **NEW** `lib/chatLocale.ts` — `resolveChatContextLocale(message, options)` + Vitest.
2. `hooks/useChat.ts` — use resolver; quick-prompt path passes `isQuickPrompt: true`; remove `navigator.language` default.
3. `lib/gemini.ts` — strengthen rule #5 for mixed vs overwhelmingly Hebrew.

**Verify:** `npm test -- lib/chatLocale.test.ts`

### Step 4 — Chat UI LTR shell

1. `components/ChatInterface.tsx` — outer `dir="ltr"`; keep `dir="auto"` on input and message bodies.
2. **Required:** `NearbyPlacesSection`, `AttractionSearch`, `EssentialsChecklist`, `SavedAttractionsList`, `LogisticsCard` — remove `he` branches and Hebrew unit suffixes (`מ'`, `ק"מ`).
3. `useChat.ts` / `ChatInterface.tsx` — `sendMessage(text, { isQuickPrompt })` wired from quick-prompt + pendingPrompt paths.

**Verify:** Manual on `:9001` — English nav; Hebrew chat reply works.

### Step 5 — E2E updates

1. Update `e2e/step15.smoke.spec.ts`, `e2e/step17.smoke.spec.ts`, `e2e/step21.auth.spec.ts` — English assertions, `data-locale="en"`, `ltr`.
2. **NEW** `e2e/step23.english-ui-hebrew-chat.spec.ts` — quick-prompt English + Hebrew message mock.
3. Grep: `lang-toggle`, `data-locale="he"`, Hebrew nav strings in `e2e/`.

**Verify:**

```bash
npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts e2e/step21.auth.spec.ts e2e/step23.english-ui-hebrew-chat.spec.ts
```

### Step 6 — Full verification

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Stop; reply **`confirmed`** before deploy or next feature.

## Manual smoke (port 9001)

1. Cold load `/` — English bottom nav, LTR.
2. `/chat` — tap quick prompt → English reply.
3. `/chat` — send Hebrew-only question → Hebrew reply.
4. `/chat` — send mixed HE+EN sentence → English reply.
5. Bookmark a place → English toast.
6. Clear site data with legacy `locale: "he"` in storage → still English UI.
