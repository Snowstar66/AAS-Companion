"use client";

import { useState } from "react";
import { Bot, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { formatAiLevelLabel, getHelpPattern, getInlineGuidance } from "@/lib/help/aas-help";
import { InlineFieldGuidance } from "@/components/shared/context-help";

type OutcomeAiRiskPostureCardProps = {
  defaultAiLevel: "level_1" | "level_2" | "level_3";
  defaultRiskProfile: "low" | "medium" | "high";
  disabled?: boolean | undefined;
};

export function OutcomeAiRiskPostureCard({
  defaultAiLevel,
  defaultRiskProfile,
  disabled = false
}: OutcomeAiRiskPostureCardProps) {
  const [aiLevel, setAiLevel] = useState<"level_1" | "level_2" | "level_3">(defaultAiLevel);
  const help = getHelpPattern("framing.ai_level", aiLevel);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>AI and risk posture</CardTitle>
        <CardDescription>Keep the intended AI level and risk posture explicit during the customer handshake.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">AI level</span>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
              defaultValue={defaultAiLevel}
              disabled={disabled}
              name="aiAccelerationLevel"
              onChange={(event) => setAiLevel(event.target.value as "level_1" | "level_2" | "level_3")}
            >
              <option value="level_1">Level 1</option>
              <option value="level_2">Level 2</option>
              <option value="level_3">Level 3</option>
            </select>
            <InlineFieldGuidance guidance={getInlineGuidance("framing.ai_level")} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Risk profile</span>
            <select
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
              defaultValue={defaultRiskProfile}
              disabled={disabled}
              name="riskProfile"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,255,255,0.92))] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
              {formatAiLevelLabel(aiLevel)}
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-950">
              <Bot className="h-4 w-4" />
              Intended AI posture for this case
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">What this level means here</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{help.summary}</p>
              {help.aiLevelNote ? <p className="mt-3 text-sm leading-6 text-slate-700">{help.aiLevelNote}</p> : null}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">What belongs in the handshake</p>
                <p className="mt-2 text-sm leading-6">{help.belongs}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/85 p-4 text-amber-950">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Avoid at this stage</p>
                </div>
                <p className="mt-2 text-sm leading-6">{help.avoid}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
