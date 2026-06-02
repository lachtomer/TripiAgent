# production-readiness Skill

**Purpose:** Validate environment configuration, CI pipeline wiring, and build readiness for production deployment.

**Checks Performed:**
- Verify required env vars are present in `.env.example` and documented.
- Ensure `firebase.json` / `.vercel` config matches the deployment target.
- Confirm `.gitlab-ci.yml` contains stages: lint → test → build → (optional) deploy.
- Run `npm run build` and capture any warnings; apply mechanical fixes (e.g., missing type declarations) when safe.
- Export a short readiness report used by `/prod-check`.

**Auto‑activation:** Invoked by `/prod-check` workflow and also triggered automatically after a successful `/dev-loop` when step 6 completes.
