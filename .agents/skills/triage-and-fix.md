# triage-and-fix Skill

**Purpose:** Provide the logic for agents to triage failures, hypothesize root causes, and apply safe mechanical fixes.

**Operations:**
- Run `run_command` to reproduce the failure and capture logs.
- Use `grep_search` / `view_file` to locate offending code.
- Apply `replace_file_content` or `multi_replace_file_content` for mechanical fixes (imports, typings, lint issues).
- Emit a **Report** using the format defined in `AGENTS.md`.

**Auto‑activation:** Invoked by `/triage-fix` workflow; also auto‑triggered when a test failure is detected during `/dev-loop`.
