"use client";

import { useState } from "react";
import { X } from "lucide-react";
import MapPreview from "@/components/MapPreview";

export default function ActiveRouteMapCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        data-testid="active-route-map"
        onClick={() => setExpanded(true)}
        className="cursor-pointer rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md"
        style={{ height: 220 }}
        role="button"
        aria-label="הרחב מפה — Expand map"
      >
        <MapPreview />
      </div>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-bold">המסלול שלי</span>
            <button
              onClick={() => setExpanded(false)}
              className="p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              aria-label="סגור — Close map"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <MapPreview />
          </div>
        </div>
      )}
    </>
  );
}
