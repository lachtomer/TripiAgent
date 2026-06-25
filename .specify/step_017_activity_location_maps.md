# Step 017 — Activity location pill opens Google Maps

## Goal

Fix bug: tapping the itinerary activity **location pill** (MapPin + `locationName`) incorrectly navigates to AI chat. It must open Google Maps with a **text search** for `locationName` (not coordinates).

## Acceptance criteria

- [ ] Location pill on expanded activity is an external link to `https://www.google.com/maps/search/?api=1&query={locationName}`.
- [ ] Link opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).
- [ ] **Ask AI Tips** still routes to `/chat` with the existing prompt.
- [ ] **Explore nearby** unchanged.
- [ ] `data-testid="activity-location-link-{activityId}"` for E2E.
- [ ] Unit tests for URL builder; Playwright smoke for location vs Ask AI split.

## Files

- `lib/urlSafety.ts` — export `buildActivityLocationMapsUrl`
- `lib/urlSafety.test.ts`
- `components/ItineraryCard.tsx`
- `lib/translations.ts` — aria-label strings
- `e2e/step27.activity-location-maps.smoke.spec.ts`

## Out of scope

- Using `lat`/`lng` for activity location links
- Changing TodayPlanner location display (non-clickable today)
