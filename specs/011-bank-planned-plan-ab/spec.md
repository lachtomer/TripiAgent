# Specification: Target Bank “Planned” Status & Easy Plan A / B per Day

## 1. Goal & Context

Travelers using TripiAgent’s **Target Bank** (Locations tab) see a long list of curated and bookmarked places—many of which are **already scheduled** on the itinerary (e.g. Gardaland on Jun 30, Verona Arena on Jun 28). Today those entries look the same as unused alternatives, which creates noise and makes people think they need to **replan the whole trip** when browsing the bank.

This feature:

1. **Marks** Target Bank entries that are already on the itinerary as **Planned**.
2. **Reorders** the list so **unplanned alternatives appear first** and **planned entries sink to the bottom**.
3. Surfaces a simple **Plan A / Plan B** view **per itinerary day** so users can see their committed plan and one-tap **backup options** (rain, energy, closure) without replanning from scratch.

**Target personas:** Group planner before the trip; in-trip traveler checking “what’s our backup if it rains?”

**Relationship to prior work:** Extends Target Bank (Feature 002 day picker, Feature 003 Lake Garda content, Feature 004 Locations tab). Does **not** replace the itinerary or auto-rewrite all days.

---

## 2. User Stories

- **As a planner**, I want bank items already on my itinerary labeled **Planned**, **so that** I focus on what’s still open to schedule.
- **As a planner**, I want unplanned suggestions at the **top** of the Target Bank list, **so that** I don’t scroll past things I’ve already locked in.
- **As a traveler**, I want each day to show **Plan A** (what we’re doing) and an optional **Plan B** (easy backup), **so that** I can swap mentally—or in the app—when weather or mood changes.
- **As a traveler**, I want Plan B choices limited to **1–2 sensible alternates** from the same bank, **so that** I’m not overwhelmed with options.
- **As a group member**, I want Planned status to update when an activity is added or removed from the itinerary, **so that** the bank stays truthful without manual tagging.

---

## 3. Functional Requirements

### A. “Planned” detection & labeling

- [ ] A Target Bank entry is **Planned** when its **name** (normalized, case-insensitive) matches any **itinerary activity title** on any day, **or** when the activity stores an explicit link to that bank entry id (if present).
- [ ] Planned entries show a visible **“Planned”** badge (or equivalent) on the Locations / Target Bank list and in the Target Bank day picker sheet.
- [ ] Removing the last matching activity from the itinerary **clears** Planned status for that bank entry.
- [ ] Custom POIs added only to the itinerary (not in the bank) do not affect bank ordering; bank entries not on the itinerary remain **Unplanned**.

### B. List ordering (Locations / Target Bank)

- [ ] Default sort: **Unplanned first** (preserve existing order within each group—e.g. curated order or bookmark date), then **Planned last**.
- [ ] Within the Planned group at the bottom, order matches **itinerary day sequence** (earliest scheduled day first) when a single match exists; ties by name.
- [ ] Optional filter chip: **All | Unplanned only | Planned only** (default **All** with sort above).
- [ ] Search/filter within Locations (if present) respects the same Planned grouping.

### C. Plan A / Plan B per day (itinerary)

- [ ] Each **itinerary day card** shows a compact **Plan A** summary: the day’s scheduled activities (existing behavior, unchanged content).
- [ ] Below or beside Plan A, show **Plan B** when at least one **Unplanned** bank entry is associated with that day as a backup (see association rules).
- [ ] Plan B displays **at most two** backup options per day, each with: name, one-line reason (e.g. “Rain backup · same area”), and actions: **View** (expand description / links), **Add to this day** (existing day-picker flow), optional **Replace Plan A activity** only when user explicitly chooses swap (see D).
- [ ] Plan B section is **collapsed by default** with label **“Backup options (Plan B)”**; one tap expands.
- [ ] Days with no configured backups hide the Plan B block entirely (no empty accordion).

### D. Plan B association rules (v1, no AI)

- [ ] **Primary:** Bank entry **description** or metadata includes an itinerary **date or day label** (e.g. “Jun 27 lunch”, “Jul 2 nature day”) → associate to that calendar day derived from `tripStartDate`.
- [ ] **Secondary:** Bank entry tagged as **alternate for** a named activity or place (e.g. alternate for “Self-Drive Boat”) via structured tag in bank seed data or `alternateFor` field.
- [ ] **Tertiary:** Same **location area** as a Plan A activity on that day and category **compatible** (attraction vs dining) → eligible backup only if listed in curated **day backup set** for that trip template (avoids random suggestions).
- [ ] v1 does **not** auto-generate Plan B from live weather; weather may **highlight** an existing Plan B (e.g. rain icon on Jun 27) using existing weather display patterns.

