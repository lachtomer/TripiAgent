# Step 024 — Search result card mobile readability (Option A)

**Status:** Implement

## Goal

Fix truncated, hard-to-read search result cards on 390px mobile by restructuring `AttractionSearch` list items into a two-row layout that prioritizes text over side action buttons.

## Problem

Single-row cards cram thumbnail + text + calendar/AI buttons horizontally. Titles, types, and addresses use aggressive `truncate` and `text-[9px]`–`10px`, producing unreadable ellipses on phone.

## Scope

1. `.specify/step_024_search_card_mobile_readability.md` — this spec
2. `components/PlaceNameLink.tsx` — add `search` variant + `lineClamp` for 2-line names without breaking other callers
3. `components/AttractionSearch.tsx` — two-row card layout:
   - Row 1: thumbnail (bookmark + rating badge) + full-width text block
   - Row 2: Schedule + Ask AI actions (full width, end-aligned)
   - Title `line-clamp-2` at `text-sm`; meta/address at `text-xs`; remove `max-w-[130px]` cap
4. `stores/tripStore.ts` — stop wiping user-customized itinerary on rehydrate when template version unchanged (unblocks step13 verification)

## Out of scope

- `NearbyPlacesSection`, `SavedAttractionsList`, or other card lists (future consistency pass)

## Acceptance

- Place name shows up to 2 lines before ellipsis on 390px viewport
- Category, open/closed status, and address readable at ≥12px (`text-xs`)
- Rating appears on thumbnail badge, not competing with title width
- Calendar (`#direct-add-*`) and AI buttons remain functional; E2E selectors unchanged
- `npm run lint` and targeted E2E (`step13`, `step21`) pass
- User-added itinerary activities survive full page navigation (persist rehydrate must not wipe customized plans when template version is unchanged)
