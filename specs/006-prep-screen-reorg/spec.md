# Specification: Trip Prep Screen Reorganization

## 1. Goal & Context

TripiAgent’s **Itinerary (תכנון)** screen currently mixes three concerns: daily schedule, a pre-trip essentials checklist, and saved places. The **Locations (יעדים)** screen duplicates saved places. The **Logistics (לוגיסטיקה)** tab focuses only on flight/voucher fields.

Travelers preparing for Italy need one place for “everything before and during logistics” (passport checks, vouchers, lockbox codes) and one place for “places I want to visit.” The daily schedule screen should focus on **when** things happen, not on prep tasks or place management.

**Target personas:** Planner (pre-trip, at home) — primary beneficiary. In-Trip travelers may still view prep items but edit less often.

**Relationship to prior work:** Step 16 moved the route map to Home and moved `LogisticsCard` to `/bookings`. This spec completes the information architecture cleanup the user requested after reviewing screen-by-screen content.

---

## 2. User Stories

- **As a planner**, I want my pre-trip essentials checklist (passport, insurance, adapters, bookings to verify) on the same screen as my flight and voucher details, **so that** I prepare for the trip in one place instead of hunting across tabs.
- **As a planner**, I want the Itinerary screen to show only my day-by-day schedule, **so that** planning days is not cluttered with checklists or saved-place management.
- **As a planner**, I want saved attractions and custom POIs managed only on the Locations tab, **so that** I always know where to bookmark, edit, and assign places to days.
- **As a planner**, I want to manually enter or update flight codes, car rental vouchers, lockbox codes, and Milan ZTL status, **so that** critical reference numbers are available offline during the trip.
- **As a planner**, I want checklist progress and logistics details to persist on my device, **so that** I can close the app and resume preparation later without re-entering data.

---

## 3. Functional Requirements

### A. Screen 6 — Logistics Hub (route `/bookings`)

- [ ] Keep the sixth bottom-nav tab label unchanged from Step 16:
  - **Nav label (Hebrew):** `לוגיסטיקה`
  - **Nav label (English):** `Logistics`
- [ ] Update the page heading and subtitle to reflect **both** logistics form and trimmed checklist:
  - **Page title (Hebrew):** `לוגיסטיקה והזמנות`
  - **Page subtitle (Hebrew):** `טיסות, שוברים, כספת — והזמנות לבדוק לפני הנסיעה`
  - **Page title (English):** `Logistics & Bookings`
  - **Page subtitle (English):** `Flights, vouchers, lockbox — plus reservations to verify before the trip`
- [ ] Display **LogisticsCard** on this page (already present after Step 16).
- [ ] Display **EssentialsChecklist** on this page (moved from Itinerary), **trimmed per dedup strategy B** (§G).
- [ ] Section order on the page (top to bottom):
  1. Page header (title + subtitle)
  2. Logistics & bookings form (reference codes — primary for this tab)
  3. Essentials checklist (reservations & extras only — no overlap with form fields)
- [ ] Both sections remain independently collapsible if the component already supports collapse; default state on this dedicated page: **expanded** for both.

### B. Screen 2 — Itinerary (route `/itinerary`)

- [ ] Remove **EssentialsChecklist** from the Itinerary page.
- [ ] Remove **SavedAttractionsList** from the Itinerary page.
- [ ] Itinerary page content is limited to:
  - Page header (Itinerary + schedule-focused subtitle)
  - **ItineraryCard** (day-by-day schedule)
- [ ] Update Itinerary subtitle copy to reflect schedule-only purpose (no mention of bookings, logistics, or saved places).

### C. Screen 5 — Locations (route `/locations`)

- [ ] **SavedAttractionsList** remains the sole home for saved attractions and custom POIs.
- [ ] No functional regression: bookmark from Home Investigate, add custom POI, assign to day, delete — all still reachable from Locations only (Itinerary may still *display* activities added from saved places, but not manage the list).

### D. LogisticsCard — manual entry (in scope)

- [ ] Users **can** manually enter and save:
  - Outbound flight reference (TLV → MXP)
  - Return flight reference (MXP → TLV)
  - Car rental voucher code
  - Villa lockbox / key instructions
  - Milan ZTL Area C paid (checkbox)
- [ ] Saved values persist locally and reload after app restart.
- [ ] Save action provides visible confirmation feedback.

### E. LogisticsCard — auto-fill from bookings (out of scope for this feature)

- [ ] **Not required in this release.** Document as future enhancement (see Assumptions).
- [ ] This spec does **not** add paste-from-email, receipt upload, or AI extraction UI.

### F. Navigation & routing

- [ ] Route `/bookings` unchanged (still the Logistics hub URL).
- [ ] All six bottom-nav tabs remain; tab 6 nav label stays `לוגיסטיקה`; page content expands to include trimmed checklist.
- [ ] No new routes introduced.

### G. Checklist deduplication — Strategy B (user confirmed)

Flights, car rental, lockbox, and Milan ZTL are captured **only** in **LogisticsCard**. Remove overlapping rows from **EssentialsChecklist** so each concern has a single home.

