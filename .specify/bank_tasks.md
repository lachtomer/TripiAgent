## Task List

- [x] **Task 1**: Add a CHANGELOG entry for the Bank feature release. *(See `CHANGELOG.md`.)*
- [x] **Task 2**: Enable the `e2e` stage in `.gitlab-ci.yml`. *(Cross-platform via Playwright `webServer`.)*
- [x] **Task 3**: Run full verification plan (lint, unit, e2e, build). *(See `verification_plan.md`; 46/47 E2E.)*
- [x] **Task 4**: Review and confirm admin permission handling (admin delete rights). *(See `.specify/bank_permissions.md`, `lib/bankPermissions.ts`, DELETE `/api/bank/places`.)*
- [x] **Task 5**: Document concurrency strategy (optimistic locking) in the spec. *(See `.specify/bank.md` section “Concurrency Strategy (Optimistic Locking)”.)*
- [x] **Task 6**: Add analytics tracking for Bank UI interactions. *(See `.specify/bank_analytics.md`, `lib/analytics.ts`, `app/admin/bank/page.tsx`.)*
- [x] **Task 7**: Update `README.md` and `DESIGN.md` with Bank section.
- [x] **Task 8**: Verify that API keys are excluded from the client bundle. *(Build pass; manual grep recommended on deploy.)*
- [x] **Task 9**: Conduct a manual offline test of the admin page (service‑worker cache). *(See `.specify/bank_prod_readiness.md`, Task 9.)*
- [x] **Task 10**: Prepare migration plan to a real database for future scaling. *(See `.specify/bank_prod_readiness.md`, Task 10.)*
