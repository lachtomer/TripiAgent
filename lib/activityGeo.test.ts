import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resolveActivityCoordinates } from "./activityGeo";

describe("resolveActivityCoordinates", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns stored coordinates without calling geocode", async () => {
    const result = await resolveActivityCoordinates({
      title: "Uffizi",
      lat: 43.7678,
      lng: 11.2553,
    });
    expect(result).toEqual({ lat: 43.7678, lng: 11.2553 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("geocodes when coordinates are missing", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ lat: 45.4642, lng: 9.19 }),
    } as Response);

    const result = await resolveActivityCoordinates({
      title: "Milan",
      locationName: "Milan, Italy",
    });
    expect(result).toEqual({ lat: 45.4642, lng: 9.19 });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/geocode?address=")
    );
  });

  it("returns null when geocode fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    const result = await resolveActivityCoordinates({
      title: "Unknown",
      locationName: "Nowhere",
    });
    expect(result).toBeNull();
  });
});
