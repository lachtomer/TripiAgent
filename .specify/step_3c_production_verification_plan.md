# Specification: Step 3c — Production Verification Plan

This specification outlines the E2E verification plan and execution steps to validate that all features (ZTL rules, ferry scheduling, before/after compare drawers, and the new Travel Copilot engine) are fully operational.

## 1. Goal & Context
Confirm that the compiled production bundle is completely functional and free of deployment errors. We simulate a production build locally on port 9001 and execute our comprehensive Playwright E2E test suite.

## 2. Verification Checklist

- [ ] **Route Availability:** Confirm all 4 main routes (`/`, `/chat`, `/itinerary`, `/pack`) render correctly with 200 HTTP status.
- [ ] **Travel Copilot Widget:** Verify the Co-PilotAdvice section renders, allows clicking "Consult", and displays the Morning Briefing and Serendipity recommendation cards.
- [ ] **Quick-Add Activity:** Confirm clicking "Add to Today" on the serendipity card inserts the activity successfully into the Day 1 itinerary.
- [ ] **Weather Warnings:** Confirm Day 3 itinerary contains the `🌧️ Rain Alert` badge and triggers the proper chat assistant swap prompt when clicked.
- [ ] **PWA Configuration:** Check manifest.json and layout meta tags.

## 3. Test Automation Mappings (Playwright e2e)

We will execute the following existing E2E specs to verify individual layers:
- `e2e/step10.smoke.spec.ts`: Validates Saved Attractions list, custom POI scheduling, today planner hour timeline, and travel logistics storage.
- `e2e/step4h.smoke.spec.ts`: Validates collapsible itinerary cards, title edits, custom activity CRUD, and start date indicators.
- `e2e/step4i-4j.smoke.spec.ts`: Validates AI Packing List generator, collapsible lists, and bottom navigation unread indicators.
- `e2e/step5.smoke.spec.ts` & `e2e/step6.smoke.spec.ts`: Validates PWA manifest files, security headers, and layout components.
- `e2e/travelAgentPersona.spec.ts`: Validates end-to-end user flows.

## 4. Execution Workflow

To execute this verification plan locally under production mode:
1. Start the next production server in the background:
   ```bash
   npm run start
   ```
2. Wait for port 9001 to become responsive.
3. Run the Playwright test suite:
   ```bash
   npx playwright test
   ```
4. Shutdown the background server once tests complete.
