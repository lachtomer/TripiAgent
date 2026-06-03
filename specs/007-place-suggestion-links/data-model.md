# Data Model — 007 Clickable Place Suggestion Links

---

## PlaceDetail (extended)

| Field | Type | Source | Notes |
| --- | --- | --- | --- |
| `place_id` | string | Nearby Search | unchanged |
| `name` | string | Nearby Search | unchanged |
| `rating` | number? | Nearby Search | unchanged |
| `open_now` | boolean? | Nearby Search | unchanged |
| `types` | string[]? | Nearby Search | unchanged |
| `distance` | number? | computed | unchanged |
| `maps_url` | string? | `buildGoogleMapsUrl(place_id)` | fallback link |
| `website_url` | string? | Place Details `website` | primary link; omitted if absent or fails validation |
| `address` | string? | Nearby Search | unchanged |

### Validation rules

| Rule | Enforcement |
| --- | --- |
| `website_url` must pass `isSafeExternalUrl` | `lib/places.ts` after Details fetch |
| If `website_url` invalid/missing, UI uses `maps_url` | `PlaceNameLink` |
| If both missing, name renders as text | `PlaceNameLink` |

---

## SavedAttraction (extended)

| Field | Type | Storage | Notes |
| --- | --- | --- | --- |
| `website_url` | string? | `tripStore.savedAttractions` | set on bookmark from search |
| `maps_url` | string? | same | set on bookmark from search |

**Migration:** Optional fields — existing persisted attractions without URLs render as plain text names (no migration script).

---

## API: GET `/api/places`

**Query:** unchanged (`PlacesQuerySchema`)

**Response:** `PlaceDetail[]` with enriched `website_url` when available.

**Server cache key:** unchanged coordinate tuple; cached payload includes enriched URLs.

---

## New utility: `lib/urlSafety.ts`

```typescript
export function isSafeExternalUrl(url: string): boolean;
export function resolvePlaceHref(websiteUrl?: string, mapsUrl?: string): string | null;
```

---

## State transitions

None in `tripStore` beyond optional fields on bookmark payloads:

```
Search result (PlaceDetail) --bookmark--> SavedAttraction { ..., website_url, maps_url }
```

No new Zustand actions required; existing `saveAttraction` / `toggleSearchBookmark` accept extended shape.
