"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Landmark,
  BarChart3,
  Flame,
  DollarSign,
  Activity,
} from "lucide-react"

export interface AnalysisData {
  val_sp500_price: number
  val_oil_price: number
  val_us_treasury_10y: number
  val_vix_volatility: number
  nar_growth_regime: string
  nar_policy_stance: string
  nar_market_sentiment: string
}

function parseNarrative(value: string) {
  if (value.includes(" - ")) {
    const [label, ...rest] = value.split(" - ")
    return { label: label.trim(), description: rest.join(" - ").trim() }
  }
  return { label: value.trim(), description: "" }
}

function sentimentColor(label: string) {
  const lower = label.toLowerCase()
  if (
    lower.includes("bullish") ||
    lower.includes("expansionary") ||
    lower.includes("dovish")
  ) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  }
  if (
    lower.includes("bearish") ||
    lower.includes("contractionary") ||
    lower.includes("hawkish")
  ) {
    return "bg-red-500/10 text-red-400 border-red-500/25"
  }
  return "bg-amber-500/10 text-amber-400 border-amber-500/25"
}

const METRICS = [
  { key: "val_sp500_price" as const, label: "S&P 500", icon: TrendingUp, prefix: "$" },
  { key: "val_oil_price" as const, label: "Crude Oil", icon: Flame, prefix: "$" },
  { key: "val_us_treasury_10y" as const, label: "10Y Treasury", icon: Landmark, suffix: "%" },
  { key: "val_vix_volatility" as const, label: "VIX", icon: Activity },
]

const NARRATIVES = [
  { key: "nar_growth_regime" as const, label: "Growth Regime", icon: BarChart3 },
  { key: "nar_policy_stance" as const, label: "Policy Stance", icon: Landmark },
  { key: "nar_market_sentiment" as const, label: "Market Sentiment", icon: DollarSign },
]

export default function AnalysisCard({
  data,
  mode,
}: {
  data: AnalysisData
  mode?: "baseline" | "counterfactual"
}) {
  return (
    <Card className="w-full max-w-2xl border-border/40 shadow-xl shadow-black/10 bg-card ring-1 ring-border/20">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Analysis Report
          </CardTitle>
          {mode && (
            <Badge
              variant="outline"
              className={[
                "text-[10px] font-mono border",
                mode === "counterfactual"
                  ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
                  : "border-primary/30 text-primary bg-primary/5",
              ].join(" ")}
            >
              {mode === "counterfactual" ? "Counterfactual" : "Baseline"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 pt-0">
        {/* Market indicators grid */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            Market Indicators
          </p>
          <div className="grid grid-cols-2 gap-2">
            {METRICS.map((m) => {
              const Icon = m.icon
              const raw = data[m.key]
              const formatted =
                (m.prefix ?? "") +
                (typeof raw === "number" ? raw.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(raw)) +
                (m.suffix ?? "")

              return (
                <div
                  key={m.key}
                  className="rounded-xl bg-muted/30 ring-1 ring-border/20 px-3.5 py-3 transition-all duration-200 hover:bg-muted/50 hover:ring-border/40"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3 text-muted-foreground/60" />
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {m.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-lg font-bold tracking-tight font-mono text-foreground">
                    {formatted}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        {/* Narrative assessment */}
        <div>
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            Narrative Assessment
          </p>
          <div className="space-y-2">
            {NARRATIVES.map((n) => {
              const Icon = n.icon
              const parsed = parseNarrative(data[n.key])
              return (
                <div
                  key={n.key}
                  className="flex items-start gap-3 rounded-xl bg-muted/20 ring-1 ring-border/15 px-3.5 py-2.5 transition-all duration-200 hover:bg-muted/35"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/20">
                    <Icon className="size-3 text-muted-foreground/70" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {n.label}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${sentimentColor(parsed.label)}`}
                      >
                        {parsed.label}
                      </span>
                      {parsed.description && (
                        <span className="text-xs text-foreground/60">
                          {parsed.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
