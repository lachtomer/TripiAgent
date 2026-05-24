"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useTripStore } from "@/stores/tripStore";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "What's near me?",
  "Find lunch under €15",
  "Plan my afternoon",
  "Skip the line tips",
];

export default function ChatInterface() {
  const [input, setInput] = useState("");

  // isActive=true: this component is mounted = chat tab is open
  const { messages, loading, streamStarted, sendMessage } = useChat();

  const pendingPrompt = useTripStore((s) => s.pendingPrompt);
  const clearPendingPrompt = useTripStore((s) => s.clearPendingPrompt);
  const firedRef = useRef(false);

  // Scroll sentinel
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fire pendingPrompt exactly once on mount
  useEffect(() => {
    if (pendingPrompt && !firedRef.current) {
      firedRef.current = true;
      clearPendingPrompt();
      sendMessage(pendingPrompt);
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
    sendMessage(prompt);
  };

  // Show typing dots only while waiting for the FIRST stream chunk
  const showTypingDots = loading && !streamStarted;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4.5 pb-36 pt-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] text-center p-6 text-muted-foreground animate-in fade-in duration-300">
            <div className="h-14 w-14 rounded-full bg-primary/5 dark:bg-[#86df72]/10 border border-primary/10 dark:border-[#86df72]/10 flex items-center justify-center mb-3.5 shadow-sm">
              <Bot className="h-7 w-7 text-[#006400] dark:text-[#86df72] animate-pulse" />
            </div>
            <h2 className="font-extrabold text-sm text-foreground">Ask TripiAgent travel guide</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-normal">
              Get recommendations, translations, and packing advice for Italy.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
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
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-300 border",
                    isUser
                      ? "bg-primary text-primary-foreground border-primary/20 rounded-br-none"
                      : "bg-card text-foreground border-outline-variant/30 rounded-bl-none"
                  )}
                >
                  {isUser ? (
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                  ) : (
                    // Render assistant messages as markdown
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none leading-relaxed
                        prose-p:my-1 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                        prose-headings:text-foreground prose-a:text-[#006400] dark:prose-a:text-[#86df72]
                        prose-strong:text-foreground prose-code:text-[#006400] dark:prose-code:text-[#86df72]
                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text || ""}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing dots — only while awaiting first stream chunk */}
        {showTypingDots && (
          <div className="flex items-center gap-2 mr-auto max-w-[85%] animate-in fade-in duration-200">
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
      <div className="absolute bottom-0 left-0 right-0 p-1 pb-2 flex flex-col gap-2 z-20 bg-gradient-to-t from-background via-background/90 to-transparent pt-6 pointer-events-none">
        
        {/* Quick-prompt chips */}
        <div className="pointer-events-auto flex gap-2 overflow-x-auto hide-scrollbar px-1 py-0.5">
          {QUICK_PROMPTS.map((prompt) => (
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
            placeholder="Ask where to go or translate something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-10.5 flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs sm:text-sm shadow-none focus:outline-none"
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
    </div>
  );
}
