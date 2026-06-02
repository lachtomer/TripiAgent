# e2e-stabilization Skill

**Purpose:** Ensure E2E tests use stable selectors and deterministic synchronization, and mock external services.

**Key Rules:**
- Prefer `data-testid` or ARIA roles for selectors; avoid fragile CSS class chains.
- Replace generic `await page.waitForTimeout` with explicit readiness checks (`waitForSelector`, `waitForResponse`).
- Intercept network calls with `page.route` and serve fixture JSONs for third‑party APIs.
- If a flaky test is detected, rerun it up to two times before marking as stable.
- Auto‑apply the above fixes via code edits or test rewrites.

**Auto‑activation:** Called by `/triage-fix` when classification = flaky timing or external nondeterminism, and by `/dev-loop` after implementation.
