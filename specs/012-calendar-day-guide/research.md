# Research — 012 Calendar Day Guide & Itinerary Refresh

## R1: Where to store Day Guide content

**Decision:** Static module `lib/tripDayGuides.ts` keyed by `dayNumber` (1–10), exported via `getDayGuide(dayNumber)`.

**Rationale:**
- Large curated content (must-see bullets, food, URLs) should not inflate `defaultItalyItinerary.ts` or Zustand persisted state.
- Day guides are **read-only reference** in v1; no user edits → no persist schema migration.
- Lookup by `dayNumber` matches spec edge case (“custom itinerary may drift; guide tied to default day numbers”).

**Alternatives considered:**
- Embed in `ItineraryDay.dayGuide` on seed only — duplicates data in store after user edits; harder to diff content updates.
- Fetch from `/api/day-guides` — violates “offline bundled” success criterion; adds server surface for static copy.

---

## R2: Link handling

**Decision:** Reuse `PlaceNameLink`, `resolvePlaceHref`, and `isSafeExternalUrl` from `lib/urlSafety.ts`.

**Rationale:** Existing pattern on Target Bank and ActivityNearby; enforces http/https only and `noopener noreferrer`.

**Alternatives considered:**
- Raw `<a>` tags — inconsistent a11y labels and URL validation.

---

## R3: Sun Jun 28 dual-option presentation

**Decision:** `DayGuide` supports optional `options: DayGuideOption[]` (Option A / B). Timeline shows a single summary activity plus banner; Day Guide carries full detail for both branches.

**Rationale:** Spec excludes selection UI in v1; duplicating entire timeline for both options would imply double booking.

**Alternatives considered:**
- Two full parallel timelines — confusing and contradicts “pick one” messaging.

---

## R4: Itinerary refresh scope

**Decision:** Replace `DEFAULT_ITALY_ITINERARY` activities for Days 2–9 per spec §3B; update `lakeGardaTargetBank.ts`, `lakeGardaDayBackups.ts`, and `data/bank.json` for removed venues (Rimbalzello, safari, Desenzano boat) and new anchors (Bergamo, Castellaro, Manerba boat, CanevaWorld+Peschiera).

**Rationale:** Planned badges and Plan B depend on itinerary ↔ bank alignment (Feature 011).

**Alternatives considered:**
- Day Guide only, leave old itinerary — fails schedule accuracy success criterion.

---

## R5: Expand/collapse default state

**Decision:** `DayGuidePanel` receives `defaultExpanded={todayDayNumber === day.dayNumber}`; local state on first mount only (does not re-collapse when midnight passes during session).

**Rationale:** Matches spec; simple UX; same pattern as other local UI state in `ItineraryCard`.

**Alternatives considered:**
- Persist expand state per day in Zustand — unnecessary for v1.

---

## R6: i18n

**Decision:** English strings in `lib/tripDayGuides.ts` and new `lib/translations.ts` keys for section labels only (“Day guide”, “What to see”, “Food”, “Optional”, “Option A/B”).

**Rationale:** Spec allows English content v1; section chrome can be translated later without moving curated POI copy.

---

## R7: E2E strategy

**Decision:** New `e2e/step26.calendar-day-guide.smoke.spec.ts` — assert Day Guide visibility, expand, external link `href` presence, updated day titles (Jun 26 Bergamo, Jun 27 Borghetto, etc.). Update `e2e/step4h.smoke.spec.ts` day title strings.

**Rationale:** step4h encodes old itinerary labels; must update to avoid false failures.
