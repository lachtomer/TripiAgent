import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { getGoogleNearbyPlaces, getProgressiveNearbyPlaces } from "@/lib/places";
import { PlacesResponseSchema } from "@/lib/schemas";
import type { PlaceDetail } from "@/lib/places";

// Mock the Google Places helper functions
vi.mock("@/lib/places", async () => {
  const actual = await vi.importActual<typeof import("@/lib/places")>("@/lib/places");
  return {
    ...actual,
    getGoogleNearbyPlaces: vi.fn(),
    getProgressiveNearbyPlaces: vi.fn(),
    enrichPlacesWithDetails: vi.fn(async (places: PlaceDetail[]) => places),
  };
});

describe("GET /api/places", () => {
  const envBackup = process.env.GOOGLE_PLACES_API_KEY;
  const fetchBackup = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = "mock-google-key";

    // Delegate getProgressiveNearbyPlaces to getGoogleNearbyPlaces mock by default
    vi.mocked(getProgressiveNearbyPlaces).mockImplementation(
      async (lat, lng, type, apiKey, keyword) => {
        return getGoogleNearbyPlaces(lat, lng, 5000, type, apiKey, keyword);
      }
    );
  });

  afterEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = envBackup;
    global.fetch = fetchBackup;
  });

  it("should return places successfully for valid query parameters", async () => {
    const mockPlaces = [
      { place_id: "p1", name: "Duomo", rating: 4.8 },
      { place_id: "p2", name: "Piazza del Duomo", rating: 4.7 },
    ];
    vi.mocked(getGoogleNearbyPlaces).mockResolvedValue(mockPlaces);

    const request = new NextRequest(
      "http://localhost:9001/api/places?lat=45.4642&lng=9.1900&radius=2000&type=tourist_attraction&keyword=Gelato"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPlaces);
    expect(getProgressiveNearbyPlaces).toHaveBeenCalledWith(
      45.4642,
      9.1900,
      "tourist_attraction",
      "mock-google-key",
      "Gelato"
    );
    expect(getGoogleNearbyPlaces).toHaveBeenCalledWith(
      45.4642,
      9.1900,
      5000,
      "tourist_attraction",
      "mock-google-key",
      "Gelato"
    );
  });

  it("should return enriched places that satisfy PlacesResponseSchema", async () => {
    const enrichedPlaces = [
      {
        place_id: "mock-osteria-1",
        name: "Osteria Mock",
        rating: 4.6,
        website_url: "https://example.com/osteria",
        maps_url:
          "https://www.google.com/maps/search/?api=1&query_place_id=mock-osteria-1",
      },
      {
        place_id: "mock-cafe-2",
        name: "Cafe Senza Sito",
        maps_url:
          "https://www.google.com/maps/search/?api=1&query_place_id=mock-cafe-2",
      },
    ];
    vi.mocked(getProgressiveNearbyPlaces).mockResolvedValue(enrichedPlaces);

    const request = new NextRequest(
      "http://localhost:9001/api/places?lat=45.4384&lng=10.9916&type=restaurant"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    const parsed = PlacesResponseSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    expect(data[0].website_url).toBe("https://example.com/osteria");
    expect(data[1].website_url).toBeUndefined();
  });

  it("should reject unsafe website_url in PlacesResponseSchema contract", () => {
    const unsafePayload = [
      {
        place_id: "bad-1",
        name: "Bad Link",
        website_url: "javascript:alert(1)",
        maps_url: "https://www.google.com/maps/place/1",
      },
    ];

    const parsed = PlacesResponseSchema.safeParse(unsafePayload);
    expect(parsed.success).toBe(false);
  });

  it("should return 400 if lat or lng are missing", async () => {
    const request = new NextRequest("http://localhost:9001/api/places?lat=45.4642&radius=2000");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing lat or lng parameter");
  });

  it("should return 400 if lat or lng format is invalid", async () => {
    const request = new NextRequest("http://localhost:9001/api/places?lat=invalid&lng=9.1900");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid query parameters format");
  });

  it("should cache subsequent identical coordinates queries within tolerance", async () => {
    const mockPlaces1 = [{ place_id: "p1", name: "Duomo", rating: 4.8 }];
    vi.mocked(getGoogleNearbyPlaces).mockResolvedValue(mockPlaces1);

    const request1 = new NextRequest(
      "http://localhost:9001/api/places?lat=45.4641&lng=9.1901&radius=2000"
    );
    const response1 = await GET(request1);
    expect(response1.status).toBe(200);

    const request2 = new NextRequest(
      "http://localhost:9001/api/places?lat=45.4642&lng=9.1902&radius=2000"
    );
    const response2 = await GET(request2);
    expect(response2.status).toBe(200);

    expect(getGoogleNearbyPlaces).toHaveBeenCalledTimes(1);
  });

  it("should return 500 if GOOGLE_PLACES_API_KEY environment variable is missing", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;

    const request = new NextRequest("http://localhost:9001/api/places?lat=45.4642&lng=9.1900");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Server API configuration missing");
  });

  it("should use direct nearby call when radius exceeds 5000m", async () => {
    const mockPlaces = [{ place_id: "p1", name: "Gardaland", rating: 4.7 }];
    vi.mocked(getGoogleNearbyPlaces).mockResolvedValue(mockPlaces);
    vi.mocked(getProgressiveNearbyPlaces).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:9001/api/places?lat=45.6050&lng=10.5210&radius=50000&type=tourist_attraction"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPlaces);
    expect(getGoogleNearbyPlaces).toHaveBeenCalledWith(
      45.605,
      10.521,
      50000,
      "tourist_attraction",
      "mock-google-key",
      undefined
    );
    expect(getProgressiveNearbyPlaces).not.toHaveBeenCalled();
  });

  it("should return enriched payload through real getProgressiveNearbyPlaces pipeline", async () => {
    const actual = await vi.importActual<typeof import("@/lib/places")>("@/lib/places");
    vi.mocked(getProgressiveNearbyPlaces).mockImplementation(actual.getProgressiveNearbyPlaces);

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        const placeId = new URL(url).searchParams.get("place_id") ?? "";
        return {
          ok: true,
          json: async () => ({
            status: "OK",
            result:
              placeId === "p0"
                ? {
                    website: "https://osteria.example/menu",
                    url: "https://maps.google.com/?cid=route-test",
                  }
                : {},
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          status: "OK",
          results: [
            {
              place_id: "p0",
              name: "Osteria Route",
              geometry: { location: { lat: 45.4, lng: 9.1 } },
            },
            {
              place_id: "p1",
              name: "Bar Route",
              geometry: { location: { lat: 45.4, lng: 9.1 } },
            },
            {
              place_id: "p2",
              name: "Bistro Route",
              geometry: { location: { lat: 45.4, lng: 9.1 } },
            },
          ],
        }),
      } as Response;
    });

    const request = new NextRequest(
      "http://localhost:9001/api/places?lat=45.1111&lng=9.1111&type=restaurant"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(PlacesResponseSchema.safeParse(data).success).toBe(true);
    expect(data[0].website_url).toBe("https://osteria.example/menu");
    expect(data[0].maps_url).toBe("https://maps.google.com/?cid=route-test");
  });
});
