"use client"

import { Button } from "@/components/ui/button"
import { scenarios } from "@/lib/scenarios"

interface ScenarioPanelProps {
  onScenarioClick: (scenarioId: string) => void
}

export default function ScenarioPanel({ onScenarioClick }: ScenarioPanelProps) {
  return (
    <aside className="hidden flex-shrink-0 md:block w-64 lg:w-80">
      <div className="h-full overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-4 font-semibold text-card-foreground">Demo Scenarios</h2>
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <Button
              key={scenario.id}
              onClick={() => onScenarioClick(scenario.id)}
              className="w-full justify-start text-left"
              variant="outline"
            >
              <span className="truncate">{scenario.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
