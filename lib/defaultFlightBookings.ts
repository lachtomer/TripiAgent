/** Wizz Air schedule — Jun 2026 (confirmation PQGFPN, updated Jun 19). */
export interface FlightLeg {
  id: "outbound" | "return";
  label: string;
  dateLabel: string;
  departAirport: string;
  departTime: string;
  arriveAirport: string;
  arriveTime: string;
  airline: string;
  flightNumber: string;
  duration: string;
}

export const DEFAULT_FLIGHT_BOOKINGS: readonly FlightLeg[] = [
  {
    id: "outbound",
    label: "Outbound",
    dateLabel: "Thu Jun 25, 2026",
    departAirport: "TLV",
    departTime: "18:55",
    arriveAirport: "MXP",
    arriveTime: "22:10",
    airline: "Wizz Air",
    flightNumber: "W5 6404",
    duration: "4h 15m",
  },
  {
    id: "return",
    label: "Return",
    dateLabel: "Sat Jul 4, 2026",
    departAirport: "MXP",
    departTime: "13:05",
    arriveAirport: "TLV",
    arriveTime: "18:00",
    airline: "Wizz Air",
    flightNumber: "W4 6403",
    duration: "3h 55m",
  },
] as const;

export const DEFAULT_WIZZ_CONFIRMATION = "PQGFPN";
