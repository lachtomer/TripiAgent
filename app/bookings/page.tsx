import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ניירות — TripiAgent",
  description: "Bookings and travel documents",
};

export default function BookingsPage() {
  return (
    <div
      data-testid="bookings-page"
      className="flex flex-col flex-1 items-center justify-center pb-16 px-4 pt-4 gap-3"
    >
      <p className="text-2xl">📄</p>
      <h1 className="text-lg font-bold">ניירות</h1>
      <p className="text-sm text-muted-foreground text-center">
        בקרוב — ניהול הזמנות, שוברים, ומסמכי נסיעה.
      </p>
    </div>
  );
}
