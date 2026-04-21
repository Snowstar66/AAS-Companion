"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Compass,
  Layers3,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { helpContent, type HelpLanguage } from "@/components/help/help-page-content.data";
import { useAppLanguage } from "@/components/layout/app-language";
import { FlagIcon } from "@/components/shared/flag-icon";

const processStepIcons = [Target, Layers3, LibraryBig] as const;
const processStepIconClasses = ["text-sky-700", "text-amber-700", "text-emerald-700"] as const;

export function HelpPageContent(props: { returnTo: string }) {
  const { language, setLanguage } = useAppLanguage();
  const content = helpContent[language as HelpLanguage];

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.94))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <AasBrandMark subtitle="Operating model for controlled AI delivery" />
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <CircleHelp className="h-3.5 w-3.5 text-primary" />
                  {content.heroBadge}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/90 p-1.5 shadow-sm">
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Switch help page to English"
                    aria-pressed={language === "en"}
                    className={`inline-flex h-10 w-12 items-center justify-center rounded-xl text-base transition ${
                      language === "en"
                        ? "border border-primary/30 bg-primary/10 text-foreground shadow-sm"
                        : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40"
                    }`}
                    onClick={() => setLanguage("en")}
                    title="English"
                    type="button"
                  >
                    <FlagIcon className="h-5 w-7" country="gb" />
                  </button>
                  <button
                    aria-label="Byt hjälpsidan till svenska"
                    aria-pressed={language === "sv"}
                    className={`inline-flex h-10 w-12 items-center justify-center rounded-xl text-base transition ${
                      language === "sv"
                        ? "border border-primary/30 bg-primary/10 text-foreground shadow-sm"
                        : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/40"
                    }`}
                    onClick={() => setLanguage("sv")}
                    title="Svenska"
                    type="button"
                  >
                    <FlagIcon className="h-5 w-7" country="se" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{content.heroTitle}</h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{content.heroIntro}</p>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{content.heroBody}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href={props.returnTo}>
                  {content.backToWork}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">{content.processHeading}</p>
            <div className="mt-4 space-y-3">
              {content.processSteps.map((step, index) => {
                const Icon = processStepIcons[index] ?? Target;
                const iconClass = processStepIconClasses[index] ?? "text-sky-700";

                return (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-3.5" key={step.title}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-border/70 bg-background/90 p-2">
                        <Icon className={`h-4.5 w-4.5 ${iconClass}`} />
                      </div>
                      <p className="font-medium text-foreground">{step.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>{content.practiceTitle}</CardTitle>
            <CardDescription>{content.practiceDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.quickTakeaways.map((item) => (
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>{content.nonGoalsTitle}</CardTitle>
            <CardDescription>{content.nonGoalsDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.nonGoals.map((item) => (
              <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.waterfallDescription} title={content.waterfallTitle}>
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm leading-7 text-muted-foreground">{content.waterfallIntro}</p>
              <p className="text-sm leading-7 text-muted-foreground">{content.waterfallBody}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                <p className="font-semibold text-sky-950">{content.waterfallFeedbackTitle}</p>
                <div className="mt-4 space-y-3">
                  {content.waterfallFeedbackItems.map((item) => (
                    <div className="rounded-2xl border border-sky-200 bg-white p-4 text-sm leading-6 text-slate-700" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50/75 p-5">
                <p className="font-semibold text-amber-950">{content.waterfallBacktrackingTitle}</p>
                <p className="mt-3 text-sm leading-7 text-amber-950">{content.waterfallBacktrackingBody}</p>
                <div className="mt-4 space-y-3">
                  {content.waterfallBacktrackingItems.map((item) => (
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/75 p-5">
                <p className="font-semibold text-emerald-950">{content.waterfallEnablesTitle}</p>
                <div className="mt-4 space-y-3">
                  {content.waterfallEnablesItems.map((item) => (
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-6 text-slate-700" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
              <p className="font-semibold text-foreground">{content.waterfallMatrixTitle}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{content.waterfallSummary}</p>
              <div className="mt-4 overflow-x-auto rounded-3xl border border-border/70 bg-background">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/20 text-left">
                      <th className="px-4 py-3 font-semibold text-foreground">{content.waterfallMatrixHeaders[0]}</th>
                      <th className="px-4 py-3 font-semibold text-rose-900">{content.waterfallMatrixHeaders[1]}</th>
                      <th className="px-4 py-3 font-semibold text-emerald-900">{content.waterfallMatrixHeaders[2]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.waterfallMatrix.map((row) => (
                      <tr className="border-b border-border/50 align-top" key={row.dimension}>
                        <th className="bg-muted/10 px-4 py-3 text-left font-semibold text-foreground">{row.dimension}</th>
                        <td className="px-4 py-3 leading-6 text-muted-foreground">{row.waterfall}</td>
                        <td className="px-4 py-3 leading-6 text-muted-foreground">{row.aas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.faqDescription} title={content.faqTitle}>
          <div className="space-y-4">
            {content.faqItems.map((item) => (
              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5" key={item.question}>
                <p className="font-semibold text-foreground">{item.question}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="font-semibold text-emerald-950">{content.faqSummaryTitle}</p>
              <p className="mt-3 text-sm leading-7 text-emerald-950">{content.faqSummaryBody}</p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.deliveryTypesDescription} title={content.deliveryTypesTitle}>
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              {content.deliveryTypeCards.map((card) => (
                <div className={card.cardClassName} key={card.short}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${card.shortClassName}`}>{card.short}</p>
                  <p className={`mt-2 font-semibold ${card.titleClassName}`}>{card.title}</p>
                  <p className={`mt-2 text-sm leading-6 ${card.bodyClassName}`}>{card.body}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border/70 bg-background">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">{content.matrixDimensionHeader}</th>
                    <th className="px-4 py-3 font-semibold text-sky-900">{content.matrixHeaders[0]}</th>
                    <th className="px-4 py-3 font-semibold text-amber-900">{content.matrixHeaders[1]}</th>
                    <th className="px-4 py-3 font-semibold text-emerald-900">{content.matrixHeaders[2]}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.deliveryTypeMatrix.map((row) => (
                    <tr className="border-b border-border/50 align-top" key={row.dimension}>
                      <th className="bg-muted/10 px-4 py-3 text-left font-semibold text-foreground">{row.dimension}</th>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.ad}</td>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.at}</td>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.am}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.principlesDescription} title={content.principlesTitle}>
          <div className="grid gap-4 lg:grid-cols-2">
            {content.principles.map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item.title}>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.aiDescription} title={content.aiTitle}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
            <div className="space-y-3">
              {content.levelNotes.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                  <div className="flex items-start gap-3">
                    <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">{content.reviewApprovalTitle}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.reviewApprovalBody}</p>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          accentClassName="border-border/70 bg-background/95"
          description={content.roleLevelsDescription}
          title={content.roleLevelsTitle}
        >
          <div className="space-y-5">
            <p className="text-sm leading-7 text-muted-foreground">{content.roleLevelsIntro}</p>

            <div className="flex flex-wrap gap-3">
              {content.roleLevelsLegend.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-sm" key={`${item.label}-${item.meaning}`}>
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="ml-2 text-muted-foreground">{item.meaning}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border/70 bg-background">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20 text-left">
                    {content.roleLevelsHeaders.map((header, index) => (
                      <th
                        className={`px-4 py-3 font-semibold ${
                          index >= 4
                            ? index === 4
                              ? "text-sky-900"
                              : index === 5
                                ? "text-amber-900"
                                : "text-emerald-900"
                            : "text-foreground"
                        }`}
                        key={header}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.roleLevelsMatrix.map((row) => (
                    <tr className="border-b border-border/50 align-top" key={row.role}>
                      <th className="bg-muted/10 px-4 py-3 text-left font-semibold text-foreground">{row.role}</th>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.mandateFocus}</td>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.responsibility}</td>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{row.criticalDecisions}</td>
                      <td className="px-4 py-3 font-semibold text-sky-900">{row.level1}</td>
                      <td className="px-4 py-3 font-semibold text-amber-900">{row.level2}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-900">{row.level3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.spineDescription} title={content.spineTitle}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <div className="flex items-center gap-3">
                  <Waypoints className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground">{content.spineFormula}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.spineFormulaBody}</p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <p className="text-sm font-medium text-foreground">{content.compactDiagramTitle}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">{content.compactDiagramLabels[0]}</div>
                  <div className="pl-4">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">{content.compactDiagramLabels[1]}</div>
                  </div>
                  <div className="pl-8">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">{content.compactDiagramLabels[2]}</div>
                  </div>
                  <div className="pl-12">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">{content.compactDiagramLabels[3]}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {content.spineBullets.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection accentClassName="border-border/70 bg-background/95" description={content.toolingDescription} title={content.toolingTitle}>
          <div className="grid gap-4 lg:grid-cols-2">
            {content.toolingItems.map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item.title}>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

      </div>
    </section>
  );
}
