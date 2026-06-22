# Specification: Calendar Day Guide & Jun 2026 Itinerary Refresh

## 1. Goal & Context

TripiAgent travelers use the **Calendar** view (Itinerary tab) to see what happens each day of their Lake Garda trip. Today, day cards show a **timeline of timed activities** with short free-text descriptions. Travelers must ask AI or search elsewhere for **what to see at each stop**, **where to eat around noon**, and **links to maps or official sites**.

This feature adds a structured **Day Guide** to each itinerary day and refreshes the **default Jun 25–Jul 4, 2026** schedule to match the group’s approved replan (Monzambano base, teens 15–18, heat-wave aware, casual dining).

**Target personas:** Group members checking the plan on mobile (WhatsApp-adjacent sharing); in-trip traveler at lunch time needing a quick food pick.

**User value:** One place to answer “What’s there?” and “Where do we eat?” without replanning or opening multiple apps.

**Relationship to prior work:** Extends Itinerary / Calendar (Features 003, 004, 011). Does **not** replace the activity timeline, Target Bank, or Plan B panels.

---

## 2. User Stories

- **As a traveler**, I want each day to list **must-see highlights** per location, **so that** I know what matters without reading long activity descriptions.
- **As a traveler**, I want **casual lunch suggestions** (~noon) with tappable links, **so that** we can decide quickly (pizza, trattoria, burgers — not fine dining).
- **As a traveler**, I want **official site or map links** for sights and restaurants, **so that** I can navigate or check hours in one tap.
- **As a group member**, I want the **default trip schedule** to match our agreed week (Bergamo stop, Borghetto day, Gardaland weekday, etc.), **so that** Calendar reflects reality on first load.
- **As a planner**, I want **optional** sights clearly marked (e.g. Grotte di Catullo, Manerba village stroll), **so that** the group knows what is core vs. nice-to-have.
- **As a traveler**, I want **Sunday Jun 28** to show **Verona OR Monte Baldo** until the group picks one, **so that** both options stay visible without duplicating the whole week.

---

## 3. Functional Requirements

### A. Day Guide content (per itinerary day)

- [ ] Each **activity day** (Days 2–9 of the Jun 2026 template) includes a **Day Guide** block with:
  - **Locations** — one or more named places visited that day.
  - **Must-see** — bullet list of highlights per location (concise, scannable).
  - **Links** — at least one tappable link per location (official website and/or map search).
- [ ] Each day includes **Food** suggestions:
  - Primary **lunch** option (~12:00–13:30) aligned with that day’s geography.
  - At least one **backup** lunch where practical.
  - **Dinner** only where explicitly part of the plan (e.g. Fri Jun 26 welcome dinner, Fri Jul 3 Milan farewell).
  - Style: **casual Italian** (trattoria, pizzeria, park food, outlet food court) — not fine dining.
  - Each food entry includes name, short style label, and tappable map and/or website link.
- [ ] **Optional** sights are labeled **Optional** (e.g. Grotte di Catullo on Tue; Manerba village on Thu).
- [ ] **Dual-option day** (Sun Jun 28): Day Guide shows **two labeled sections** — “Option A: Verona” and “Option B: Monte Baldo + Malcesine” — each with its own must-see and food lists until the group selects one (selection mechanism out of v1 scope; both remain visible).

### B. Approved default itinerary (Jun 25–Jul 4, 2026)

- [ ] **Day 2 — Fri Jun 26:** Car pickup Malpensa → stop **Bergamo Città Alta** → drive → check-in Monzambano → lake swim → welcome dinner.
- [ ] **Day 3 — Sat Jun 27:** Castellaro Lagusello → Borghetto sul Mincio → Parco Giardino Sigurtà.
- [ ] **Day 4 — Sun Jun 28:** Full **Verona** (no safari) **OR** **Monte Baldo + Malcesine** (Day Guide shows both).
- [ ] **Day 5 — Mon Jun 29:** **Gardaland** (weekday full day).
- [ ] **Day 6 — Tue Jun 30:** **Sirmione** (castle + old town) → **Aquaria Thermal Spa** (afternoon, must).
- [ ] **Day 7 — Wed Jul 1:** **CanevaWorld Aqua Paradise** → **Peschiera del Garda** (after park).
- [ ] **Day 8 — Thu Jul 2:** **Manerba** self-drive family boat → **Rocca di Manerba** walk.
- [ ] **Day 9 — Fri Jul 3:** Check-out → **Serravalle Designer Outlet** → Milan → car return → farewell dinner.
- [ ] Days 1 and 10 (arrival / departure flights) keep existing logistics activities; Day Guide optional or minimal for those days.
- [ ] **Excluded** from default schedule and Day Guide seed: Natura Viva Safari, Rimbalzello, Jungle Adventure, SUP/kayak, Desenzano boat (Manerba boat used instead), Mantova, passive guided boat tours, split-car group flows.

### C. Calendar UI (Itinerary tab)

- [ ] Each day card displays a **collapsible Day Guide** section **above** the existing activity timeline.
- [ ] **Today’s day** (when trip start date is set and matches calendar): Day Guide **expanded by default**; other days **collapsed by default**.
- [ ] Location and food names open links in a **new browser tab** (external navigation).
- [ ] Must-see bullets are **plain text** (no extra tap required).
- [ ] Food section uses clear meal labels: **Lunch**, **Dinner**, **Snack** where applicable.
- [ ] Dual-option day shows a short **banner** prompting group to choose Verona or Monte Baldo.
- [ ] Day Guide works at **390px** width without horizontal scroll; touch targets meet mobile minimums for links.
- [ ] Existing day card features remain: timeline, edit, Target Bank add, Plan B, rain alerts, explore nearby.

