# BACKLOG

## Planned features (specified — implement when ready)

| ID | Feature | Spec | Status |
|----|---------|------|--------|
| F-1 | **User login & layered persistence** — Sign-in (e.g. Tomer/Tomer); group-shared data (itinerary, target bank) vs. per-user data (personal packing, preferences); common + personal packing items | [`specs/001-user-login-persistence/spec.md`](specs/001-user-login-persistence/spec.md) | Spec complete → `/speckit-plan` |
| F-2 | **Multi-trip workspaces** — Same tool for different people, destinations, or trips (e.g. Italy vs. Japan); switch or create trip context; isolate selections per trip | _Spec pending — run `/speckit-specify`_ | Backlog only |
| F-3 | **Target bank day picker & activity-nearby** — Per-day picker from group Target Bank; explore nearby via places API anchored to activity lat/lng | [`specs/002-target-bank-day-picker/spec.md`](specs/002-target-bank-day-picker/spec.md) | Implemented |

### F-1 summary (persistence model)

- **Group-shared (all travelers on the trip):** itinerary, saved/target bank, trip dates & destination context, shared chat for the trip.
- **Hybrid — packing:** common list items for the whole group + personal items per signed-in traveler.
- **Per signed-in user:** personal packing checkmarks, locale, admin permissions, session identity.
- **Login:** username/password (password may equal username for v1 trusted groups).

### F-3 summary (target bank → day + nearby)

- **Target Bank only:** group `savedAttractions` (bookmarks + custom POIs), not admin `/admin/bank`.
- **Per-day picker** on each itinerary day card to schedule a bank entry with time onto that day.
- **Activity-nearby:** expand/select activity → explore nearby using resolved `lat`/`lng` via `/api/places` (geocode fallback).
- Sidebar `SavedAttractionsList` stays; picker is a faster path.

### F-2 summary (not yet specified)

- One account may own multiple trips to different places.
- Each trip has its own destination, itinerary, bank, and selection bundle.
- User picks the active trip; data does not leak between trips.

---

## Non-immediate items (nice-to-have)

- Task 9: Explore live transit routing integration (Google Routes API / Trenitalia).
- Task 10: Implement push notifications for rain warnings, ZTL alerts, and flight delays.

## Blocked items

- None at this time.
