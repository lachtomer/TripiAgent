import { NextRequest, NextResponse } from "next/server";
import { PlacesQuerySchema } from "@/lib/schemas";
import { getGoogleNearbyPlaces, PlaceDetail } from "@/lib/places";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface CacheEntry {
  placesData: PlaceDetail[];
  expiresAt: number;
}

// In-memory cache for nearby places queries
const placesCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");
  const rawType = searchParams.get("type") || undefined;
  const rawRadius = searchParams.get("radius") || undefined;

  if (!rawLat || !rawLng) {
    return NextResponse.json({ error: "Missing lat or lng parameter" }, { status: 400 });
  }

  // Validate parameters using Zod
  const validation = PlacesQuerySchema.safeParse({
    lat: rawLat,
    lng: rawLng,
    type: rawType,
    radius: rawRadius,
  });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid query parameters format" }, { status: 400 });
  }

  const { lat, lng, type, radius } = validation.data;

  // Round coordinates to 3 decimals for cache grouping (approx 110m precision)
  const roundedLat = Number(lat.toFixed(3));
  const roundedLng = Number(lng.toFixed(3));
  const cacheKey = `${roundedLat},${roundedLng},${type || ""},${radius}`;

  const now = Date.now();
  if (placesCache.has(cacheKey)) {
    const entry = placesCache.get(cacheKey)!;
    if (now < entry.expiresAt) {
      console.log(`Places cache hit for coordinates: ${cacheKey}`);
      return NextResponse.json(entry.placesData);
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    const placesData = await getGoogleNearbyPlaces(lat, lng, radius, type, apiKey);

    // Save to cache
    placesCache.set(cacheKey, {
      placesData,
      expiresAt: now + CACHE_DURATION_MS,
    });

    console.log(`Places cache miss. Fetched and cached: ${cacheKey}`);
    return NextResponse.json(placesData);
  } catch (error) {
    console.error("Failed to fetch nearby places from provider:", error);
    return NextResponse.json({ error: "Failed to retrieve nearby recommendations" }, { status: 502 });
  }
}
