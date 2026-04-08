"use client"

import React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ArrowUp, Sparkles, BarChart3 } from "lucide-react"

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function ChatWindow({
  onSendMessage,
  isLoading,
  selectedDate,
  onSelectedDateChange,
  chatMode,
  onChatModeChange,
  counterfactualText,
  onCounterfactualTextChange,
}: {
  onSendMessage: () => void
  isLoading: boolean
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

  const canSend =
    Boolean(selectedDate) &&
    (chatMode === "baseline" || Boolean(counterfactualText.trim()))

  return (
    <div className="shrink-0 border-t bg-muted/30 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-3">
        {/* Mode selector */}
        <Tabs
          value={chatMode}
          onValueChange={(v) => onChatModeChange(v as "baseline" | "counterfactual")}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="baseline" className="flex-1 gap-1.5">
              <BarChart3 className="size-3.5" />
              Baseline
            </TabsTrigger>
            <TabsTrigger value="counterfactual" className="flex-1 gap-1.5">
              <Sparkles className="size-3.5" />
              Counterfactual
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date & controls row */}
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={[
                  "flex-1 justify-start gap-2 text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                ].join(" ")}
              >
                <CalendarIcon className="size-4 shrink-0" />
                {selectedDate
                  ? formatDisplayDate(selectedDate)
                  : "Select analysis date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={onSendMessage}
            disabled={!canSend || isLoading}
            size="default"
            className="shrink-0 gap-2"
          >
            <ArrowUp className="size-4" />
            Run
          </Button>
        </div>

        {/* Counterfactual input or baseline info */}
        {chatMode === "counterfactual" ? (
          <Textarea
            value={counterfactualText}
            onChange={(e) => onCounterfactualTextChange(e.target.value)}
            placeholder="Describe the counterfactual scenario (e.g., 'Oil prices spike to $120/barrel due to OPEC supply cuts')"
            className="resize-none text-sm"
            rows={3}
          />
        ) : (
          <p className="text-xs text-muted-foreground text-center py-1">
            Baseline uses the 14-day window ending on the selected date. Context is built from Tavily search, narrative outputs from Groq, and market data from yfinance.
          </p>
        )}
      </div>
    </div>
  )
}
