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
  mode,
  onModeChange,
  counterfactualText,
  onCounterfactualTextChange,
}: {
  messages: Message[]
  inputValue: string
  onInputChange: (v: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement | null>
  starterPrompts?: string[]
  onStarterPromptClick?: (prompt: string) => void
  mode: "baseline" | "counterfactual"
  onModeChange: (mode: "baseline" | "counterfactual") => void
  counterfactualText: string
  onCounterfactualTextChange: (value: string) => void
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
  const counterfactualRequired =
    mode === "counterfactual" && !counterfactualText.trim()
  const sendDisabled = isLoading || !inputValue.trim() || counterfactualRequired

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
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
                disabled={counterfactualRequired}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Input row pinned to bottom */}
      <div className="shrink-0 border-t p-3">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Forecast mode</span>
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as "baseline" | "counterfactual")}
              className="rounded-md border bg-background px-2 py-1 text-sm text-foreground outline-none"
            >
              <option value="baseline">Baseline</option>
              <option value="counterfactual">Counterfactual</option>
            </select>
          </label>

          {mode === "counterfactual" ? (
            <input
              value={counterfactualText}
              onChange={(e) => onCounterfactualTextChange(e.target.value)}
              placeholder="Scenario to assume is true..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
            />
          ) : null}
        </div>

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
            disabled={sendDisabled}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
