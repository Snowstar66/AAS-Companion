import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleHelp,
  Flag,
  FlaskConical,
  Layers3,
  PencilRuler,
  ShieldCheck,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";

type HelpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

const processSteps = [
  {
    title: "Framing",
    subtitle: "Agree the outcome and direction before anyone starts building.",
    result: "Result: clear intent",
    icon: Target,
    tone: "border-sky-200 bg-sky-50/75 text-sky-950",
    bullets: [
      {
        title: "Define the problem",
        detail: "Make the current pain or missed opportunity explicit so the team solves the right thing."
      },
      {
        title: "Define the outcome",
        detail: "Describe the change you want, not the implementation you happen to imagine today."
      },
      {
        title: "Set baseline and success",
        detail: "Anchor the work in today's reality so later progress can be judged against something concrete."
      },
      {
        title: "Decide AI level and direction",
        detail: "Choose how much AI to use and outline the rough functional path before decomposing the work."
      }
    ]
  },
  {
    title: "Design",
    subtitle: "Turn intent into testable, build-ready input.",
    result: "Result: build-ready input",
    icon: PencilRuler,
    tone: "border-emerald-200 bg-emerald-50/75 text-emerald-950",
    bullets: [
      {
        title: "Create Epics",
        detail: "Break the outcome into major value slices so the team can reason about scope and direction."
      },
      {
        title: "Create Stories",
        detail: "Turn each Epic into small delivery units that can be reviewed, built and tested."
      },
      {
        title: "Define acceptance criteria and tests",
        detail: "Be explicit about how success will be checked before build work starts."
      },
      {
        title: "Define AI usage scope",
        detail: "State where AI helps, where humans decide and what still needs approval."
      }
    ]
  },
  {
    title: "Build (AI tools)",
    subtitle: "Use Codex, BMAD or similar tools to execute the already-structured work.",
    result: "This tool does not build the code",
    icon: Bot,
    tone: "border-amber-200 bg-amber-50/75 text-amber-950",
    bullets: [
      {
        title: "Generate code",
        detail: "AI tools help produce implementation faster once the work is properly framed and designed."
      },
      {
        title: "Run tests and iterate",
        detail: "Outputs are checked against the tests and acceptance criteria that were defined beforehand."
      },
      {
        title: "Keep humans responsible",
        detail: "AI accelerates delivery, but humans still own mandate, quality and approval."
      }
    ]
  }
] as const;

const usageSignals = [
  {
    title: "New feature",
    detail: "Use the tool when you need to align the team around what should be built before the build starts."
  },
  {
    title: "Unclear requirements",
    detail: "Use it when the desired outcome is still fuzzy and the team needs a shared structure before execution."
  },
  {
    title: "AI-heavy development",
    detail: "Use it when AI will be used heavily and you want explicit control, traceability and test-before-build discipline."
  }
] as const;

const nonGoals = [
  "It does not generate code.",
  "It does not replace developers.",
  "It does not auto-approve decisions.",
  "It does not replace agile methods."
] as const;

