# Design Specification – TripiAgent

## Core Design Tokens
- **Accent Color**: `#006400` – used for badges, buttons, and interactive highlights.
- **Mobile Width**: 390 px – all pages are mobile‑first, with tap targets ≥ 48 px.
- **Dark Mode**: Implemented via `next-themes` – background, text, and component colors adapt automatically.
- **Typography**: Google Font **Inter** for body, **Outfit** for headings.
- **Animations**: Subtle hover / focus transitions using CSS `transition` and Framer Motion where appropriate.

## Bank Feature Design
- **Admin UI (`/admin/bank`)**
  - Layout follows the app’s standard admin wrapper (`app/(admin)/layout.tsx`).
  - Contains a large `textarea` (`#itinerary-input`) for raw itinerary text.
  - **Generate Bank Entries** button: accent background (`#006400`), hover darkens slightly, focus outline visible.
  - **Preview Table** (`#preview-table`): appears after generation, rows display place name, category badge (green background with white text), and an optional checkbox to include the entry.
  - **Submit** button: disabled until at least one row is selected; on success shows a toast with green accent.
  - All interactive elements have `aria-label`s and keyboard focus styles.
- **API Endpoints**
  - `POST /api/bank/places` – returns `201` on success, validates payload with Zod schema defined in `lib/schemas.ts`.
  - `GET /api/bank/places` – cached for 5 min, returns list of places.
- **State Management**
  - Zustand store `bankStore` persisted to `localStorage` under key `bank-store`.
  - Store actions: `load`, `add`, `remove`.
- **Responsive & Accessibility**
  - UI fits within the 390 px mobile viewport, with 48 px tap targets.
  - Badges use sufficient color contrast against the dark background.
  - Keyboard navigation works through `tabindex` and focus outlines.

## Other Design Guidelines
- **Bottom Navigation**: Fixed safe‑area bottom nav with accent‑colored active icons.
- **PWA Offline**: Service worker caches static assets; the Bank page static assets are pre‑cached.
- **Consistent Layout**: All admin pages share the `app/(admin)/layout.tsx` wrapper for header/footer and theme handling.
