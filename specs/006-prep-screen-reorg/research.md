# Research — 006 Prep Screen Reorganization

**Status:** COMPLETE — no unknowns remain.

---

## Decision 1: Nav label stays `לוגיסטיקה`

- **Decision:** Keep sixth tab label **`לוגיסטיקה`** / **`Logistics`** (unchanged from Step 16).
- **Rationale:** User explicitly rejected `הכנה` after brutal review — avoids third rename confusion; tab name matches primary content (logistics form).
- **Alternatives considered:** `הכנה` (rejected), `לוג'` (too abbreviated).

---

## Decision 2: Checklist deduplication — Strategy B

- **Decision:** Remove checklist rows **e1, e2, e3, e5**; keep **e4, e6, e7, e8, e9** (5 items).
- **Rationale:** Flights, car voucher, lockbox, and ZTL are already captured in `LogisticsCard` — duplicate rows caused two places for the same task.
- **Alternatives considered:** A (keep both with helper text), C (merge into single rows with inline fields) — user chose B.

---

## Decision 3: Section order on `/bookings`

- **Decision:** Page header → **LogisticsCard** → **EssentialsChecklist** (trimmed).
- **Rationale:** Tab is named logistics; reference codes are primary; checklist is secondary “reservations to verify.”
- **Alternatives considered:** Checklist first — rejected because nav semantics favor logistics form above fold.

---

## Decision 4: Itinerary layout after sidebar removal

- **Decision:** Remove `md:grid-cols-3` grid entirely; single-column full-width `ItineraryCard`.
- **Rationale:** Empty sidebar column on tablet would look broken; spec requires schedule-only focus.
- **Alternatives considered:** Keep grid with empty sidebar — rejected.

---

## Decision 5: Saved places single home

- **Decision:** `SavedAttractionsList` only on `/locations`; removed from `/itinerary`.
- **Rationale:** Duplicate management on Itinerary sidebar and Locations tab confused users; bookmark flow already writes to Zustand store visible on both — single UI home is Locations.
- **Alternatives considered:** Keep read-only list on Itinerary — rejected (still duplicate).

---

## Decision 6: Persistence for trimmed checklist IDs

- **Decision:** Keep `localStorage` key `tripiagent-essentials-checklist` unchanged; ignore checked state for removed IDs e1–e3, e5.
- **Rationale:** No migration script; remaining IDs e4, e6–e9 retain user progress.
- **Alternatives considered:** Purge removed IDs from storage — unnecessary for v1.

---

## Decision 7: Auto-fill logistics (out of scope)

- **Decision:** Manual entry only; AI receipt parser deferred to step 4c / future spec.
- **Rationale:** This feature is IA reorg only; auto-parse is a separate API + UI effort.

---

## Decision 8: E2E test redirect strategy

- **Decision:** Update specs that assert Saved Attractions or Essentials on `/itinerary` to use `/locations` and `/bookings` respectively.
- **Rationale:** Known blast radius from Step 16 pattern — tests must follow new screen ownership.
- **Files:** `step10.smoke.spec.ts`, `step17.smoke.spec.ts`, `travelAgentPersona.spec.ts`.
