# Bank Production Readiness (Tasks 9-10)

## Scope
Close the final open bank backlog items before deployment:
- Task 9: offline behavior validation for `/admin/bank`
- Task 10: migration plan from JSON file storage to a real database

## Task 9 - Offline Validation Plan and Result

### Goal
Confirm the admin bank page shell remains accessible when the client is offline after an initial online load.

### Procedure
1. Start app on `http://localhost:9001`.
2. Open `/admin/bank` while online and wait for `bank-page-ready`.
3. Verify static UI shell renders: page title, textarea, generate button.
4. Simulate offline mode.
5. Reload `/admin/bank`.
6. Confirm the page shell still renders from service worker cache.
7. Confirm network-backed actions fail gracefully (parse/submit/load), with no crash.

### Result
- PASS: bank page shell remains visible after offline reload.
- PASS: network-backed actions are unavailable offline but UI remains stable.

## Task 10 - Database Migration Plan

### Current state
- Source of truth is file-based JSON storage in `data/bank.json`.
- API routes read/write through `/api/bank/places`.

### Target state
- Move bank persistence to a relational database (PostgreSQL recommended).
- Keep current API contracts stable during transition.

### Migration phases
1. **Schema and access layer**
   - Add `bank_places` table (`id`, `name`, `category`, `description`, `lat`, `lng`, `created_by`, `created_at`, `updated_at`).
   - Introduce repository abstraction used by bank routes.
2. **Dual-read cutover**
   - Read from DB first, fallback to JSON when empty.
   - Add feature flag for write target (`json` | `db` | `dual`).
3. **Dual-write window**
   - Write to DB and JSON for one release cycle.
   - Add parity checks in CI to detect divergence.
4. **DB-primary**
   - Switch reads to DB only.
   - Keep JSON export endpoint for backup/rollback.
5. **Cleanup**
   - Remove JSON write path and local file dependency.

### Safety and rollout controls
- Add request-level tracing around bank mutations.
- Add migration smoke checks in CI and post-deploy checklist.
- Keep rollback path: toggle write mode back to JSON if DB errors spike.

### Success criteria
- No API contract break for UI clients.
- Equal or better route latency compared to JSON baseline.
- Zero data loss during dual-write and cutover.
