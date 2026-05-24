import { useState, useEffect, useCallback } from "react";
import { useTripStore } from "@/stores/tripStore";
import { LocationCoords } from "@/types";

export function useLocation() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const storeLocation = useTripStore((state) => state.location);
  const setLocation = useTripStore((state) => state.setLocation);
  const setManualCity = useTripStore((state) => state.setManualCity);

  const fetchCityName = async (lat: number, lng: number): Promise<string> => {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error("Failed to geocode coordinates");
    const data = await res.json();
    return data.cityName || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  };

  const getPosition = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocation({
        coords: null,
        cityName: null,
        permissionState: "denied",
      });
      return;
    }

    setLoading(true);
    setError(null);

    // Set permissionState to pending
    setLocation({
      coords: storeLocation?.coords || null,
      cityName: storeLocation?.cityName || null,
      permissionState: "pending",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: LocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        try {
          const cityName = await fetchCityName(coords.latitude, coords.longitude);
          setLocation({
            coords,
            cityName,
            permissionState: "granted",
          });
        } catch (err) {
          console.error("Geocoding failed", err);
          setLocation({
            coords,
            cityName: `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
            permissionState: "granted",
          });
          setError("Coordinates acquired, but failed to resolve city name.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.warn("Geolocation query failed", geoError);
        setLocation({
          coords: null,
          cityName: storeLocation?.cityName || null,
          permissionState: "denied",
        });
        setError("Location permission denied. Please enter your city manually.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [setLocation, storeLocation]);

  // Run on mount if location is prompt or unconfigured
  useEffect(() => {
    if (!storeLocation || storeLocation.permissionState === "prompt") {
      const timer = setTimeout(() => {
        getPosition();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [storeLocation, getPosition]);

  return {
    location: storeLocation || { coords: null, cityName: null, permissionState: "prompt" },
    loading,
    error,
    refreshLocation: getPosition,
    setManualCity,
  };
}
