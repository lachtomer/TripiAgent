# Contract: UI Language vs Chat Language

## UI shell contract (all routes except message bodies)

| Property | Value |
| --- | --- |
| UI dictionary | `translations.he` only |
| Document `dir` | `rtl` |
| Document `lang` | `he` |
| Language toggle | **Absent** |
| Readiness marker | `[data-testid="translations-loaded"][data-locale="he"]` |

### Affected surfaces (non-exhaustive)

- `TopAppBar` — brand + profile only
- `BottomNav` — six Hebrew tab labels
- Page headers on `/`, `/itinerary`, `/locations`, `/pack`, `/bookings`, `/chat`
- Toasts, sheets, checklists, packing lists

## Chat contract (`/chat`)

| Element | Language | Direction |
| --- | --- | --- |
| Empty state title/subtitle | Hebrew (`t.chatTitle`, `t.chatSubtitle`) | RTL shell |
| Quick-prompt chips | Hebrew (`t.quickPrompt*`) | RTL |
| Input placeholder | Hebrew (`t.chatPlaceholder`) | `dir="auto"` |
| User message text | User's choice (EN/HE/IT) | `dir="auto"` on bubble |
| Model markdown body | Matches user query language | `dir="auto"` |
| Replan sheet labels | Hebrew | RTL |

## AI API payload (`POST /api/ai`)

```typescript
// TripContext excerpt — unchanged shape
{
  locale?: string; // e.g. "en-US" from navigator; NOT from UI toggle
  // ...coords, itinerarySummary, etc.
}
```

**Invariant:** UI locale must never be the sole driver of `context.locale` after this feature.

## Test IDs

| Removed | Retained |
| --- | --- |
| `data-testid="lang-toggle"` | `data-testid="translations-loaded"` |
| `#lang-toggle-btn` | `id="chat-input"`, `id="chat-send-button"` |

## E2E expectations

1. Load `/` → `data-locale="he"` without clicking toggle.
2. `document.documentElement.getAttribute("dir") === "rtl"`.
3. On `/chat`, type English message → mock/fixture returns English text → visible in thread.
