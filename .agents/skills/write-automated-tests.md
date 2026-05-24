# Skill: Write automated tests

## Stack
- **Vitest** + **@testing-library/react** + **@testing-library/jest-dom**
- **Playwright** for E2E (`e2e/smoke.spec.ts`)

## Rules
- New hook (`hooks/*`) → unit test with mocked `fetch` / geolocation
- New API route → test handler with mocked env and invalid body (400)
- New page → 至少 smoke: renders without throw; key testid on BottomNav tabs
- E2E smoke (Playwright): visit `/`, `/chat`, `/itinerary`, `/pack`; assert bottom nav visible; no console errors on load

## Scripts (ensure in package.json)
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:e2e": "playwright test"`

## CI
Tests must pass in GitLab job `test` before merge.
