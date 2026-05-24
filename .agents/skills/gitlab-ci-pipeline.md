# Skill: GitLab CI pipeline

## Objective
Create or update `.gitlab-ci.yml` for TripiAgent.

## Stages
1. **lint** — `npm ci && npm run lint`
2. **test** — `npm ci && npm run test`
3. **build** — `npm ci && npm run build` (artifacts: `.next` optional, expire 1 week)
4. **e2e** (optional, allow_failure on free runners) — `npx playwright install --with-deps && npm run test:e2e`

## Variables
- Use GitLab CI/CD variables for secrets — NEVER commit keys
- Document in README: `GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `OPENWEATHER_API_KEY`, `GEMINI_MODEL`

## Cache
- Cache `node_modules/` keyed on `package-lock.json`

## MR policy note in README
- Pipeline must be green before merge to `main`
