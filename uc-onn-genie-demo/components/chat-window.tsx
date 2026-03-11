"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

export default function ChatWindow({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  chatEndRef,
  starterPrompts = [],
  onStarterPromptClick,
}: {
  messages: Message[]
  inputValue: string
  onInputChange: (v: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
  starterPrompts?: string[]
  onStarterPromptClick?: (prompt: string) => void
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCalendarOpen(false)
    const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    onInputChange(`economic articles from ${formatted}`)
  }
  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border bg-background">
      {/* Scrollable messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto w-fit max-w-[85%] bg-muted"
                  : "mr-auto w-fit max-w-[85%] bg-secondary",
              ].join(" ")}
            >
              {m.content}
            </div>
          ))}

          {isLoading ? (
            <div className="mr-auto w-fit max-w-[85%] rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          ) : null}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Preset prompts above the input */}
      {starterPrompts.length > 0 ? (
        <div className="shrink-0 border-t px-3 py-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Try a preset scenario
          </div>
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((prompt, index) => (
              <button
                key={`${prompt}-${index}`}
                type="button"
                onClick={() =>
                  onStarterPromptClick
                    ? onStarterPromptClick(prompt)
                    : onInputChange(prompt)
                }
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Input row pinned to bottom */}
      <div className="shrink-0 border-t p-3">
        <div className="flex gap-2 items-center">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type a scenario or choose a preset prompt..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="rounded-md border border-border bg-background px-2 py-2 text-sm hover:bg-muted"
            aria-label="Open calendar"
          >
            📅
          </button>
          <button
            type="button"
            onClick={onSendMessage}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
          >
            Send
          </button>
        </div>
        {calendarOpen && (
          <div className="absolute z-10 mt-2 bg-background border rounded-md shadow-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
        )}
      </div>
    </div>
  )
}
