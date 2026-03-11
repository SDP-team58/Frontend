"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import ChatWindow from "@/components/chat-window"
import DevLog from "@/components/dev-log"
import { scenarios } from "@/lib/scenarios"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

interface ChatThread {
  id: string
  preview: string
  createdAt: string
  messages: Message[]
}

interface AnalysisReply {
  val_sp500_price: number,
  val_oil_price: number,
  val_us_treasury_10y: number,
  val_vix_volatility: number,
  nar_growth_regime: string
  nar_policy_stance: string
  nar_market_sentiment: string
}

const initialAssistantMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Welcome to GENIE, UConn's Macroeconomic World Model. Select a scenario below to explore how different economic shocks impact the economy.",
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

export default function MainApp({ user }: { user: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [chatHistory, setChatHistory] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  const [devLogOpen, setDevLogOpen] = useState(false)
  const [devRunId, setDevRunId] = useState(0)
  const runCounterRef = useRef(0)

  const pendingAssistantRef = useRef<{
    runId: number
    content: AnalysisReply | string
    threadId: string
  } | null>(null)

  const starterPrompts = scenarios.slice(0, 4).map((s) => s.prompt)

  const showStarterPrompts =
    !activeThreadId &&
    messages.length === 1 &&
    messages[0]?.id === initialAssistantMessage.id

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (devLogOpen) return
    scrollToBottom()
  }, [messages, devLogOpen])

  const startDevRun = () => {
    const next = ++runCounterRef.current
    setDevRunId(next)
    setDevLogOpen(true)
    return next
  }

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
    setInputValue("")
  }

  const handleDeleteThread = (threadId: string) => {
    setChatHistory((prev) => prev.filter((thread) => thread.id !== threadId))
    setOpenMenuThreadId(null)

    if (activeThreadId === threadId) {
      setActiveThreadId(null)
      setMessages([initialAssistantMessage])
      setIsLoading(false)
      pendingAssistantRef.current = null
    }
  }

  const handleDevLogDone = (finishedRunId: number) => {
    const pending = pendingAssistantRef.current
    if (!pending) return
    if (pending.runId !== finishedRunId) return

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: pending.content,
      isLoading: false,
    }

    setChatHistory((prev) =>
      prev.map((thread) =>
        thread.id === pending.threadId
          ? {
              ...thread,
              messages: [...thread.messages, assistantMessage],
            }
          : thread
      )
    )

    if (activeThreadId === pending.threadId) {
      setMessages((prev) => [...prev, assistantMessage])
    }

    setIsLoading(false)
    pendingAssistantRef.current = null
  }

  const handleScenarioClick = async (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return
  
    const runId = startDevRun()
  
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: scenario.prompt,
    }
  
    const threadId = `${Date.now()}-thread`
  
    const newThread: ChatThread = {
      id: threadId,
      preview: buildPreview(scenario.prompt),
      createdAt: new Date().toISOString(),
      messages: [userMessage],
    }
  
    setChatHistory((prev) => [newThread, ...prev])
    setActiveThreadId(threadId)
    setMessages([userMessage])
    setIsLoading(true)
  
    try {
      let dateRange = null
  
      if (selectedDate) {
        dateRange = buildDateRange(selectedDate)
      }
  
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: scenario.prompt,
          date_range_start: dateRange?.start_date,
          date_range_end: dateRange?.end_date,
        }),
      })
  
      const data = await response.json()

      const formattedReply = `
        S&P 500 Price: $${data.reply.val_sp500_price}
        Oil Price: $${data.reply.val_oil_price}
        US Treasury 10Y Yield: ${data.reply.val_us_treasury_10y}%
        VIX Volatility Index: ${data.reply.val_vix_volatility}
        Growth Regime: ${data.reply.nar_growth_regime}
        Policy Stance: ${data.reply.nar_policy_stance}
        Market Sentiment: ${data.reply.nar_market_sentiment}
      `.trim()
  
      pendingAssistantRef.current = {
        runId,
        content: formattedReply,
        threadId,
      }
    } catch (err) {
      console.error(err)
  
      pendingAssistantRef.current = {
        runId,
        content: "Error contacting backend.",
        threadId,
      }
    }
  }

  const handleStarterPromptClick = (prompt: string) => {
    const scenario = scenarios.find((s) => s.prompt === prompt)
    if (!scenario) return
    handleScenarioClick(scenario.id)
  }

  const handleSendMessage = () => {
    const userText = inputValue.trim()
    if (!userText) return
    setInputValue("")

    const matchingScenario = scenarios.find(
      (s) => s.prompt.toLowerCase() === userText.toLowerCase()
    )

    if (matchingScenario) {
      handleScenarioClick(matchingScenario.id)
      return
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: userText,
    }

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content:
        "This demo is in static mode right now. Please choose one of the preset scenarios to see an example output.",
    }

    const threadId = `${Date.now()}-thread`

    const newThread: ChatThread = {
      id: threadId,
      preview: buildPreview(userText),
      createdAt: new Date().toISOString(),
      messages: [userMessage, assistantMessage],
    }

    setChatHistory((prev) => [newThread, ...prev])
    setActiveThreadId(threadId)
    setMessages([userMessage, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header user={user} />

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4 p-4 md:gap-6 md:p-6">
        {/* LEFT SIDEBAR */}
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
                No chats yet. Start with one of the preset scenarios.
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

        {/* RIGHT COLUMN */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              chatEndRef={chatEndRef}
              starterPrompts={showStarterPrompts ? starterPrompts : []}
              onStarterPromptClick={handleStarterPromptClick}
            />
          </div>

          <div className="shrink-0 flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setDevLogOpen((v) => !v)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {devLogOpen ? "Hide Dev Log" : "Show Dev Log"}
            </button>
          </div>

          <div
            className={[
              "shrink-0 overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out",
              devLogOpen ? "max-h-[340px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
            aria-hidden={!devLogOpen}
          >
            <div className={devLogOpen ? "pt-2" : ""}>
              <DevLog
                selectedDate={selectedDate}
                runId={devRunId}
                onDone={handleDevLogDone}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
