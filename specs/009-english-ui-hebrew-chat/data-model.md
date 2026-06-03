# Data Model: 009 — English UI Only, Hebrew in Chat

## Entities

### Application UI locale (pinned)

| Field | Type | Value | Notes |
| --- | --- | --- | --- |
| `locale` | `"en"` | constant in store | Was `"he"` in Feature 008 |
| Persistence key | `tripiagent-trip-storage` | Zustand persist | On rehydrate: coerce any non-`en` → `en` |

**State transitions:**

```
(any legacy locale) --onRehydrate--> "en"
resetStore() --> locale: "en"
```

No `setLocale` action (unchanged from 008).

### Chat context locale (per request, not stored)

| Field | Type | Source |
| --- | --- | --- |
| `TripContext.locale` | `string?` | `resolveChatContextLocale()` at send time |

| Trigger | `locale` value |
| --- | --- |
| Quick-prompt chip / prefilled English send | `"en"` or `"en-US"` |
| User-typed message, overwhelmingly Hebrew | `"he"` |
| User-typed message, otherwise | `"en"` |
| Browser `navigator.language` | **Not used** |

### User-generated trip content (unchanged shape)

| Entity | Hebrew allowed | Direction |
| --- | --- | --- |
| `SavedAttraction.name` | Yes | `dir="auto"` or `ltr` for codes |
| `Activity.title`, `description` | Yes | `dir="auto"` on display |
| `PackingItem.name` | Yes | `dir="auto"` |
| `ChatMessage.text` | Yes | `dir="auto"` in bubbles |

### Translation catalogs

| Catalog | Production use |
| --- | --- |
| `translations.en` | **Active** via `useTranslation()` |
| `translations.he` | **Inactive** (retained in repo) |

## Invariants

1. `useTranslation().locale` is always `"en"` in production UI.
2. `document.documentElement.dir` is `"ltr"` after hydration.
3. `context.locale` on `/api/ai` never comes from `tripStore.locale`.
4. Bookmark toast strings in store match `translations.en` keys exactly.
