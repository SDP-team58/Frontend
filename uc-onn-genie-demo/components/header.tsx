"use client"

import LogoutButton from "@/components/logout-button"
import { Globe } from "lucide-react"

export default function Header({ user }: { user: Record<string, unknown> }) {
  return (
    <header className="shrink-0 border-b border-white/10 bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <Globe className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight sm:text-base">
              GENIE
            </h1>
            <p className="hidden text-[11px] opacity-70 sm:block">
              UConn Macroeconomic World Model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-xs opacity-70 sm:inline">
            {String(user.user ?? "unknown")}
          </span>
          <LogoutButton className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-white/20 transition-colors" />
        </div>
      </div>
    </header>
  )
}