**Remove from checklist** (handled by logistics form):

| ID | Item |
| --- | --- |
| e1 | Passports & Flights |
| e2 | Centauro Car Rental Voucher |
| e3 | Villa Eunice Check-in Keys |
| e5 | Milan Area C / ZTL Registration |

**Keep in checklist** (reservations, safety, activities — not in logistics form):

| ID | Item |
| --- | --- |
| e4 | Portable CO/Smoke Detector |
| e6 | Aquaria Thermal Spa Booking |
| e7 | Gardaland Tickets |
| e8 | Taverna del Silenzio Reservation |
| e9 | Desenzano Boat Rental |

- [ ] Checklist shows **5 items** after trim (progress counter uses 5, not 9).
- [ ] Checked state for removed IDs (e1, e2, e3, e5) may remain in `localStorage` but is ignored (no UI); no migration script required.
- [ ] Update checklist card title/description copy to reflect **reservations & trip extras**, not flights/vouchers (e.g. Hebrew: `הזמנות לבדיקה` / English: `Reservations to Verify`).

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; bottom nav must fit six Hebrew labels without overflow.
- **Tab 6 label:** Stays `לוגיסטיקה` (9 chars — fits 390px nav).
- **Page layout:** Vertical scroll; no centered placeholder layout; sections stack full-width with consistent padding matching Pack and Itinerary pages.
- **RTL:** Hebrew headings and checklist text render RTL-safe; logistics input fields remain LTR for codes and voucher strings.
- **Itinerary layout:** On tablet/desktop, ItineraryCard uses **full width** — remove the 3-column grid and empty sidebar column.
- **No duplicate concerns:** Flights, car, lockbox, and ZTL appear only in LogisticsCard; checklist must not repeat those topics after dedup B.

---

## 5. Security & Edge Cases

- **Data storage:** Essentials checklist and logistics data remain client-side only (no server DB v1); no change to persistence model in this feature.
- **Empty states:** If logistics fields are empty, show empty inputs (not a “coming soon” placeholder). Essentials checklist shows predefined items with unchecked state for new users.
- **Migration:** Users who checked essentials items while checklist lived on Itinerary must retain checkbox state (same localStorage key — no data migration required if component moves unchanged).
- **Deep links:** Navigating directly to `/bookings` shows both sections; `/itinerary` shows schedule only; `/locations` shows saved places only.

---

## 6. Assumptions

1. **Tab naming:** Nav label stays **`לוגיסטיקה`** / **`Logistics`** (user confirmed). Page title `לוגיסטיקה והזמנות` describes the combined logistics form + trimmed checklist.
2. **Dedup strategy B:** User confirmed — remove checklist rows e1, e2, e3, e5; keep e4, e6, e7, e8, e9. Logistics form owns all reference codes.
3. **Logistics auto-fill:** Manual only today. AI paste-parse deferred to step 4c / future spec.
4. **Essentials items list:** Trimmed static list (5 items); no user-editable checklist rows in this feature.
5. **Itinerary → Locations flow:** Saved places managed only on יעדים; no in-app tutorial required for v1.

---

## 7. Success Criteria

1. **Single prep hub:** 100% of essentials checklist and logistics form interactions occur on `/bookings`; neither component appears on `/itinerary`.
2. **Single places hub:** 100% of saved-attraction list management (view, add custom POI, assign to day, delete) occurs on `/locations`; SavedAttractionsList does not render on `/itinerary`.
3. **Schedule focus:** Itinerary page contains only the day-by-day schedule card plus header — verifiable by visual inspection on mobile.
4. **Persistence:** After entering logistics data and checking two essentials items, reloading the app restores both states within 5 seconds on the Prep page.
5. **Navigation clarity:** Sixth nav tab displays `לוגיסטיקה` (Hebrew) or `Logistics` (English); page shows logistics form + 5-item checklist with no duplicate flight/car/lockbox/ZTL rows.
6. **No regression:** Bookmarking a place from Home Investigate still adds it to Locations; adding that place to a day from Locations still appears on the Itinerary schedule.

---

## 8. Key Entities

| Entity | Description | Storage |
| --- | --- | --- |
| Essentials checklist item | Predefined prep task (id, task, subtext) with checked/unchecked state | `localStorage` key `tripiagent-essentials-checklist` |
| Travel logistics | Outbound/return flight refs, car voucher, lockbox code, Milan ZTL paid flag | Zustand `tripStore.logistics` (persisted) |
| Saved attraction | Bookmarked or custom POI with optional day assignment | Zustand `tripStore.savedAttractions` |
| Itinerary day / activity | Scheduled items per day | Zustand `tripStore.itinerary` |

---

## 9. Out of Scope

- AI auto-parse of booking emails or receipts into logistics fields
- New logistics fields (hotel confirmations, train tickets, insurance PDFs)
- User-editable essentials checklist items
- Changes to Home, Chat, Pack, or route map
- Server-side booking integrations or live flight status
