"use client"

import type React from "react"

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
}: {
  messages: Message[]
  inputValue: string
  onInputChange: (v: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  chatEndRef: React.RefObject<HTMLDivElement>
}) {
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
