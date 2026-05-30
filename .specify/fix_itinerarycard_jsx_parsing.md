# Specification: Fix ItineraryCard JSX Parsing Error

## Goal
Correct the malformed JSX in `components/ItineraryCard.tsx` where a stray `<CardHeader>` tag exists, causing a parsing error (`')' expected`). The component should render a valid CardHeader with appropriate children and be closed properly.

## Acceptance Criteria
- The file compiles without JSX syntax errors.
- No lint errors related to this component.
- Unit tests (if any) for ItineraryCard pass.
- The UI renders correctly with day title editing functionality.
