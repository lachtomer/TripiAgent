import { NextRequest, NextResponse } from "next/server";
import { WeatherQuerySchema } from "@/lib/schemas";
import { getOpenWeatherDetails, WeatherData } from "@/lib/weather";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface CacheEntry {
  weatherData: WeatherData;
  expiresAt: number;
}

// In-memory cache for weather data
const weatherCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");

  if (!rawLat || !rawLng) {
    return NextResponse.json({ error: "Missing lat or lng parameter" }, { status: 400 });
  }

  // Validate request parameters using Zod
  const validation = WeatherQuerySchema.safeParse({ lat: rawLat, lng: rawLng });
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid coordinates format" }, { status: 400 });
  }

  const { lat, lng } = validation.data;

  // Round coordinates to 3 decimals for cache grouping (approx 110m precision)
  const roundedLat = Number(lat.toFixed(3));
  const roundedLng = Number(lng.toFixed(3));
  const cacheKey = `${roundedLat},${roundedLng}`;

  const now = Date.now();
  if (weatherCache.has(cacheKey)) {
    const entry = weatherCache.get(cacheKey)!;
    if (now < entry.expiresAt) {
      console.log(`Weather cache hit for coordinates: ${cacheKey}`);
      return NextResponse.json(entry.weatherData);
    }
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENWEATHER_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    // OpenWeather API takes 'lon' parameter, so we map 'lng' to it
    const weatherData = await getOpenWeatherDetails(lat, lng, apiKey);

    // Save to cache
    weatherCache.set(cacheKey, {
      weatherData,
      expiresAt: now + CACHE_DURATION_MS,
    });

    console.log(`Weather cache miss. Fetched and cached: ${cacheKey}`);
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Failed to fetch weather details from provider:", error);
    return NextResponse.json({ error: "Failed to retrieve weather details" }, { status: 502 });
  }
}
