"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type LogLevel = "info" | "success" | "error"

type LogItem = {
  t: string
  msg: string
  level: LogLevel
}

function nowTime() {
  return new Date().toLocaleTimeString()
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export default function DevLog({
  selectedDate,
  runId,
  onDone,
}: {
  selectedDate: Date | null
  runId: number
  onDone?: (runId: number) => void
}) {
  const [logs, setLogs] = useState<LogItem[]>([])
  const [running, setRunning] = useState(false)

  // Used to cancel/ignore older runs if a new run starts quickly
  const activeRunRef = useRef<number>(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "No date selected"
    return selectedDate.toDateString()
  }, [selectedDate])

  const add = (msg: string, level: LogLevel = "info") => {
    setLogs((prev) => [...prev, { t: nowTime(), msg, level }])
  }

  const runMock = async (id: number) => {
    activeRunRef.current = id
    setRunning(true)
    setLogs([])

    const stillActive = () =>
      mountedRef.current && activeRunRef.current === id

    // If another run starts, quietly stop.
    const safeWait = async (ms: number) => {
      await wait(ms)
      return stillActive()
    }

    add(`Request received for date: ${dateLabel}`, "info")
    if (!(await safeWait(650))) return

    add("Validated 14-day window", "success")
    if (!(await safeWait(650))) return

    add("Retrieving economic news (Tavily)", "info")
    if (!(await safeWait(850))) return

    add("Retrieved articles", "success")
    if (!(await safeWait(550))) return

    add("Pulling numeric indicators (yfinance)", "info")
    if (!(await safeWait(850))) return

    add("Retrieved indicators (CPI/GDP/Unemployment)", "success")
    if (!(await safeWait(550))) return

    add("Building MacroInput JSON", "info")
    if (!(await safeWait(750))) return

    add("Schema validation passed", "success")
    if (!(await safeWait(550))) return

    add("Sending request to vLLM", "info")
    if (!(await safeWait(1200))) return

    add("LLM response received", "success")
    if (!(await safeWait(650))) return

    add("Parsed MacroOutput successfully", "success")
    if (!(await safeWait(400))) return

    add("Process complete", "success")

    if (!stillActive()) return
    setRunning(false)
    onDone?.(id)
  }

  useEffect(() => {
    if (!runId) return
    runMock(runId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  return (
    <div className="rounded-lg border bg-black text-green-300">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 font-mono text-xs text-zinc-200">
        <div>Dev Log (demo) • {dateLabel}</div>
        <div className="text-zinc-400">{running ? "Running..." : "Idle"}</div>
      </div>

      <div className="h-56 overflow-y-auto px-4 py-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-zinc-500">
            Send a prompt or click a scenario to populate the log.
          </div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="mb-1">
              <span className="text-zinc-500">[{l.t}] </span>
              <span
                className={
                  l.level === "success"
                    ? "text-green-400"
                    : l.level === "error"
                    ? "text-red-400"
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
