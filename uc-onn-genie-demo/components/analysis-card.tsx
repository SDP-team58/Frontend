"use client"

import type { ReactNode } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Activity,
  BarChart3,
  DollarSign,
  ExternalLink,
  FileText,
  Flame,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

export interface AnalysisReply {
  val_sp500_price: number
  val_oil_price: number
  val_us_treasury_10y: number
  val_vix_volatility: number
  nar_growth_regime: string
  nar_policy_stance: string
  nar_market_sentiment: string
}

interface NumericMetricSummary {
  label: string
  values: number[]
  mean: number
  median: number
  minimum: number
  maximum: number
  stddev: number
  confidence_score: number
}

interface NarrativeMetricSummary {
  label: string
  candidates: string[]
  consensus: string
  majority_label: string
  label_counts: Record<string, number>
  agreement_score: number
}

interface EnsembleRun {
  sample_index: number
  reply: AnalysisReply
}

interface EnsembleSummary {
  requested_runs: number
  successful_runs: number
  success_rate_score: number
  numeric_confidence_score: number
  narrative_agreement_score: number
  overall_confidence_score: number
  confidence_label: string
  numeric_summaries: Record<string, NumericMetricSummary>
  narrative_summaries: Record<string, NarrativeMetricSummary>
  runs: EnsembleRun[]
}

interface PromptDetails {
  narrative_prompt: string
  model_prompt: AnalysisReply
}

interface DisplayArticle {
  title: string
  url: string
  content: string
}

export interface AnalysisData {
  reply: AnalysisReply
  sources?: string[] | null
  display_articles?: DisplayArticle[] | null
  financial_data?: Record<string, number | null> | null
  prompt_details?: PromptDetails
  ensemble?: EnsembleSummary
}

const METRICS = [
  { key: "val_sp500_price" as const, label: "S&P 500", icon: TrendingUp, prefix: "$", color: "#3b82f6" },
  { key: "val_oil_price" as const, label: "Crude Oil", icon: Flame, prefix: "$", color: "#f97316" },
  { key: "val_us_treasury_10y" as const, label: "10Y Treasury", icon: Landmark, suffix: "%", color: "#8b5cf6" },
  { key: "val_vix_volatility" as const, label: "VIX", icon: Activity, color: "#22c55e" },
]

const NARRATIVES = [
  { key: "nar_growth_regime" as const, label: "Growth Regime", icon: BarChart3 },
  { key: "nar_policy_stance" as const, label: "Policy Stance", icon: Landmark },
  { key: "nar_market_sentiment" as const, label: "Market Sentiment", icon: DollarSign },
]

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

function confidenceColor(score: number) {
  if (score >= 85) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  }
  if (score >= 65) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/25"
  }
  return "bg-red-500/10 text-red-400 border-red-500/25"
}

function formatMetricValue(
  key: keyof AnalysisReply,
  value: number,
  options?: { compact?: boolean },
) {
  const metric = METRICS.find((item) => item.key === key)
  const maximumFractionDigits =
    key === "val_us_treasury_10y" || key === "val_vix_volatility" ? 3 : 2
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits: options?.compact ? 0 : undefined,
  })

  return `${metric?.prefix ?? ""}${formatted}${metric?.suffix ?? ""}`
}

function scoreLabel(score: number) {
  if (score >= 85) {
    return "High"
  }
  if (score >= 65) {
    return "Medium"
  }
  return "Low"
}

function promptJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

