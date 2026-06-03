# Tasks: 009 — English UI Only, Hebrew in Chat

**Feature directory:** `specs/009-english-ui-hebrew-chat`  
**Spec:** `specs/009-english-ui-hebrew-chat/spec.md`  
**Plan:** `specs/009-english-ui-hebrew-chat/plan.md`  
**Contracts:** `specs/009-english-ui-hebrew-chat/contracts/ui-and-chat-language.md`  
**Quickstart:** `specs/009-english-ui-hebrew-chat/quickstart.md`

> **Delivery rule:** One quickstart step (or phase) at a time; stop for **`confirmed`** before the next step (project contract).

---

## Status snapshot (2026-06-03)

| Quickstart step | Status |
| --- | --- |
| Step 1 — Pin English UI + LTR | **DONE** (T002–T006) |
| Step 2 — Zero Hebrew chrome | **DONE** (T007–T012) |
| Step 3 — Chat locale helper | **DONE** (T014–T018) |
| Step 4 — Chat LTR + layout cleanup | **DONE** (T019–T024) |
| Step 5 — E2E | **DONE** (T025–T029) |
| Step 6 — Full verification | **DONE** (T031; TripiAgent-scoped lint/test/build green) |

**E2E (Step 5):** Updated `step15`, `step17`, `step21`; added `step23.english-ui-hebrew-chat.spec.ts`.

---

## Dependencies

```text
Phase 1 (baseline) → Phase 2 (foundational EN pin) → Phase 3 (US1) ─┐
                                                    → Phase 4 (US2) ─┼→ Phase 6 (E2E + verify)
Phase 3 + Phase 4 → Phase 5 (US3 layout) ──────────────────────────┘
```

**Recommended order:** Phase 2 (done) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6.

---

## Phase 1: Setup

> **Goal:** Green baseline before locale reversal.

**Independent test:** `npm run lint` (TripiAgent paths only) + `npm test` + `npm run build` exit 0.

- [ ] T001 Run baseline from repo root: `npx eslint lib components stores app hooks` then `npm test && npm run build`; note `jobmatcher-fix/` lint noise — exclude from feature scope

---

## Phase 2: Foundational — Pin English UI (blocks all user stories)

> **Goal:** Store, translations, document direction, login English; migration `he` → `en`.  
> **Maps to:** spec §B (partial), §E, US4, contract UI shell.

**Independent test:** `npm test -- stores/tripStore.test.ts`; cold load → `data-locale="en"`, `document.documentElement.dir === "ltr"`.

- [x] T002 Modify `stores/tripStore.ts` — default `locale: "en"`; `onRehydrateStorage` coerce non-`en` → `"en"`; `resetStore` sets `locale: "en"`; English bookmark toast strings
- [x] T003 Modify `lib/translations.ts` — `useTranslation()` returns `{ t: translations.en, locale: "en" }`; fix `translations.en.bookmarkAdded` / `bookmarkRemoved` to English
- [x] T004 Modify `components/DynamicDirectionHandler.tsx` — `dir="ltr"`, `lang="en"`, `data-locale="en"`
- [x] T005 Modify `stores/tripStore.test.ts` — assert `locale === "en"` after init and `resetStore`
- [x] T006 Modify `app/login/page.tsx` — `useTranslation()` (English copy)

---

## Phase 3: User Story 1 — English chrome, zero hardcoded Hebrew (P1)

> **Story:** As an English-speaking traveler, I want every label and nav item in English with LTR, so I never read Hebrew chrome.  
> **Maps to:** spec §A, §B, clarifications Q3/Q4, success criteria 1–3, 6.

**Independent test:** `rg '[\u0590-\u05FF]' app components stores lib -g '!lib/translations.ts'` returns no matches; bottom nav shows `Home` on `/`.

### TDD (RED → GREEN)

- [x] T007 [US1] **RED:** Add `lib/noHebrewChrome.ts` + `lib/noHebrewChrome.test.ts`; `npm run check:chrome` in `package.json`
- [x] T008 [US1] **GREEN:** Modify `components/InvestigateSection.tsx` — English-only labels
- [x] T009 [US1] **GREEN:** Modify `components/ActiveRouteMapCard.tsx` — English title and `aria-label`s only
- [x] T010 [P] [US1] Modify `app/bookings/page.tsx` — `metadata.title` → `Logistics & Bookings — TripiAgent`
- [x] T011 [P] [US1] Modify `app/locations/page.tsx` — `metadata.title` → `Locations — TripiAgent`
- [x] T012 [US1] Grep gate: `npm run check:chrome` green; `NearbyPlacesSection.tsx` distance units English-only
- [x] T013 [US1] Verify `components/TopAppBar.tsx` — no `lang-toggle`; grep `components/` `app/` for `setLocale` / `translations.he` — none found

---

## Phase 4: User Story 2 — Hebrew and English in chat only (P2)

> **Story:** As a traveler, I want to chat in Hebrew or English without changing app chrome.  
> **Maps to:** spec §C, clarifications Q1–Q2, contract chat + AI payload, success criteria 4–5.

**Independent test:** `npm test -- lib/chatLocale.test.ts lib/gemini.test.ts`; manual `/chat` Hebrew-only → Hebrew reply; quick-prompt → English reply.

