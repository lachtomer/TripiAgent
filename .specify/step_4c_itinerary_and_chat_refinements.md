# Specification: Step 4c — Itinerary, Chat, and Logistics Refinements

This specification defines the functional requirements for refining the travel assistant's core planning, validation, and dashboard features.

## 1. Goal & Context
The goal is to refine existing user experiences across the **TripiAgent** app by integrating deep validation checks into the AI Chat state machine (weather and ferry route checks), adding interactive task completion on the Home Dashboard, providing an automated receipt/booking parser, and aligning packing checklists with real-time weather forecasts.

## 2. User Stories
*   **As a** traveler planning a trip, **I want** the AI agent to flag ferry route errors (e.g., scheduling a route out of season) and weather conflicts (e.g., heavy rain during a swim activity) before I confirm the plan, **so that** I don't make invalid bookings.
*   **As a** traveler on the road, **I want** to tap activities on my home screen Today Planner widget to check them off as completed, **so that** I can track my daily progress.
*   **As a** traveler with multiple reservations, **I want** to paste raw email text from my airlines, rental car agencies, or hotels to let the AI auto-extract voucher codes, **so that** I don't have to input them manually.
*   **As a** traveler packing my bags, **I want** my AI-generated packing list to automatically suggest umbrellas, raincoats, or sunscreen based on the current weather forecasts, **so that** I am prepared for the local climate.

## 3. Functional Requirements

### 3.1 LangGraph Validator Enhancements
- [ ] **Ferry Route Validation:** Enhance the graph's `validatorNode` to inspect proposed activities. If they reference traveling by ferry between towns (e.g., "Sirmione to Desenzano"), check them against the static ferry schedules (`public/data/lake_garda_ferries_2026.json`). If a route is unavailable or out-of-season, append a state conflict.
- [ ] **Weather Conflict Validation:** If current weather contains rain/storms and a proposed activity is outdoor-only (e.g., swimming, hiking), flag it as a conflict in the state to prompt a refinement loop.

### 3.2 Interactive Today Planner
- [ ] **Activity Completion:** Add a checkoff checkbox/button next to hour-by-hour activities in the `<TodayPlanner />` widget on the home page.
- [ ] **Zustand Store Persistence:** Track checkoff states (`completedActivityIds: string[]`) in `tripStore.ts` and persist them via Zustand localStorage sync.

### 3.3 Logistics Receipt Auto-Parser
- [ ] **AI Parsing Interface:** Create a text-area input in the `<LogisticsCard />` that allows pasting raw booking reservation details.
- [ ] **Information Extraction:** Trigger a structured Gemini parsing call to parse details (outbound flight confirmation, car rental voucher code, lockbox code, Milan ZTL Area C paid state) and directly save them into the `logistics` store.

### 3.4 Weather-Aware AI Packing List
- [ ] **Weather Forecast Injection:** Pass weather conditions from the home page/itinerary directly to the packing list generator payload.
- [ ] **Dynamic Prompt Adjustments:** Modify `/api/pack/generate` to explicitly include items matching the forecast (e.g., rainwear, warm layers, or sunglasses/sunscreen).

## 4. UI & Form Factor Constraints
*   **Viewport:** Tailored to the 390px mobile viewport width.
*   **Gestures & Visuals:** Checked activities in the Today Planner should be strike-through and grayed out. The logistics parser input field must expand gracefully on mobile screen space.

## 5. Security & Edge Cases
*   **Validation Fallbacks:** If the weather API fails or weather context is missing, default the packing list and graph validation to standard summer defaults.
*   **Parser Robustness:** Ensure the LLM parses the receipt details cleanly even when fed noisy or truncated copy-paste data, falling back gracefully without modifying existing unrelated fields.
