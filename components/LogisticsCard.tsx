"use client";

import { useEffect, useState } from "react";
import { Plane, Car, Check, Key, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTranslation } from "@/lib/translations";
import { DEFAULT_FLIGHT_BOOKINGS } from "@/lib/defaultFlightBookings";

export default function LogisticsCard() {
  const isHydrated = useIsHydrated();
  const logistics = useTripStore((state) => state.logistics);
  const updateLogistics = useTripStore((state) => state.updateLogistics);
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [flightConfirmation, setFlightConfirmation] = useState("");
  const [carRentalCode, setCarRentalCode] = useState("");

  useEffect(() => {
    if (isHydrated && logistics) {
      const timer = setTimeout(() => {
        setFlightConfirmation(logistics.flightConfirmationCode || "");
        setCarRentalCode(logistics.carRentalVoucherCode || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, logistics]);

  if (!isHydrated) {
    return (
      <Card className="border border-outline-variant/30 bg-card/50">
        <CardContent className="p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">{t.loadingBookings}</span>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    updateLogistics({
      flightConfirmationCode: flightConfirmation.trim(),
      carRentalVoucherCode: carRentalCode.trim(),
    });

    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <Card
      dir="ltr"
      data-testid="bookings-card"
      className="border border-outline-variant/30 bg-card overflow-hidden shadow-sm transition-all duration-300"
    >
      <CardHeader
        className="p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/5 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary dark:text-[#86df72]" />
            <CardTitle className="text-sm font-extrabold tracking-tight">{t.bookingsCardTitle}</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground">
            {t.bookingsCardDescription}
          </CardDescription>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-0 space-y-4 animate-in fade-in duration-200">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t.flightsSectionTitle}
            </p>

            {DEFAULT_FLIGHT_BOOKINGS.map((leg) => (
              <div
                key={leg.id}
                data-testid={`flight-leg-${leg.id}`}
                className="rounded-xl border border-outline-variant/30 bg-background/50 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-foreground">{leg.label}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{leg.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span>{leg.departTime}</span>
                  <span className="text-muted-foreground font-semibold">{leg.departAirport}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{leg.arriveTime}</span>
                  <span className="text-muted-foreground font-semibold">{leg.arriveAirport}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {leg.airline} · {leg.flightNumber} · {leg.duration}
                </p>
              </div>
            ))}

            <div className="space-y-1">
              <label
                htmlFor="bookings-flight-confirmation"
                className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"
              >
                <Plane className="h-3 w-3 text-primary dark:text-[#86df72]" />
                {t.wizzConfirmationLabel}
              </label>
              <Input
                id="bookings-flight-confirmation"
                data-testid="bookings-flight-confirmation"
                placeholder="e.g. PQGFPN"
                value={flightConfirmation}
                onChange={(e) => setFlightConfirmation(e.target.value)}
                className="h-8 text-xs font-semibold text-start"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-outline-variant/20">
            <label
              htmlFor="bookings-car-rental-voucher"
              className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"
            >
              <Car className="h-3 w-3 text-primary dark:text-[#86df72]" />
              {t.carRentalVoucher}
            </label>
            <Input
              id="bookings-car-rental-voucher"
              data-testid="bookings-car-rental-voucher"
              placeholder="e.g. CTR-9817263-IT"
              value={carRentalCode}
              onChange={(e) => setCarRentalCode(e.target.value)}
              className="h-8 text-xs font-semibold text-start"
              dir="ltr"
            />
          </div>

          <Button
            id="bookings-save-button"
            data-testid="bookings-save-button"
            onClick={handleSave}
            className={`w-full font-semibold h-9 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              showSavedFeedback
                ? "bg-green-600 hover:bg-green-600 text-white"
                : "bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#9df888] text-white dark:text-zinc-950"
            }`}
          >
            {showSavedFeedback ? (
              <>
                <Check className="h-4 w-4 animate-bounce" />
                {t.detailsSaved}
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                {t.saveBookings}
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
