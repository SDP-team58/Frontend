"use client";

import { useEffect, useRef, useState } from "react";

import ChatWindow from "@/components/chat-window";
import Header from "@/components/header";
import AnalysisCard from "@/components/analysis-card";
import type { AnalysisData } from "@/components/analysis-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MoreHorizontal, Activity, Bot, Zap, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysisData?: AnalysisData;
  analysisMode?: "baseline" | "counterfactual";
}

interface ChatThread {
  id: string;
  preview: string;
  createdAt: string;
  messages: Message[];
  mode: "baseline" | "counterfactual";
}

const initialAssistantMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Welcome to GENIE. Select a date to run the default 10-sample ensemble, or switch to counterfactual mode to compare an alternate scenario against that consensus.",
};

function formatThreadDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildDateRange(endDate: Date) {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - 14);
  const format = (d: Date) => d.toISOString().split("T")[0];
  return {
    start_date: format(start),
    end_date: format(end),
  };
}

function buildPreview(text: string) {
  return text.length > 42 ? `${text.slice(0, 42)}...` : text;
}

function formatAnalysisReply(response: AnalysisData) {
  const { reply, ensemble } = response;
  const confidenceLine = ensemble
    ? `Confidence: ${ensemble.overall_confidence_score.toFixed(1)}% (${ensemble.confidence_label})`
    : "Confidence: n/a";

  return `${confidenceLine}\nS&P 500 Price: $${reply.val_sp500_price}\nOil Price: $${reply.val_oil_price}\nUS Treasury 10Y Yield: ${reply.val_us_treasury_10y}%\nVIX Volatility Index: ${reply.val_vix_volatility}\nGrowth Regime: ${reply.nar_growth_regime}\nPolicy Stance: ${reply.nar_policy_stance}\nMarket Sentiment: ${reply.nar_market_sentiment}`;
}

function buildRequestSummary(
  selectedDate: Date,
  chatMode: "baseline" | "counterfactual",
  counterfactualText: string,
) {
  const dateLabel = formatDisplayDate(selectedDate);
  if (chatMode === "counterfactual") {
    return `Counterfactual analysis for ${dateLabel}\nScenario: ${counterfactualText.trim()}`;
  }
  return `Baseline analysis for ${dateLabel}`;
}

