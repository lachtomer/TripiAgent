"use client";

import { useEffect } from "react";
import { useTripStore } from "@/stores/tripStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Toast() {
  const toast = useTripStore((s) => s.toast);
  const setToast = useTripStore((s) => s.setToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-4.5 w-4.5 text-[#006400] dark:text-[#86df72]" />,
    error: <AlertCircle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />,
    info: <Info className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />,
  };

  const bgColors = {
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30",
    error: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30",
    info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[350px] px-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md",
          bgColors[toast.type]
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[toast.type]}
          <p
            data-testid="toast-message"
            className="text-xs font-bold text-foreground leading-normal truncate"
          >
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => setToast(null)}
          className="text-muted-foreground hover:text-foreground shrink-0 rounded-lg p-0.5 hover:bg-muted/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
