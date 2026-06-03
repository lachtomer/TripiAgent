# UI Screen Contracts — 006 Prep Screen Reorganization

These contracts define what each route must render after implementation. Verifiable via Playwright smoke tests and manual inspection at 390px.

---

## `/bookings` — Logistics hub

| Element | Requirement |
| --- | --- |
| `data-testid="bookings-page"` | Present on root container |
| Page H1 | `לוגיסטיקה והזמנות` (HE) / `Logistics & Bookings` (EN) |
| Page subtitle | Per spec §A (HE/EN strings) |
| `#logistics-save-button` | Visible (LogisticsCard expanded) |
| Logistics fields | `#logistics-flight-tlv-mxp`, `#logistics-flight-mxp-tlv`, `#logistics-car-rental-voucher`, `#logistics-lockbox-code`, `#logistics-milan-ztl-paid` |
| Checklist | Visible below logistics; **5 items**; must NOT show "Passports & Flights" or "Centauro Car Rental Voucher" |
| Checklist title | `Reservations to Verify` (EN) / `הזמנות לבדיקה` (HE) |
| Nav tab | `#nav-link-bookings` label `לוגיסטיקה` or `Logistics` |

**Section order:** header → LogisticsCard → EssentialsChecklist

---

## `/itinerary` — Schedule only

| Element | Requirement |
| --- | --- |
| Page H1 | `Itinerary` |
| Subtitle | Schedule-only copy (no logistics/bookings/saved places) |
| `#day-card-*` or itinerary content | Present |
| EssentialsChecklist | **Absent** |
| SavedAttractionsList | **Absent** |
| `text=Saved Attractions & POIs` | **Absent** |
| Layout | Single column full width at all breakpoints |

---

## `/locations` — Places hub

| Element | Requirement |
| --- | --- |
| `data-testid="saved-attractions-ready"` | Present |
| `text=Saved Attractions & POIs` | Present |
| `#add-custom-poi-submit` | Reachable when form open |
| SavedAttractionsList | Sole management surface for bookmarks |

---

## Cross-screen flows

| Flow | Contract |
| --- | --- |
| Home bookmark | Place appears on `/locations` |
| Locations → Add to Day | Activity appears on `/itinerary` schedule |
| Bookings logistics save | Values persist after reload on `/bookings` |
| Booklist checklist toggle | State persists after reload on `/bookings` |

---

## Bottom navigation

| Tab key | Route | Label (HE) |
| --- | --- | --- |
| bookings | `/bookings` | `לוגיסטיקה` |

No change to other five tabs.
