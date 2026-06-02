# User Login & Layered Trip Persistence (F-1)

**Canonical spec:** [`specs/001-user-login-persistence/spec.md`](../specs/001-user-login-persistence/spec.md)

**Persistence model:**

| Shared (group) | Hybrid | Personal (per signed-in user) |
|----------------|--------|--------------------------------|
| Itinerary, target bank, trip dates & destination, group chat, trip mode | Common packing list + personal packing list | Personal packing items/checkmarks, locale, bank votes/signals, activity-done per person |

**Backlog:** [`BACKLOG.md`](../BACKLOG.md) — F-1 (this), F-2 multi-trip (spec pending).

**Status:** Spec complete — ready for `/speckit-plan`.
