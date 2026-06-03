# Tasks: 008 — Hebrew UI Only, English in Chat

**Feature directory:** `specs/008-hebrew-ui-english-chat`  
**Spec:** `specs/008-hebrew-ui-english-chat/spec.md`  
**Plan:** `specs/008-hebrew-ui-english-chat/plan.md`  
**Contracts:** `specs/008-hebrew-ui-english-chat/contracts/ui-and-chat-language.md`

> **Delivery rule:** Complete one phase (or single task when user requests step mode), then stop for **`confirmed`** before the next phase.

---

## Dependencies

```text
Phase 1 (baseline) → Phase 2 (foundational) → Phase 3 (US1) ─┐
                                              → Phase 4 (US2) ─┼→ Phase 6 (E2E + verify)
Phase 3 + Phase 4 → Phase 5 (US3 spot-check) ──────────────────┘
```

US1 and US2 can proceed in sequence (US1 before US2 recommended so toggle is gone before chat-only testing).

---

## Phase 1: Setup

> **Goal:** Confirm green baseline before locale pinning.

**Independent test:** `npm run lint && npm test && npm run build` exit 0 on `main`.

- [x] T001 Run baseline verification from repo root: `npm run lint && npm test && npm run build`; record any pre-existing failures (do not fix unrelated issues in this feature)

---

## Phase 2: Foundational — Pin Hebrew UI (blocks all user stories)

> **Goal:** Store, translations, document direction, and login always Hebrew; satisfies spec §B, §E, contract UI shell.

**Independent test:** `npm test -- stores/tripStore.test.ts` passes; cold load shows `data-locale="he"` and `document.documentElement.dir === "rtl"` without any toggle click.

- [x] T002 Modify `stores/tripStore.ts` — default `locale: "he"`; remove `setLocale` from `TripState` and implementation; in `onRehydrateStorage` coerce `locale !== "he"` to `"he"`; `resetStore` sets `locale` to `"he"`
- [x] T003 Modify `lib/translations.ts` — `useTranslation()` always returns `{ t: translations.he, locale: "he" as const }` (no read of togglable store locale for UI)
- [x] T004 Modify `components/DynamicDirectionHandler.tsx` — always set `document.documentElement.dir = "rtl"` and `lang = "he"`; marker `data-testid="translations-loaded"` with `data-locale="he"` (remove dependency on store locale if present)
- [x] T005 Modify `stores/tripStore.test.ts` — remove `setLocale` tests; assert default `locale === "he"`; assert `resetStore` leaves `locale === "he"`; add rehydrate coercion test if feasible with persist mock
- [x] T006 Modify `app/login/page.tsx` — use `useTranslation()` or `translations.he` directly; remove `useTripStore` locale branch for copy selection

---

## Phase 3: User Story 1 — Hebrew chrome, no language switcher (P1)

> **Story:** As a Hebrew-speaking traveler, I want app chrome always in Hebrew with RTL, so I never hunt for a language switcher.  
> **Maps to:** spec §A, §B, success criteria 1–3, 5–6.

**Independent test:** Top bar has no `data-testid="lang-toggle"`; bottom nav shows Hebrew labels on `/` after cold load; no `setLocale` usage in `components/` (grep).

- [x] T007 [US1] Modify `components/TopAppBar.tsx` — remove `locale`, `setLocale`, toggle button, `#lang-toggle-btn`, and `data-testid="lang-toggle"`; keep `UserProfileSwitcher` only
- [x] T008 [US1] Grep repo for `lang-toggle`, `setLocale`, `data-locale="en"` in `components/`, `app/`, `e2e/` — fix any production UI switchers found (exclude `.specify/` and `specs/` docs); document if only E2E/docs remain for Phase 6

---

## Phase 4: User Story 2 — English (and Hebrew) in chat only (P2)

> **Story:** As a traveler, I want to ask the AI in English or Hebrew without changing the rest of the app.  
> **Maps to:** spec §C, contract chat + AI payload, success criterion 4.

