"use client";

import { useEffect, useState } from "react";
import { Plane, Car, Lock, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Check, Key } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTranslation } from "@/lib/translations";

export default function LogisticsCard() {
  const isHydrated = useIsHydrated();
  const logistics = useTripStore((state) => state.logistics);
  const updateLogistics = useTripStore((state) => state.updateLogistics);
  const { t, locale } = useTranslation();

  const [collapsed, setCollapsed] = useState(true); // Collapsed by default to save page height
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Local state for forms to avoid heavy re-renders on keypress
  const [flightTlvMxp, setFlightTlvMxp] = useState("");
  const [flightMxpTlv, setFlightMxpTlv] = useState("");
  const [carRentalCode, setCarRentalCode] = useState("");
  const [lockboxCode, setLockboxCode] = useState("");
  const [ztlPaid, setZtlPaid] = useState(false);

  // Sync store -> local state on hydration or store updates
  useEffect(() => {
    if (isHydrated && logistics) {
      const timer = setTimeout(() => {
        setFlightTlvMxp(logistics.flightTlvMxpCode || "");
        setFlightMxpTlv(logistics.flightMxpTlvCode || "");
        setCarRentalCode(logistics.carRentalVoucherCode || "");
        setLockboxCode(logistics.villaEuniceLockboxCode || "");
        setZtlPaid(!!logistics.milanZtlPaid);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, logistics]);

  if (!isHydrated) {
    return (
      <Card className="border border-outline-variant/30 bg-card/50">
        <CardContent className="p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">{t.loadingLogistics}</span>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    updateLogistics({
      flightTlvMxpCode: flightTlvMxp.trim(),
      flightMxpTlvCode: flightMxpTlv.trim(),
      carRentalVoucherCode: carRentalCode.trim(),
      villaEuniceLockboxCode: lockboxCode.trim(),
      milanZtlPaid: ztlPaid,
    });

    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2000);
  };

  return (
    <Card dir={locale === 'he' ? 'rtl' : 'ltr'} className="border border-outline-variant/30 bg-card overflow-hidden shadow-sm transition-all duration-300">
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/5 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary dark:text-[#86df72]" />
            <CardTitle className="text-sm font-extrabold tracking-tight">{t.travelLogistics}</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground">
            {t.logisticsDescription}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          {ztlPaid && (
            <span className="text-[9px] font-extrabold bg-[#006400]/10 text-[#006400] dark:bg-[#86df72]/10 dark:text-[#86df72] px-2 py-0.5 rounded border border-[#006400]/20 dark:border-[#86df72]/20 uppercase">
              {t.ztlPaidBadge}
            </span>
          )}
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-0 space-y-4 animate-in fade-in duration-200">
          <div className="space-y-3.5">
            {/* Flight outbound */}
            <div className="space-y-1">
              <label htmlFor="logistics-flight-tlv-mxp" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Plane className="h-3 w-3 text-primary dark:text-[#86df72]" />
                {t.outboundFlight}
              </label>
              <Input
                id="logistics-flight-tlv-mxp"
                placeholder="e.g. LY381 / QW92B1"
                value={flightTlvMxp}
                onChange={(e) => setFlightTlvMxp(e.target.value)}
                className="h-8 text-xs font-semibold text-start"
                dir="ltr"
              />
            </div>

            {/* Flight return */}
            <div className="space-y-1">
              <label htmlFor="logistics-flight-mxp-tlv" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Plane className={`h-3 w-3 text-primary dark:text-[#86df72] ${locale === 'he' ? '' : 'rotate-180'}`} />
                {t.returnFlight}
              </label>
              <Input
                id="logistics-flight-mxp-tlv"
                placeholder="e.g. LY382 / ZX71P9"
                value={flightMxpTlv}
                onChange={(e) => setFlightMxpTlv(e.target.value)}
                className="h-8 text-xs font-semibold text-start"
                dir="ltr"
              />
            </div>

            {/* Car rental */}
            <div className="space-y-1">
              <label htmlFor="logistics-car-rental-voucher" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Car className="h-3 w-3 text-primary dark:text-[#86df72]" />
                {t.carRentalVoucher}
              </label>
              <Input
                id="logistics-car-rental-voucher"
                placeholder="e.g. CTR-9817263-IT"
                value={carRentalCode}
                onChange={(e) => setCarRentalCode(e.target.value)}
                className="h-8 text-xs font-semibold text-start"
                dir="ltr"
              />
            </div>

            {/* Villa Eunice Lockbox */}
            <div className="space-y-1">
              <label htmlFor="logistics-lockbox-code" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                <Lock className="h-3 w-3 text-primary dark:text-[#86df72]" />
                {t.villaLockboxLabel}
              </label>
              <Input
                id="logistics-lockbox-code"
                placeholder="e.g. Code: 2026 / Key Box C"
                value={lockboxCode}
                onChange={(e) => setLockboxCode(e.target.value)}
                className="h-8 text-xs font-semibold text-start"
                dir="ltr"
              />
            </div>

            {/* Milan ZTL Milan Area C Entry */}
            <div className="flex gap-2.5 items-start p-3 bg-[#006400]/5 dark:bg-[#86df72]/5 border border-outline-variant/30 rounded-xl">
              <input
                id="logistics-milan-ztl-paid"
                type="checkbox"
                checked={ztlPaid}
                onChange={(e) => setZtlPaid(e.target.checked)}
                className="mt-0.5 shrink-0 rounded border-outline-variant/30 text-[#006400] focus:ring-[#006400]"
              />
              <div className="space-y-1 select-none flex-1">
                <label htmlFor="logistics-milan-ztl-paid" className="text-xs font-bold text-foreground cursor-pointer">
                  {t.milanZtlLabel}
                </label>
                <p className="text-[10px] text-muted-foreground leading-normal flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
                  <span>
                    {t.ztlDescription}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Save Button */}
            <Button
              id="logistics-save-button"
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
                  {t.saveLogistics}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
