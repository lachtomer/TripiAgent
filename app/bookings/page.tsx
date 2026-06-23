import type { Metadata } from "next";
import BookingsPageContent from "@/components/BookingsPageContent";

export const metadata: Metadata = {
  title: "Bookings — TripiAgent",
  description: "Flight schedule, Wizz Air confirmation, car rental voucher, and reservations to verify",
};

export default function BookingsPage() {
  return <BookingsPageContent />;
}
