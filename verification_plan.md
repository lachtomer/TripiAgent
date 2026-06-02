# TripiAgent — Verification Plan

Last updated: 2026-06-02 (Production readiness pass)

## Automated checks (required before merge)

| Command | Expectation |
|---------|-------------|
| `npm run lint` | 0 errors |
| `npm run test` | All Vitest unit tests pass (26+) |
| `npm run test:e2e` | 47/47 pass; no deterministic failures |
| `npm run build` | Production webpack build succeeds |

## E2E scope

- **Full suite**: `npm run test:e2e` (Playwright `webServer` starts Next.js on `:9001` — cross-platform)
- **Windows legacy**: `npm run test:e2e:win` (thin PowerShell wrapper)
- **Targeted**: `npx playwright test e2e/bank/itinerary_import.smoke.spec.ts` (and other affected specs)
- **Mocks**: External APIs (Gemini, Places, geocode, pack generate) must be intercepted in E2E unless explicitly testing live integration

## Manual smoke (post-deploy)

1. Open https://tripiagent.vercel.app/ (or local `:9001`)
2. Toggle Hebrew → verify RTL on home, itinerary, pack
3. Visit `/admin/bank` → generate preview → submit → success message
4. Bookmark a place on home → verify on `/itinerary` saved list
5. Confirm no API keys in client bundle (search built `.next/static` for `GEMINI_`, `GOOGLE_`, `OPENWEATHER_`)

## CI (GitLab)

Pipeline stages: lint → unit_test → build (main/MR) → e2e (main/MR)

Playwright `webServer` in `playwright.config.ts` starts the dev server on `:9001` for CI and local runs.

## Baseline results (2026-06-02)

- lint: PASS
- unit: 46/46 PASS
- e2e: 47/47 PASS (`step10` bookmark stabilized in Task 5.4)
- build: PASS
- bundle scan (`.next/static`): PASS (no `GEMINI_`, `GOOGLE_`, `OPENWEATHER_`, or obvious API key patterns)
- offline admin bank shell check (`/admin/bank` in production mode): PASS
