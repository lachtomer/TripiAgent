# Research: 009 — English UI Only, Hebrew in Chat

**Date:** 2026-06-03  
**Spec:** `specs/009-english-ui-hebrew-chat/spec.md`

## Decision 1: Reverse Feature 008 in place (no new i18n framework)

- **Decision:** Pin `useTranslation()` to `translations.en`, `locale: "en"`, document `ltr`/`lang="en"`, migrate persisted `he` → `en` on rehydrate.
- **Rationale:** Feature 008 already removed the toggle; 009 is a symmetric flip with existing dual dictionaries.
- **Alternatives considered:** Delete `translations.he` — rejected (spec allows keeping for tests/future).

## Decision 2: Chat locale hint source

- **Decision:** Add `lib/chatLocale.ts` with `resolveChatContextLocale(message, { isQuickPrompt })` — quick-prompts always `"en"` / `"en-US"`; typed messages use Hebrew script ratio heuristic (overwhelmingly Hebrew → `"he"`, else `"en"`).
- **Rationale:** Clarifications forbid `navigator.language` overriding UI or quick-prompts; lightweight heuristic avoids new dependencies.
- **Alternatives considered:** Always `navigator.language` — rejected (Q2). Always `"en"` — rejected (breaks Hebrew-only chat).

## Decision 3: Mixed Hebrew+English messages

- **Decision:** Extend `lib/gemini.ts` rule #5 to state: mixed-language user messages → English reply unless overwhelmingly Hebrew; overwhelmingly Hebrew → Hebrew reply.
- **Rationale:** Model may still drift; explicit system rule + English `locale` hint aligns behavior with acceptance tests.
- **Alternatives considered:** Model-only detection — insufficient for deterministic E2E.

## Decision 4: LTR shell layout

- **Decision:** `DynamicDirectionHandler` sets `dir="ltr"` / `lang="en"`; `ChatInterface` outer shell `dir="ltr"`; simplify `locale === "he" ? rtl : ltr` branches to LTR defaults in discover/logistics components.
- **Rationale:** Clarification Q4 requires standard LTR mirroring, not RTL nav/FAB inversion.
- **Alternatives considered:** Keep logical properties with `dir=ltr` only — acceptable where already using `ms`/`me`; remove RTL-only branches.

## Decision 5: Hardcoded Hebrew cleanup

- **Decision:** Single pass: fix `translations.en` bookmark toasts; `tripStore` toast strings; `InvestigateSection`, `ActiveRouteMapCard`; grep `[\u0590-\u05FF]` under `components/`, `stores/`, `lib/` (exclude `translations.he` block).
- **Rationale:** Clarification Q3 — all chrome and ARIA English.
- **Alternatives considered:** Leave bilingual Investigate labels — rejected.

## Decision 6: User-generated Hebrew content

- **Decision:** No data migration; keep `dir="auto"` on itinerary fields, saved names, chat bubbles.
- **Rationale:** Clarification Q5 — show as stored.
- **Alternatives considered:** Translate seed bank — out of scope.

## Decision 7: E2E strategy

- **Decision:** Update `step15`, `step17`, `step21` Hebrew assertions → English; add `e2e/step23.english-ui-hebrew-chat.spec.ts` for chat locale smoke (mock `/api/ai`).
- **Rationale:** Constitution requires layout/locale changes to update Playwright smoke tests.

## Decision 8: Hebrew detection — build minimal helper (search-first)

- **Decision:** Custom `lib/chatLocale.ts` (Unicode range `[\u0590-\u05FF]`, ratio ≥50% letter chars = overwhelmingly Hebrew). No new npm package.
- **Rationale (search-first):** Repo already uses Gemini + hand-rolled i18n; adding `franc` / `@formatjs` only for a binary en/he gate is dependency bloat. Threshold must match `lib/gemini.ts` rule #5 wording and Vitest fixtures.
- **Alternatives considered:** `franc` (lang detect) — rejected (overkill, extra dep); infer from `navigator.language` — rejected (clarification Q2).

## Decision 9: Zero Hebrew in production chrome — enforced grep

- **Decision:** Before merge, run repo audit (see plan §2h inventory + §6 gate). Fail if Hebrew appears under `app/`, `components/`, `stores/` outside `translations.he` block in `lib/translations.ts`.
- **Rationale:** Brutal-review found gaps plan under-listed (`app/*/page.tsx` metadata, `translations.en` bookmark keys).
