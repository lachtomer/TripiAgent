# Requirements Checklist — 007 Place Suggestion Links

## Functional

- [ ] Place name links to official website when Google provides it
- [ ] Falls back to Google Maps when no website
- [ ] Plain text when no safe URL
- [ ] NearbyPlacesSection, AttractionSearch, ActivityNearbyPanel updated
- [ ] SavedAttractionsList links when URLs stored
- [ ] Chat venue names as markdown links (Maps search URL)
- [ ] External links open new tab with noopener

## Non-functional

- [ ] URL scheme validation (http/https only)
- [ ] API key stays server-side
- [ ] 390px tap targets acceptable
- [ ] RTL/LTR name rendering preserved

## Testing

- [ ] Unit tests for urlSafety and places enrichment
- [ ] E2E step22.place-links.spec.ts green
- [ ] lint + build pass
