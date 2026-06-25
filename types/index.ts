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
  /** Target Bank entry id when activity was added from the bank */
  sourceAttractionId?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  activities: Activity[];
}

/** Curated must-see highlight under a day-guide location */
export interface DayGuideSpot {
  id: string;
  title: string;
  detail?: string;
  optional?: boolean;
  link?: string;
  linkLabel?: string;
}

/** Location block in a day guide (what to see) */
export interface DayGuideLocation {
  id: string;
  name: string;
  mapsUrl: string;
  websiteUrl?: string;
  mustSee: DayGuideSpot[];
  optional?: boolean;
}

/** Casual food suggestion for a day guide */
export interface DayGuideFood {
  id: string;
  name: string;
  style: string;
  when: "lunch" | "dinner" | "snack";
  mapsUrl: string;
  websiteUrl?: string;
  isPrimary?: boolean;
}

/** Mutually exclusive plan branch (e.g. Verona OR Monte Baldo) */
export interface DayGuideOption {
  id: string;
  label: string;
  locations: DayGuideLocation[];
  food: DayGuideFood[];
}

/** Bundled reference content for an itinerary day (Calendar view) */
export interface DayGuide {
  dayNumber: number;
  locations?: DayGuideLocation[];
  food?: DayGuideFood[];
  options?: DayGuideOption[];
  bannerNote?: string;
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
  /** 1-based itinerary day this entry backs up (Plan B hint) */
  backupForDay?: number;
  /** Activity title or bank id this entry is an alternate for */
  alternateFor?: string;
  /** One-line Plan B reason shown on itinerary day cards */
  planBReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "user" | "admin";
}

export interface TravelLogistics {
  /** Wizz Air booking confirmation (covers both legs). */
  flightConfirmationCode?: string;
  carRentalVoucherCode?: string;
  /** VRBO / vacation rental — Lake Garda base. */
  accommodationName?: string;
  vrboConfirmationCode?: string;
  vrboPropertyId?: string;
  /** Euro amount still due at the property (digits only, e.g. "98"). */
  accommodationBalanceDue?: string;
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

