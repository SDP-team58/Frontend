"use client"

import { useMemo, useState } from "react"

type LogLevel = "info" | "success" | "error"

type LogEntry = {
  t: string
  level: LogLevel
  msg: string
}

function nowTime() {
  return new Date().toLocaleTimeString()
}

export default function DevLog({ selectedDate }: { selectedDate?: Date | null }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [running, setRunning] = useState(false)

  const dateLabel = useMemo(() => {
    if (!selectedDate) return "No date selected"
    return selectedDate.toDateString()
  }, [selectedDate])

  const add = (msg: string, level: LogLevel = "info") => {
    setLogs((prev) => [...prev, { t: nowTime(), level, msg }])
  }

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const runMock = async () => {
    setLogs([])
    setRunning(true)

    add(`Request received for date: ${dateLabel}`)
    await wait(350)

    add("Validated 14-day window", "success")
    await wait(450)

    add("Retrieving economic news (Tavily)", "info")
    await wait(600)

    add("Retrieved articles", "success")
    await wait(450)

    add("Pulling numeri indicators (yfinance)", "info")
    await wait(600)

    add("Retrieved indicators (CPI/GDP/Unemployment)", "success")
    await wait(450)

    add("Building MacroInput JSON", "info")
    await wait(600)

    add("Schema validation passed", "success")
    await wait(450)

    add("Sending request to vLLM", "info")
    await wait(900)

    add("LLM response received", "success")
    await wait(350)

    add("Parsed MacroOutput successfully", "success")
    add("Process complete ✔", "success")

    setRunning(false)
  }

  return (
    <div className="mt-4 rounded-lg border bg-black text-green-300">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="font-mono text-xs text-zinc-300">
          Dev Log (demo) • {dateLabel}
        </div>
        <button
          onClick={runMock}
          disabled={running}
          className="rounded bg-zinc-200 px-3 py-1 text-xs text-black hover:bg-white disabled:opacity-60"
        >
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <div className="h-56 overflow-y-auto px-4 py-3 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-zinc-500">
            Click “Run” to simulate backend steps.
          </div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="mb-1">
              <span className="text-zinc-500">[{l.t}]</span>{" "}
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
