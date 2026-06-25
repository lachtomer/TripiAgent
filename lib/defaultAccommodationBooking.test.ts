import { describe, it, expect } from "vitest";
import { DEFAULT_ACCOMMODATION_BOOKING } from "./defaultAccommodationBooking";

describe("defaultAccommodationBooking", () => {
  it("seeds Villa Bella Desenzano VRBO details", () => {
    expect(DEFAULT_ACCOMMODATION_BOOKING).toMatchObject({
      name: "Villa Bella Desenzano",
      locationName: "Desenzano del Garda",
      vrboConfirmationCode: "HA-HC6RCW",
      vrboPropertyId: "10207760",
      balanceDueEuro: "98",
    });
  });
});
