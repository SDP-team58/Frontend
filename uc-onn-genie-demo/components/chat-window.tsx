"use client"

import type React from "react"
import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
  validated?: boolean
}

export default function ChatWindow({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  chatEndRef,
  onCalendarDateSelect,
}: {
  messages: Message[]
  inputValue: string
  onInputChange: (v: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
  onCalendarDateSelect?: (date: Date) => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    
    const dateString = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    onInputChange(`Economics articles from ${dateString}`)
    onCalendarDateSelect?.(date)
  }

  return (
    // IMPORTANT: h-full + min-h-0 + flex-col lets the scroll area actually scroll
    <div className="flex h-full min-h-0 flex-col rounded-lg border bg-background">
      {/* This must be the scroll container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={[
                "rounded-md px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap flex items-start gap-2",
                m.role === "user"
                  ? "ml-auto w-fit max-w-[85%] bg-muted"
                  : "mr-auto w-fit max-w-[85%] bg-secondary",
              ].join(" ")}
            >
              <div>{m.content}</div>
              {m.role === "user" && m.content.toLowerCase().startsWith("economics articles from") && (
                <div className={`shrink-0 text-lg ${m.validated ? "text-red-500" : "text-gray-400"}`}>
                  ✓
                </div>
              )}
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

      {/* Input row pinned to bottom */}
      <div className="shrink-0 border-t p-3">
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type a scenario or press a button on the left..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
              />
            </PopoverContent>
          </Popover>
          
          <button
            type="button"
            onClick={onSendMessage}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-muted"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
