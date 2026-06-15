# Contract: Planned Bank & Plan A/B (011)

## Locations / Target Bank list

| Element | testid / id | Behavior |
| --- | --- | --- |
| Filter chips | `[data-testid='bank-filter-all']`, `bank-filter-unplanned`, `bank-filter-planned` | Default **All** |
| Section label (optional) | `[data-testid='bank-section-unplanned']` | “Alternatives” group header |
| Section label (optional) | `[data-testid='bank-section-planned']` | “Already planned” group header |
| Planned badge | `[data-testid='bank-planned-badge']` | Text “Planned” + icon; `aria-label` includes day numbers |
| Scheduled hint | `[data-testid='bank-scheduled-days']` | “Day 3, Day 6” when multiple |
| Row order | — | Unplanned first (stable), Planned last (by earliest day) |
| Planned row tap | — | Toast or inline link: “View on Itinerary → Day N” navigates to `/itinerary#day-card-N` |

---

## Target Bank day picker sheet

| Element | Behavior |
| --- | --- |
| Same sort + Planned badge as Locations list |
| Planned rows **disabled for select** (or show “Already on itinerary”) |
| Unplanned rows selectable as today |

---

## Itinerary day card — Plan B panel

| Element | testid | Behavior |
| --- | --- | --- |
| Plan B toggle | `[data-testid='plan-b-toggle-day-{n}']` | Collapsed by default; `aria-expanded` |
| Plan B panel | `[data-testid='plan-b-panel-day-{n}']` | Hidden when zero options |
| Plan B row | `[data-testid='plan-b-option-{bankId}']` | Name + reason |
| Add to day | `[data-testid='plan-b-add-day-{n}-{bankId}']` | Calls `addAttractionToItinerary(n, bankId, defaultTime)` |
| View backup | expands description + PlaceNameLink |
| Rain hint | `[data-testid='plan-b-weather-hint-day-{n}']` | Optional when Plan A activity has weather flag |
| Swap (optional) | `[data-testid='plan-b-swap-day-{n}-{bankId}']` | Opens confirm dialog |

**Invariant:** At most **2** Plan B rows visible per day.

---

## Planned matching (lib contract)

```typescript
function normalizePlanText(s: string): string;
function titleTokensMatch(bankName: string, activityTitle: string): boolean;
function getBankPlannedStatus(entry: SavedAttraction, itinerary: ItineraryDay[]): PlannedStatus;
function sortBankEntries(entries: SavedAttraction[], itinerary: ItineraryDay[]): SortedBankEntry[];
function getPlanBOptionsForDay(dayNumber: number, ctx: PlanBContext): PlanBOption[]; // max 2
```

---

## Lake Garda backup map (v1 seed)

| Day | Date (default itinerary) | Plan B bank ids (if unplanned) |
| --- | --- | --- |
| 3 | Jun 27 boat | `bank-caneva-aqua`, `bank-movieland` (rain / boat cancel) |
| 3 | | `bank-jungle-adventure` (tertiary — only if &lt;2 above planned) |
| 6 | Jun 30 Gardaland | `bank-caneva-aqua`, `bank-movieland` |
| 7 | Jul 1 Baldo | `bank-paragliding-malcesine` (alternateFor cable car) |
| 2 | Jun 26 | none required (optional empty) |

Dining-only bank entries match Planned via title/description to scheduled meals; appear in Planned group.

---

## E2E expectations (step25 smoke)

1. Locations: Gardaland row shows **Planned**; CanevaWorld does not; CanevaWorld above Gardaland in list.
2. Filter **Unplanned only** hides Gardaland.
3. Itinerary Day 3: expand Plan B → CanevaWorld visible; Add schedules activity.
4. After add, CanevaWorld becomes Planned (if title matches) or remains if different title — id link preferred.

---

## Regression

- `step18` Target Bank day picker still adds unplanned row
- `step19` Serravalle visible in picker
- Bookmark / vote / admin delete unchanged
