# Data Model: Itinerary & Target Bank Refresh

## SavedAttraction (extended seed)

Existing fields unchanged. New entries use:

| Field | Notes |
|-------|--------|
| `category` | admin bank only: `theme_park`, `adventure`, `nature`, `water_sports`, `town`, `culture`, `wellness`, `shopping`, `dining` |
| `description` | includes teen-fit rationale and booking hints |

## Activity (itinerary)

| Field | Notes |
|-------|--------|
| `time` | HH:MM 24h; Gardaland day starts 09:30 |
| `description` | restaurant name + dish suggestion where applicable |

## New POIs (bank)

Borghetto sul Mincio, Parco Giardino Sigurtà, Serravalle Designer Outlet, plus dining POIs tied to each day.
