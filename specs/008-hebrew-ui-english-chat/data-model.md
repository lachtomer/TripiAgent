# Data Model: 008 — Hebrew UI Only, English in Chat

## State changes

### `tripStore` — `locale` field

| Field | Before | After |
| --- | --- | --- |
| `locale` | `"en" \| "he"`, user-toggled, default `"en"` | Always `"he"` in practice; default `"he"` |
| `setLocale` | Public action | **Removed** from `TripState` interface |

### Persistence migration

On `onRehydrateStorage` (or first read after upgrade):

```text
if (state.locale !== "he") state.locale = "he"
```

No new localStorage keys. Existing key: `tripiagent-trip-storage`.

### Chat — no new entities

| Field | Change |
| --- | --- |
| `chatMessages` | Unchanged |
| `TripContext.locale` in API payload | Remains string from browser; **not** tied to UI `locale` |

## Translation model

| Key | Usage |
| --- | --- |
| `translations.he` | **Production UI** — sole user-facing dictionary |
| `translations.en` | Dev/tests only; not selected by `useTranslation()` |

## UI direction invariant

| Surface | `dir` | `lang` |
| --- | --- | --- |
| `document.documentElement` | `rtl` | `he` |
| Chat input | `auto` | inherited |
| User chat bubble text | `auto` | inherited |
| Place names / flight codes | `ltr` (existing wrappers) | — |

## Validation rules

- No Zod schema changes required (`locale` on API schemas is optional string for AI context, unchanged).
- Store type: `locale` may remain `"he"` literal type or `"en" \| "he"` with runtime coercion — implementation choice; runtime value must be `"he"`.