export default function AnalysisCard({
  data,
  mode,
}: {
  data: AnalysisData
  mode?: "baseline" | "counterfactual"
}) {
  const reply = data.reply
  const ensemble = data.ensemble

  return (
    <Card className="w-full border-border/40 bg-card shadow-xl shadow-black/10 ring-1 ring-border/20">
      <CardHeader className="space-y-5 px-6 pt-6 pb-0 xl:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground xl:text-xl 2xl:text-2xl">
              Consensus Analysis Report
            </CardTitle>
            <p className="text-sm text-muted-foreground xl:text-base">
              Default mode now runs the model 10 times, aggregates the numeric forecast, and uses Groq to reconcile the narrative consensus.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {mode && (
              <Badge
                variant="outline"
                className={[
                  "border px-2.5 py-1 text-xs font-mono xl:text-sm",
                  mode === "counterfactual"
                    ? "border-amber-500/30 text-amber-400 bg-amber-500/5"
                    : "border-primary/30 text-primary bg-primary/5",
                ].join(" ")}
              >
                {mode === "counterfactual" ? "Counterfactual" : "Baseline"}
              </Badge>
            )}
            {ensemble ? (
              <Badge
                variant="outline"
                className={`border text-[10px] font-mono ${confidenceColor(
                  ensemble.overall_confidence_score,
                )}`}
              >
                {ensemble.confidence_label} confidence · {ensemble.overall_confidence_score.toFixed(1)}%
              </Badge>
            ) : null}
          </div>
        </div>

        {ensemble ? (
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryStat
              title="Overall confidence"
              value={`${ensemble.overall_confidence_score.toFixed(1)}%`}
              subtitle={`${scoreLabel(ensemble.overall_confidence_score)} stability across ensemble samples`}
              progressValue={ensemble.overall_confidence_score}
              icon={<ShieldCheck className="size-3.5 text-primary" />}
            />
            <SummaryStat
              title="Numeric stability"
              value={`${ensemble.numeric_confidence_score.toFixed(1)}%`}
              subtitle="Spread-adjusted confidence from the 10 sampled forecasts"
              progressValue={ensemble.numeric_confidence_score}
              icon={<TrendingUp className="size-3.5 text-primary" />}
            />
            <SummaryStat
              title="Narrative agreement"
              value={`${ensemble.narrative_agreement_score.toFixed(1)}%`}
              subtitle="Label agreement before Groq picks the consensus explanation"
              progressValue={ensemble.narrative_agreement_score}
              icon={<BarChart3 className="size-3.5 text-primary" />}
            />
            <SummaryStat
              title="Successful runs"
              value={`${ensemble.successful_runs}/${ensemble.requested_runs}`}
              subtitle={`${ensemble.success_rate_score.toFixed(1)}% sample completion rate`}
              progressValue={ensemble.success_rate_score}
              icon={<Activity className="size-3.5 text-primary" />}
            />
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-8 px-6 py-6 xl:px-7">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 xl:text-sm">
              Forecast Consensus
            </p>
            {ensemble ? (
              <p className="text-xs text-muted-foreground xl:text-sm">
                Median of {ensemble.successful_runs} successful model samples
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {METRICS.map((metric) => {
              const Icon = metric.icon
              const summary = ensemble?.numeric_summaries?.[metric.key]
              const chartConfig = {
                value: { label: metric.label, color: metric.color },
                consensus: { label: "Consensus", color: "#94a3b8" },
              } satisfies ChartConfig
              const chartData =
                ensemble?.runs.map((run) => ({
                  sample: `#${run.sample_index}`,
                  value: run.reply[metric.key],
                  consensus: summary?.median ?? reply[metric.key],
                })) ?? []

              return (
                <div
                  key={metric.key}
                  className="rounded-2xl border border-border/40 bg-muted/20 p-4 shadow-sm shadow-black/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
                            {metric.label}
                          </p>
                          <p className="text-2xl font-bold tracking-tight font-mono text-foreground xl:text-3xl 2xl:text-[2.2rem]">
                            {formatMetricValue(metric.key, reply[metric.key])}
                          </p>
                        </div>
                      </div>
                    </div>
                    {summary ? (
                      <Badge
                        variant="outline"
                        className={`border text-[10px] font-mono ${confidenceColor(
                          summary.confidence_score,
                        )}`}
                      >
                        {summary.confidence_score.toFixed(1)}% confidence
                      </Badge>
                    ) : null}
                  </div>

                  {summary ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <MiniStat label="Mean" value={formatMetricValue(metric.key, summary.mean, { compact: true })} />
                        <MiniStat label="Range" value={`${formatMetricValue(metric.key, summary.minimum, { compact: true })} → ${formatMetricValue(metric.key, summary.maximum, { compact: true })}`} />
                        <MiniStat label="Std dev" value={formatMetricValue(metric.key, summary.stddev, { compact: true })} />
                      </div>
                      <ChartContainer config={chartConfig} className="h-44 w-full xl:h-52">
                        <LineChart accessibilityLayer data={chartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="sample" tickLine={false} axisLine={false} />
                          <YAxis hide domain={["auto", "auto"]} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <ReferenceLine
                            y={summary.median}
                            stroke="var(--color-consensus)"
                            strokeDasharray="4 4"
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ChartContainer>
                      <div className="flex items-center justify-between text-xs text-muted-foreground xl:text-sm">
                        <span>Consensus line: {formatMetricValue(metric.key, summary.median, { compact: true })}</span>
                        <span>{summary.values.length} samples</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 xl:text-sm">
              Narrative Consensus
            </p>
            <p className="text-xs text-muted-foreground xl:text-sm">
              Groq synthesizes the final narrative from all sampled outputs
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {NARRATIVES.map((narrative) => {
              const Icon = narrative.icon
              const summary = ensemble?.narrative_summaries?.[narrative.key]
              const parsed = parseNarrative(
                summary?.consensus ?? reply[narrative.key],
              )
              return (
                <div
                  key={narrative.key}
                  className="rounded-2xl border border-border/40 bg-muted/20 p-4 shadow-sm shadow-black/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/20">
                      <Icon className="size-4 text-muted-foreground/70" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
                          {narrative.label}
                        </p>
                        {summary ? (
                          <Badge
                            variant="outline"
                            className={`border text-xs font-mono xl:text-sm ${confidenceColor(
                              summary.agreement_score,
                            )}`}
                          >
                            {summary.agreement_score.toFixed(1)}% agreement
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold xl:text-sm ${sentimentColor(parsed.label)}`}
                          >
                            {parsed.label}
                          </span>
                          {summary ? (
                            <span className="text-xs text-muted-foreground xl:text-sm">
                              Majority label: {summary.majority_label}
                            </span>
                          ) : null}
                        </div>
                       <p className="text-base leading-relaxed text-foreground/80 xl:text-lg">
                         {parsed.description || "No narrative explanation was returned."}
                       </p>
                      {summary ? (
                        <div className="space-y-2">
                          <Progress value={summary.agreement_score} />
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(summary.label_counts).map(([label, count]) => (
                              <Badge
                                key={label}
                                variant="outline"
                                  className="border-border/40 bg-background/50 text-xs font-mono text-muted-foreground xl:text-sm"
                                >
                                  {label}: {count}
                                </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Accordion type="multiple" className="rounded-2xl border border-border/40 bg-muted/10 px-4">
          {ensemble ? (
            <AccordionItem value="runs">
              <AccordionTrigger className="text-base font-medium xl:text-lg">
                Run-by-run evidence
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-3 lg:grid-cols-2">
                  {ensemble.runs.map((run) => (
                    <div
                      key={run.sample_index}
                      className="rounded-xl border border-border/30 bg-background/60 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant="outline" className="border-border/40 bg-muted/30 font-mono text-xs xl:text-sm">
                          Sample #{run.sample_index}
                        </Badge>
                        <span className="text-xs text-muted-foreground xl:text-sm">
                          {formatMetricValue("val_sp500_price", run.reply.val_sp500_price, {
                            compact: true,
                          })} S&P
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {METRICS.map((metric) => (
                          <div key={metric.key} className="rounded-lg bg-muted/20 px-3 py-2">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
                              {metric.label}
                            </p>
                            <p className="font-mono text-base text-foreground xl:text-lg">
                              {formatMetricValue(metric.key, run.reply[metric.key], {
                                compact: true,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 space-y-2">
                        {NARRATIVES.map((narrative) => {
                          const parsed = parseNarrative(run.reply[narrative.key])
                          return (
                            <div key={narrative.key} className="rounded-lg bg-muted/20 px-3 py-2">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
                                {narrative.label}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                <span
                                   className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold xl:text-sm ${sentimentColor(parsed.label)}`}
                                 >
                                   {parsed.label}
                                 </span>
                                 <span className="text-sm text-foreground/70 xl:text-base">
                                   {parsed.description}
                                 </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          {data.display_articles?.length ? (
            <AccordionItem value="articles">
              <AccordionTrigger className="text-base font-medium xl:text-lg">
                Related coverage
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid gap-4 xl:grid-cols-3">
                  {data.display_articles.map((article) => (
                    <ArticleCard
                      key={article.url}
                      title={article.title}
                      content={article.content}
                      url={article.url}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          <AccordionItem value="prompt">
            <AccordionTrigger className="text-base font-medium xl:text-lg">
              Prompt inspection
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <PromptPanel
                  title="Narrative prompt"
                  subtitle="Text sent into Groq before the model ensemble is constructed"
                  content={data.prompt_details?.narrative_prompt ?? "No narrative prompt available."}
                />
                <PromptPanel
                  title="Model prompt"
                  subtitle="Structured payload sent to the HPC-hosted model"
                  content={promptJson(data.prompt_details?.model_prompt ?? reply)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {!data.display_articles?.length && data.sources?.length ? (
            <AccordionItem value="sources">
              <AccordionTrigger className="text-base font-medium xl:text-lg">
                Source context
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {data.sources.map((source) => (
                    <a
                      key={source}
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-border/40 bg-background/70 px-3 py-1.5 text-sm text-primary hover:border-primary/40 hover:bg-primary/5"
                    >
                      {source}
                    </a>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function SummaryStat({
  title,
  value,
  subtitle,
  progressValue,
  icon,
}: {
  title: string
  value: string
  subtitle: string
  progressValue: number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 shadow-sm shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground xl:text-4xl">
            {value}
          </p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          {icon}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Progress value={progressValue} />
        <p className="text-sm leading-relaxed text-muted-foreground xl:text-base">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/50 px-3 py-2 ring-1 ring-border/20">
      <p className="text-xs uppercase tracking-wider text-muted-foreground/60 xl:text-sm">
        {label}
      </p>
      <p className="mt-1 text-base font-mono text-foreground xl:text-lg">
        {value}
      </p>
    </div>
  )
}

function ArticleCard({
  title,
  content,
  url,
}: {
  title: string
  content: string
  url: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-2xl border border-border/30 bg-background/60 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-base font-semibold leading-snug text-foreground xl:text-lg">
            {title}
          </p>
          <p className="text-sm leading-relaxed text-foreground/75 xl:text-base">
            {content}
          </p>
        </div>
        <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
      <p className="mt-3 text-xs text-primary/80 xl:text-sm">{url}</p>
    </a>
  )
}

function PromptPanel({
  title,
  subtitle,
  content,
}: {
  title: string
  subtitle: string
  content: string
}) {
  return (
    <div className="rounded-2xl border border-border/30 bg-background/60 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <FileText className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-base font-medium text-foreground xl:text-lg">{title}</p>
          <p className="text-sm text-muted-foreground xl:text-base">{subtitle}</p>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto rounded-xl bg-muted/20 p-3 text-xs leading-relaxed text-foreground/80 ring-1 ring-border/20 whitespace-pre-wrap break-words xl:text-sm">
        {content}
      </pre>
    </div>
  )
}