function StateDropdown({ data }: { data: AnalysisData }) {
  const [open, setOpen] = useState(false);
  const reply = data.reply;

  const rows: { label: string; value: string }[] = [
    { label: "S&P 500", value: `$${reply.val_sp500_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "Crude Oil", value: `$${reply.val_oil_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
    { label: "10Y Treasury", value: `${reply.val_us_treasury_10y}%` },
    { label: "VIX", value: String(reply.val_vix_volatility) },
    { label: "Growth Regime", value: reply.nar_growth_regime },
    { label: "Policy Stance", value: reply.nar_policy_stance },
    { label: "Market Sentiment", value: reply.nar_market_sentiment },
  ];

  return (
    <div className="mb-2 w-full max-w-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <ChevronDown
          className={[
            "size-3 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
        Current state
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border/30 bg-muted/20 ring-1 ring-border/10 divide-y divide-border/20 overflow-hidden">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-3.5 py-2">
              <span className="text-[11px] text-muted-foreground/60 font-medium">
                {row.label}
              </span>
              <span className="text-[11px] font-mono text-foreground/80">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MainApp({ user }: { user: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([
    initialAssistantMessage,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [chatMode, setChatMode] = useState<"baseline" | "counterfactual">(
    "baseline",
  );
  const [counterfactualText, setCounterfactualText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectThread = (threadId: string) => {
    const thread = chatHistory.find((t) => t.id === threadId);
    if (!thread) return;
    setOpenMenuThreadId(null);
    setActiveThreadId(threadId);
    setMessages(thread.messages);
    setIsLoading(false);
  };

  const handleStartNewChat = () => {
    setOpenMenuThreadId(null);
    setActiveThreadId(null);
    setMessages([initialAssistantMessage]);
    setIsLoading(false);
    setSelectedDate(null);
    setChatMode("baseline");
    setCounterfactualText("");
  };

  const handleDeleteThread = (threadId: string) => {
    setChatHistory((prev) => prev.filter((thread) => thread.id !== threadId));
    setOpenMenuThreadId(null);
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      setMessages([initialAssistantMessage]);
      setIsLoading(false);
    }
  };

  const sendBackendMessage = async () => {
    if (!selectedDate) return;
    if (chatMode === "counterfactual" && !counterfactualText.trim()) return;

    const userSummary = buildRequestSummary(
      selectedDate,
      chatMode,
      counterfactualText,
    );
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: userSummary,
    };
    const threadId = `${Date.now()}-thread`;
    const newThread: ChatThread = {
      id: threadId,
      preview: buildPreview(userSummary),
      createdAt: new Date().toISOString(),
      messages: [userMessage],
      mode: chatMode,
    };

    setChatHistory((prev) => [newThread, ...prev]);
    setActiveThreadId(threadId);
    setMessages([userMessage]);
    setIsLoading(true);

    try {
      const dateRange = buildDateRange(selectedDate);
      const endpoint =
        chatMode === "counterfactual"
          ? "/api/chat/counterfactual"
          : "/api/chat";

      const payload =
        chatMode === "counterfactual"
          ? {
              date_range_start: dateRange.start_date,
              date_range_end: dateRange.end_date,
              counterfactual_text: counterfactualText.trim(),
            }
          : {
              date_range_start: dateRange.start_date,
              date_range_end: dateRange.end_date,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : `Backend request failed with status ${response.status}.`,
        );
      }
      if (!data?.reply) {
        throw new Error("Backend returned an invalid response.");
      }

      const analysis = data as AnalysisData;
      if (!analysis?.reply) {
        throw new Error("Backend returned an invalid response.");
      }
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: formatAnalysisReply(analysis),
        analysisData: analysis,
        analysisMode: chatMode,
      };

      setChatHistory((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage] }
            : thread,
        ),
      );
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content:
          err instanceof Error ? err.message : "Error contacting backend.",
      };

      setChatHistory((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage] }
            : thread,
        ),
      );
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background bg-noise">
      <Header user={user} />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <div className="flex w-64 shrink-0 min-h-0 flex-col border-r border-border/50 bg-sidebar">
          <div className="shrink-0 p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNewChat}
              className="w-full justify-start gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
            >
              <Plus className="size-4" />
              New Analysis
            </Button>
          </div>

          <div className="px-3 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
              History
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-2 pb-2 space-y-0.5">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 mb-3 ring-1 ring-border/50">
                    <Activity className="size-4 text-muted-foreground/60" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground/60">
                    No analyses yet
                  </p>
                </div>
              ) : (
                chatHistory.map((thread) => (
                  <div
                    key={thread.id}
                    className={[
                      "group relative rounded-lg px-3 py-2.5 transition-all duration-150 cursor-pointer",
                      activeThreadId === thread.id
                        ? "bg-primary/10 ring-1 ring-primary/20"
                        : "hover:bg-muted/40",
                    ].join(" ")}
                    onClick={() => handleSelectThread(thread.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleSelectThread(thread.id);
                    }}
                  >
                    <div className="flex items-center gap-2 pr-7">
                      <Badge
                        variant="outline"
                        className={[
                          "shrink-0 text-[9px] px-1.5 py-0 font-mono border",
                          thread.mode === "counterfactual"
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
                            : "border-primary/30 text-primary bg-primary/5",
                        ].join(" ")}
                      >
                        {thread.mode === "counterfactual" ? "CF" : "BL"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground/70 font-mono">
                        {formatThreadDate(thread.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-secondary-foreground/80 truncate leading-relaxed">
                      {thread.preview}
                    </p>

                    <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuThreadId((prev) =>
                            prev === thread.id ? null : thread.id,
                          );
                        }}
                        aria-label="Open chat options"
                        className="size-6 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>

                    {openMenuThreadId === thread.id ? (
                      <div className="absolute right-1 top-8 z-20 rounded-lg border border-border/50 bg-popover p-1 shadow-xl shadow-black/20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-6 py-8 space-y-5">
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary/15 ring-1 ring-primary/20 px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                if (m.analysisData) {
                  return (
                    <div key={m.id} className="flex justify-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 mt-1">
                        <Zap className="size-3.5 text-primary" />
                      </div>
                      <div className="flex flex-col w-full max-w-2xl">
                        <StateDropdown data={m.analysisData} />
                        <AnalysisCard data={m.analysisData} mode={m.analysisMode} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="flex justify-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 mt-1">
                      <Bot className="size-3.5 text-primary" />
                    </div>
                    <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-card ring-1 ring-border/50 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                );
              })}

              {isLoading ? (
                <div className="flex justify-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 mt-1">
                    <Zap className="size-3.5 text-primary animate-pulse-glow" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-card ring-1 ring-border/50 px-4 py-3.5">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs">
                        Running 10-model consensus analysis&hellip;
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={chatEndRef} />
            </div>
          </div>

          <ChatWindow
            onSendMessage={sendBackendMessage}
            isLoading={isLoading}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            chatMode={chatMode}
            onChatModeChange={setChatMode}
            counterfactualText={counterfactualText}
            onCounterfactualTextChange={setCounterfactualText}
          />
        </div>
      </div>
    </div>
  );
}
