# Target Bank Day Picker & Activity-Nearby Discovery

**Canonical spec:** [`specs/002-target-bank-day-picker/spec.md`](../specs/002-target-bank-day-picker/spec.md)  
**Status:** Implemented (2026-06-02)  
**Short name:** `target-bank-day-picker`

## Summary (from user input)

1. **Target bank** — group `savedAttractions` only (not admin `/admin/bank`).
2. **UX picker on each day** — add bank entries directly onto that day’s itinerary timeline.
3. **Places by activity lat/lng** — when an activity is selected, nearby discovery uses `/api/places` with that activity’s coordinates (geocode fallback if missing).

## Out of scope (v1)

- Admin `bankStore` → itinerary bridge.
- Replacing Home `AttractionSearch`.

## Next command

`/speckit-plan`
