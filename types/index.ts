export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  weatherForecast?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  activities: Activity[];
}

export interface WeatherInfo {
  temp: number;
  description: string;
  icon: string;
  cityName: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  coords: LocationCoords | null;
  cityName: string | null;
  permissionState: "prompt" | "pending" | "granted" | "denied";
}

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  category: string;
}

export interface PlaceRecommendation {
  id: string;
  name: string;
  rating?: number;
  address?: string;
  type?: string;
}

export interface WeatherSnapshot {
  temp: number;
  condition: string;
}

export interface TripContext {
  coords: LocationCoords | null;
  cityName: string | null;
  localTime?: string;
  dayOfWeek?: string;
  weather?: WeatherSnapshot | null;
  itinerarySummary?: string | null;
  locale?: string;
  isInTrip?: boolean;
  currentCoordinates?: LocationCoords | null;
  currentTime?: string | null;
}

export interface AiHistoryEntry {
  role: "user" | "model";
  text: string;
}

export interface AiRequestBody {
  message: string;
  history?: AiHistoryEntry[];
  context?: TripContext;
  itinerary?: ItineraryDay[] | null;
  dayAnchors?: Record<number, string>;
}

export interface SavedAttraction {
  id: string;
  name: string;
  description?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  image?: string;
  website_url?: string;
  maps_url?: string;
  upvotes?: string[]; // array of user IDs who upvoted
  downvotes?: string[]; // array of user IDs who downvoted
  createdBy?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "user" | "admin";
}

export interface TravelLogistics {
  flightTlvMxpCode?: string;
  flightMxpTlvCode?: string;
  carRentalVoucherCode?: string;
  villaEuniceLockboxCode?: string;
  milanZtlPaid: boolean;
}

export interface MorningBriefing {
  text: string;
  date: string;
}

export interface SerendipitySuggestion {
  title: string;
  description: string;
  category: string;
  date: string;
}