### E. User actions (easy paths)

- [ ] **Add Plan B to day** uses existing **Add from Target Bank** / day picker—no new scheduling API.
- [ ] **Swap** (optional v1): user selects one Plan A activity and one Plan B entry → confirm dialog → replace activity title/description/location from bank entry; **no silent auto-swap**.
- [ ] Tapping a **Planned** bank row from Locations shows **“Scheduled on Day N”** with link to scroll/focus that day on Itinerary (navigation only).

### F. Scope boundaries

- [ ] v1 does **not** replan the full trip automatically.
- [ ] v1 does **not** require group voting on Plan B.
- [ ] v1 does **not** sync Plan B across devices beyond existing trip store rules.
- [ ] Admin `/admin/bank` curation pipeline unchanged; only **group Target Bank** (`savedAttractions`) and itinerary UI.
- [ ] v1 does **not** add new external APIs; matching uses itinerary + bank data on device.

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; Plan B fits in existing day card accordion pattern.
- **Locations list:** Planned badge must not rely on color alone (text “Planned” + icon).
- **English UI** copy (Feature 009); short labels: “Planned”, “Backup (Plan B)”, “View backup”, “Add to day”.
- **Accessibility:** Expand/collapse Plan B has `aria-expanded`; Planned state announced to screen readers.

---

## 5. Security & Edge Cases

- **False positive match:** “Verona” activity vs “Verona Arena” bank entry — prefer **longest match** or explicit id link; ambiguous matches require **both** normalized names to share significant token overlap (spec: ≥80% of bank name tokens appear in activity title).
- **Duplicate activities same name on two days:** Planned badge shows **“Day 3 & Day 5”** or earliest day for sort key.
- **Empty itinerary:** All bank entries Unplanned; no Plan B blocks on itinerary.
- **Trip not started / no start date:** Day association from text falls back to **day number in description** only; Plan B date labels hidden if undetermined.
- **Planning mode freeze:** Plan B **Add** / **Swap** follows same disable rules as other itinerary edits.

---

## 6. Assumptions

1. Default trip template remains **Lake Garda Jun 25–Jul 4 2026** with seeded bank entries that already mention dates in descriptions.
2. **Plan A** is always whatever is on the itinerary; the app does not maintain a separate Plan A document.
3. **Plan B** entries are a **subset** of Unplanned bank items pre-associated by content/tags—not every unplanned item appears on every day.
4. Users want **clarity over completeness**—showing 0–2 backups per day is acceptable.
5. Matching Planned status is **client-side** against persisted itinerary + bank (no new server DB).

---

## 7. Success Criteria

1. **Planned visibility:** ≥90% of bank entries that appear verbatim (or linked) on the itinerary show **Planned** within one navigation after scheduling.
2. **Sort clarity:** In user testing, travelers identify **unplanned alternatives in the first screen** of Locations without scrolling past planned items (planned items only after scroll).
3. **Plan B usefulness:** For Jun 27 (rain-sensitive day), expanding Plan B shows **CanevaWorld or Movieland** (or equivalent tagged backup) within **2 taps** from Itinerary.
4. **No replan anxiety:** Users can articulate that Plan B is **optional backup**, not a requirement to replan (qualitative: task success in moderated test).
5. **Regression:** Target Bank day picker, bookmark, add-to-day, and existing itinerary edit flows still work.
6. **Performance:** Planned sort and badges appear on Locations load within **1 second** on mid-tier mobile for ≤50 bank entries.

---

## 8. Key Entities

| Entity | Description | Persistence |
| --- | --- | --- |
| Target Bank entry | Saved / curated place (`savedAttractions[]`) | Existing store |
| Planned status | Derived: entry matches itinerary activity | Computed; not manually edited in v1 |
| Itinerary activity | Day, time, title, optional bank link id | Existing store |
| Day plan summary | Plan A = activities that day | Read from itinerary |
| Plan B option | Unplanned bank entry associated to a day | Derived from tags / description / backup set |
| Trip start date | Anchors calendar day for text associations | Existing `tripStartDate` |

---

## 9. Out of Scope

- AI-generated Plan B from chat
- Automatic weather-triggered swap
- Multi-leg replan wizard
- Exporting Plan A/B PDF
- Per-user different Planned sets in shared group (shared itinerary remains source of truth)
