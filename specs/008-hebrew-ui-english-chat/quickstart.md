# Quickstart — 007 Hebrew UI, English in Chat

## Prerequisites

- Feature spec: `specs/008-hebrew-ui-english-chat/spec.md`
- Plan: `specs/008-hebrew-ui-english-chat/plan.md`
- Baseline: `npm run lint && npm test && npm run build` green on `main`

## Implementation order (one step at a time — confirm after each)

### Step 1 — Pin translations and document direction

1. `lib/translations.ts` — `useTranslation()` always returns `{ t: translations.he, locale: "he" }`.
2. `components/DynamicDirectionHandler.tsx` — always set `rtl` / `he`.
3. `stores/tripStore.ts` — default `locale: "he"`; rehydrate coercion `en` → `he`; remove `setLocale`.
4. `app/login/page.tsx` — use `translations.he` or `useTranslation()`.

**Verify:** `npm test -- stores/tripStore.test.ts`

### Step 2 — Remove language toggle

1. `components/TopAppBar.tsx` — delete toggle button and store hooks.

**Verify:** Manual — no EN/עב in header.

### Step 3 — Chat BiDi polish

1. `components/ChatInterface.tsx` — user bubble `<p dir="auto">`; shell `dir="rtl"` constant.
2. Confirm `hooks/useChat.ts` does not read `tripStore.locale` for context.

**Verify:** Manual — English paragraph in chat aligns LTR.

### Step 4 — E2E updates

1. `e2e/step15.smoke.spec.ts` — Hebrew default, no toggle click.
2. `e2e/step17.smoke.spec.ts` — open checklist without toggling language.
3. Grep repo for `lang-toggle`, `setLocale`, `data-locale="en"` and fix stragglers.

**Verify:**

```bash
npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts
```

### Step 5 — Full verification

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

Stop; reply **`confirmed`** before any deploy or follow-on feature work.

## Manual smoke (port 9001)

1. Cold load `/` — Hebrew bottom nav, RTL.
2. `/chat` — send "What is near Desenzano?" — English reply.
3. `/chat` — send Hebrew question — Hebrew reply.
4. Clear site data → still Hebrew UI (no toggle).
