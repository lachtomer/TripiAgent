# Implementation Plan – CI & Verification Fixes (Steps 4‑9)

## Goal
Enable full CI pipeline with lint, unit, build, and Playwright E2E stages, add missing `test:e2e` npm script, and ensure the verification plan covers the Bank feature and overall production readiness.

## Proposed Changes
- **.gitlab-ci.yml** – added `e2e` stage, enabled Playwright install, and set `allow_failure: false`.
- **package.json** – added `"test:e2e": "playwright test"` script.
- **implementation_plan.md** – (this file) documents the plan and verification steps.
- **verification plan** – included below as a section.

---

## Verification Plan

### Automated Tests
- `npm run lint` – ensure no lint warnings.
- `npm run test` – run all Vitest unit tests.
- `npm run test:e2e` – execute Playwright E2E suite (including Bank flow tests).
- `npm run build` – compile production build.

### Manual Verification
- Deploy to Vercel (or local preview) on port 9001.
- Visit `/admin/bank` and confirm admin UI loads, generates entries, and persists.
- Verify no API keys appear in client bundles (`npm run build` then inspect generated JS).
- Run a smoke navigation test across all main routes.

---

## Next Steps
1. Run the full CI locally (`npm run lint && npm run test && npm run test:e2e && npm run build`).
2. Fix any failures (e.g., missing test files, configuration).
3. Proceed to Step 5 – add missing test coverage for Bank flow.
