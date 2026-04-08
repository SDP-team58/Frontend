"use client"

import { useEffect, useRef, useState } from "react"

import ChatWindow from "@/components/chat-window"
import Header from "@/components/header"
import AnalysisCard from "@/components/analysis-card"
import type { AnalysisData } from "@/components/analysis-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, MoreHorizontal, MessageSquare, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  analysisData?: AnalysisData
  analysisMode?: "baseline" | "counterfactual"
}

interface ChatThread {
  id: string
  preview: string
  createdAt: string
  messages: Message[]
  mode: "baseline" | "counterfactual"
}

const initialAssistantMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Welcome to GENIE. Select a date and run a baseline analysis, or switch to counterfactual mode to explore alternative scenarios.",
}

function formatThreadDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function buildDateRange(endDate: Date) {
  const end = new Date(endDate)
  const start = new Date(end)
  start.setDate(start.getDate() - 14)

  const format = (d: Date) => d.toISOString().split("T")[0]

  return {
    start_date: format(start),
    end_date: format(end),
  }
}

function buildPreview(text: string) {
  return text.length > 42 ? `${text.slice(0, 42)}...` : text
}

function formatAnalysisReply(reply: AnalysisData) {
  return `S&P 500 Price: $${reply.val_sp500_price}\nOil Price: $${reply.val_oil_price}\nUS Treasury 10Y Yield: ${reply.val_us_treasury_10y}%\nVIX Volatility Index: ${reply.val_vix_volatility}\nGrowth Regime: ${reply.nar_growth_regime}\nPolicy Stance: ${reply.nar_policy_stance}\nMarket Sentiment: ${reply.nar_market_sentiment}`
}

function buildRequestSummary(
  selectedDate: Date,
  chatMode: "baseline" | "counterfactual",
  counterfactualText: string
) {
  const dateLabel = formatDisplayDate(selectedDate)
  if (chatMode === "counterfactual") {
    return `Counterfactual analysis for ${dateLabel}\nScenario: ${counterfactualText.trim()}`
  }
  return `Baseline analysis for ${dateLabel}`
}

export default function MainApp({ user }: { user: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [chatMode, setChatMode] = useState<"baseline" | "counterfactual">("baseline")
  const [counterfactualText, setCounterfactualText] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSelectThread = (threadId: string) => {
    const thread = chatHistory.find((t) => t.id === threadId)
    if (!thread) return

    setOpenMenuThreadId(null)
    setActiveThreadId(threadId)
    setMessages(thread.messages)
    setIsLoading(false)
  }

  const handleStartNewChat = () => {
    setOpenMenuThreadId(null)
    setActiveThreadId(null)
    setMessages([initialAssistantMessage])
    setIsLoading(false)
    setSelectedDate(null)
    setChatMode("baseline")
    setCounterfactualText("")
  }

  const handleDeleteThread = (threadId: string) => {
    setChatHistory((prev) => prev.filter((thread) => thread.id !== threadId))
    setOpenMenuThreadId(null)

    if (activeThreadId === threadId) {
      setActiveThreadId(null)
      setMessages([initialAssistantMessage])
      setIsLoading(false)
    }
  }

  const sendBackendMessage = async () => {
    if (!selectedDate) return
    if (chatMode === "counterfactual" && !counterfactualText.trim()) return

    const userSummary = buildRequestSummary(selectedDate, chatMode, counterfactualText)
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: userSummary,
    }
    const threadId = `${Date.now()}-thread`
    const newThread: ChatThread = {
      id: threadId,
      preview: buildPreview(userSummary),
      createdAt: new Date().toISOString(),
      messages: [userMessage],
      mode: chatMode,
    }

    setChatHistory((prev) => [newThread, ...prev])
    setActiveThreadId(threadId)
    setMessages([userMessage])
    setIsLoading(true)

    try {
      const dateRange = buildDateRange(selectedDate)
      const endpoint =
        chatMode === "counterfactual"
          ? "http://localhost:8000/chat/counterfactual"
          : "http://localhost:8000/chat"

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
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : `Backend request failed with status ${response.status}.`
        )
      }
      if (!data?.reply) {
        throw new Error("Backend returned an invalid response.")
      }

      const reply = data.reply as AnalysisData
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: formatAnalysisReply(reply),
        analysisData: reply,
        analysisMode: chatMode,
      }

      setChatHistory((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage] }
            : thread
        )
      )
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: err instanceof Error ? err.message : "Error contacting backend.",
      }

      setChatHistory((prev) =>
        prev.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage] }
            : thread
        )
      )
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Header user={user} />

      <div className="flex flex-1 min-h-0 overflow-hidden gap-0">
        {/* ---- Sidebar ---- */}
        <div className="flex w-72 shrink-0 min-h-0 flex-col border-r bg-muted/20">
          <div className="shrink-0 p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNewChat}
              className="w-full justify-start gap-2"
            >
              <Plus className="size-4" />
              New Analysis
            </Button>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                    <MessageSquare className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No analyses yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Pick a date to get started
                  </p>
                </div>
              ) : (
                chatHistory.map((thread) => (
                  <div
                    key={thread.id}
                    className={[
                      "group relative rounded-lg px-3 py-2.5 transition-colors cursor-pointer",
                      activeThreadId === thread.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/60",
                    ].join(" ")}
                    onClick={() => handleSelectThread(thread.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelectThread(thread.id)
                    }}
                  >
                    <div className="flex items-center gap-2 pr-8">
                      <Badge
                        variant={thread.mode === "counterfactual" ? "default" : "secondary"}
                        className="shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {thread.mode === "counterfactual" ? "CF" : "BL"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatThreadDate(thread.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm truncate">{thread.preview}</p>

                    <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuThreadId((prev) =>
                            prev === thread.id ? null : thread.id
                          )
                        }}
                        aria-label="Open chat options"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>

                    {openMenuThreadId === thread.id ? (
                      <div className="absolute right-1 top-9 z-20 rounded-md border bg-popover p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteThread(thread.id)
                          }}
                          className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
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

        {/* ---- Main chat area ---- */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground leading-relaxed whitespace-pre-wrap shadow-sm">
                        {m.content}
                      </div>
                    </div>
                  )
                }

                if (m.analysisData) {
                  return (
                    <div key={m.id} className="flex justify-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                        <Bot className="size-4 text-primary" />
                      </div>
                      <AnalysisCard
                        data={m.analysisData}
                        mode={m.analysisMode}
                      />
                    </div>
                  )
                }

                return (
                  <div key={m.id} className="flex justify-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                )
              })}

              {isLoading ? (
                <div className="flex justify-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <span className="size-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
                        <span className="size-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                        <span className="size-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span>Analyzing macro environment&hellip;</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input controls */}
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
  )
}
