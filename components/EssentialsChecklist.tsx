"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Square, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTranslation } from "@/lib/translations";

interface ChecklistItem {
  id: string;
  task: string;
  subtext: string;
}

const ESSENTIALS_ITEMS: ChecklistItem[] = [
  { id: "e6", task: "Aquaria Thermal Spa Booking", subtext: "Verify reservation for the lakeside thermal spa in Sirmione on Thu Jul 2." },
  { id: "e7", task: "Gardaland Tickets", subtext: "Buy online for Mon Jun 29. Consider Fast Pass if peak season." },
  { id: "e8", task: "Taverna del Silenzio Reservation", subtext: "Book lunch in Borghetto for Sat Jun 27 — famous tortellini, fills up in summer." },
  { id: "e9", task: "Manerba Boat Rental", subtext: "Reserve self-drive boat for Sun Jun 28 at 09:30 (no license, up to 40 HP)." },
];

export default function EssentialsChecklist() {
  const isHydrated = useIsHydrated();
  const { t } = useTranslation();
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
          <span className="text-xs text-muted-foreground">{t.loadingChecklist || "Loading checklist..."}</span>
        </CardContent>
      </Card>
    );
  }

  const completedCount = ESSENTIALS_ITEMS.filter((item) => !!checkedItems[item.id]).length;
  const progressPercent = Math.round((completedCount / ESSENTIALS_ITEMS.length) * 100);

  return (
    <Card dir="ltr" className="border border-outline-variant/30 bg-card overflow-hidden shadow-sm transition-all duration-300">
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/5 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary dark:text-[#86df72]" />
            <CardTitle className="text-sm font-extrabold tracking-tight">{t.essentialsTitle}</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground">
            {t.essentialsDesc}
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
              <span>{t.prepProgress}</span>
              <span className="text-primary dark:text-[#86df72]">
                {(t.percentReady || "{progress}% Ready").replace("{progress}", progressPercent.toString())}
              </span>
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
              const taskKey = `item_${item.id}_task` as keyof typeof t;
              const subtextKey = `item_${item.id}_subtext` as keyof typeof t;
              const taskText = (t[taskKey] as string) || item.task;
              const subtextText = (t[subtextKey] as string) || item.subtext;

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
                    aria-label={isChecked ? `Uncheck ${taskText}` : `Check ${taskText}`}
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4.5 w-4.5 text-primary dark:text-[#86df72]" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-muted-foreground/60" />
                    )}
                  </button>
                  <div className="space-y-0.5 text-start">
                    <p className={`text-xs font-bold leading-tight ${
                      isChecked ? "line-through text-muted-foreground" : "text-foreground"
                    }`}>
                      {taskText}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      {subtextText}
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

