# Skill: Implement one step

## Input
User provides: step id (e.g. `4c`, `5`, `scaffold-2`) and optional Stitch/DESIGN reference.

## Process
1. Act as @engineer.
2. Implement **only** that step from the TripiAgent playbook.
3. Add/update tests per `write-automated-tests.md`.
4. Act as @qa — run tests, fix failures.
5. Act as @handoff — update `HANDOFF.md`.

## Stop gate
End message MUST include:
- Files changed (bullet list)
- Commands user should run locally
- `Waiting for: Step <id> confirmed`
