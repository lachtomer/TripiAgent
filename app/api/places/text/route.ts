import { NextRequest, NextResponse } from "next/server";
import { PlacesResponseSchema, PlacesTextQuerySchema } from "@/lib/schemas";
import { PlaceDetail, searchPlacesByText } from "@/lib/places";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface CacheEntry {
  placesData: PlaceDetail[];
  expiresAt: number;
}

const textPlacesCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get("q");
  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");
  const rawType = searchParams.get("type") || undefined;
  const rawRadius = searchParams.get("radius") || undefined;

  if (!rawQ || !rawLat || !rawLng) {
    return NextResponse.json({ error: "Missing q, lat, or lng parameter" }, { status: 400 });
  }

  const validation = PlacesTextQuerySchema.safeParse({
    q: rawQ,
    lat: rawLat,
    lng: rawLng,
    type: rawType,
    radius: rawRadius,
  });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid query parameters format" }, { status: 400 });
  }

  const { q, lat, lng, type, radius } = validation.data;

  const roundedLat = Number(lat.toFixed(3));
  const roundedLng = Number(lng.toFixed(3));
  const cacheKey = `text:${roundedLat},${roundedLng},${type || ""},${radius},${q.toLowerCase()}`;

  const now = Date.now();
  if (textPlacesCache.has(cacheKey)) {
    const entry = textPlacesCache.get(cacheKey)!;
    if (now < entry.expiresAt) {
      return NextResponse.json(entry.placesData);
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    const placesData = await searchPlacesByText(q, lat, lng, type, apiKey, radius);
    const parsed = PlacesResponseSchema.safeParse(placesData);
    if (!parsed.success) {
      console.error("Text places response failed schema validation:", parsed.error);
      return NextResponse.json({ error: "Invalid provider response format" }, { status: 502 });
    }

    if (placesData.length === 0) {
      return NextResponse.json({ error: "No places found for this name" }, { status: 404 });
    }

    textPlacesCache.set(cacheKey, {
      placesData,
      expiresAt: now + CACHE_DURATION_MS,
    });

    return NextResponse.json(placesData);
  } catch (error) {
    console.error("Failed to fetch text search places from provider:", error);
    return NextResponse.json({ error: "Failed to retrieve place matches" }, { status: 502 });
  }
}
