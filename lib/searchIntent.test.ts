import { describe, it, expect } from "vitest";
import {
  parseKeywordInLocation,
  parseNameWithArea,
  isLocationBrowseCandidate,
  isKnownArea,
  LOCATION_BROWSE_RADIUS_KM,
} from "./searchIntent";

describe("parseKeywordInLocation", () => {
  it("splits Pizza in Milan", () => {
    expect(parseKeywordInLocation("Pizza in Milan")).toEqual({
      keyword: "Pizza",
      locationText: "Milan",
    });
  });

  it("returns null when no ' in ' segment", () => {
    expect(parseKeywordInLocation("Gardaland")).toBeNull();
    expect(parseKeywordInLocation("Pizza Milan")).toBeNull();
  });
});

describe("parseNameWithArea", () => {
  it("splits Colosseum Rome", () => {
    expect(parseNameWithArea("Colosseum Rome")).toEqual({
      nameText: "Colosseum",
      areaText: "Rome",
    });
  });

  it("splits Gardaland Lake Garda", () => {
    expect(parseNameWithArea("Gardaland Lake Garda")).toEqual({
      nameText: "Gardaland",
      areaText: "Lake Garda",
    });
  });

  it("splits Osteria Francescana Modena", () => {
    expect(parseNameWithArea("Osteria Francescana Modena")).toEqual({
      nameText: "Osteria Francescana",
      areaText: "Modena",
    });
  });

  it("does not split Pizza in Milan (keyword path)", () => {
    expect(parseNameWithArea("Pizza in Milan")).toBeNull();
  });

  it("returns null for single-token queries", () => {
    expect(parseNameWithArea("Verona")).toBeNull();
    expect(parseNameWithArea("Gardaland")).toBeNull();
  });

  it("returns null when whole query is a known browse area", () => {
    expect(parseNameWithArea("Lake Garda")).toBeNull();
    expect(parseNameWithArea("Riva del Garda")).toBeNull();
    expect(parseNameWithArea("Desenzano del Garda")).toBeNull();
  });
});

describe("isLocationBrowseCandidate", () => {
  const localityProbe = {
    cityName: "Verona",
    matchedName: "Verona",
    placeTypes: ["locality", "political"],
  };

  it("returns true for Verona locality probe", () => {
    expect(isLocationBrowseCandidate("Verona", localityProbe)).toBe(true);
  });

  it("returns false for Gardaland amusement park probe", () => {
    expect(
      isLocationBrowseCandidate("Gardaland", {
        cityName: "Gardaland",
        matchedName: "Gardaland",
        placeTypes: ["amusement_park", "point_of_interest", "establishment"],
      })
    ).toBe(false);
  });

  it("returns false when query is name_with_area pattern", () => {
    expect(isLocationBrowseCandidate("Colosseum Rome", localityProbe)).toBe(false);
  });

  it("returns false for keyword in location pattern", () => {
    expect(isLocationBrowseCandidate("Pizza in Milan", localityProbe)).toBe(false);
  });

  it("returns true for Lake Garda allowlisted region", () => {
    expect(
      isLocationBrowseCandidate("Lake Garda", {
        cityName: "Lake Garda",
        matchedName: "Lake Garda",
        placeTypes: ["natural_feature", "political"],
      })
    ).toBe(true);
  });

  it("returns true for allowlisted natural-feature regions without locality types", () => {
    expect(
      isLocationBrowseCandidate("Lake Garda", {
        cityName: "Lake Garda",
        matchedName: "Lago di Garda",
        placeTypes: ["natural_feature"],
      })
    ).toBe(true);
  });
});

describe("isKnownArea", () => {
  it("recognizes allowlist cities case-insensitively", () => {
    expect(isKnownArea("Milan")).toBe(true);
    expect(isKnownArea("lake garda")).toBe(true);
    expect(isKnownArea("Gardaland")).toBe(false);
  });
});

describe("LOCATION_BROWSE_RADIUS_KM", () => {
  it("defaults to 50 km for regional browse", () => {
    expect(LOCATION_BROWSE_RADIUS_KM).toBe(50);
  });
});