const principles = [
  {
    title: "Outcome before output",
    detail: "Start from the business effect you want, not from prompts, tickets or implementation fragments.",
    tone: "border-emerald-200 bg-emerald-50/75 text-emerald-950"
  },
  {
    title: "Test before build",
    detail: "Define what good looks like before AI starts producing code.",
    tone: "border-sky-200 bg-sky-50/75 text-sky-950"
  },
  {
    title: "AI is controlled acceleration",
    detail: "AI speeds up execution, but only inside a clear human-owned structure.",
    tone: "border-amber-200 bg-amber-50/75 text-amber-950"
  },
  {
    title: "Human remains responsible",
    detail: "Mandate, approval and accountability stay with people, not with the tool.",
    tone: "border-border/70 bg-muted/20 text-foreground"
  }
] as const;

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const query = searchParams ? await searchParams : {};
  const returnTo = normalizeReturnTo(getParamValue(query.returnTo));

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Help",
        sectionLabel: "Help",
        badge: "Global intro"
      }}
    >
      <section className="space-y-8">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,250,0.94))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <CircleHelp className="h-3.5 w-3.5 text-primary" />
                Quick start
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">What is this tool?</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts,
                  you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <Link href={returnTo}>
                    Back to work
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm sm:grid-cols-2 xl:w-[420px] xl:grid-cols-1">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-sky-700" />
                  <p className="font-medium text-sky-950">Framing</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-sky-900">Agree what matters before the work gets decomposed.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-5 w-5 text-emerald-700" />
                  <p className="font-medium text-emerald-950">Design</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-900">Turn intent into Epics, Stories, tests and AI usage boundaries.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:col-span-2 xl:col-span-1">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-amber-700" />
                  <p className="font-medium text-amber-950">Build</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-amber-900">AI tools accelerate execution, but humans still own approval and accountability.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>How it fits into AI development</CardTitle>
              <CardDescription>
                Inspired by the AAS Framing and operating-model view: move from intent, to structure, to controlled AI execution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(14,116,144,0.06),rgba(255,255,255,0.92),rgba(245,158,11,0.08))] p-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Framing -&gt; Design -&gt; Build (AI tools)</p>
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div className="contents" key={step.title}>
                        <div className={`rounded-3xl border p-5 shadow-sm ${step.tone}`}>
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-current/15 bg-white/70 p-2">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-current/70">Step {index + 1}</p>
                              <p className="mt-1 text-xl font-semibold text-current">{step.title}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-current/85">{step.subtitle}</p>
                        </div>
                        {index < processSteps.length - 1 ? (
                          <div className="hidden items-center justify-center lg:flex">
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="font-medium text-foreground">Who decides?</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">You and the team decide the outcome, the structure and the guardrails.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <p className="font-medium text-foreground">What gets defined?</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Stories, acceptance criteria and tests are made explicit before build starts.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="font-medium text-foreground">What stays human?</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Approval, mandate and final responsibility stay with humans throughout the flow.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>When to use this tool</CardTitle>
                <CardDescription>Use it when you need structure before acceleration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {usageSignals.map((item) => (
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item.title}>
                    <div className="flex items-center gap-3">
                      <Flag className="h-4 w-4 text-primary" />
                      <p className="font-medium text-foreground">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>What this tool does NOT do</CardTitle>
                <CardDescription>It improves readiness and control, not automation-by-default.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nonGoals.map((item) => (
                  <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4" key={item}>
                    <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>What happens in each step</CardTitle>
            <CardDescription>Keep the operating model simple: humans define the work, AI accelerates the build.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 xl:grid-cols-3">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div className={`rounded-3xl border p-5 ${step.tone}`} key={step.title}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-current/15 bg-white/70 p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-current">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-current/80">{step.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {step.bullets.map((bullet) => (
                      <div className="rounded-2xl border border-current/10 bg-white/70 p-4" key={bullet.title}>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-current" />
                          <div>
                            <p className="font-medium text-current">{bullet.title}</p>
                            <p className="mt-1 text-sm leading-6 text-current/80">{bullet.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-current/15 bg-white/75 px-4 py-3 text-sm font-medium text-current">
                    {step.result}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Key principles</CardTitle>
              <CardDescription>AAS-aligned, but expressed in practical language.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {principles.map((item) => (
                <div className={`rounded-2xl border p-4 ${item.tone}`} key={item.title}>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Quick diagrams</CardTitle>
              <CardDescription>Three compact views of the tool's logic and responsibility split.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 1: delivery flow</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                  {[
                    { label: "Customer", icon: Users },
                    { label: "Framing", icon: Target },
                    { label: "Design", icon: Layers3 },
                    { label: "AI Build", icon: Bot }
                  ].map((item, index, items) => {
                    const Icon = item.icon;

                    return (
                      <div className="contents" key={item.label}>
                        <div className="rounded-2xl border border-border/70 bg-background/85 p-4 text-center">
                          <Icon className="mx-auto h-5 w-5 text-primary" />
                          <p className="mt-2 text-sm font-medium text-foreground">{item.label}</p>
                        </div>
                        {index < items.length - 1 ? (
                          <div className="hidden justify-center sm:flex">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 2: value spine</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-950">Outcome</div>
                  <div className="pl-4">
                    <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm font-medium text-sky-950">Epic</div>
                  </div>
                  <div className="pl-8">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-950">Story</div>
                  </div>
                  <div className="pl-12">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Test</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 3: responsibility split</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-sky-700" />
                      <p className="font-medium text-sky-950">You decide what and how</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-sky-900">Outcome, structure, tests, AI level, guardrails and sign-off stay on the human side.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-amber-700" />
                      <p className="font-medium text-amber-950">AI helps build it</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-amber-900">Codex, BMAD and similar tools accelerate implementation after the work is properly framed and designed.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