**Independent test:** On `/chat`, Hebrew chrome visible; English user message renders LTR in bubble; `hooks/useChat.ts` does not pass `tripStore.locale` as `context.locale`.

- [x] T009 [US2] Modify `components/ChatInterface.tsx` — outer shell `dir="rtl"`; user message `<p dir="auto">`; fix bubble corner classes for permanent RTL (`locale === "he"` branches may be simplified to RTL-only)
- [x] T010 [US2] Verify `hooks/useChat.ts` — `TripContext.locale` must use `navigator.language` (or equivalent), not `useTripStore` locale; change only if regression found
- [x] T011 [US2] Verify `lib/gemini.ts` — language-matching instruction still present; no edit unless tests prove regression

---

## Phase 5: User Story 3 — BiDi for place names and codes unchanged (P3)

> **Story:** As a traveler, I want flight codes and Italian addresses to stay LTR inside Hebrew UI.  
> **Maps to:** spec §D (no regression).

**Independent test:** Spot-check `components/LogisticsCard.tsx`, `components/SavedAttractionsList.tsx`, and one chat replan row still use `dir="ltr"` on codes/names; no removal of BiDi wrappers in this feature.

- [x] T012 [US3] Spot-check BiDi in `components/LogisticsCard.tsx`, `components/SavedAttractionsList.tsx`, and `components/ChatInterface.tsx` replan sheet — confirm existing `dir="ltr"` wrappers unchanged; fix only if Phase 2–4 edits broke them

---

## Phase 6: Polish & cross-cutting verification

> **Goal:** Constitution E2E requirement; full verification loop.

**Independent test:** `npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts` green; full `npm run lint && npm test && npm run test:e2e && npm run build` green.

- [x] T013 Modify `e2e/step15.smoke.spec.ts` — assert Hebrew-by-default (`data-locale="he"` on load); remove language toggle click and `#lang-toggle` / `lang-toggle` selectors; keep RTL assertions per contract
- [x] T014 Modify `e2e/step17.smoke.spec.ts` — open essentials checklist route without toggling language; use Hebrew-default assertions for checklist copy/`dir`
- [x] T015 Grep `e2e/` for `lang-toggle`, `setLocale`, `data-locale="en"` — update any remaining specs (e.g. `travelAgentPersona.spec.ts`) touched by this feature
- [x] T016 Run `npm run lint && npm test && npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts && npm run build` from repo root; fix failures without `test.skip`

**Optional (out of MVP):**

- [ ] T017 [P] Add chat English round-trip smoke in `e2e/` with mocked `POST /api/ai` — only if fixtures already exist; otherwise defer

---

## Parallel execution map

| Parallel group | Tasks | Notes |
| --- | --- | --- |
| After T002 | T003 [P], T004 [P] | Separate files; both depend on T002 interface stable |
| After Phase 2 | T007 [P], T009 [P] | Different files; prefer T007 before manual chat QA |
| Phase 6 | T013 [P], T014 [P] | Different E2E files after US1–US2 code complete |

---

## Implementation strategy

1. **MVP (minimum shippable):** Phase 1 → Phase 2 → Phase 3 (T001–T008) — Hebrew UI pinned, toggle removed.  
2. **Increment 2:** Phase 4 (T009–T011) — chat bilingual behavior.  
3. **Increment 3:** Phase 5–6 (T012–T016) — BiDi check + E2E + full loop.

---

## Format validation

All tasks use: `- [ ] T### [P?] [US?] Description with file path`. ✓

| Metric | Value |
| --- | --- |
| **Total tasks** | 17 (16 required + 1 optional T017) |
| **US1** | T007–T008 (2) |
| **US2** | T009–T011 (3) |
| **US3** | T012 (1) |
| **Setup + foundational + polish** | T001–T006, T013–T016 (11) |

**Suggested MVP scope:** T001–T008 (Phases 1–3).
