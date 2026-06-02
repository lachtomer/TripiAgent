# Specification Quality Checklist: Navigation Redesign & Home Screen

**Purpose**: Validate specification completeness and quality before proceeding to planning  
**Created**: 2026-06-02  
**Updated**: 2026-06-02 (v2 — post brutal review, all 14 findings resolved in plan.md)  
**Feature**: [spec.md](../spec.md)

---

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows (Planner and In-Trip)
- [x] No implementation details leak into specification

## Plan Review (v2 — post-review)

- [x] **Fix #1+#2**: `defaultQuery` via `useState` initial value — no `useEffect`, no lint violation
- [x] **Fix #3**: Correct store selectors: `location?.cityName`, `savedAttractions[0]?.locationName`
- [x] **Fix #4**: `bookings/page.tsx` — no unused imports, pure server component
- [x] **Fix #5**: 390px 6-tab layout explicitly specified (`min-w-[48px]`, `px-1`, `text-[9px]`)
- [x] **Fix #6**: Double-card nesting resolved via `headless` prop on `AttractionSearch`
- [x] **Fix #7**: Mode switcher moved to top of Home (above map card)
- [x] **Fix #8**: Map expand uses `fixed inset-0` overlay — no Sheet, no Dialog
- [x] **Fix #9**: `NearbyPlacesSection` removal acknowledged explicitly; UX compensated by pre-filled `defaultQuery`
- [x] **Fix #10**: `metadata` export added to `/locations` page
- [x] **Fix #11**: `ActiveRouteMapCard.tsx` is **required**, not optional
- [x] **Fix #12**: `key={mode}` on `<AttractionSearch>` resets query on toggle
- [x] **Fix #13**: Affected E2E spec (`step4i-4j`) enumerated with specific line changes
- [x] **Fix #14**: `LocationCard` removal and weather context gap acknowledged in plan

## Notes

- All items pass. Spec + plan are ready for `/speckit-tasks`.
- Bookings route is intentionally a scaffold placeholder; full spec deferred to a future feature.
- `NearbyPlacesSection` is intentionally removed from Home — its role is absorbed by InvestigateSection's pre-filled default search.
