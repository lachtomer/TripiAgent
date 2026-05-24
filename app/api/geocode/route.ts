import { NextRequest, NextResponse } from "next/server";
import { GeocodeQuerySchema } from "@/lib/schemas";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface CacheEntry {
  cityName: string;
  expiresAt: number;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodingResult {
  address_components: AddressComponent[];
  formatted_address: string;
}

// In-memory cache for reverse geocoding
const geocodeCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = searchParams.get("lat");
  const rawLng = searchParams.get("lng");

  if (!rawLat || !rawLng) {
    return NextResponse.json({ error: "Missing lat or lng parameter" }, { status: 400 });
  }

  // Zod validation
  const validation = GeocodeQuerySchema.safeParse({ lat: rawLat, lng: rawLng });
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid lat/lng coordinates" }, { status: 400 });
  }

  const { lat, lng } = validation.data;

  // Round to 3 decimal places for caching (approx 110 meters precision)
  const roundedLat = Number(lat.toFixed(3));
  const roundedLng = Number(lng.toFixed(3));
  const cacheKey = `${roundedLat},${roundedLng}`;

  const now = Date.now();
  if (geocodeCache.has(cacheKey)) {
    const entry = geocodeCache.get(cacheKey)!;
    if (now < entry.expiresAt) {
      console.log(`Geocode cache hit for coordinates: ${cacheKey} -> ${entry.cityName}`);
      return NextResponse.json({ cityName: entry.cityName });
    }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing GOOGLE_PLACES_API_KEY environment variable on the server");
    return NextResponse.json({ error: "Server API configuration missing" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`Google Geocoding API error: ${data.status}`, data);
      return NextResponse.json({ error: `Google API Error: ${data.status}` }, { status: 502 });
    }

    let cityName = "";
    const results = data.results as GeocodingResult[] | undefined;
    if (results && results.length > 0) {
      // 1. Try Locality
      for (const result of results) {
        const component = result.address_components.find((c: AddressComponent) =>
          c.types.includes("locality")
        );
        if (component) {
          cityName = component.long_name;
          break;
        }
      }

      // 2. Try Administrative Area Level 3 (Municipality/Comune in Italy)
      if (!cityName) {
        for (const result of results) {
          const component = result.address_components.find((c: AddressComponent) =>
            c.types.includes("administrative_area_level_3")
          );
          if (component) {
            cityName = component.long_name;
            break;
          }
        }
      }

      // 3. Try Administrative Area Level 2 (Province)
      if (!cityName) {
        for (const result of results) {
          const component = result.address_components.find((c: AddressComponent) =>
            c.types.includes("administrative_area_level_2")
          );
          if (component) {
            cityName = component.long_name;
            break;
          }
        }
      }

      // 4. Fallback to first formatted address component
      if (!cityName) {
        cityName = results[0].formatted_address;
      }
    }

    if (!cityName) {
      cityName = `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }

    // Save to in-memory cache
    geocodeCache.set(cacheKey, {
      cityName,
      expiresAt: now + CACHE_DURATION_MS,
    });

    console.log(`Geocode cache miss. Fetched and cached: ${cacheKey} -> ${cityName}`);
    return NextResponse.json({ cityName });
  } catch (error) {
    console.error("Failed to perform reverse geocoding:", error);
    return NextResponse.json({ error: "Failed to perform reverse geocoding" }, { status: 500 });
  }
}
