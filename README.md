# TripiAgent 🇮🇹 ✈️
> A premium, mobile-first AI travel PWA guide tailored for exploring Italy.

TripiAgent is a state-of-the-art Progressive Web App (PWA) designed to fit perfectly on a 390px mobile interface. Powered by Gemini AI, it helps travelers create editable day-by-day itineraries, generate smart packing lists, chat with a localized AI assistant, and stay updated on weather and local logistics.

---

## 📱 Interface Mockups
*(Place screenshots here)*
```
┌─────────────────────────────────┐
│   [🔍 Explore]  [💬 Chat]       │
│                                 │
│   🇮🇹 Rome                       │
│   ☀️ 24°C / sunny               │
│                                 │
│   [🗂️ Itinerary] [🧳 Pack]       │
└─────────────────────────────────┘
```

---

## 🛠️ Stack & Architecture

TripiAgent is built on a modern, robust, and highly-optimized web stack:

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript (TS)
*   **Styling**: Tailwind CSS & shadcn (Slate theme)
*   **State Management**: Zustand + localStorage persistence
*   **PWA Wrapper**: `@ducanh2912/next-pwa` (service worker enabled in production)
*   **Deployment**: Vercel
*   **Animations**: Framer Motion & CSS transitions

### Route Structure
```
├── app/
│   ├── page.tsx          # Explore tab (Home, location search, weather widget)
│   ├── chat/             # AI Travel Assistant chat interface
│   ├── itinerary/        # Day-by-day planner & CRUD editor
│   ├── pack/             # AI packing helper with categorized checkboxes
│   └── api/              # Server-side API endpoints
│       ├── ai/           # Gemini Chat Streaming endpoint
│       ├── pack/generate # Gemini Packing List generator
│       ├── places/       # Google Places proxy (server-only)
│       └── weather/      # OpenWeather proxy (server-only)
```

---

## 🔑 Environment Variables

To keep credentials secure, all API keys are evaluated on the server side. Create a `.env.local` file in the root directory:

| Variable | Description | Default Value |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API Developer Key | *(Required)* |
| `GOOGLE_PLACES_API_KEY` | Google Maps Platform Places API Key | *(Required)* |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key | *(Required)* |
| `GEMINI_MODEL` | Gemini AI model used for chats/generation | `gemini-2.0-flash` |
| `TRIP_REGION` | Two-letter ISO country code | `IT` |

---

## 💻 Local Development Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   npm (v10+)

### Setup Instructions
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Add environment variables**:
    Create `.env.local` based on `.env.example` and add your keys.
3.  **Run development server**:
    ```bash
    npm run dev
    ```
    *Note: The server is hard-locked to port **9001** to conform to testing requirements.*
4.  **Open in browser**:
    Access [http://localhost:9001](http://localhost:9001)

---

## 🚀 Deployment to Vercel

TripiAgent is optimized to deploy directly onto Vercel with serverless compute and edge-optimized static builds:

1.  Push the codebase to a **GitHub** repository.
2.  Import the repository into your **Vercel Dashboard**.
3.  Configure the **Environment Variables** in Vercel project settings:
    *   Add `GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `OPENWEATHER_API_KEY`, `GEMINI_MODEL`, and `TRIP_REGION`.
4.  Vercel will build the application using the Webpack pipeline needed for PWA service workers (pre-configured via `--webpack` flags).
5.  Launch! Preview deployments will automatically trigger on new branches and PRs.

---

## 📊 API Costs & Free Tiers

TripiAgent is extremely cost-effective. By default, it operates well within the free/low-cost tiers of the target services:

*   **Gemini 2.0 Flash**: Free tier supports up to 15 RPM (Requests Per Minute) and 1,500 RPD (Requests Per Day), which is more than sufficient for general travel use.
*   **Google Places API**: $200 free monthly credit from Google Cloud allows thousands of Autocomplete and Details queries.
*   **OpenWeatherMap**: 1,000 free API calls per day on the One Call / Current Weather subscription.

---

## 🗺️ Phase 2 Roadmap

Future development milestones for# TripiAgent

Mobile AI travel PWA for Italy.

<!-- Deploy timestamp: 2026-06-01T14:58:00+03:00 -->
*   **10a: Saved Attractions**: Custom attraction bookmarking and custom points-of-interest injection into itineraries.
*   **10b: Today Planner**: Real-time hourly timeline focusing specifically on the traveler's current active day.
*   **10c: Logistics & Bookings**: Store flight numbers, hotel reservation receipts, and rental car details locally.
*   **Gemini Vision Integration**: Capture images of historical sites or menus in Italy and get instant translations/context.
*   **Bookable Experiences**: Direct integration with Viator/GetYourGuide APIs for booking tours in Verona, Sirmione, and Rome.
*   **Itinerary Sharing**: Generate a cryptographically signed static link to share your trip details with family.
*   **Language Options**: Hebrew language translations and dual-direction layouts (RTL).

## 🏦 Bank Feature

The **Bank** provides a curated repository of attractions that admins can bulk‑import via itinerary text, preview, edit, and submit. It powers the itinerary builder by offering reusable places.

- **Admin UI**: `/admin/bank` page with textarea, generate button, preview table, and submit.
- **API**: `POST /api/bank/places` to create entries (validated with Zod) and `GET /api/bank/places` to retrieve them (cached 5 min).
- **State**: Zustand store `bankStore` persisted to `localStorage` under `bank-store`.
- **Design**: Mobile‑first, 390 px width, accent color `#006400` for badges and buttons, accessible aria labels.
- **Testing**: Unit tests for API routes, parser utility, store persistence; Playwright smoke test `e2e/bank/itinerary_import.smoke.spec.ts` validates the full flow.
