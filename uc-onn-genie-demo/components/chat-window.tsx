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
  selectedDate,
  onSelectedDateChange,
  chatMode,
  onChatModeChange,
  counterfactualText,
  onCounterfactualTextChange,
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
  selectedDate: Date | null
  onSelectedDateChange: (date: Date | null) => void
  chatMode: "baseline" | "counterfactual"
  onChatModeChange: (mode: "baseline" | "counterfactual") => void
  counterfactualText: string
  onCounterfactualTextChange: (text: string) => void
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const handleDateSelect = (date: Date) => {
    onSelectedDateChange(date)
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

      {/* Mode selector and counterfactual text input */}
      <div className="shrink-0 border-t px-3 py-3 space-y-3">
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Mode
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChatModeChange("baseline")}
              className={[
                "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition",
                chatMode === "baseline"
                  ? "border-border bg-muted"
                  : "border-border bg-background hover:bg-muted"
              ].join(" ")}
            >
              Baseline
            </button>
            <button
              type="button"
              onClick={() => onChatModeChange("counterfactual")}
              className={[
                "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition",
                chatMode === "counterfactual"
                  ? "border-border bg-muted"
                  : "border-border bg-background hover:bg-muted"
              ].join(" ")}
            >
              Counterfactual
            </button>
          </div>
        </div>

        {chatMode === "counterfactual" && (
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Counterfactual scenario
            </label>
            <textarea
              value={counterfactualText}
              onChange={(e) => onCounterfactualTextChange(e.target.value)}
              placeholder="Describe the counterfactual scenario..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none resize-none"
              rows={3}
            />
          </div>
        )}
      </div>

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
            disabled={chatMode === "counterfactual" && !counterfactualText.trim()}
            className={[
              "rounded-md border border-border px-4 py-2 text-sm",
              chatMode === "counterfactual" && !counterfactualText.trim()
                ? "bg-background text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-background hover:bg-muted"
            ].join(" ")}
          >
            Send
          </button>
        </div>
        {calendarOpen && (
          <div className="absolute z-10 mt-2 bg-background border rounded-md shadow-lg">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
            />
          </div>
        )}
      </div>
    </div>
  )
}
