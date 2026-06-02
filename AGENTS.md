# AGENTS.md

## Project‑wide Operating System for Antigravity Agents

### Core Principles (must never be violated)
1. **No unnecessary user interaction** – agents ask questions *only* when a product decision is required.
2. **Deterministic fixes over cosmetic work‑arounds** – never hide a bug behind a flaky wait or a lint‑disable.
3. **Stable selectors & explicit readiness signals** – E2E tests must use semantic `data-testid`, ARIA roles, or visible text, never pure CSS class selectors.
4. **Mock external services** – AI, Places, or any third‑party API is intercepted with a fixture unless the task explicitly states a live‑integration validation.
5. **Never claim READY FOR GO‑LIVE** unless **lint**, **unit tests**, **E2E**, and **build** are all green.
6. **Never claim DEPLOYED** without a verified Vercel (or Firebase) URL and a successful smoke check.
7. **Self‑heal** – for lint / build failures agents automatically attempt safe mechanical fixes (type errors, unused vars, missing imports, broken selectors, missing mocks, deterministic waits). If fixing requires a business decision the agent stops and asks the precise question.

### Failure Classification (applied in order)
1. Deterministic code bug
2. Flaky timing / race condition
3. External dependency nondeterminism
4. Environment / config issue
5. Test bug / brittle assertion
6. Mixed cause

### Fixed Execution Cycle (used by all workflows)
1. **Reproduce** – run the failing command, capture logs.
2. **Triage** – classify using the table above.
3. **Root‑cause hypothesis** – produce a concise hypothesis.
4. **Implement minimal safe fix** – edit app code *or* test code according to the classification.
5. **Run targeted test(s)** – only the affected spec(s) / unit test.
6. **Self‑heal safe failures** – if the fix introduced lint or build warnings, apply mechanical corrections automatically.
7. **Run broader validation** – `npm run lint && npm test && npm run test:e2e && npm run build`.
8. **Report** – structured short report (see *Report Format* below).

### Report Format
```
1. Triage classification: <type>
2. Root cause: <summary>
3. Files changed:
   - <file path>
4. Fix applied: <concise description>
5. Tests run: <list of commands / specs>
6. Failures remaining: <none | list>
7. Risk level: <low | medium | high>
8. Final status: <E2E STABLE | E2E STILL FLAKY>
``` 

### Workflows
- **/triage-fix** – executes the full execution cycle for any failing spec, lint, or build error.
- **/dev-loop** – orchestrates the repeatable development loop (design → plan → implement → targeted checks → self‑heal → broader validation → pause).
- **/prod-check** – runs final production verification after a successful dev loop (lint → unit → e2e → build → deployment smoke).

### Skills (auto‑activated by workflows)
- `triage-and-fix` – classification, root‑cause analysis, mechanical fixes.
- `e2e-stabilization` – selector hygiene, deterministic waits, fixture mocking.
- `production-readiness` – env/config validation, CI wiring, build checks.
- `design-implement-verify` – design‑understand, plan creation, batch implementation.

### Permissions Guidance
- Safe install/access requests (e.g., npm packages, file reads) should be auto‑approved where Antigravity UI allows it.
- Require manual approval only for:
  * Destructive actions (deleting files, database resets).
  * Credential or secret handling.
  * Business‑logic changes that could alter user‑facing behavior.

### Usage Guide
See `USAGE.md` at the repo root.
