# Step 021 — Day guide food grouped by location (dual options)

**Status:** Implement

## Goal

On Days **2, 6, 7** (Option A/B), show each location as one block: **must-see + food for that place**. Add `locationId` on `DayGuideFood` and tag all dual-option food entries.

## Scope

- `types/index.ts` — optional `locationId` on `DayGuideFood`
- `components/DayGuidePanel.tsx` — location-centric layout for options
- `lib/tripDayGuides.ts` — `locationId` on Days 2/6/7 food
- `lib/dayGuideFoodGrouping.ts` + unit test

## Acceptance

- Dual-option days render food under matching location headings
- Ungrouped food (no `locationId`) still renders at end of option
- Single-track days unchanged
- Tests + lint green
