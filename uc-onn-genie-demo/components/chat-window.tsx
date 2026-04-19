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
      <div className="mx-auto w-full max-w-[1800px] space-y-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 rounded-2xl bg-muted/50 p-1.5 ring-1 ring-border/30">
          <button
            type="button"
            onClick={() => onChatModeChange("baseline")}
            className={[
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 xl:text-base",
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
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 xl:text-base",
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={[
                  "h-12 flex-1 justify-start gap-2 border-border/50 bg-input/30 text-left text-sm font-normal hover:bg-input/50 xl:h-14 xl:text-base",
                  !selectedDate && "text-muted-foreground",
                ].join(" ")}
              >
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground xl:size-5" />
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
              "h-12 shrink-0 gap-2 px-5 text-sm font-medium transition-all duration-200 xl:h-14 xl:text-base",
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
          <div className="space-y-2">
            <Textarea
              value={counterfactualText}
              onChange={(e) => onCounterfactualTextChange(e.target.value)}
              placeholder="Describe the counterfactual scenario (e.g., 'Oil prices spike to $120/barrel due to OPEC supply cuts')"
              className="resize-none border-border/50 bg-input/30 text-base placeholder:text-muted-foreground/50 focus-visible:border-amber-500/30 focus-visible:ring-amber-500/30 xl:text-lg"
              rows={4}
            />
            <p className="text-sm text-muted-foreground/70 xl:text-base">
              Counterfactual mode still uses the 10-run ensemble. Only the scenario block changes.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-muted/20 px-4 py-3 ring-1 ring-border/20">
            <Info className="size-4 shrink-0 text-muted-foreground/50 xl:size-5" />
            <p className="text-sm text-muted-foreground/70 xl:text-base">
              Baseline now runs a 10-sample ensemble over the selected 14-day window, scores confidence from the spread, and shows the exact prompt sent to the model.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
