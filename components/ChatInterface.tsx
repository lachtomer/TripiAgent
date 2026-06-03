"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useTripStore } from "@/stores/tripStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/translations";
import { isSafeExternalUrl } from "@/lib/urlSafety";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface ReplanData {
  type: "replan";
  dayNumber: number;
  activities: {
    time: string;
    title: string;
    description: string;
    locationName?: string;
  }[];
}

function parseReplanPayload(text: string): { cleanText: string; replan: ReplanData | null } {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data && data.type === "replan") {
        const cleanText = text.replace(jsonRegex, "").trim();
        return { cleanText, replan: data as ReplanData };
      }
    } catch {
      // JSON might be incomplete while streaming
    }
  }
  return { cleanText: text, replan: null };
}

const markdownLinkComponents = {
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href || !isSafeExternalUrl(href)) {
      return <span>{children}</span>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const { messages, loading, streamStarted, sendMessage } = useChat();
  const { t } = useTranslation();

  const pendingPrompt = useTripStore((s) => s.pendingPrompt);
  const clearPendingPrompt = useTripStore((s) => s.clearPendingPrompt);
  const itinerary = useTripStore((s) => s.itinerary);
  const replaceDayPlan = useTripStore((s) => s.replaceDayPlan);
  const setToast = useTripStore((s) => s.setToast);

  const firedRef = useRef(false);
  const [activeReplan, setActiveReplan] = useState<ReplanData | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Compare and apply proposed changes
  const originalDay = itinerary?.find((d) => d.dayNumber === activeReplan?.dayNumber);
  const originalActivities = originalDay?.activities || [];

  const quickPrompts = [
    t.quickPromptNearMe,
    t.quickPromptLunch,
    t.quickPromptAfternoon,
    t.quickPromptTips,
  ];

  const handleApplyReplan = () => {
    if (!activeReplan) return;

    const updatedActivities = activeReplan.activities.map((act) => ({
      id: crypto.randomUUID(),
      time: act.time,
      title: act.title,
      description: act.description,
      locationName: act.locationName,
    }));

    replaceDayPlan(activeReplan.dayNumber, updatedActivities);
    setToast({
      message: t.replanSuccessToast.replace("{day}", String(activeReplan.dayNumber)),
      type: "success",
    });
    setShowDrawer(false);
    setActiveReplan(null);
  };

  // Scroll sentinel
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fire pendingPrompt exactly once on mount
  useEffect(() => {
    if (pendingPrompt && !firedRef.current) {
      firedRef.current = true;
      clearPendingPrompt();
      sendMessage(pendingPrompt, { isQuickPrompt: true });
    }
  }, [pendingPrompt, clearPendingPrompt, sendMessage]);

  // Auto-scroll to bottom on every new message or stream chunk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleQuickPrompt = (prompt: string) => {
    if (loading) return;
    sendMessage(prompt, { isQuickPrompt: true });
  };

  // Show typing dots only while waiting for the FIRST stream chunk
  const showTypingDots = loading && !streamStarted;

  return (
    <div dir="ltr" className="flex-1 flex flex-col min-h-0 relative">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4.5 pb-36 pt-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] text-center p-6 text-muted-foreground animate-in fade-in duration-300">
            <div className="h-14 w-14 rounded-full bg-primary/5 dark:bg-[#86df72]/10 border border-primary/10 dark:border-[#86df72]/10 flex items-center justify-center mb-3.5 shadow-sm">
              <Bot className="h-7 w-7 text-[#006400] dark:text-[#86df72] animate-pulse" />
            </div>
            <h2 className="font-extrabold text-sm text-foreground">{t.chatTitle}</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-normal">
              {t.chatSubtitle}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            let displayMarkdown = msg.text;
            let replanData: ReplanData | null = null;
            if (!isUser) {
              const parsed = parseReplanPayload(msg.text);
              displayMarkdown = parsed.cleanText;
              replanData = parsed.replan;
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isUser ? "ms-auto flex-row-reverse" : "me-auto"
                )}
              >
                {/* Avatar Icon */}
                <div
                  className={cn(
                    "flex h-8.5 w-8.5 shrink-0 select-none items-center justify-center rounded-full border shadow-sm transition-all duration-300",
                    isUser 
                      ? "bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 border-none" 
                      : "bg-card border-outline-variant/30 text-[#006400] dark:text-[#86df72]"
                  )}
                >
                  {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>

                {/* Bubble Content */}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-300 border flex flex-col gap-2",
                    isUser
                      ? cn("bg-primary text-primary-foreground border-primary/20 rounded-br-none")
                      : cn("bg-card text-foreground border-outline-variant/30 rounded-bl-none")
                  )}
                >
                  {isUser ? (
                    <p dir="auto" className="leading-relaxed font-medium">{msg.text}</p>
                  ) : (
                    // Render assistant messages as markdown
                    <div
                      dir="auto"
                      className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-start
                        prose-p:my-1 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                        prose-headings:text-foreground prose-a:text-[#006400] dark:prose-a:text-[#86df72]
                        prose-strong:text-foreground prose-code:text-[#006400] dark:prose-code:text-[#86df72]
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownLinkComponents}
                      >
                        {displayMarkdown || ""}
                      </ReactMarkdown>
                    </div>
                  )}

                  {!isUser && replanData && (
                    <div className="mt-2.5 p-3 bg-[#006400]/5 dark:bg-[#86df72]/5 border border-[#006400]/15 dark:border-[#86df72]/15 rounded-xl space-y-2.5 text-start">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#006400] dark:text-[#86df72] uppercase tracking-wider">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{t.proposedReplanTitle.replace("{day}", String(replanData.dayNumber))}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {t.proposedReplanDescription.replace("{day}", String(replanData.dayNumber))}
                      </p>
                      <Button
                        size="sm"
                        id={`replan-review-btn-${msg.id}`}
                        onClick={() => {
                          setActiveReplan(replanData);
                          setShowDrawer(true);
                        }}
                        className="w-full text-[10px] font-bold bg-[#006400] text-white hover:bg-[#004d00] dark:bg-[#86df72] dark:text-zinc-950 dark:hover:bg-[#9df888] rounded-xl cursor-pointer py-1 h-7"
                      >
                        {t.reviewApplyBtn}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing dots — only while awaiting first stream chunk */}
        {showTypingDots && (
          <div className="flex items-center gap-2 me-auto max-w-[85%] animate-in fade-in duration-200">
            <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border bg-card border-outline-variant/30 text-[#006400] dark:text-[#86df72]">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="rounded-2xl rounded-bl-none bg-card border border-outline-variant/30 px-4.5 py-3 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006400] dark:bg-[#86df72]" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006400] dark:bg-[#86df72]" style={{ animationDelay: "160ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#006400] dark:bg-[#86df72]" style={{ animationDelay: "320ms" }} />
              </span>
            </div>
          </div>
        )}

        {/* Scroll sentinel */}
        <div ref={bottomRef} />
      </div>

      {/* Floating Controls Overlay at Bottom (above BottomNav) */}
      <div className="absolute bottom-0 inset-x-0 p-1 pb-2 flex flex-col gap-2 z-20 bg-gradient-to-t from-background via-background/90 to-transparent pt-6 pointer-events-none">
        
        {/* Quick-prompt chips */}
        <div className="pointer-events-auto flex gap-2 overflow-x-auto hide-scrollbar px-1 py-0.5">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              id={`quick-prompt-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
              onClick={() => handleQuickPrompt(prompt)}
              disabled={loading}
              className="shrink-0 rounded-full border border-outline-variant/40 bg-card/90 backdrop-blur-sm px-3.5 py-2 text-xs
                font-bold text-muted-foreground whitespace-nowrap
                hover:bg-[#006400]/5 hover:text-[#006400] hover:border-[#006400]/30
                dark:hover:bg-[#86df72]/5 dark:hover:text-[#86df72] dark:hover:border-[#86df72]/30
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="pointer-events-auto flex gap-2 items-center bg-card/95 dark:bg-zinc-900/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-1.5 shadow-lg">
          <Input
            id="chat-input"
            placeholder={t.chatPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-10.5 flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs sm:text-sm shadow-none focus:outline-none"
            dir="auto"
          />
          <Button
            id="chat-send-button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-9.5 w-9.5 bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 hover:bg-[#004d00] dark:hover:bg-[#9df888] rounded-xl shrink-0 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Replan Comparison Sheet Drawer */}
      <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
        <SheetContent side="bottom" className="h-[80vh] sm:max-w-xl mx-auto rounded-t-3xl border-t border-outline-variant/30 flex flex-col p-0">
          <SheetHeader className="p-4 border-b border-outline-variant/10 shrink-0">
            <SheetTitle className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              {t.replanTitle.replace("{day}", String(activeReplan?.dayNumber))}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
              {t.replanDescription}
            </SheetDescription>
          </SheetHeader>

          {/* Diff comparison section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {/* Before Column */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#992222] dark:text-red-400 uppercase tracking-wider">{t.currentActivitiesBefore}</h3>
                <div className="space-y-2">
                  {originalActivities.length === 0 ? (
                    <div className="p-3 border border-dashed border-outline-variant/35 rounded-xl text-center text-xs text-muted-foreground">
                      {t.noActivitiesScheduled}
                    </div>
                  ) : (
                    originalActivities.map((act, index) => (
                      <div key={act.id || index} className="p-3 bg-muted/15 border border-outline-variant/20 rounded-xl space-y-1">
                        <div dir="ltr" className="flex items-center gap-2 text-start">
                          <span className="text-[10px] font-bold text-[#992222] dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">{act.time}</span>
                          <span className="text-xs font-bold text-foreground">{act.title}</span>
                        </div>
                        <p dir="ltr" className="text-[11px] text-muted-foreground leading-normal text-start">{act.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Arrow separator */}
              <div className="flex justify-center py-0.5 shrink-0">
                <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">{t.proposingAdjustments}</span>
              </div>

              {/* After Column */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#006400] dark:text-[#86df72] uppercase tracking-wider">{t.proposedActivitiesAfter}</h3>
                <div className="space-y-2">
                  {activeReplan?.activities.map((act, index) => (
                    <div key={index} className="p-3 bg-[#006400]/5 dark:bg-[#86df72]/5 border border-[#006400]/15 dark:border-[#86df72]/15 rounded-xl space-y-1">
                      <div dir="ltr" className="flex items-center gap-2 text-start">
                        <span className="text-[10px] font-bold text-[#006400] dark:text-[#86df72] bg-[#006400]/10 dark:bg-[#86df72]/10 px-1.5 py-0.5 rounded-full">{act.time}</span>
                        <span className="text-xs font-bold text-foreground">{act.title}</span>
                      </div>
                      <p dir="ltr" className="text-[11px] text-muted-foreground leading-normal text-start">{act.description}</p>
                      {act.locationName && (
                        <p dir="ltr" className="text-[9px] text-muted-foreground font-semibold text-start">📍 {act.locationName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-outline-variant/10 bg-card/60 backdrop-blur-md gap-3 shrink-0 flex-row">
            <Button
              id="replan-cancel-btn"
              variant="outline"
              onClick={() => {
                setShowDrawer(false);
                setActiveReplan(null);
              }}
              className="flex-1 text-xs font-bold rounded-xl cursor-pointer"
            >
              {t.cancelBtn}
            </Button>
            <Button
              id="replan-apply-btn"
              onClick={handleApplyReplan}
              className="flex-1 text-xs font-bold bg-[#006400] text-white hover:bg-[#004d00] dark:bg-[#86df72] dark:text-zinc-950 dark:hover:bg-[#9df888] rounded-xl cursor-pointer shadow-md"
            >
              {t.confirmApplyBtn}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
