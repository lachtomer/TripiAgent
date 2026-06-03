# UI Contracts — Place Suggestion Links (007)

Verifiable via Playwright at 390px with mocked `/api/places` fixtures.

---

## Shared: `PlaceNameLink`

| Element | Requirement |
| --- | --- |
| Component | `components/PlaceNameLink.tsx` |
| `data-testid` | `place-name-link-{placeId}` when linked; `place-name-text-{placeId}` when plain |
| Link href | `website_url` if safe; else `maps_url` if safe; else no link |
| Link attrs | `target="_blank"`, `rel="noopener noreferrer"` |
| Styling | Accent `#006400` / dark `#86df72`, underline on hover, `dir="ltr"` on name |
| Icon | Optional `ExternalLink` lucide icon, 12px, decorative |

---

## Home — NearbyPlacesSection

| Element | Requirement |
| --- | --- |
| Top Picks card | Place name uses `PlaceNameLink`; card wrapper has **no** navigate-to-chat `onClick` |
| `#place-card-{placeId}` button | Still triggers `handlePlaceTap` (Ask AI) |
| Bookmark `#bookmark-{placeId}` | Unchanged; `stopPropagation` |
| Discover More rows | Place name uses `PlaceNameLink` |

---

## Home — AttractionSearch

| Element | Requirement |
| --- | --- |
| Search result row | `PlaceNameLink` on name |
| `#search-bookmark-{placeId}` | Unchanged |
| Load-more / pagination | Unchanged |

---

## Itinerary — ActivityNearbyPanel

| Element | Requirement |
| --- | --- |
| `data-testid="activity-nearby-result-{placeId}"` | Present |
| Place name | `PlaceNameLink` |
| `#activity-nearby-add-{placeId}` | Unchanged |
| `#activity-nearby-save-bank-{placeId}` | Unchanged |

---

## Locations — SavedAttractionsList

| Element | Requirement |
| --- | --- |
| Saved attraction name | `PlaceNameLink` when `website_url` or `maps_url` on saved record |
| Custom POI without URLs | Plain text name (no link) |

---

## Chat — ChatInterface

| Element | Requirement |
| --- | --- |
| Markdown links in assistant bubbles | Render with custom `a` component: new tab + scheme check |
| Link color | Matches prose accent tokens |

---

## Mock fixture contract (E2E / unit)

```json
{
  "place_id": "mock-osteria-1",
  "name": "Osteria Mock",
  "website_url": "https://example.com/osteria",
  "maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=mock-osteria-1"
}
```

Fallback fixture (no website):

```json
{
  "place_id": "mock-cafe-2",
  "name": "Cafe Senza Sito",
  "maps_url": "https://www.google.com/maps/search/?api=1&query_place_id=mock-cafe-2"
}
```

---

## Security contract

| Case | Expected |
| --- | --- |
| `website_url: "javascript:alert(1)"` | Stripped server-side; fallback to `maps_url` |
| Both URLs unsafe/missing | Plain text name, no `<a>` |
