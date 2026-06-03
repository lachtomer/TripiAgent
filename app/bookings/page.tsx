import type { Metadata } from "next";
import BookingsPageContent from "@/components/BookingsPageContent";

export const metadata: Metadata = {
  title: "Logistics & Bookings — TripiAgent",
  description: "Flights, car rental, lockbox codes, ZTL permits, and reservations to verify",
};

export default function BookingsPage() {
  return <BookingsPageContent />;
}
