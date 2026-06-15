# Data Model — 011 Target Bank Planned & Plan A/B

## SavedAttraction (extended, backward compatible)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | unchanged |
| `name` | string | yes | unchanged |
| `description` | string? | no | may mention dates for fallback parsing |
| `backupForDay` | number? | no | **NEW** — explicit Plan B day hint (1-based) |
| `alternateFor` | string? | no | **NEW** — activity title or bank id this backs up |
| `planBReason` | string? | no | **NEW** — one-line UI reason, e.g. “Rain backup · same area” |

Existing fields unchanged (`locationName`, `lat`, `lng`, votes, etc.).

---

## Activity (extended)

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `sourceAttractionId` | string? | no | **NEW** — bank id when added via `addAttractionToItinerary` |

Existing fields unchanged.

---

## PlannedStatus (derived, not persisted)

| Field | Type | Source |
| --- | --- | --- |
| `isPlanned` | boolean | match itinerary |
| `scheduledDayNumbers` | number[] | days with matching activities |
| `matchKind` | enum | `id_link` \| `title_exact` \| `title_fuzzy` |

**Producer:** `getBankPlannedStatus(bankEntry, itinerary)`  
**Consumer:** Locations list, Target Bank picker, sort helper

---

## SortedBankEntry (derived)

| Field | Type |
| --- | --- |
| `entry` | SavedAttraction |
| `plannedStatus` | PlannedStatus |
| `sortIndex` | number (original order for stable unplanned sort) |

---

## PlanBOption (derived per day)

| Field | Type | Notes |
| --- | --- | --- |
| `bankId` | string | Target Bank entry |
| `name` | string | display |
| `reason` | string | e.g. “Rain backup · same area” |
| `alternateFor` | string? | activity title this replaces |
| `highlightWeather` | boolean | true when day has rain-sensitive Plan A activity |

**Producer:** `getPlanBOptionsForDay(dayNumber, itinerary, savedAttractions, tripStartDate)`  
**Cap:** max 2 options per day (spec)

---

## Day backup catalog (static v1)

`LAKE_GARDA_DAY_BACKUPS`: `Record<number, { bankId: string; reason: string; alternateFor?: string }[]>`

Example keys: day 3 (Jun 27 boat day) → CanevaWorld, Movieland; day 6 → CanevaWorld/Movieland as Gardaland alternates.

---

## Client UI state (ephemeral)

| State | Component | Notes |
| --- | --- | --- |
| `bankFilter` | SavedAttractionsList | `all` \| `unplanned` \| `planned` |
| `planBExpanded` | ItineraryCard | `Record<dayNumber, boolean>` |
| `swapDialog` | ItineraryCard | `{ dayNumber, activityId, bankId } \| null` |

**Store:** Optional `swapActivityWithBankEntry` action; filter state local only.

---

## Cache / persistence

No new persistence keys. `sourceAttractionId` migrates on new adds only; existing itinerary activities rely on title fuzzy match until re-added from bank.
