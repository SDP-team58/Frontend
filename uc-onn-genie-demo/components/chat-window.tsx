"use client"

import React from "react"

import { Calendar } from "@/components/ui/calendar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  chatEndRef,
  selectedDate,
  onSelectedDateChange,
  chatMode,
  onChatModeChange,
  counterfactualText,
  onCounterfactualTextChange,
}: {
  messages: Message[]
  onSendMessage: () => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
  selectedDate: Date | null
  onSelectedDateChange: (date: Date | null) => void
  chatMode: "baseline" | "counterfactual"
  onChatModeChange: (mode: "baseline" | "counterfactual") => void
  counterfactualText: string
  onCounterfactualTextChange: (text: string) => void
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onSelectedDateChange(date ?? null)
    setCalendarOpen(false)
  }

  const dateLabel = selectedDate
    ? formatDisplayDate(selectedDate)
    : "Select a date to analyze the prior 14-day window."

  const canSend =
    Boolean(selectedDate) &&
    (chatMode === "baseline" || Boolean(counterfactualText.trim()))

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border bg-background">
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
              Running analysis...
            </div>
          ) : null}

          <div ref={chatEndRef} />
        </div>
      </div>

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
                  : "border-border bg-background hover:bg-muted",
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
                  : "border-border bg-background hover:bg-muted",
              ].join(" ")}
            >
              Counterfactual
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Date
          </div>
          <div className="rounded-md border bg-background px-3 py-2 text-sm">
            {dateLabel}
          </div>
        </div>

        {chatMode === "counterfactual" ? (
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Counterfactual scenario
            </label>
            <textarea
              value={counterfactualText}
              onChange={(e) => onCounterfactualTextChange(e.target.value)}
              placeholder="Describe the counterfactual scenario..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none resize-none"
              rows={4}
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            Baseline mode uses the selected date only. The backend builds context from Tavily, derives narrative outputs with Groq, and combines them with yfinance data.
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
            aria-label="Open calendar"
          >
            Pick date
          </button>
          <button
            type="button"
            onClick={onSendMessage}
            disabled={!canSend || isLoading}
            className={[
              "rounded-md border border-border px-4 py-2 text-sm",
              !canSend || isLoading
                ? "bg-background text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-background hover:bg-muted",
            ].join(" ")}
          >
            Run analysis
          </button>
        </div>

        {calendarOpen ? (
          <div className="absolute z-10 mt-2 rounded-md border bg-background shadow-lg">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
