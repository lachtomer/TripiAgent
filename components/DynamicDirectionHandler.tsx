"use client";

import { useEffect } from "react";

export default function DynamicDirectionHandler() {
  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = "en";
  }, []);

  return (
    <div
      data-testid="translations-loaded"
      data-locale="en"
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}
