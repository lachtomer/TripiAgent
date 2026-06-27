# Step 026 — In-trip: hide planning switcher + enable GPS

**Date:** 2026-06-27  
**Branch:** main  
**Port:** 9001

## Goal

When the user is **in-trip**, hide the Planning/In-Trip mode switcher and automatically request GPS so Investigate **Nearby** search works on-device.

## Acceptance criteria

- [ ] `tripMode === "in-trip"`: mode switcher hidden; non-interactive in-trip label shown
- [ ] `tripMode === "planning"`: mode switcher unchanged (both buttons)
- [ ] Entering in-trip (toggle or trip-start migration) triggers geolocation request
- [ ] `useLocation` auto-request only runs in in-trip (not while planning at home)
- [ ] `InvestigateSection` syncs to **Nearby** when trip mode becomes in-trip
- [ ] Trip start migration: if today ≥ `tripStartDate`, default/migrate to `in-trip`
- [ ] E2E: in-trip hides switcher; GPS granted enables Nearby search
- [ ] E2E planning tests seed `tripMode: planning` via localStorage helper

## Files

| File | Change |
| --- | --- |
| `app/page.tsx` | Hide switcher in-trip; in-trip label |
| `hooks/useLocation.ts` | GPS auto-request gated on in-trip |
| `components/InvestigateSection.tsx` | Sync investigate mode on tripMode |
| `stores/tripStore.ts` | Default/migrate in-trip after trip start |
| `e2e/helpers/authFixture.ts` | `seedTripMode` helper |
| `e2e/step20.nav-home-redesign.spec.ts` | Seed planning where needed |
| `e2e/step26.in-trip-mode.smoke.spec.ts` | **NEW** in-trip UX smoke |
