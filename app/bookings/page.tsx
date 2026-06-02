import type { Metadata } from "next";
import LogisticsCard from "@/components/LogisticsCard";

export const metadata: Metadata = {
  title: "לוגיסטיקה והזמנות — TripiAgent",
  description: "Flights, car rental, lockbox codes and ZTL permits",
};

export default function BookingsPage() {
  return (
    <div
      data-testid="bookings-page"
      className="flex flex-col flex-1 pb-16 px-4 pt-4 space-y-4"
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          לוגיסטיקה והזמנות
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          טיסות, השכרת רכב, כספת וכניסה לאזורי ZTL
        </p>
      </div>

      <LogisticsCard />
    </div>
  );
}
