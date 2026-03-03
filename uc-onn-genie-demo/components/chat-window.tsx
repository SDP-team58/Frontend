"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import MessageBubble from "@/components/message-bubble"
import { Send, Calendar } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

interface ChatWindowProps {
  messages: Message[]
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement | null>
}

export default function ChatWindow({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  chatEndRef,
}: ChatWindowProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      onInputChange(`Economic articles from ${formattedDate}`)
      setShowDatePicker(false)
    }
  }
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-card shadow-sm md:min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>GENIE is thinking…</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 md:p-6">
        <div className="flex gap-3">
          <Button
            onClick={() => setShowDatePicker(true)}
            disabled={isLoading}
            size="icon"
            variant="outline"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type a scenario or press a button on the left..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={onSendMessage} disabled={isLoading || !inputValue.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Date</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
