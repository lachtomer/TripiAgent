# Research: 008 — Hebrew UI Only, English in Chat

## Summary

All design questions resolved from codebase review. No new npm dependencies. One behavioral reversal of Step 15 (global toggle); chat and BiDi patterns from Step 15 are retained.

---

## Decision 1: How to pin UI to Hebrew

**Chosen:** Hard-pin `useTranslation()` to `translations.he` and default `tripStore.locale` to `"he"`. On `persist` rehydrate, coerce any `locale === "en"` to `"he"`.

**Rationale:** Simplest mental model for users and tests; avoids dead `setLocale` calls scattered in components. Keeps `translations.en` for unit tests and optional dev without exposing EN UI.

**Alternatives considered:**
- Delete `locale` from store entirely — larger diff, breaks persisted shape migrations in one step; defer to a later cleanup if desired.
- Keep `locale` but hide toggle — still allows programmatic EN; rejected.

---

## Decision 2: What “only chat supports EN” means

**Chosen:**
- **UI chrome:** Hebrew only (nav, labels, toasts, checklists).
- **Chat content:** User may write English or Hebrew; AI responds in query language (`lib/gemini.ts` already instructs language matching).
- **Chat context field:** Continue using `navigator.language` in `useChat` (already independent of `tripStore.locale` today).

**Rationale:** Matches user wording without adding a second “chat language” toggle. English support is conversational, not structural.

**Alternatives considered:**
- Separate `chatLocale` in store — unnecessary; message language is detected per turn by the model.
- Force Hebrew-only AI replies — contradicts “chat supports EN”.

---

## Decision 3: TopAppBar and document direction

**Chosen:** Remove toggle from `TopAppBar.tsx`. Set `DynamicDirectionHandler` to always `dir="rtl"`, `lang="he"`, `data-locale="he"`.

**Rationale:** Single source of truth; components using `locale === 'he' ? 'rtl' : 'ltr'` remain correct when locale is always `he` (optional follow-up: simplify to constant `rtl`).

---

## Decision 4: E2E impact

**Chosen:** Update `e2e/step15.smoke.spec.ts` and `e2e/step17.smoke.spec.ts` to assert Hebrew-by-default (no toggle). Add or extend chat smoke: send English prompt, assert reply contains Latin letters (loose) or fixture mock.

**Rationale:** Constitution requires E2E when layout/chrome changes; step15 explicitly tests toggle.

**Alternatives considered:**
- Delete step15 file — loses RTL regression coverage; prefer rewrite.

---

## Decision 5: Login page

**Chosen:** Use `useTranslation()` or `translations.he` directly instead of `translations[locale]`.

**Rationale:** Login layout has no top bar toggle; pinning avoids English login for migrated users.

---

## Dependency notes

| Area | Finding |
| --- | --- |
| `TopAppBar.tsx` | Only UI entry for `setLocale` |
| `useChat.ts` | Already uses `navigator.language` for `context.locale` |
| `ChatInterface.tsx` | Input `dir="auto"` present; user bubble needs `dir="auto"` |
| `tripStore.test.ts` | `setLocale` tests → migrate to pinned `he` behavior |
| `FEATURE_AUDIT.md` | i18n row will need doc update post-implement (out of plan scope) |
