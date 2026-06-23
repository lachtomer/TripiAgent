import { describe, it, expect } from "vitest";
import { DEFAULT_FLIGHT_BOOKINGS, DEFAULT_WIZZ_CONFIRMATION } from "./defaultFlightBookings";

describe("defaultFlightBookings", () => {
  it("exports Wizz Air Jun 2026 schedule", () => {
    expect(DEFAULT_FLIGHT_BOOKINGS).toHaveLength(2);
    expect(DEFAULT_FLIGHT_BOOKINGS[0]).toMatchObject({
      departTime: "18:55",
      arriveTime: "22:10",
      flightNumber: "W5 6404",
    });
    expect(DEFAULT_FLIGHT_BOOKINGS[1]).toMatchObject({
      departTime: "13:05",
      arriveTime: "18:00",
      flightNumber: "W4 6403",
    });
    expect(DEFAULT_WIZZ_CONFIRMATION).toBe("PQGFPN");
  });
});
