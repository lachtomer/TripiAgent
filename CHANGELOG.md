# Changelog

All notable changes to TripiAgent are documented here.

## [Unreleased]

### Fixed (2026-06-01 — Cursor Phase 1)

- Consolidated Bank admin UI to `/admin/bank` (removed duplicate `(admin)` route group that served `/bank`)
- Bank E2E: hydration readiness, API mocks, stable selectors
- Step 13: deterministic Places/geocode mocks + toast `data-testid`
- Step 15: Hebrew i18n readiness via `data-locale` on translations marker
- Step 4g: AI mock for markdown rendering test
- Travel Agent Persona: mocked AI/pack endpoints; in-trip mode retry; explicit chat send
- `bankStore.add()` now throws on failed POST (surfaces errors in UI)
- Playwright workers reduced 3 → 2 for dev-server stability

### Added

- `e2e/helpers/apiMocks.ts` — shared route interception helpers
- `verification_plan.md` — validation checklist
- `data-testid` markers: `toast-message`, `bank-page-ready`, `today-planner`, `submit-success`

### Changed (2026-06-01 — Cursor Phase 2)

- Bank admin UX: Generate/Submit loading states, ARIA labels, 48px tap targets, accent `#006400`, Return to Home link
- E2E: Playwright `webServer` for cross-platform CI; `npm run test:e2e` runs `playwright test` directly
- Bank API unit tests (`app/api/bank/places/route.test.ts`) with mocked filesystem
- Bank production-readiness spec: offline admin validation result + staged database migration plan (`.specify/bank_prod_readiness.md`)

### Known issues

- Stabilized `e2e/step10.smoke.spec.ts` bookmark test: mocked places API, `#bookmark-place1`, localStorage flush wait, `saved-attractions-ready` testid
- GitLab CI `test:e2e` uses Windows PowerShell script — not compatible with Linux runners without follow-up
- Bank admin delete permissions: `lib/bankPermissions.ts`, DELETE `/api/bank/places`, admin-only delete on `/admin/bank` stored list
- Bank spec concurrency plan documented: optimistic locking with `version`, `expectedVersion`, and `409 Conflict` handling
- Bank analytics instrumentation: `bank_*` events for page view, generate, submit, and delete via `lib/analytics.ts`
- E2E stabilization: `e2e/step17.smoke.spec.ts` radius assertions now wait on observed request values instead of fixed sleeps
