# Data Model: Navigation Redesign & Home Screen

## Scope

This feature is a **UI-only restructure**. No new persistent entities are introduced.
All existing data structures in `tripStore` and `bankStore` are reused without changes.

---

## Existing Entities Used (no changes)

### `TripState` (in `stores/tripStore.ts`)

| Field | Type | Usage in this feature |
|-------|------|-----------------------|
| `tripMode` | `"planning" \| "in-trip"` | Determines default Investigate mode (Target vs Around Me) and whether MapPreview shows destination overview or GPS position |
| `savedAttractions` | `SavedAttraction[]` | Read by `/locations` page via `SavedAttractionsList` component |
| `location` | `LocationDetails \| null` | GPS coordinates used by "Around Me" mode in `InvestigateSection` |
| `itinerary` | `ItineraryDay[] \| null` | MapPreview reads today's stops (future enhancement); currently decorative |
| `locale` | `"en" \| "he"` | Controls which translation string is rendered in BottomNav labels |

### `SavedAttraction` (in `types/index.ts`)

No changes. The `/locations` route renders the existing `SavedAttractionsList`
component which already handles this type.

---

## Translation Keys Added (in `lib/translations.ts`)

These are the only "data" changes: new string keys added to both `en` and `he` locales.

| Key | English value | Hebrew value |
|-----|--------------|--------------|
| `home` | `"Home"` | `"בית"` |
| `calendar` | `"Calendar"` | `"תכנון"` |
| `locations` | `"Locations"` | `"יעדים"` |
| `bookings` | `"Bookings"` | `"ניירות"` |

> **Note:** `chat` (`"צ'אט"`) and `pack` (`"אריזה"`) already exist in both locales.

---

## Navigation Config (in `components/BottomNav.tsx`)

The `navItems` array changes from 4 entries to 6. This is a UI constant, not a
persisted state change.

| # | Key | Route | Icon | Translation key |
|---|-----|-------|------|-----------------|
| 1 | `home` | `/` | `Home` | `t.home` |
| 2 | `calendar` | `/itinerary` | `Calendar` | `t.calendar` |
| 3 | `chat` | `/chat` | `MessageCircle` | `t.chat` |
| 4 | `pack` | `/pack` | `Luggage` | `t.pack` |
| 5 | `locations` | `/locations` | `MapPin` | `t.locations` |
| 6 | `bookings` | `/bookings` | `FileText` | `t.bookings` |

---

## Component Props Added

### `AttractionSearch` — new optional props (v2 corrected)

```typescript
interface AttractionSearchProps {
  defaultQuery?: string; // Initial value for the query useState — NOT a useEffect
  headless?: boolean;    // Suppresses Card + CardHeader wrapper
}
```

`defaultQuery` is passed directly as `useState(defaultQuery ?? "")`.  
No `useEffect` is used — avoids lint violation and is correct by design.

`key={mode}` on `<AttractionSearch>` inside `InvestigateSection` forces remount
when the toggle changes, resetting the query state to the new `defaultQuery`.

---

## Correct Store Field References

| Intended value | Correct selector |
|----------------|-----------------|
| GPS-resolved city name | `useTripStore(s => s.location?.cityName)` |
| First saved attraction location | `useTripStore(s => s.savedAttractions[0]?.locationName)` |

> Do NOT use `.location` (not a field on `SavedAttraction`) or `manualCity` (not a top-level field on `TripState`).

---

## State Transitions

No new state machines. The `InvestigateSection` toggle is local React state
(`useState`) in the component — it does not persist to `tripStore`.

```
InvestigateSection local state:
  mode: "target" | "around-me"
  Initial value: tripMode === "in-trip" ? "around-me" : "target"
  On mode change: AttractionSearch remounts via key={mode}
```
