# TripiAgent Spec-Kit Project Constitution

This Constitution outlines the coding standards, architectural patterns, constraints, and constraints for the TripiAgent travel guide application. All agents, templates, and human edits must strictly conform to this file.

---

## 1. Project Stack Contract
*   **Core:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn (Slate theme components).
*   **State & Storage:** Zustand with persistent local storage (`tripiagent-trip-storage`). No server-side DB v1.
*   **PWA Setup:** `@ducanh2912/next-pwa` (or Serwist) for production bundles.
*   **Deployment:** Vercel only.
*   **Local Development:** Local port **9001** only (`http://localhost:9001`).
*   **API Routes:** All API keys must remain server-side (server-only). Inputs must be validated with Zod schemas.
*   **Mobile Viewport:** Specifically optimized for **390px mobile screens** using bottom-nav layouts and a primary accent color of `#006400`.

---

## 2. Agent Architecture Guardrails
*   **Single Runtime Agent:** We use a single runtime agent containing two specialized personas (Planner and In-Trip). **No complex Multi-Agent Systems (MAS) at runtime.**
*   **Dev-Guard Externalization:** Developer constraints (code layout, rules, lint check compliance) must run strictly outside the client agent bundle (e.g., inside pre-commit hooks, Vitest unit tests, Playwright E2E tests, and GitLab CI pipelines).
*   **Zero Timetable Hallucination:** The agent must never attempt to memorize or guess seasonal transit timetables, ferry schedules, or ZTL boundary times. It is strictly required to query static files or helper tools (e.g., checking Milan ZTL via rules or querying `/api/ferries`).
*   **State Sync & Sync Guards:** Edit controls on the client-side UI (Itinerary page) must be disabled while the agent is planning. All changes proposed by the agent must be batch-applied only after the user approves them in a Before/After comparison drawer.

---

## 3. Workflow & Delivery Principles
*   **SDD (Spec-Driven Development):** All features must have a structured specification file created under `.specify/` prior to writing any source code.
*   **Incremental Step Delivery:** Implementations must proceed one sub-step at a time. The agent must stop and request confirmation before moving on to the next task.
*   **Testing Requirement:** Every API route must be paired with Zod schemas and Vitest unit tests. Main layout and routing changes must include Playwright E2E smoke tests.
