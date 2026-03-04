"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import ScenarioPanel from "@/components/scenario-panel"
import ChatWindow from "@/components/chat-window"
import { scenarios } from "@/lib/scenarios"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
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
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleScenarioClick = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (!scenario) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: scenario.prompt,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate loading animation
    setTimeout(() => {
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: scenario.response,
        isLoading: false,
      }
      setMessages((prev) => [...prev, loadingMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userText = inputValue.trim()
    setInputValue("")

    // Check if the message starts with "economic articles from"
    if (userText.toLowerCase().startsWith("economic articles from")) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userText,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      // Extract date from the user text
      const dateMatch = userText.match(/from\s+(.+)$/i)
      const literalDate = dateMatch ? dateMatch[1] : "Today"

      // Fetch backend response (Tavily articles with the date)
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_message: `economic articles from ${literalDate}`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const fetchedArticles = data.sources || []

          // Create an article group with all fetched articles
          const articleGroup: ArticleGroup = {
            id: Date.now().toString(),
            date: literalDate,
            articles: fetchedArticles.slice(0, 3), // Limit to 3 articles
          }

          setArticleGroups((prev) => [articleGroup, ...prev])

          // Add assistant response
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Found ${Math.min(fetchedArticles.length, 3)} articles for "${literalDate}". Check the Elements panel on the left to view them.`,
          }

          setMessages((prev) => [...prev, assistantMessage])
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching articles:", error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Failed to fetch articles. Please try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
          setIsLoading(false)
        })
      return
    }

    // Check if the message matches any scenario prompt
    const matchingScenario = scenarios.find((s) => s.prompt.toLowerCase() === userText.toLowerCase())

    if (!matchingScenario) {
      // Show error message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userText,
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "This demo only supports the preset scenarios on the left. Please choose one of those to see an example output.",
      }

      setMessages((prev) => [...prev, userMessage, errorMessage])
      return
    }

    // Valid scenario
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
      <div className="flex flex-1 overflow-hidden gap-4 p-4 md:gap-6 md:p-6">
        {/* Left panel - Scenarios */}
        <ScenarioPanel onScenarioClick={handleScenarioClick} articleGroups={articleGroups} />

        {/* Right panel - Chat */}
        <ChatWindow
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
        />
      </div>
    </div>
  )
}
