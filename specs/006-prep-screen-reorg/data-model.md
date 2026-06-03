# Data Model — 006 Prep Screen Reorganization

No new Zustand fields or API schemas. This feature relocates UI and trims a static checklist array.

---

## Existing entities (unchanged storage)

### TravelLogistics

| Field | Type | Storage |
| --- | --- | --- |
| `flightTlvMxpCode` | string | `tripStore.logistics` → persisted |
| `flightMxpTlvCode` | string | same |
| `carRentalVoucherCode` | string | same |
| `villaEuniceLockboxCode` | string | same |
| `milanZtlPaid` | boolean | same |

**Owner UI:** `LogisticsCard` on `/bookings` only.

---

### Essentials checklist item (trimmed)

| Field | Type | Storage |
| --- | --- | --- |
| `id` | string (`e4`, `e6`–`e9`) | static in component |
| `task` | string | static |
| `subtext` | string | static |
| `checked` | boolean | `localStorage` `tripiagent-essentials-checklist` keyed by id |

**Removed IDs (no UI, state ignored):** `e1`, `e2`, `e3`, `e5`

**Active IDs after dedup B:**

| ID | Task |
| --- | --- |
| e4 | Portable CO/Smoke Detector |
| e6 | Aquaria Thermal Spa Booking |
| e7 | Gardaland Tickets |
| e8 | Taverna del Silenzio Reservation |
| e9 | Desenzano Boat Rental |

**Owner UI:** `EssentialsChecklist` on `/bookings` only.

---

### SavedAttraction

Unchanged. Managed only via `/locations` UI; consumed by itinerary when user assigns to day.

---

### Itinerary day / activity

Unchanged. Displayed on `/itinerary` via `ItineraryCard`.

---

## Validation rules

| Rule | Enforcement |
| --- | --- |
| Checklist progress = checked count / 5 | `EssentialsChecklist` computed from trimmed array |
| Logistics fields optional strings | Existing `updateLogistics` trim on save |
| Removed checklist IDs not rendered | Filter or delete from `ESSENTIALS_ITEMS` constant |

---

## State transitions

None. No new actions in `tripStore.ts`.
