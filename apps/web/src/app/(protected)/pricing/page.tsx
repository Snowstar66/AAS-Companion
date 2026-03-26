import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Compass, Shield, Workflow } from "lucide-react";
import { getProjectPricingWorkspaceService } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { requireOrganizationContext } from "@/lib/auth/guards";

type PricingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatAiLevel(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not selected yet";
}

function formatSignalValue(value: string) {
  return value.replaceAll("_", " ");
}

function toneClasses(input: { tone: "neutral" | "ready" | "risk" | "blocked" }) {
  if (input.tone === "ready") {
    return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
  }

  if (input.tone === "risk") {
    return "border-amber-200 bg-amber-50/80 text-amber-950";
  }

  if (input.tone === "blocked") {
    return "border-rose-200 bg-rose-50/80 text-rose-950";
  }

  return "border-border/70 bg-muted/20 text-foreground";
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const organization = await requireOrganizationContext();
  const query = searchParams ? await searchParams : {};
  const outcomeId = getParamValue(query.outcomeId);
  const pricing = await getProjectPricingWorkspaceService({
    organizationId: organization.organizationId,
    ...(outcomeId ? { outcomeId } : {})
  });

  if (!pricing.ok) {
    return (
      <AppShell
        topbarProps={{
          projectName: organization.organizationName,
          sectionLabel: "Pricing",
          badge: "Unavailable"
        }}
      >
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Pricing is unavailable</CardTitle>
            <CardDescription>{pricing.errors[0]?.message ?? "The pricing workspace could not be loaded."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const data = pricing.data;
  const selectedOutcome = data.selectedOutcome;
  const classificationTone =
    data.evaluation.classification.key === "uncertain_fallback" ? "risk" : "neutral";
  const readinessTone =
    data.evaluation.readiness.state === "ready"
      ? "ready"
      : data.evaluation.readiness.state === "conditionally_ready"
        ? "risk"
        : "blocked";

  return (
    <AppShell
      topbarProps={{
        projectName: organization.organizationName,
        sectionLabel: "Pricing",
        badge: "Project section"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(24,63,94,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.85fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                Commercial fit
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">Pricing guidance</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                Pricing is advisory only. This page uses the active project context to suggest a suitable AAS pricing model,
                explain why it fits, and surface what still blocks commercial confidence.
              </p>
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/85 p-4 text-sm text-sky-950">
                <p className="font-medium">Pricing does not equal approval</p>
                <p className="mt-2">
                  Human Review, governance validation, Value Spine progression and tollgates remain separate. This page
                  recommends a model, but it does not create a bypass around AAS controls.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: classificationTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Project classification</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{data.evaluation.classification.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.evaluation.classification.description}</p>
              </div>
              <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses({ tone: readinessTone })}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pricing readiness</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{data.evaluation.readiness.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.evaluation.readiness.description}</p>
              </div>
              <div className="rounded-3xl border border-sky-200 bg-sky-50/85 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Recommended model</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-sky-950">{data.evaluation.recommendation.label}</p>
                <p className="mt-2 text-sm leading-6 text-sky-900/80">Recommended, but not enforced.</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/90 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current AI level</p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {formatAiLevel(data.signals.aiLevel.value)}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.signals.aiLevel.detail}</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))] shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle>Pricing context</CardTitle>
                <CardDescription>
                  {selectedOutcome
                    ? `Commercial guidance is currently anchored to ${selectedOutcome.key} inside the active project.`
                    : "Pricing can load before Framing is complete, but it will stay conservative until a project branch exists."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/framing?outcomeId=${selectedOutcome.id}` : "/framing"}>
                    <Compass className="mr-2 h-4 w-4" />
                    Open Framing
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={selectedOutcome ? `/workspace?framing=${selectedOutcome.id}` : "/workspace"}>
                    <Workflow className="mr-2 h-4 w-4" />
                    Open Value Spine
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link
                    href={
                      selectedOutcome
                        ? `/governance?view=readiness&sourceEntity=outcome&sourceId=${selectedOutcome.id}&level=${data.governance.selectedAiLevel}`
                        : `/governance?view=readiness&level=${data.governance.selectedAiLevel}`
                    }
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Open Governance
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
              <div className="rounded-3xl border border-border/70 bg-background/90 p-5">
                {selectedOutcome ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedOutcome.key}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {formatAiLevel(selectedOutcome.aiAccelerationLevel)}
                      </span>
                      <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {selectedOutcome.riskProfile} risk profile
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-foreground">{selectedOutcome.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedOutcome.outcomeStatement ?? "Outcome statement is still missing."}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-foreground">No active Framing branch yet</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Pricing still renders, but it falls back to a cautious recommendation until a real project branch is available.
                    </p>
                  </>
                )}
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/15 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current governance signal</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{data.governance.summaryTitle}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.governance.summaryMessage}</p>
              </div>
            </div>

            {data.availableOutcomes.length > 1 ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Switch pricing branch</p>
                <div className="-mx-1 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-2 px-1">
                    {data.availableOutcomes.map((outcome) => (
                      <Button
                        asChild
                        key={outcome.id}
                        size="sm"
                        variant={selectedOutcome?.id === outcome.id ? "default" : "secondary"}
                      >
                        <Link href={`/pricing?outcomeId=${outcome.id}`}>
                          {outcome.key}: {outcome.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={data.signals.baseline.detail}
                label="Baseline exists"
                value={data.signals.baseline.value === "yes" ? "Yes" : "No"}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={data.signals.outcomeClarity.detail}
                label="Outcome clarity"
                value={formatSignalValue(data.signals.outcomeClarity.value)}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={data.signals.scopeStability.detail}
                label="Scope stability"
                value={formatSignalValue(data.signals.scopeStability.value)}
              />
              <ActionSummaryCard
                className="border-border/70 bg-background/90 shadow-sm"
                description={`Visible in the selected branch: ${data.summary.epicCount} epics, ${data.summary.storyCount} stories.`}
                label="Imported lineage"
                value={data.summary.importedLineageCount}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Why this model is recommended</CardTitle>
              <CardDescription>The recommendation updates with Framing, Value Spine and governance signals, but it does not auto-select anything.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.evaluation.recommendation.rationale.map((reason) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground" key={reason}>
                  {reason}
                </div>
              ))}

              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
                <p className="font-medium">Simple selection flow</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">Framing signals</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">Project classification</span>
                  <ArrowRight className="h-4 w-4 text-sky-600" />
                  <span className="rounded-full border border-sky-200 bg-white px-3 py-1">Advisory pricing model</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Process guardrails</CardTitle>
              <CardDescription>These AAS controls remain in force even when pricing guidance looks strong.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.guardrails.map((guardrail) => (
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    guardrail.status === "covered"
                      ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                      : "border-amber-200 bg-amber-50/80 text-amber-950"
                  }`}
                  key={guardrail.key}
                >
                  <p className="font-medium">{guardrail.title}</p>
                  <p className="mt-2">{guardrail.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Blocking items</CardTitle>
              <CardDescription>These issues keep the pricing posture out of a clean green state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.blockers.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">
                  No blocking pricing issues are currently visible.
                </div>
              ) : (
                data.evaluation.blockers.map((item) => (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4 text-sm text-rose-950" key={item.key}>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2">{item.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Risks to keep visible</CardTitle>
              <CardDescription>These items do not block all pricing discussion, but they should stay explicit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.evaluation.risks.length === 0 ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-950">
                  No additional pricing risks are currently visible.
                </div>
              ) : (
                data.evaluation.risks.map((item) => (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-950" key={item.key}>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-2">{item.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Pricing models</CardTitle>
            <CardDescription>All three models stay visible so the recommendation is explainable rather than hidden inside a black box.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-3">
            {data.evaluation.models.map((model) => {
              const recommended = model.key === data.evaluation.recommendation.modelKey;

              return (
                <div
                  className={`rounded-3xl border p-5 ${
                    recommended
                      ? "border-sky-300 bg-sky-50/80 shadow-sm"
                      : "border-border/70 bg-muted/15"
                  }`}
                  key={model.key}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{model.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{model.tagline}</p>
                    </div>
                    {recommended ? (
                      <span className="inline-flex rounded-full border border-sky-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                        Recommended
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">When to use</p>
                      <p className="mt-2 leading-6 text-muted-foreground">{model.whenToUse}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">Strengths</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {model.strengths.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                      <p className="font-medium text-foreground">Risks</p>
                      <div className="mt-2 space-y-2 text-muted-foreground">
                        {model.risks.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
