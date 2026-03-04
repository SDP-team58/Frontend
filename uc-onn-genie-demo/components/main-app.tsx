"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Header from "@/components/header"
import ScenarioPanel from "@/components/scenario-panel"
import ChatWindow from "@/components/chat-window"
import DevLog from "@/components/dev-log"
import { scenarios } from "@/lib/scenarios"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
  validated?: boolean
}

interface Article {
  title: string
  content: string
  url: string
}

interface ArticleGroup {
  id: string
  date: string
  articles: Article[]
}

export default function MainApp({ user }: { user: Record<string, unknown> }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to GENIE, UConn's Macroeconomic World Model. Select a scenario on the left to explore how different economic shocks impact the economy.",
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [articleGroups, setArticleGroups] = useState<ArticleGroup[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Dev Log control
  const [devLogOpen, setDevLogOpen] = useState(false)
  const [devRunId, setDevRunId] = useState(0)

  // Create a monotonic runId that we can reliably capture
  const runCounterRef = useRef(0)

  // Store what assistant response should be posted when dev log finishes
  const pendingAssistantRef = useRef<{
    runId: number
    content: string
  } | null>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Only auto-scroll when Dev Log is closed (prevents “layout jump” feeling)
  useEffect(() => {
    if (devLogOpen) return
    scrollToBottom()
  }, [messages, devLogOpen])

  const startDevRun = () => {
    const next = ++runCounterRef.current
    setDevRunId(next)

    // Optional: auto-open dev log when a run starts
    setDevLogOpen(true)

    return next
  }

  const handleDevLogDone = (finishedRunId: number) => {
    const pending = pendingAssistantRef.current
    if (!pending) return
    if (pending.runId !== finishedRunId) return

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: pending.content,
      isLoading: false,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
    pendingAssistantRef.current = null
  }

  const handleScenarioClick = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

    const runId = startDevRun()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: scenario.prompt,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Post assistant response ONLY when Dev Log finishes this runId
    pendingAssistantRef.current = {
      runId,
      content: scenario.response,
    }
  }

  const handleSendMessage = () => {
    const userText = inputValue.trim()
    if (!userText) return
    setInputValue("")

    // Static demo: if user types exactly a scenario prompt, run it
    const matchingScenario = scenarios.find(
      (s) => s.prompt.toLowerCase() === userText.toLowerCase()
    )

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    }
    setMessages((prev) => [...prev, userMessage])

    // Handle "Economics articles from {date}" command
    if (userText.toLowerCase().startsWith("economics articles from")) {
      setIsLoading(true)
      
      // Extract date and fetch articles
      const dateStr = userText.replace(/^economics articles from\s*/i, '')
      
      // Call tavily API
      fetch("/api/tavily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `Economics articles from ${dateStr}`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const articles = data.articles || []
          
          // Add to article groups
          const newGroup: ArticleGroup = {
            id: Date.now().toString(),
            date: dateStr,
            articles: articles,
          }
          
          setArticleGroups((prev) => [...prev, newGroup])
          
          // Mark message as validated
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMessage.id ? { ...m, validated: true } : m
            )
          )
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Found ${articles.length} economics articles from ${dateStr}. Check the "Economic Articles" tab in the sidebar.`,
          }
          setMessages((prev) => [...prev, assistantMessage])
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching articles:", error)
          
          // Mark message as validated even if request fails
          setMessages((prev) =>
            prev.map((m) =>
              m.id === userMessage.id ? { ...m, validated: true } : m
            )
          )
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Unable to fetch articles. Please try again.",
          }
          setMessages((prev) => [...prev, assistantMessage])
          setIsLoading(false)
        })
      return
    }

    if (!matchingScenario) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This demo is in static mode right now. Please choose one of the preset scenarios on the left to see an example output.",
      }
      setMessages((prev) => [...prev, assistantMessage])
      return
    }

    // If it matches a scenario prompt, run the scenario flow
    handleScenarioClick(matchingScenario.id)
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

      {/* Main split layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-4 p-4 md:gap-6 md:p-6">
        <ScenarioPanel
          onScenarioClick={handleScenarioClick}
          articleGroups={articleGroups}
        />

        {/* RIGHT COLUMN */}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {/* Chat area must be allowed to shrink; chat-window should manage its own scroll */}
          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              chatEndRef={chatEndRef}
              onCalendarDateSelect={setSelectedDate}
            />
          </div>

          {/* Controls row */}
          <div className="shrink-0 flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setDevLogOpen((v) => !v)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {devLogOpen ? "Hide Dev Log" : "Show Dev Log"}
            </button>
          </div>

          {/* Dev Log (mounted once; collapses without breaking layout) */}
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
