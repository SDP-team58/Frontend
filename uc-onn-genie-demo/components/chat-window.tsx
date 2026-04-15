"use client"

import React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowUp, Sparkles, BarChart3, Info } from "lucide-react"

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
    <div className="shrink-0 border-t border-border/50 bg-card/60 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 py-4 space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 ring-1 ring-border/30">
          <button
            type="button"
            onClick={() => onChatModeChange("baseline")}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
              chatMode === "baseline"
                ? "bg-primary/15 text-primary ring-1 ring-primary/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <BarChart3 className="size-3.5" />
            Baseline
          </button>
          <button
            type="button"
            onClick={() => onChatModeChange("counterfactual")}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
              chatMode === "counterfactual"
                ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25 shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Sparkles className="size-3.5" />
            Counterfactual
          </button>
        </div>

        {/* Date + run button */}
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={[
                  "flex-1 justify-start gap-2 text-left font-normal h-10 border-border/50 bg-input/30 hover:bg-input/50",
                  !selectedDate && "text-muted-foreground",
                ].join(" ")}
              >
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                {selectedDate
                  ? formatDisplayDate(selectedDate)
                  : "Select analysis date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-border/50" align="start">
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
            className={[
              "shrink-0 h-10 gap-2 font-medium transition-all duration-200",
              canSend && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-ring"
                : "",
            ].join(" ")}
          >
            <ArrowUp className="size-4" />
            Run
          </Button>
        </div>

        {/* Counterfactual input or baseline hint */}
        {chatMode === "counterfactual" ? (
          <div className="space-y-1.5">
            <Textarea
              value={counterfactualText}
              onChange={(e) => onCounterfactualTextChange(e.target.value)}
              placeholder="Describe the counterfactual scenario (e.g., 'Oil prices spike to $120/barrel due to OPEC supply cuts')"
              className="resize-none text-sm bg-input/30 border-border/50 placeholder:text-muted-foreground/50 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/30"
              rows={3}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Counterfactual mode still uses the 10-run ensemble. Only the scenario block changes.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2 ring-1 ring-border/20">
            <Info className="size-3.5 shrink-0 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground/70">
              Baseline now runs a 10-sample ensemble over the selected 14-day window, scores confidence from the spread, and shows the exact prompt sent to the model.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
