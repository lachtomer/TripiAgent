import { z } from "zod";

export const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      text: z.string(),
    })
  ).optional(),
});

export const WeatherQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
});

export const GeocodeQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
});

export const PlacesQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  type: z.string().optional(),
  radius: z.string().optional().transform((val) => val ? parseInt(val, 10) : 500),
});

export const LocationCoordsSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const WeatherSnapshotSchema = z.object({
  temp: z.number(),
  condition: z.string(),
});

export const TripContextSchema = z.object({
  coords: LocationCoordsSchema.nullable(),
  cityName: z.string().nullable(),
  localTime: z.string().optional(),
  dayOfWeek: z.string().optional(),
  weather: WeatherSnapshotSchema.nullable().optional(),
  itinerarySummary: z.string().nullable().optional(),
  locale: z.string().optional(),
  isInTrip: z.boolean().optional(),
  currentCoordinates: LocationCoordsSchema.nullable().optional(),
  currentTime: z.string().optional(),
});

export const PackingGenerateSchema = z.object({
  itinerarySummary: z.string().optional(),
  tripStartDate: z.string().nullable().optional(),
  cityName: z.string().nullable().optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
  weather: z.object({
    temp: z.number(),
    condition: z.string(),
  }).nullable().optional(),
});

export const AiRequestBodySchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      text: z.string(),
    })
  ).optional(),
  context: TripContextSchema.optional(),
  itinerary: z.array(z.any()).nullable().optional(),
});

export const FerriesQuerySchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
});

export const CopilotRequestBodySchema = z.object({
  dayNumber: z.number(),
  date: z.string().optional(),
  itineraryActivities: z.array(
    z.object({
      id: z.string(),
      time: z.string(),
      title: z.string(),
      description: z.string(),
      locationName: z.string().optional(),
    })
  ),
  weatherInfo: z.object({
    temp: z.number(),
    description: z.string(),
  }).optional(),
  cityName: z.string().optional(),
});


