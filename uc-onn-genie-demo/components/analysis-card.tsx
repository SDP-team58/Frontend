"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
  }
  if (
    lower.includes("bearish") ||
    lower.includes("contractionary") ||
    lower.includes("hawkish")
  ) {
    return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
  }
  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
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
    <Card className="w-full max-w-2xl border-0 shadow-md bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            Analysis Report
          </CardTitle>
          {mode && (
            <Badge
              variant={mode === "counterfactual" ? "default" : "secondary"}
              className="text-[11px] font-medium"
            >
              {mode === "counterfactual" ? "Counterfactual" : "Baseline"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Market Indicators
          </p>
          <div className="grid grid-cols-2 gap-2.5">
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
                  className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-muted/60 to-muted/30 px-3.5 py-3 transition-colors hover:from-muted/80 hover:to-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {m.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xl font-bold tracking-tight">
                    {formatted}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Narrative Assessment
          </p>
          <div className="space-y-3">
            {NARRATIVES.map((n) => {
              const Icon = n.icon
              const parsed = parseNarrative(data[n.key])
              return (
                <div
                  key={n.key}
                  className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3.5 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {n.label}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${sentimentColor(parsed.label)}`}
                      >
                        {parsed.label}
                      </span>
                      {parsed.description && (
                        <span className="text-sm text-foreground/80">
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
