"use client";

import { useEffect } from "react";
import { useTripStore } from "@/stores/tripStore";

export default function DynamicDirectionHandler() {
  const locale = useTripStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
