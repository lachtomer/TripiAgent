# Data Model — 012 Calendar Day Guide & Itinerary Refresh

## DayGuideSpot

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | stable slug, e.g. `bergamo-piazza-vecchia` |
| `title` | string | yes | highlight name |
| `detail` | string | no | one-line why |
| `optional` | boolean | no | default false; true → “Optional” badge |
| `link` | string | no | official or maps URL |
| `linkLabel` | string | no | e.g. “Official site” |

---

## DayGuideLocation

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | e.g. `loc-bergamo-alta` |
| `name` | string | yes | display heading |
| `mapsUrl` | string | yes | Google Maps search or place URL |
| `websiteUrl` | string | no | tourism / park official site |
| `mustSee` | DayGuideSpot[] | yes | ≥1 item |

---

## DayGuideFood

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | e.g. `food-la-bruschetta` |
| `name` | string | yes | venue name |
| `style` | string | yes | e.g. “Pizza · casual” |
| `when` | `"lunch"` \| `"dinner"` \| `"snack"` | yes | meal slot |
| `mapsUrl` | string | yes | |
| `websiteUrl` | string | no | |
| `isPrimary` | boolean | no | highlight first lunch choice |

---

## DayGuideOption

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | `option-a-verona` |
| `label` | string | yes | “Option A: Verona” |
| `locations` | DayGuideLocation[] | yes | |
| `food` | DayGuideFood[] | yes | |

Used when day has mutually exclusive plans (Day 4).

---

## DayGuide

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `dayNumber` | number | yes | 1-based itinerary day |
| `locations` | DayGuideLocation[] | no | standard single-plan days |
| `food` | DayGuideFood[] | no | |
| `options` | DayGuideOption[] | no | if set, `locations`/`food` top-level omitted |
| `bannerNote` | string | no | e.g. “Group vote: Verona or Monte Baldo” |

**Producer:** `getDayGuide(dayNumber)` from `lib/tripDayGuides.ts`  
**Consumer:** `DayGuidePanel` in `ItineraryCard`

---

## ItineraryDay (unchanged shape)

No new persisted fields on `ItineraryDay` in v1. Activity timeline remains source of timed schedule.

| Field | Change |
| --- | --- |
| `date` | Updated strings per replan (e.g. `Jun 27 – Castellaro & Sigurtà`) |
| `activities` | Rebuilt Days 2–9 |

---

## Activity (unchanged)

Existing fields; new seed activities reference updated titles/locations for Planned matching.

Optional: set `sourceAttractionId` on seeded activities where bank id exists (Gardaland, Aquaria, etc.) for stronger Planned links.

---

## Client UI state (ephemeral)

| State | Component | Notes |
| --- | --- | --- |
| `dayGuideExpanded` | `DayGuidePanel` | `useState`; initial from `defaultExpanded` prop |
| `todayDayNumber` | `ItineraryCard` | existing helper |

---

## Static catalogs

| Module | Purpose |
| --- | --- |
| `lib/tripDayGuides.ts` | `TRIP_DAY_GUIDES: Record<number, DayGuide>` |
| `lib/defaultItalyItinerary.ts` | Timed activities |
| `lib/lakeGardaTargetBank.ts` | Bank seed sync |
| `lib/lakeGardaDayBackups.ts` | Plan B map keyed by new day activities |

---

## Validation rules

1. Every `DayGuideLocation` has ≥1 `mustSee` and a valid `mapsUrl` (`isSafeExternalUrl`).
2. Days 2–9 each have ≥1 `DayGuideFood` with `when: "lunch"`.
3. All URLs http/https only.
4. Day 4 must have exactly 2 `DayGuideOption` entries.
5. Optional spots (`Grotte di Catullo`, `Manerba village`) have `optional: true` on spot or location note.
