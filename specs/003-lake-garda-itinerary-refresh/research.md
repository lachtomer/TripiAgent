# Research: Lake Garda Teen Itinerary Refresh

## Decision: Extract itinerary to lib module

**Rationale:** Keeps `ItineraryCard.tsx` under maintainable size; same export surface via re-export.

**Alternatives considered:** Inline edit in ItineraryCard only — rejected due to ~300 line activity array.

## Decision: Dining as Target Bank POIs with `category: dining`

**Rationale:** User requested all recommendations in bank; dining entries enable day-picker scheduling and nearby discovery.

**Alternatives considered:** Restaurants only in activity descriptions — rejected per user request.

## Decision: No localStorage migration version bump

**Rationale:** Zustand persist has no version hook today; document manual reset for travelers who already loaded old itinerary.

**Alternatives considered:** Force-reset itinerary on app load — rejected (destructive to user edits).
