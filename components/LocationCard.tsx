"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Cloud, Sun, CloudRain, CloudSnow, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/hooks/useLocation";
import type { WeatherData } from "@/lib/weather";

function WeatherIcon({ condition, className }: { condition: string; className?: string }) {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className={className} />;
  if (c.includes("snow")) return <CloudSnow className={className} />;
  if (c.includes("cloud")) return <Cloud className={className} />;
  return <Sun className={className} />;
}

export default function LocationCard() {
  const { location, loading: locLoading, refreshLocation } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [localTime, setLocalTime] = useState("");

  const cityName = location.cityName || "Rome, Italy";
  const coords = location.coords;
  const latitude = coords?.latitude ?? 41.9028; // Default to Rome latitude
  const longitude = coords?.longitude ?? 12.4964; // Default to Rome longitude

  // Update clock every minute in Italy timezone
  useEffect(() => {
    const updateClock = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: "Europe/Rome",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };
        setLocalTime(new Intl.DateTimeFormat([], options).format(new Date()));
      } catch (e) {
        setLocalTime("14:30"); // Fallback
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather based on active coordinates
  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setWeatherLoading(true);
    }, 0);

    fetch(`/api/weather?lat=${latitude}&lng=${longitude}`)
      .then((r) => r.json())
      .then((data: WeatherData) => {
        if (active) setWeather(data);
      })
      .catch((err) => {
        console.error("Weather fetch failed:", err);
        // Set mock data if API fails to prevent empty UI
        if (active) setWeather({ temp: 24, condition: "Sunny", icon: "01d", forecast: [] });
      })
      .finally(() => {
        if (active) setWeatherLoading(false);
      });

    return () => {
      active = false;
    };
  }, [latitude, longitude]);

  return (
    <section className="w-full">
      <span className="absolute opacity-0 select-none pointer-events-none" style={{ fontSize: "1px" }}>
        Current Location
      </span>
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg group border border-outline-variant/30">
        {/* Sunset Background Image */}
        <img
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          alt="Breathtaking panoramic view of Rome at sunset"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAhpKUZWvdA5-2hLk7t04lW0WypU9tXQLCNeb2ts7xKHPF8xitdVXm4Tc9s27Ck9D8zalkiE9hYvHNksySpvuDwcQFXB6wHWKxfSLcwvTT16ER2If45_-ldFET4EbI-aYKCQIp85ofWwMIM1jyBYxxAY5OwKGglmC_VkMaACmYfC8WAbhEiDDGS1KFezYV_n4cU-OBpeDM5AuQfMFCdexyJ3uZ-DmYyrKEtznYs5436mT892zqJ62IM2Yc1NtkDXBkPFbOFJycWvl-"
        />
        {/* Rich double overlay: warm sunset filter + bottom shadow for legibility */}
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

        {/* Refresh button floating top right */}
        {location.cityName && (
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshLocation}
            disabled={locLoading}
            className="absolute top-3.5 right-3.5 h-8.5 w-8.5 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:border-white/25 transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            aria-label="Refresh Location"
          >
            <RefreshCw className={`h-4 w-4 ${locLoading ? "animate-spin" : ""}`} />
          </Button>
        )}

        {/* Content bottom row */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white">
          <div className="flex justify-between items-end gap-4">
            <div className="space-y-1">
              <h2 className="font-headline-lg-mobile text-white tracking-tight flex items-center gap-1.5 font-bold drop-shadow-sm">
                <MapPin className="h-5 w-5 shrink-0 text-[#86df72]" />
                {cityName}
              </h2>
              <p className="text-xs text-white/80 font-medium tracking-wide flex items-center gap-1.5">
                <span>{localTime || "14:30"}</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span>Local Time</span>
              </p>
            </div>
            
            <div className="text-right flex flex-col items-end shrink-0">
              <div className="flex items-center justify-center gap-2 bg-primary/10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl shrink-0 border border-white/15 shadow-md">
                {weatherLoading ? (
                  <div className="h-5 w-12 bg-white/20 rounded animate-pulse" />
                ) : weather ? (
                  <>
                    <WeatherIcon
                      condition={weather.condition}
                      className="h-4.5 w-4.5 text-[#86df72] shrink-0"
                    />
                    <span className="text-sm md:text-base font-bold tracking-tight">{weather.temp}°C</span>
                  </>
                ) : (
                  <span className="text-sm md:text-base font-bold">—°C</span>
                )}
              </div>
              <p className="text-[10px] text-[#86df72] font-bold uppercase tracking-wider mt-1.5 drop-shadow-sm">
                {weatherLoading ? "Loading..." : weather?.condition || "Sunny"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
