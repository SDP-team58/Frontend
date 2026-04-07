"use client"

import { useEffect, useRef, useState } from "react"

import ChatWindow from "@/components/chat-window"
import Header from "@/components/header"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatThread {
  id: string
  preview: string
  createdAt: string
  messages: Message[]
}

interface AnalysisReply {
  val_sp500_price: number
  val_oil_price: number
  val_us_treasury_10y: number
  val_vix_volatility: number
  nar_growth_regime: string
  nar_policy_stance: string
  nar_market_sentiment: string
}

const initialAssistantMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Select a date to run the baseline analysis. Switch to counterfactual mode if you want to add a counterfactual overlay.",
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

function formatAnalysisReply(reply: AnalysisReply) {
  return `
    S&P 500 Price: $${reply.val_sp500_price}
    Oil Price: $${reply.val_oil_price}
    US Treasury 10Y Yield: ${reply.val_us_treasury_10y}%
    VIX Volatility Index: ${reply.val_vix_volatility}
    Growth Regime: ${reply.nar_growth_regime}
    Policy Stance: ${reply.nar_policy_stance}
    Market Sentiment: ${reply.nar_market_sentiment}
  `.trim()
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

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: formatAnalysisReply(data.reply as AnalysisReply),
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
    <div className="flex h-screen flex-col bg-background">
      <Header user={user} />

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex w-80 shrink-0 min-h-0 flex-col rounded-lg border bg-background">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Chat History</h2>
            <button
              type="button"
              onClick={handleStartNewChat}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-muted"
            >
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {chatHistory.length === 0 ? (
              <div className="rounded-md border px-3 py-4 text-sm text-muted-foreground">
                No analyses yet. Pick a date to run the baseline flow or add a counterfactual.
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((thread) => (
                  <div
                    key={thread.id}
                    className={[
                      "group relative rounded-md border transition hover:bg-muted",
                      activeThreadId === thread.id ? "bg-muted" : "bg-background",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectThread(thread.id)}
                      className="block w-full pr-12 px-3 py-3 text-left"
                    >
                      <div className="text-xs text-muted-foreground">
                        {formatThreadDate(thread.createdAt)}
                      </div>
                      <div className="mt-1 text-sm">{thread.preview}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuThreadId((prev) =>
                          prev === thread.id ? null : thread.id
                        )
                      }
                      className="absolute right-2 top-2 rounded px-2 py-1 text-sm text-muted-foreground opacity-0 transition hover:bg-background group-hover:opacity-100"
                      aria-label="Open chat options"
                    >
                      ⋯
                    </button>

                    {openMenuThreadId === thread.id ? (
                      <div className="absolute right-2 top-10 z-10 rounded-md border bg-background p-1 shadow-md">
                        <button
                          type="button"
                          onClick={() => handleDeleteThread(thread.id)}
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          Delete chat
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              onSendMessage={sendBackendMessage}
              isLoading={isLoading}
              chatEndRef={chatEndRef}
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
    </div>
  )
}
