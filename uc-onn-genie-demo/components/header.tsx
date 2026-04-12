"use client"

import LogoutButton from "@/components/logout-button"
import { Activity } from "lucide-react"

export default function Header({ user }: { user: Record<string, unknown> }) {
  return (
    <header className="shrink-0 border-b border-border/50 bg-card/60 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
            <Activity className="size-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">
              GENIE
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Macroeconomic World Model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {String(user.user ?? "unknown")}
          </div>
          <LogoutButton className="rounded-lg bg-secondary/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" />
        </div>
      </div>
    </header>
  )
}
