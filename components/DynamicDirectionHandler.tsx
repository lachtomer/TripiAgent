"use client";

import { useEffect } from "react";

export default function DynamicDirectionHandler() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);

  return (
    <div
      data-testid="translations-loaded"
      data-locale="he"
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}
