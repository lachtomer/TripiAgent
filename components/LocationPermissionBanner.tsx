"use client";

import { useState } from "react";
import { MapPin, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/hooks/useLocation";

export default function LocationPermissionBanner() {
  const { location, loading, refreshLocation, setManualCity } = useLocation();
  const [manualCity, setManualCityInput] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (
    dismissed ||
    location.permissionState === "granted" ||
    (location.permissionState === "denied" && location.cityName)
  ) {
    return null;
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity.trim()) {
      setManualCity(manualCity.trim());
    }
  };

  return (
    <div className="w-full">
      {location.permissionState === "denied" ? (
        <div className="border-b border-destructive/10 bg-destructive/5 dark:bg-destructive/10 px-4 py-3.5 text-sm transition-all duration-300">
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-2.5 w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-xs font-semibold text-foreground">
                Location access denied. Enter your city manually:
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7 text-muted-foreground hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-full"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Input
                placeholder="e.g. Rome, Florence, Venice"
                value={manualCity}
                onChange={(e) => setManualCityInput(e.target.value)}
                className="h-10 flex-1 text-xs border-outline-variant bg-card text-foreground focus-visible:ring-1 focus-visible:ring-primary-container rounded-lg px-3"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="h-10 px-4 bg-primary hover:bg-[#004900] text-primary-foreground hover:shadow-md transition-all active:scale-[0.97] rounded-lg cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border-b border-primary/10 bg-[#006400]/5 dark:bg-[#006400]/15 px-4 py-3 text-sm flex items-center justify-between gap-4 w-full transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-[#006400] dark:text-[#86df72] shrink-0 animate-bounce" style={{ animationDuration: "2s" }} />
            <p className="text-xs font-medium text-[#004900] dark:text-[#86df72]">
              {location.permissionState === "pending"
                ? "Locating you in Italy..."
                : "Enable location for better local picks"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="default"
              onClick={refreshLocation}
              disabled={loading || location.permissionState === "pending"}
              className="h-8 px-4 text-xs font-bold bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 hover:bg-[#004d00] dark:hover:bg-[#9df888] rounded-full shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {location.permissionState === "pending" ? "Locating..." : "Allow"}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:bg-[#006400]/10 dark:hover:bg-[#86df72]/10 rounded-full"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
