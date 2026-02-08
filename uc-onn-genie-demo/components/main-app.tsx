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

export default function MainApp({ user }: { user?: Record<string, unknown> }) {
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
        <ScenarioPanel onScenarioClick={handleScenarioClick} />

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