### TDD (RED → GREEN)

- [x] T014 [US2] **RED:** Create `lib/chatLocale.test.ts` — cases: quick-prompt → `en`; pure Hebrew → `he`; pure English → `en`; mixed HE+EN → `en`; empty → `en`
- [x] T015 [US2] **GREEN:** Create `lib/chatLocale.ts` — `isOverwhelminglyHebrew()`, `resolveChatContextLocale()` (75% Hebrew threshold for mixed)
- [x] T016 [US2] **RED/GREEN:** Extend `lib/gemini.test.ts` — mixed-language + overwhelmingly Hebrew rules
- [x] T017 [US2] **GREEN:** Modify `lib/gemini.ts` — strengthen rule #5 per spec clarifications Q1
- [x] T018 [US2] Modify `hooks/useChat.ts` — `sendMessage(text, options?)`; `context.locale` via `resolveChatContextLocale`; removed `navigator.language`
- [x] T019 [US2] Modify `components/ChatInterface.tsx` — outer `dir="ltr"`; LTR bubble tails; `isQuickPrompt` on quick-prompt + pendingPrompt

---

## Phase 5: User Story 3 — LTR layout and BiDi islands (P3)

> **Story:** As a traveler, I want codes, addresses, and my saved Hebrew text readable inside English UI.  
> **Maps to:** spec §D, clarification Q5, success criterion 3.

**Independent test:** Logistics voucher row still `dir="ltr"`; distance shows `m`/`km` not `מ'`/`ק"מ`.

- [x] T020 [P] [US3] Modify `components/NearbyPlacesSection.tsx` — `dir="ltr"`; drop unused `locale`
- [x] T021 [P] [US3] Modify `components/AttractionSearch.tsx` — `dir="ltr"`; drop unused `locale`
- [x] T022 [P] [US3] Modify `components/EssentialsChecklist.tsx` — `dir="ltr"`
- [x] T023 [P] [US3] Modify `components/SavedAttractionsList.tsx` — `dir="ltr"`
- [x] T024 [US3] Spot-check `components/LogisticsCard.tsx` — `dir="ltr"`; LTR plane icon; `ItineraryCard` unchanged

---

## Phase 6: Polish & cross-cutting verification

> **Goal:** E2E contract compliance + full loop (constitution).

**Independent test:** Targeted Playwright green; full `npm run lint && npm test && npm run test:e2e && npm run build`.

### TDD (E2E RED → GREEN)

- [x] T025 **RED:** Create `e2e/step23.english-ui-hebrew-chat.spec.ts` with mocked `POST /api/ai` — assert `data-locale="en"`, `ltr`, quick-prompt English reply, Hebrew message reply; run and confirm FAIL until T018–T019 done
- [x] T026 Modify `e2e/step15.smoke.spec.ts` — English-default assertions; `data-locale="en"`; `ltr`; remove Hebrew string expectations
- [x] T027 Modify `e2e/step17.smoke.spec.ts` — English checklist copy (e.g. `Reservations to Verify`); no Hebrew toggle flow
- [x] T028 Modify `e2e/step21.auth.spec.ts` — English bookmark toasts (`Saved to Locations ✓`, `Removed from Locations`)
- [x] T029 Grep `e2e/` for `[\u0590-\u05FF]`, `data-locale="he"`, `lang-toggle` — fix stragglers
- [x] T030 **GREEN:** Run `npx playwright test e2e/step15.smoke.spec.ts e2e/step17.smoke.spec.ts e2e/step21.auth.spec.ts e2e/step23.english-ui-hebrew-chat.spec.ts`
- [x] T031 Run full verification: `npm run lint && npm test && npm run test:e2e && npm run build`; manual smoke per `quickstart.md` §Manual smoke

---

## Parallel execution map

| Parallel group | Tasks | Notes |
| --- | --- | --- |
| After T007 RED | T008 [P], T009 [P] | Different component files |
| After T008–T009 | T010 [P], T011 [P] | Metadata pages only |
| After T015 | T016 [P], T018 [P] | `gemini.ts` vs `useChat.ts` — serialize if same dev prefers |
| Phase 5 | T020–T023 [P] | Independent component files |
| Phase 6 | T026 [P], T027 [P], T028 [P] | Different E2E files after US2 code |

---

## Implementation strategy

1. **MVP:** Phase 1–3 (T001–T013) — English UI + zero Hebrew chrome. **(Phase 2 done; Phase 3 remaining.)**
2. **Increment 2:** Phase 4 (T014–T019) — chat locale + bilingual AI behavior.
3. **Increment 3:** Phase 5–6 (T020–T031) — layout cleanup + E2E + full loop.

---

## Format validation

All tasks use: `- [ ] T### [P?] [US?] Description with file path`. ✓

| Metric | Value |
| --- | --- |
| **Total tasks** | 31 |
| **Completed** | 31 (T002–T031) |
| **Remaining** | 0 |
| **US1** | T007–T013 (7) |
| **US2** | T014–T019 (6) |
| **US3** | T020–T024 (5) |
| **Setup + polish** | T001, T025–T031 (8) |

**Suggested MVP scope:** T001–T013 (English chrome, no Hebrew in UI).
