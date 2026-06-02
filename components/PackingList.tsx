"use client";

import { useState, useCallback } from "react";
import {
  CheckSquare,
  Square,
  Luggage,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { PackingItem } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/translations";

// --- Helpers ---
const CATEGORY_ORDER = [
  "Essentials",
  "Documents",
  "Clothing",
  "Electronics",
  "Health & Comfort",
  "Activities",
  "Miscellaneous",
];

function groupByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  const groups: Record<string, PackingItem[]> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

function sortedCategories(groups: Record<string, PackingItem[]>): string[] {
  const ordered = CATEGORY_ORDER.filter((c) => groups[c]);
  const extra = Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c));
  return [...ordered, ...extra];
}

// --- Component ---
export default function PackingList() {
  const packingList = useTripStore((s) => s.packingList);
  const togglePackingItem = useTripStore((s) => s.togglePackingItem);
  const setPackingList = useTripStore((s) => s.setPackingList);
  const itinerary = useTripStore((s) => s.itinerary);
  const tripStartDate = useTripStore((s) => s.tripStartDate);
  const location = useTripStore((s) => s.location);
  const currentUser = useTripStore((s) => s.currentUser);

  // Common packing store
  const commonPackingList = useTripStore((s) => s.commonPackingList);
  const commonCheckmarks = useTripStore((s) => s.commonCheckmarks);
  const toggleCommonCheckmark = useTripStore((s) => s.toggleCommonCheckmark);
  const addCommonPackingItem = useTripStore((s) => s.addCommonPackingItem);
  const removeCommonPackingItem = useTripStore((s) => s.removeCommonPackingItem);

  const isHydrated = useIsHydrated();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // State for adding a new common item
  const [addingCommon, setAddingCommon] = useState(false);
  const [newCommonItemName, setNewCommonItemName] = useState("");

  const buildItinerarySummary = useCallback((): string => {
    if (!itinerary || itinerary.length === 0) return "";
    return itinerary
      .map((day) => {
        const acts = day.activities.map((a) => a.title).join(", ");
        return `${day.date || `Day ${day.dayNumber}`}: ${acts}`;
      })
      .join("; ");
  }, [itinerary]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      let weatherPayload = null;
      if (location?.coords) {
        try {
          const wRes = await fetch(`/api/weather?lat=${location.coords.latitude}&lng=${location.coords.longitude}`);
          if (wRes.ok) {
            const wJson = await wRes.json();
            weatherPayload = {
              temp: wJson.temp ?? 24,
              condition: wJson.condition ?? "Sunny",
            };
          }
        } catch (e) {
          console.warn("Failed to fetch weather for packing list", e);
        }
      }

      const res = await fetch("/api/pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerarySummary: buildItinerarySummary(),
          tripStartDate: tripStartDate ?? null,
          cityName: location?.cityName ?? null,
          durationDays: itinerary?.length ?? 5,
          weather: weatherPayload,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data: { items: PackingItem[] } = await res.json();
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("AI returned an empty list. Please try again.");
      }
      setPackingList(data.items);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddItem = (category: string) => {
    const name = newItemName.trim();
    if (!name) return;
    const newItem: PackingItem = {
      id: `manual-${Date.now()}`,
      name,
      category,
      checked: false,
    };
    setPackingList([...packingList, newItem]);
    setNewItemName("");
    setAddingCategory(null);
  };

  const handleDeleteItem = (id: string) => {
    setPackingList(packingList.filter((i) => i.id !== id));
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setPackingList([]);
    setConfirmClear(false);
  };

  const handleCheckAll = (category: string, items: PackingItem[], check: boolean) => {
    const ids = new Set(items.map((i) => i.id));
    setPackingList(
      packingList.map((i) => (ids.has(i.id) ? { ...i, checked: check } : i))
    );
  };

  if (!isHydrated) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-4 flex items-center justify-center h-24">
          <span className="text-xs text-muted-foreground">{t.loadingPacking}</span>
        </CardContent>
      </Card>
    );
  }

  const myCheckedIds = commonCheckmarks[currentUser] ?? [];
  const groups = groupByCategory(packingList);
  const categories = sortedCategories(groups);

  return (
    <div className="space-y-6 pb-24">
      {/* ── SECTION 1: Group Essentials (common) ── */}
      <section data-testid="common-packing-section" className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Users className="h-4 w-4 text-[#006400] dark:text-[#86df72]" />
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">
            {t.commonPackingSection}
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {myCheckedIds.filter((id) => commonPackingList.some((i) => i.id === id)).length}/{commonPackingList.length}
          </span>
        </div>

        <Card className="border border-border bg-card overflow-hidden">
          <CardContent className="pt-2 pb-2 divide-y divide-border/60">
            {commonPackingList.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground text-center">{t.noItemsYet}</p>
            ) : (
              commonPackingList.map((item) => {
                const isChecked = myCheckedIds.includes(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between py-3 group">
                    <button
                      onClick={() => toggleCommonCheckmark(item.id)}
                      className="flex items-center gap-3 flex-1 text-start select-none focus:outline-none"
                      aria-checked={isChecked}
                      role="checkbox"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 text-[#006400] shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn("text-sm transition-all", isChecked ? "line-through text-muted-foreground" : "font-medium text-foreground")}>
                        {item.name}
                      </span>
                    </button>
                    <button
                      onClick={() => removeCommonPackingItem(item.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:outline-none focus:opacity-100"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}

            {/* Add common item inline */}
            {addingCommon ? (
              <div className="py-3 flex items-center gap-2">
                <Input
                  placeholder={t.itemNamePlaceholder}
                  value={newCommonItemName}
                  onChange={(e) => setNewCommonItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCommonItemName.trim()) {
                      addCommonPackingItem({ name: newCommonItemName.trim(), category: "Essentials", checked: false });
                      setNewCommonItemName("");
                      setAddingCommon(false);
                    }
                    if (e.key === "Escape") { setAddingCommon(false); setNewCommonItemName(""); }
                  }}
                  className="h-8 text-xs flex-1"
                  autoFocus
                  dir="auto"
                />
                <Button
                  size="sm"
                  disabled={!newCommonItemName.trim()}
                  onClick={() => {
                    addCommonPackingItem({ name: newCommonItemName.trim(), category: "Essentials", checked: false });
                    setNewCommonItemName("");
                    setAddingCommon(false);
                  }}
                  className="h-8 text-xs bg-[#006400] text-white hover:bg-[#004d00]"
                >
                  {t.addBtn}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setAddingCommon(false); setNewCommonItemName(""); }} className="h-8 text-xs">
                  {t.cancelBtn}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setAddingCommon(true)}
                className="w-full flex items-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-[#006400] transition-colors focus:outline-none"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.addBtn}</span>
              </button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {t.personalPackingSection}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── SECTION 2: My Items (personal) ── */}
      <section data-testid="personal-packing-section" className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <User className="h-4 w-4 text-[#006400] dark:text-[#86df72]" />
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">
            {t.personalPackingSection}
          </h2>
        </div>

        {/* Header Card: progress + generate */}
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Luggage className="h-4 w-4 text-[#006400]" />
              {t.packingChecklist}
            </CardTitle>
            <CardDescription>
              {packingList.length === 0
                ? t.packingDescription
                : t.packedCount.replace("{checked}", String(packingList.filter((i) => i.checked).length)).replace("{total}", String(packingList.length))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {packingList.length > 0 && (
              <div className="space-y-1">
                {(() => {
                  const checked = packingList.filter((i) => i.checked).length;
                  const total = packingList.length;
                  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;
                  return (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t.progressPercent.replace("{progress}", String(progress))}</span>
                        <span className={cn(progress === 100 ? "text-[#006400] font-semibold" : "")}>
                          {progress === 100 ? t.allPacked : t.remainingCount.replace("{count}", String(total - checked))}
                        </span>
                      </div>
                      <div id="packing-progress-bar" className="h-2 w-full bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-[#006400] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button id="generate-packing-btn" size="sm" disabled={isGenerating} onClick={handleGenerate} className="h-8 text-xs bg-[#006400] text-white hover:bg-[#004d00] gap-1.5 flex-1">
                {isGenerating ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" />{t.generating}</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" />{packingList.length > 0 ? t.regenerateWithAi : t.generateWithAi}</>
                )}
              </Button>
              {packingList.length > 0 && (
                <Button id="clear-packing-btn" size="sm" variant="outline" onClick={handleClearAll} className={cn("h-8 text-xs gap-1.5", confirmClear ? "border-destructive text-destructive hover:bg-destructive/5" : "border-border text-muted-foreground hover:text-foreground")}>
                  <X className="h-3.5 w-3.5" />
                  {confirmClear ? t.confirmClear : t.clearAll}
                </Button>
              )}
            </div>
            {generateError && (
              <p id="generate-error-msg" className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{generateError}</p>
            )}
          </CardContent>
        </Card>

        {/* Per-category cards */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {categories.map((category) => {
              const items = groups[category];
              const allChecked = items.every((i) => i.checked);
              const someChecked = items.some((i) => i.checked);
              const isCollapsed = !!collapsedCategories[category];
              const isAddingHere = addingCategory === category;
              const categoryTranslated = t[category as keyof typeof t] || category;

              return (
                <Card key={category} className="border border-border bg-card overflow-hidden">
                  <div className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
                    <button
                      id={`category-header-${category.replace(/\s+/g, "-").toLowerCase()}`}
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 flex-1 text-start focus:outline-none"
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="text-sm font-semibold text-foreground">{String(categoryTranslated)}</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", allChecked ? "bg-[#006400]/15 text-[#006400]" : someChecked ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
                        {items.filter((i) => i.checked).length}/{items.length}
                      </span>
                    </button>
                    <button
                      id={`check-all-${category.replace(/\s+/g, "-").toLowerCase()}`}
                      onClick={() => handleCheckAll(category, items, !allChecked)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-[#006400] transition-colors px-1 py-0.5 shrink-0 focus:outline-none"
                      title={allChecked ? t.uncheckAll : t.checkAll}
                    >
                      {allChecked ? t.uncheckAll : t.checkAll}
                    </button>
                  </div>

                  {!isCollapsed && (
                    <CardContent className="pt-0 pb-2 divide-y divide-border/60">
                      {items.map((item) => (
                        <div key={item.id} id={`pack-item-${item.id}`} className="flex items-center justify-between py-3 group">
                          <button
                            id={`toggle-item-${item.id}`}
                            onClick={() => togglePackingItem(item.id)}
                            className="flex items-center gap-3 flex-1 text-start select-none focus:outline-none"
                            aria-checked={item.checked}
                            role="checkbox"
                          >
                            {item.checked ? <CheckSquare className="h-5 w-5 text-[#006400] shrink-0" /> : <Square className="h-5 w-5 text-muted-foreground shrink-0" />}
                            <span dir="ltr" className={cn("text-sm transition-all", item.checked ? "line-through text-muted-foreground" : "font-medium text-foreground")}>
                              {item.name}
                            </span>
                          </button>
                          <button
                            id={`delete-pack-item-${item.id}`}
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:outline-none focus:opacity-100"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {isAddingHere ? (
                        <div id={`add-item-form-${category.replace(/\s+/g, "-").toLowerCase()}`} className="py-3 flex items-center gap-2">
                          <Input
                            id={`new-item-input-${category.replace(/\s+/g, "-").toLowerCase()}`}
                            placeholder={t.itemNamePlaceholder}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddItem(category);
                              if (e.key === "Escape") { setAddingCategory(null); setNewItemName(""); }
                            }}
                            className="h-8 text-xs flex-1"
                            autoFocus
                            dir="auto"
                          />
                          <Button id={`add-item-submit-${category.replace(/\s+/g, "-").toLowerCase()}`} size="sm" onClick={() => handleAddItem(category)} disabled={!newItemName.trim()} className="h-8 text-xs bg-[#006400] text-white hover:bg-[#004d00]">
                            {t.addBtn}
                          </Button>
                          <Button id={`add-item-cancel-${category.replace(/\s+/g, "-").toLowerCase()}`} size="sm" variant="ghost" onClick={() => { setAddingCategory(null); setNewItemName(""); }} className="h-8 text-xs">
                            {t.cancelBtn}
                          </Button>
                        </div>
                      ) : (
                        <button
                          id={`add-item-trigger-${category.replace(/\s+/g, "-").toLowerCase()}`}
                          onClick={() => { setAddingCategory(category); setNewItemName(""); }}
                          className="w-full flex items-center gap-2 py-2.5 text-xs text-muted-foreground hover:text-[#006400] transition-colors focus:outline-none"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{t.addItemToCategory.replace("{category}", String(categoryTranslated))}</span>
                        </button>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border border-dashed border-border bg-card/50">
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <Luggage className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.noItemsYet}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{t.noItemsYetDescription}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
