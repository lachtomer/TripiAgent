# Contract: UI Language vs Chat Language (009)

## UI shell contract (all routes except message bodies)

| Property | Value |
| --- | --- |
| UI dictionary | `translations.en` only |
| Document `dir` | `ltr` |
| Document `lang` | `en` |
| Language toggle | **Absent** |
| Readiness marker | `[data-testid="translations-loaded"][data-locale="en"]` |

### Affected surfaces (non-exhaustive)

- `TopAppBar` — brand + profile only (no `lang-toggle`)
- `BottomNav` — six **English** tab labels (`Home`, `Calendar`, `Locations`, `Logistics`, `Explore`, `Chat`)
- Page headers on `/`, `/itinerary`, `/locations`, `/pack`, `/bookings`, `/chat`
- Toasts: English only (e.g. `Saved to Locations ✓`)
- No bilingual hybrid labels (e.g. no `חקר / Investigate`)

## Chat contract (`/chat`)

| Element | Language | Direction |
| --- | --- | --- |
| Empty state title/subtitle | English (`t.chatTitle`, `t.chatSubtitle`) | LTR shell |
| Quick-prompt chips | English (`t.quickPrompt*`) | LTR |
| Input placeholder | English (`t.chatPlaceholder`) | `dir="auto"` on input |
| User message text | User's choice (EN/HE) | `dir="auto"` on bubble |
| Model markdown body | Per language rules below | `dir="auto"` |
| Replan sheet labels | English | LTR |

### Assistant reply language rules

| User input | Expected reply language |
| --- | --- |
| Entirely or overwhelmingly Hebrew | Hebrew |
| Entirely or overwhelmingly English | English |
| Mixed Hebrew + English (no dominant Hebrew) | English |
| English quick-prompt (any browser locale) | English |

## AI API payload (`POST /api/ai`)

```typescript
// TripContext excerpt — unchanged shape
{
  locale?: string; // "en" | "en-US" | "he" — from resolveChatContextLocale(), NOT navigator, NOT tripStore
}
```

**Invariants:**

- UI `tripStore.locale` must not be sent as `context.locale`.
- Quick-prompt sends: `locale` starts with `"en"`.
- Overwhelmingly Hebrew typed message: `locale` is `"he"`.

## Test IDs

| Removed | Retained / updated |
| --- | --- |
| `data-testid="lang-toggle"` | `data-testid="translations-loaded"` |
| `data-locale="he"` | `data-locale="en"` |
| | `id="chat-input"`, `id="chat-send-button"` |

## E2E expectations

1. Load `/` → `data-locale="en"` without clicking toggle.
2. `document.documentElement.getAttribute("dir") === "ltr"`.
3. Bottom nav shows `Home` (or `Logistics`), not `בית`.
4. On `/chat`, English quick-prompt → English mock reply visible.
5. On `/chat`, Hebrew-only message → mock/fixture returns Hebrew → visible in thread.
6. Bookmark toast contains English string, not `נשמר ליעדים`.
