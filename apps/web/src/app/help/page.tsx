import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Compass,
  Layers3,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Waypoints
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";
import { CollapsibleSection } from "@/components/shared/collapsible-section";

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
  { title: "Framing", icon: Target, tone: "border-sky-200 bg-sky-50/75 text-sky-950", subtitle: "Agree the outcome, baseline and AI direction before work is decomposed." },
  { title: "Design", icon: Layers3, tone: "border-emerald-200 bg-emerald-50/75 text-emerald-950", subtitle: "Turn intent into Epics, Stories, tests and clear AI boundaries." },
  { title: "Build (AI tools)", icon: Bot, tone: "border-amber-200 bg-amber-50/75 text-amber-950", subtitle: "Accelerate implementation with tools like Codex or BMAD under human review." },
  { title: "Transfer", icon: LibraryBig, tone: "border-violet-200 bg-violet-50/75 text-violet-950", subtitle: "Hand over something that is supportable, reproducible and still tied to its outcome." }
] as const;

const principles = [
  "Outcome before output",
  "Value Spine is mandatory",
  "Test before build",
  "AI is a level, not an impulse",
  "Human remains responsible"
] as const;

const quickPoints = [
  "AAS is an operating layer on top of agile, DevOps or ITIL. It does not replace them.",
  "No design should start without a defined Outcome.",
  "No implementation should start without testable Delivery Stories.",
  "No AI-generated code should reach production without human review and approval."
] as const;

const nonGoals = [
  "It does not generate code.",
  "It does not replace developers.",
  "It does not auto-approve decisions.",
  "It does not replace agile methods."
] as const;

const levelNotes = [
  "Level 1: assisted delivery with close human review.",
  "Level 2: structured acceleration with clearer AI review and reproducibility.",
  "Level 3: orchestrated agentic delivery only when governance is mature."
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
        badge: "Method guide"
      }}
    >
      <section className="space-y-8">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,250,0.94))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <AasBrandMark subtitle="Augmented Application Services" />
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <CircleHelp className="h-3.5 w-3.5 text-primary" />
                  Quick start
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">What is this tool?</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts,
                  you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.
                </p>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  In AAS terms, the app acts as an operating layer: business effect first, traceable delivery second, acceleration only
                  when human control and review are clear.
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

            <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm xl:w-[420px]">
              {processSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div className={`rounded-2xl border p-4 ${step.tone}`} key={step.title}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <p className="font-medium">{step.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6">{step.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>How it fits into AI development</CardTitle>
              <CardDescription>Move from business intent to controlled AI execution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(14,116,144,0.06),rgba(255,255,255,0.92),rgba(245,158,11,0.08))] p-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Framing -&gt; Design -&gt; Build (AI tools)</p>
                <div className="mt-5 grid gap-4 lg:grid-cols-4">
                  {processSteps.map((step) => {
                    const Icon = step.icon;

                    return (
                      <div className={`rounded-3xl border p-4 ${step.tone}`} key={step.title}>
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl border border-current/15 bg-white/70 p-2">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="font-semibold">{step.title}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6">{step.subtitle}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium text-foreground">Humans decide</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Outcome, structure, review and approval remain human-owned.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium text-foreground">AI accelerates</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">AI helps once the work is shaped, testable and bounded.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-medium text-foreground">Evidence stays traceable</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Value Spine and review records keep delivery understandable afterwards.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>AAS in one minute</CardTitle>
                <CardDescription>Short phrases from the operating model, rewritten for daily use.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickPoints.map((item) => (
                  <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4" key={item}>
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Key principles</CardTitle>
              <CardDescription>The five ideas the interface is built around.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {principles.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item}>
                  <p className="font-medium text-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Quick diagrams</CardTitle>
              <CardDescription>Small visual summaries of the concept.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 1: value spine</p>
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
                <p className="text-sm font-medium text-foreground">Diagram 2: responsibility split</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
                    <Users className="h-5 w-5 text-sky-700" />
                    <p className="mt-3 font-medium text-sky-950">Human side</p>
                    <p className="mt-2 text-sm leading-6 text-sky-900">Outcome, AI level, review, approval and risk acceptance stay with people.</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                    <Bot className="h-5 w-5 text-amber-700" />
                    <p className="mt-3 font-medium text-amber-950">AI side</p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">Generate options, code, tests or analysis inside the boundaries humans set.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <CollapsibleSection
            accentClassName="border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,0.92),rgba(255,255,255,0.98))]"
            defaultOpen
            description="A deeper but still compact explanation of how AAS thinks about phases and control."
            title="AAS method deep dive"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {processSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div className={`rounded-3xl border p-5 ${step.tone}`} key={step.title}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-current/15 bg-white/70 p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        <p className="mt-2 text-sm leading-6">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.98))]"
            description="AI levels explain how much acceleration is appropriate and how much governance the team must carry."
            title="AI levels and human mandate"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
              <div className="space-y-3">
                {levelNotes.map((item) => (
                  <div className="rounded-2xl border border-border/70 bg-background/85 p-4" key={item}>
                    <div className="flex items-start gap-3">
                      <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5">
                <ShieldCheck className="h-5 w-5 text-rose-700" />
                <p className="mt-3 font-semibold text-rose-950">Human mandate always stays visible</p>
                <p className="mt-2 text-sm leading-6 text-rose-900">
                  Review checks whether the artifact is good enough. Approval accepts risk and allows release. Both remain human decisions.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98))]"
            description="This is the structural backbone behind the app. Without it, AI output gets faster but less trustworthy."
            title="Why the Value Spine matters"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-3xl border border-emerald-200 bg-white/85 p-5">
                <div className="flex items-center gap-3">
                  <Waypoints className="h-5 w-5 text-emerald-700" />
                  <p className="font-semibold text-emerald-950">Outcome -&gt; Epic -&gt; Story -&gt; Test</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-900">This chain makes AI-generated work auditable, reviewable and connected to real business effect.</p>
              </div>
              <div className="space-y-3">
                {[
                  "Outcome defines the business effect and the baseline.",
                  "Epic makes the value slice understandable.",
                  "Story becomes the smallest governed delivery unit.",
                  "Test proves the intended change actually happened."
                ].map((item) => (
                  <div className="rounded-2xl border border-border/70 bg-background/85 p-4" key={item}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </section>
    </AppShell>
  );
}
