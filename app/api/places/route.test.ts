import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { getGoogleNearbyPlaces, getProgressiveNearbyPlaces } from "@/lib/places";

// Mock the Google Places helper functions
vi.mock("@/lib/places", async () => {
  const actual = await vi.importActual<typeof import("@/lib/places")>("@/lib/places");
  return {
    ...actual,
    getGoogleNearbyPlaces: vi.fn(),
    getProgressiveNearbyPlaces: vi.fn(),
  };
});

describe("GET /api/places", () => {
  const envBackup = process.env.GOOGLE_PLACES_API_KEY;

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
  });

  it("should return places successfully for valid query parameters", async () => {
    const mockPlaces = [
      { place_id: "p1", name: "Duomo", rating: 4.8 },
      { place_id: "p2", name: "Piazza del Duomo", rating: 4.7 }
    ];
    vi.mocked(getGoogleNearbyPlaces).mockResolvedValue(mockPlaces);

    const request = new NextRequest("http://localhost:9001/api/places?lat=45.4642&lng=9.1900&radius=2000&type=tourist_attraction&keyword=Gelato");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPlaces);
    expect(getProgressiveNearbyPlaces).toHaveBeenCalledWith(45.4642, 9.1900, "tourist_attraction", "mock-google-key", "Gelato");
    expect(getGoogleNearbyPlaces).toHaveBeenCalledWith(45.4642, 9.1900, 5000, "tourist_attraction", "mock-google-key", "Gelato");
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

    // Call 1
    const request1 = new NextRequest("http://localhost:9001/api/places?lat=45.4641&lng=9.1901&radius=2000");
    const response1 = await GET(request1);
    expect(response1.status).toBe(200);

    // Call 2 with slightly different coordinates (within 3 decimals rounding tolerance)
    const request2 = new NextRequest("http://localhost:9001/api/places?lat=45.4642&lng=9.1902&radius=2000");
    const response2 = await GET(request2);
    expect(response2.status).toBe(200);

    // Verify it only called getGoogleNearbyPlaces once (cache hit for the second call)
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
});
