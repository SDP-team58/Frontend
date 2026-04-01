"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import ChatWindow from "@/components/chat-window"
import DevLog, { type StreamRequest } from "@/components/dev-log"
import { scenarios } from "@/lib/scenarios"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  val_sp500_price: number
  val_oil_price: number
  val_us_treasury_10y: number
  val_vix_volatility: number
  nar_growth_regime: string
  nar_policy_stance: string
  nar_market_sentiment: string
}

interface BackendChatResponse {
  reply?: AnalysisReply
  sources?: string[]
  financial_data?: Record<string, unknown> | null
  error?: string
  detail?: string
}

type ChatMode = "baseline" | "counterfactual"

// ---------------------------------------------------------------------------
// Constants / helpers
// ---------------------------------------------------------------------------

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
  return { start_date: format(start), end_date: format(end) }
}

function buildPreview(text: string) {
  return text.length > 42 ? `${text.slice(0, 42)}...` : text
}

function formatAssistantContent(data: BackendChatResponse): string {
  if (!data.reply) {
    return data.detail ?? data.error ?? "The backend returned an empty response."
  }
  return `
S&P 500 Price: $${data.reply.val_sp500_price}
Oil Price: $${data.reply.val_oil_price}
US Treasury 10Y Yield: ${data.reply.val_us_treasury_10y}%
VIX Volatility Index: ${data.reply.val_vix_volatility}
Growth Regime: ${data.reply.nar_growth_regime}
Policy Stance: ${data.reply.nar_policy_stance}
Market Sentiment: ${data.reply.nar_market_sentiment}
`.trim()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MainApp({ user }: { user: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage])
  const [inputValue, setInputValue] = useState("")
  const [chatMode, setChatMode] = useState<ChatMode>("baseline")
  const [counterfactualText, setCounterfactualText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [articles, setArticles] = useState<{ title: string; content: string; url: string }[]>([])
  const [articleQuery, setArticleQuery] = useState<string>("")

  const [chatHistory, setChatHistory] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  const [devLogOpen, setDevLogOpen] = useState(false)
  const [devRunId, setDevRunId] = useState(0)
  // The stream request that DevLog will consume for the current run
  const [currentStreamRequest, setCurrentStreamRequest] = useState<StreamRequest | null>(null)
  const runCounterRef = useRef(0)

  // Holds the thread context for the in-flight run so onResult can commit the message
  const pendingThreadRef = useRef<{ runId: number; threadId: string } | null>(null)

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

  // ---------------------------------------------------------------------------
  // Dev log orchestration
  // ---------------------------------------------------------------------------

  /** Increments the run counter, opens the dev log, and stores the stream request. */
  const startDevRun = (req: StreamRequest): number => {
    const next = ++runCounterRef.current
    setDevRunId(next)
    setCurrentStreamRequest(req)
    setDevLogOpen(true)
    return next
  }

  /**
   * Called by DevLog when the final "result" SSE event arrives.
   * `data` is the raw ChatResponse payload from the backend.
   */
  const handleResult = (finishedRunId: number, data: Record<string, unknown>) => {
    const pending = pendingThreadRef.current
    if (!pending || pending.runId !== finishedRunId) return

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: formatAssistantContent(data as BackendChatResponse),
      isLoading: false,
    }

    setChatHistory((prev) =>
      prev.map((thread) =>
        thread.id === pending.threadId
          ? { ...thread, messages: [...thread.messages, assistantMessage] }
          : thread,
      ),
    )

    if (activeThreadId === pending.threadId) {
      setMessages((prev) => [...prev, assistantMessage])
    }

    setIsLoading(false)
    pendingThreadRef.current = null
  }

  /**
   * Called by DevLog when the stream closes (success or error).
   * If no result was committed (e.g. stream errored), show a fallback message.
   */
  const handleDevLogDone = (finishedRunId: number) => {
    const pending = pendingThreadRef.current
    if (!pending || pending.runId !== finishedRunId) return

    // Stream ended without a result event — emit an error message
    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: "The pipeline encountered an error. Check the Dev Log for details.",
      isLoading: false,
    }

    setChatHistory((prev) =>
      prev.map((thread) =>
        thread.id === pending.threadId
          ? { ...thread, messages: [...thread.messages, assistantMessage] }
          : thread,
      ),
    )

    if (activeThreadId === pending.threadId) {
      setMessages((prev) => [...prev, assistantMessage])
    }

    setIsLoading(false)
    pendingThreadRef.current = null
  }

  // ---------------------------------------------------------------------------
  // Shared fetch setup
  // ---------------------------------------------------------------------------

  /** Builds the StreamRequest and wires up the pending thread ref. */
  const _launchStream = (
    userText: string,
    threadId: string,
    overrides: Partial<StreamRequest> = {},
  ) => {
    const dateRange = selectedDate ? buildDateRange(selectedDate) : null

    const req: StreamRequest = {
      mode: chatMode,
      user_message: userText,
      counterfactual_text:
        chatMode === "counterfactual" ? counterfactualText.trim() : undefined,
      date_range_start: dateRange?.start_date,
      date_range_end: dateRange?.end_date,
      ...overrides,
    }

    const runId = startDevRun(req)
    pendingThreadRef.current = { runId, threadId }
    return runId
  }

  // ---------------------------------------------------------------------------
  // Scenario click
  // ---------------------------------------------------------------------------

  const handleScenarioClick = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

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

    _launchStream(scenario.prompt, threadId)
  }

  const handleStarterPromptClick = (prompt: string) => {
    const scenario = scenarios.find((s) => s.prompt === prompt)
    if (!scenario) return
    handleScenarioClick(scenario.id)
  }

  // ---------------------------------------------------------------------------
  // Free-text send
  // ---------------------------------------------------------------------------

  const handleSendMessage = async () => {
    const userText = inputValue.trim()
    if (!userText) return
    if (chatMode === "counterfactual" && !counterfactualText.trim()) return
    setInputValue("")

    const matchingScenario = scenarios.find(
      (s) => s.prompt.toLowerCase() === userText.toLowerCase(),
    )
    if (matchingScenario) {
      handleScenarioClick(matchingScenario.id)
      return
    }

    // Special-case: article search (non-streaming)
    if (userText.toLowerCase().startsWith("economic articles from")) {
      setIsLoading(true)
      setArticleQuery(userText)
      fetch("/api/tavily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText }),
      })
        .then((res) => res.json())
        .then((data) => {
          setArticles(data.articles ?? [])
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
      const userMessage: Message = {
        id: `${Date.now()}-user`,
        role: "user",
        content: userText,
      }
      setMessages((prev) => [...prev, userMessage])
      return
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: userText,
    }

    const threadId = `${Date.now()}-thread`
    const newThread: ChatThread = {
      id: threadId,
      preview: buildPreview(userText),
      createdAt: new Date().toISOString(),
      messages: [userMessage],
    }

    setChatHistory((prev) => [newThread, ...prev])
    setActiveThreadId(threadId)
    setMessages([userMessage])
    setIsLoading(true)

    _launchStream(userText, threadId)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // ---------------------------------------------------------------------------
  // Thread management
  // ---------------------------------------------------------------------------

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
      pendingThreadRef.current = null
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            {articleQuery && articles.length > 0 ? (
              <div className="mb-4 group">
                <div className="font-semibold text-sm mb-2 cursor-pointer capitalize">
                  {articleQuery}
                </div>
                <div className="space-y-1 hidden group-hover:flex flex-col transition-all duration-200">
                  {articles.map((a, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-gray-200 bg-white shadow-sm px-1.5 py-0.5 flex flex-col gap-0.5 hover:bg-gray-50 transition-all duration-200"
                    >
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener"
                        className="font-medium text-xs capitalize mb-0.5 cursor-pointer text-gray-800 hover:underline"
                        style={{ textDecoration: "none" }}
                      >
                        {a.title}
                      </a>
                      <div className="text-xs text-gray-700 mb-0.5 capitalize">
                        {a.content.slice(0, 120)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

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
                          prev === thread.id ? null : thread.id,
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
              mode={chatMode}
              onModeChange={setChatMode}
              counterfactualText={counterfactualText}
              onCounterfactualTextChange={setCounterfactualText}
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
                streamRequest={currentStreamRequest}
                onResult={handleResult}
                onDone={handleDevLogDone}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