### D. Content quality rules

- [ ] Must-see items follow the agreed format: **Name** — one-line why (e.g. “Piazza Vecchia — one of the prettiest squares in northern Italy”).
- [ ] Links use **stable, user-facing URLs** (official tourism/park sites or map search); no invented domains.
- [ ] Lunch suggestions match **geography that day** (e.g. Borghetto lunch on Sat, not a restaurant three hours away).
- [ ] Confirmed bookings (Aquaria spa, car rental, key check-ins) remain marked **Confirmed** on timeline activities where applicable.

### E. Scope boundaries

- [ ] v1 does **not** add live restaurant ratings or dynamic hours APIs.
- [ ] v1 does **not** auto-resolve Sun Jun 28 to a single option; both remain in Day Guide.
- [ ] v1 does **not** replace Hebrew/English translation of all Day Guide strings (English copy for v1; i18n follow-up acceptable).
- [ ] v1 does **not** change Target Bank Planned/Plan B logic beyond itinerary content updates.
- [ ] Users can still edit activities manually; Day Guide is **curated reference** bundled with default template (editing Day Guide text in UI is out of v1 scope).

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; Day Guide fits inside existing rounded day cards.
- **Visual hierarchy:** Location pins / food icon distinct from timeline; accent color consistent with app green brand.
- **Accessibility:** Expand/collapse has `aria-expanded`; link labels indicate external open; optional items not conveyed by color alone.
- **English UI** labels: “Day guide”, “What to see”, “Food”, “Optional”, “Option A”, “Option B”.
- **Offline:** Day Guide content is **bundled** with the app so it loads without network; links require connectivity when tapped.

---

## 5. Security & Edge Cases

- **External links:** Only `http`/`https` URLs in curated content; open with `noopener noreferrer`.
- **Missing trip start date:** “Today” expand behavior disabled; all Day Guides collapsed by default.
- **Custom itinerary:** If user heavily edits days, Day Guide may **not match** edited activities — acceptable for v1; guide tied to default day numbers.
- **Sun dual option:** Timeline may show one placeholder activity or both options summarized — must not imply both are scheduled simultaneously without label.
- **Optional items:** Skipping Grotte di Catullo or Manerba village must not block the rest of the day plan.
- **Planning mode freeze:** Day Guide is read-only reference; edit restrictions follow existing itinerary rules.

---

## 6. Assumptions

1. Trip base remains **Villa Eunice, Monzambano** Jun 26–Jul 2, 2026.
2. Group travels **together** in shared cars (no split-car itineraries).
3. **Aquaria Thermal Spa** on Tue Jun 30 afternoon is a **must**; other sights flex around it.
4. **Gardaland** stays on a **weekday** (Mon Jun 29), not Saturday.
5. Day Guide content for Days 2–9 is **pre-authored** from the approved planning conversation; updates require a content release, not user typing.
6. Place links prefer **official sites** when available; otherwise map search URLs are acceptable.

---

## 7. Success Criteria

1. **Discoverability:** On Itinerary, a traveler can find **must-see highlights** for Day 2 (Bergamo) within **2 taps** (open day → expand Day Guide if collapsed).
2. **Food clarity:** Each activity day (Days 2–9) shows at least **one named lunch** with a working external link.
3. **Link utility:** **100%** of curated locations and primary lunch entries have at least one tappable link that opens successfully in mobile browser testing.
4. **Schedule accuracy:** Default itinerary matches the **nine approved day plans** listed in §3B when a new user loads the Jun 2026 template (verified by checklist against spec).
5. **Optional clarity:** Grotte di Catullo and Manerba village appear with **Optional** label where specified.
6. **Regression:** Existing itinerary timeline, trip start date, Target Bank add, and Plan B panels continue to work on `/itinerary`.
7. **Performance:** Day Guide renders with day card in **under 1 second** on mid-tier mobile; no layout shift blocking timeline interaction.

---

## 8. Key Entities

| Entity | Description |
| --- | --- |
| Day Guide | Curated block attached to an itinerary day: locations, must-see, food, notes |
| Day Guide Location | Named place with must-see bullets and links |
| Day Guide Food | Restaurant or venue with meal type, style, links |
| Must-see item | Short highlight under a location |
| Optional sight | Must-see or location tagged as non-core |
| Dual-option day | Day Guide with two mutually exclusive plan sections (Sun Jun 28) |
| Default itinerary | Seeded `DEFAULT_ITALY_ITINERARY` matching Jun 2026 replan |

---

## 9. Reference Content Summary (Days 2–9)

| Day | Date | Anchor plan | Lunch (primary) |
| --- | --- | --- | --- |
| 2 | Fri Jun 26 | Bergamo Città Alta → Monzambano | La Bruschetta, Bergamo Alta |
| 3 | Sat Jun 27 | Castellaro → Borghetto → Sigurtà | Taverna del Silenzio |
| 4 | Sun Jun 28 | Verona **or** Monte Baldo | Al Pompiere **or** Vecchia Malcesine |
| 5 | Mon Jun 29 | Gardaland | In-park food |
| 6 | Tue Jun 30 | Sirmione + Aquaria | Locanda al Bersagliere / La Roccia |
| 7 | Wed Jul 1 | CanevaWorld → Peschiera | Park café / Lazise pizza |
| 8 | Thu Jul 2 | Manerba boat + Rocca | Lido Azzurro, Manerba |
| 9 | Fri Jul 3 | Serravalle → Milan | Outlet food court |

Detailed must-see bullets and links are defined in implementation data (companion to this spec); structure must match §3A format.
