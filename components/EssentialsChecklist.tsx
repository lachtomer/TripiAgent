"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Square, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIsHydrated } from "@/hooks/useIsHydrated";

interface ChecklistItem {
  id: string;
  task: string;
  subtext: string;
}

const ESSENTIALS_ITEMS: ChecklistItem[] = [
  { id: "e1", task: "Passports & Flights", subtext: "TLV → MXP on Jun 25. Check validity > 6 months." },
  { id: "e2", task: "Centauro Car Rental Voucher", subtext: "Group E2 pickup at Malpensa on Jun 26, 10:00." },
  { id: "e3", task: "Villa Eunice Check-in Keys", subtext: "Monzambano base keys and lockbox instructions saved." },
  { id: "e4", task: "Portable CO/Smoke Detector", subtext: "⚠️ Villa Eunice has no detectors — highly recommended to bring one." },
  { id: "e5", task: "Milan Area C / ZTL Registration", subtext: "Required fee (€7.50) for entry before 19:30 on Jul 3." },
  { id: "e6", task: "Aquaria Thermal Spa Booking", subtext: "Verify reservation for the lakeside thermal spa in Sirmione on Jun 29." }
];

export default function EssentialsChecklist() {
  const isHydrated = useIsHydrated();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  // Load from localStorage on client side mount
  useEffect(() => {
    if (isHydrated) {
      try {
        const saved = localStorage.getItem("tripiagent-essentials-checklist");
        if (saved) {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            setCheckedItems(parsed);
          }, 0);
        }
      } catch (e) {
        console.error("Failed to load checklist state", e);
      }
    }
  }, [isHydrated]);

  // Save to localStorage whenever checked state changes
  const toggleItem = (id: string) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    try {
      localStorage.setItem("tripiagent-essentials-checklist", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save checklist state", e);
    }
  };

  if (!isHydrated) {
    return (
      <Card className="border border-outline-variant/30 bg-card/50">
        <CardContent className="p-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading checklist...</span>
        </CardContent>
      </Card>
    );
  }

  const completedCount = ESSENTIALS_ITEMS.filter((item) => !!checkedItems[item.id]).length;
  const progressPercent = Math.round((completedCount / ESSENTIALS_ITEMS.length) * 100);

  return (
    <Card className="border border-outline-variant/30 bg-card overflow-hidden shadow-sm transition-all duration-300">
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/5 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary dark:text-[#86df72]" />
            <CardTitle className="text-sm font-extrabold tracking-tight">Trip Essentials Checklist</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground">
            Critical documents, permits, and safety checks
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-primary dark:text-[#86df72] bg-primary/5 dark:bg-[#86df72]/10 px-2 py-0.5 rounded-full border border-primary/10 dark:border-[#86df72]/10">
            {completedCount}/{ESSENTIALS_ITEMS.length}
          </span>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-4 pt-0 space-y-4 animate-in fade-in duration-200">
          {/* Progress Tracker */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Preparation Progress</span>
              <span className="text-primary dark:text-[#86df72]">{progressPercent}% Ready</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#006400] dark:bg-[#86df72] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-2.5">
            {ESSENTIALS_ITEMS.map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex gap-3 items-start p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isChecked
                      ? "border-primary/10 bg-primary/5 dark:border-[#86df72]/10 dark:bg-[#86df72]/5 opacity-80"
                      : "border-outline-variant/30 bg-background/50 hover:bg-muted/10 hover:border-outline-variant"
                  }`}
                >
                  <button 
                    type="button" 
                    className="shrink-0 mt-0.5 focus:outline-none"
                    aria-label={isChecked ? `Uncheck ${item.task}` : `Check ${item.task}`}
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4.5 w-4.5 text-primary dark:text-[#86df72]" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-muted-foreground/60" />
                    )}
                  </button>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold leading-tight ${
                      isChecked ? "line-through text-muted-foreground" : "text-foreground"
                    }`}>
                      {item.task}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      {item.subtext}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
