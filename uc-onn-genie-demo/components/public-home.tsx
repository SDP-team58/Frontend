"use client"

import LoginButton from "@/components/login-button"
import { Activity, BarChart3, Sparkles, Globe } from "lucide-react"

export default function PublicHome() {
  return (
    <div className="relative flex h-screen items-center justify-center bg-background bg-noise overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-6">
          <Activity className="size-7 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          GENIE
        </h1>
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Macroeconomic World Model
        </p>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground/80">
          Explore macroeconomic forecasts powered by real-time data, LLM-driven narrative analysis, and counterfactual scenario modeling.
        </p>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: Globe, label: "Tavily Search" },
            { icon: BarChart3, label: "Market Data" },
            { icon: Sparkles, label: "Counterfactual" },
          ].map((feat) => (
            <div
              key={feat.label}
              className="flex items-center gap-1.5 rounded-full bg-muted/30 ring-1 ring-border/20 px-3 py-1.5 text-[11px] text-muted-foreground"
            >
              <feat.icon className="size-3" />
              {feat.label}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <LoginButton className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors glow-ring" />
        </div>
      </div>
    </div>
  )
}
