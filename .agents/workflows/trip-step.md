---
description: Run one TripiAgent playbook step with tests and Cursor handoff
---

When user runs `/trip-step <step-id> [optional notes]`:

1. Act as **@lead** — confirm scope is **only** `<step-id>`; restate from AGENTS.md.
2. Act as **@engineer** — execute `implement-one-step.md` with `<step-id>`.
3. Act as **@qa** — execute `write-automated-tests.md` + `audit-security.md` for touched files.
4. Act as **@handoff** — execute `handoff-to-cursor.md`.
5. **STOP.** Do not start next step until user types `Step <step-id> confirmed`.
