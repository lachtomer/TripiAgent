# UI Contract — Calendar Day Guide (Itinerary `/itinerary`)

## Placement

- Inside each `#day-card-{dayNumber}` `Card`, **above** activity timeline in `CardContent`.
- Order: **DayGuidePanel** → add-activity form → timeline → **PlanBDayPanel** (unchanged).

---

## DayGuidePanel

### Props

```typescript
interface DayGuidePanelProps {
  dayNumber: number;
  defaultExpanded?: boolean;
}
```

Returns `null` when `getDayGuide(dayNumber)` is undefined.

### Root

| Attribute | Value |
| --- | --- |
| `data-testid` | `day-guide-{dayNumber}` |
| `aria-expanded` | on toggle button |

### Toggle button

| Attribute | Value |
| --- | --- |
| `id` | `day-guide-toggle-{dayNumber}` |
| Label | `t.dayGuideTitle` → “Day guide” |

### Banner (dual-option days only)

| Attribute | Value |
| --- | --- |
| `data-testid` | `day-guide-banner-{dayNumber}` |
| Role | status / note styling (amber neutral) |

### Location block

| Element | `data-testid` |
| --- | --- |
| Section heading | `day-guide-see-{dayNumber}` → “What to see” |
| Location row | `day-guide-location-{locationId}` |
| Must-see bullet | `day-guide-spot-{spotId}` |
| Optional badge | `day-guide-optional-{spotId}` |

Location name uses `PlaceNameLink` with `placeId={location.id}`.

### Food block

| Element | `data-testid` |
| --- | --- |
| Section heading | `day-guide-food-{dayNumber}` → “Food” |
| Food row | `day-guide-food-item-{foodId}` |
| Meal label | text: Lunch / Dinner / Snack |

Food name uses `PlaceNameLink`.

### Option sections (Day 4)

| Element | `data-testid` |
| --- | --- |
| Option wrapper | `day-guide-option-{optionId}` |
| Option label | heading text “Option A: …” |

---

## Visual (390px)

- Section headings: `text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground`
- Must-see bullets: `text-xs text-muted-foreground` with `•` prefix
- Links: green accent `#006400` / dark `#86df72`, min height 44px tap target
- Collapsed: only toggle row visible (~48px)

---

## Accessibility

- Toggle: `aria-controls={`day-guide-content-${dayNumber}`}`
- External links: `aria-label` via `PlaceNameLink` (existing)
- Optional badge includes text “Optional”, not color-only

---

## Non-regression

These must remain functional on `/itinerary`:

- `#trip-start-date`
- `#day-card-{n}` / activity timeline `data-testid={`activity-${id}`}`
- `#add-from-target-bank-day-{n}`
- Plan B panel test ids from Feature 011
- Rain alert on outdoor activities

---

## Sample acceptance (Day 2)

1. `#day-guide-2` visible when day card rendered.
2. Expand → `day-guide-location-loc-bergamo-alta` contains “Piazza Vecchia”.
3. `day-guide-food-item-food-la-bruschetta` link `href` starts with `https://`.
4. Collapse → must-see bullets hidden.
