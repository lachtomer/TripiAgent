# Bank Analytics Tracking (bank_tasks Task 6)

## Goal
Track core Bank admin interactions to measure usage and failure points without introducing external SDK dependencies.

## Event transport
- Use `trackEvent()` from `lib/analytics.ts`.
- Runtime behavior:
  - Pushes to `window.dataLayer` when available.
  - Dispatches `tripiagent:analytics` browser event for future listeners.
  - Logs to console in development only.

## Bank events
- `bank_admin_page_viewed`
  - payload: `userId`, `userName`, `canDelete`
- `bank_generate_clicked`
  - payload: `inputLength`
- `bank_generate_succeeded`
  - payload: `parsedCount`
- `bank_generate_failed`
  - payload: `message`
- `bank_submit_clicked`
  - payload: `previewCount`
- `bank_submit_succeeded`
  - payload: `submittedCount`
- `bank_submit_failed`
  - payload: `message`
- `bank_delete_clicked`
  - payload: `index`
- `bank_delete_succeeded`
  - payload: `index`
- `bank_delete_failed`
  - payload: `index`, `message`

## Non-goals
- No external analytics vendor wiring in this step.
- No PII beyond existing in-app display names/user IDs already present in UI state.

