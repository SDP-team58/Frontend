"use client"

import { useEffect, useMemo, useRef, useState } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogLevel = "info" | "success" | "warning" | "error"

type LogItem = {
  t: string
  msg: string
  level: LogLevel
}

/** Shape of every parsed SSE payload from the backend. */
export type StreamEvent = {
  type: LogLevel | "result"
  message: string
  data?: Record<string, unknown>
}

export type DevLogProps = {
  selectedDate: Date | null
  runId: number
  /** Request config forwarded from main-app — set when a new run starts. */
  streamRequest: StreamRequest | null
  onResult?: (runId: number, data: Record<string, unknown>) => void
  onDone?: (runId: number) => void
}

export type StreamRequest = {
  mode: "baseline" | "counterfactual"
  user_message?: string
  counterfactual_text?: string
  date_range_start?: string
  date_range_end?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DevLog({
  selectedDate,
  runId,
  streamRequest,
  onResult,
  onDone,
}: DevLogProps) {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [running, setRunning] = useState(false)

  const activeRunRef = useRef<number>(0)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const dateLabel = useMemo(
    () => (selectedDate ? selectedDate.toDateString() : "No date selected"),
    [selectedDate],
  )

  // Auto-scroll log to bottom as new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  // Abort any in-flight stream when component unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const append = (msg: string, level: LogLevel) => {
    setLogs((prev) => [...prev, { t: nowTime(), msg, level }])
  }

  useEffect(() => {
    // runId 0 is the initial un-triggered state
    if (!runId || !streamRequest) return

    // Cancel any previous stream
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const thisRun = runId
    activeRunRef.current = thisRun

    setLogs([])
    setRunning(true)

    const run = async () => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(streamRequest),
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok || !response.body) {
          const errData = await response.json().catch(() => ({ error: "Stream failed to open." }))
          append(errData.error ?? "Backend error.", "error")
          setRunning(false)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // SSE frames are separated by double newlines
          const frames = buffer.split("\n\n")
          // Keep any incomplete trailing frame in the buffer
          buffer = frames.pop() ?? ""

          for (const frame of frames) {
            const line = frame.trim()
            if (!line.startsWith("data:")) continue

            const raw = line.slice(5).trim()
            let event: StreamEvent
            try {
              event = JSON.parse(raw)
            } catch {
              continue
            }

            if (activeRunRef.current !== thisRun) return

            if (event.type === "result") {
              append(event.message, "success")
              if (event.data) onResult?.(thisRun, event.data)
              // result is the last event — break out
              break
            } else {
              append(event.message, event.type as LogLevel)
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        append("Stream connection lost.", "error")
      } finally {
        if (activeRunRef.current === thisRun) {
          setRunning(false)
          onDone?.(thisRun)
        }
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  return (
    <div className="rounded-lg border bg-black text-green-300">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-200">
        <div>Dev Log • {dateLabel}</div>
        <div className="text-zinc-400">{running ? "Running..." : "Idle"}</div>
      </div>

      <div
        ref={scrollRef}
        className="h-56 overflow-y-auto px-4 py-3 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-500">
            Send a prompt or click a scenario to populate the log.
          </div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="mb-1">
              <span className="text-zinc-500">[{l.t}]&nbsp;</span>
              <span
                className={
                  l.level === "success"
                    ? "text-green-400"
                    : l.level === "error"
                      ? "text-red-400"
                      : l.level === "warning"
                        ? "text-orange-400"
                        : "text-yellow-300"
                }
              >
                {l.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
