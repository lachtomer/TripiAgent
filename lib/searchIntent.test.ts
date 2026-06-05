import { describe, it, expect } from "vitest";
import {
  parseKeywordInLocation,
  parseNameWithArea,
  isLocationBrowseCandidate,
  isKnownArea,
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
});

describe("isKnownArea", () => {
  it("recognizes allowlist cities case-insensitively", () => {
    expect(isKnownArea("Milan")).toBe(true);
    expect(isKnownArea("lake garda")).toBe(true);
    expect(isKnownArea("Gardaland")).toBe(false);
  });
});
