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
  {
    title: "Framing",
    icon: Target,
    iconClass: "text-sky-700",
    description: "Clarify the business effect, the baseline, the owner and the intended AI direction before detailed delivery work starts."
  },
  {
    title: "Design",
    icon: Layers3,
    iconClass: "text-emerald-700",
    description: "Turn the agreed direction into Epics, Stories, test definitions and explicit AI usage boundaries."
  },
  {
    title: "Build (AI tools)",
    icon: Bot,
    iconClass: "text-amber-700",
    description: "Use tools such as Codex or BMAD only after the work is structured, testable and ready for review."
  },
  {
    title: "Transfer",
    icon: LibraryBig,
    iconClass: "text-violet-700",
    description: "Move from delivery into ownership with documentation, reproducibility, monitoring and follow-up still intact."
  }
] as const;

const principles = [
  {
    title: "Outcome before output",
    detail: "AAS starts from the effect the business wants to achieve. That keeps the team from producing more code without producing more value."
  },
  {
    title: "Value Spine is mandatory",
    detail: "Outcome, Epic, Story and Test stay connected so each delivery step can be traced from business effect to verified implementation."
  },
  {
    title: "AI is a level, not a tool choice",
    detail: "AI usage is chosen as an explicit acceleration level. That means governance, review depth and reproducibility scale with the chosen level."
  },
  {
    title: "Test and quality are integrated from the start",
    detail: "Stories should become testable before build work starts. Quality is not added afterwards; it is part of the structure from the beginning."
  },
  {
    title: "Human mandate remains",
    detail: "AI can assist with analysis, content, tests and code, but review, approval and risk acceptance stay with named people."
  }
] as const;

const quickTakeaways = [
  "AAS is an operating layer on top of agile, DevOps and ITIL. It adds control rather than replacing existing delivery models.",
  "Value Spine creates traceability from affärseffekt to verified implementation: Outcome -> Epic -> Story -> Test.",
  "No design should begin without a defined Outcome, and no implementation should begin without testable Delivery Stories.",
  "No AI-generated code should reach production without human review and formal approval."
] as const;

const nonGoals = [
  "It does not generate code.",
  "It does not replace developers.",
  "It does not auto-approve decisions.",
  "It does not replace agile methods."
] as const;

const levelNotes = [
  "Level 1 means assisted delivery with close human review.",
  "Level 2 means structured acceleration with stronger AI review and reproducibility expectations.",
  "Level 3 means orchestrated agentic delivery, which only makes sense when governance, roles and oversight are mature."
] as const;

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const query = searchParams ? await searchParams : {};
  const returnTo = normalizeReturnTo(getParamValue(query.returnTo));

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        title: "Help",
        sectionLabel: "Help",
        badge: "Method guide"
      }}
    >
      <section className="space-y-8">
        <div className="rounded-3xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,249,0.94))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <AasBrandMark subtitle="Operating model for controlled AI delivery" />
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <CircleHelp className="h-3.5 w-3.5 text-primary" />
                  Help
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">What is this tool?</h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts,
                  you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.
                </p>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  In AAS terms, the tool acts as an operating layer for Application Services. It makes AI acceleration more structured,
                  reviewable and safe by keeping business intent, delivery structure and human responsibility visible all the way through.
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

            <div className="w-full max-w-[430px] rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Framing -&gt; Design -&gt; Build (AI tools)</p>
              <div className="mt-4 space-y-3">
                {processSteps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={step.title}>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-border/70 bg-background/90 p-2">
                          <Icon className={`h-5 w-5 ${step.iconClass}`} />
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>AAS in practice</CardTitle>
              <CardDescription>What the operating model adds on top of ordinary delivery work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                AAS does not replace agile, DevOps or ITIL. It adds a control layer that makes AI usage explicit, keeps delivery traceable
                and ensures that humans still carry mandate and risk acceptance.
              </p>
              <div className="space-y-3">
                {quickTakeaways.map((item) => (
                  <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>What this tool does NOT do</CardTitle>
              <CardDescription>The tool improves readiness and governance. It is not automation by default.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nonGoals.map((item) => (
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                  <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Five core principles</CardTitle>
            <CardDescription>The help text below is adapted from the AAS operating model, but written for day-to-day use inside the app.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {principles.map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-5" key={item.title}>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Quick diagrams</CardTitle>
              <CardDescription>Two compact diagrams to anchor the core concepts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 1: value spine</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Outcome</div>
                  <div className="pl-4">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Epic</div>
                  </div>
                  <div className="pl-8">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Story</div>
                  </div>
                  <div className="pl-12">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Test</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <p className="text-sm font-medium text-foreground">Diagram 2: responsibility split</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-medium text-foreground">Human side</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Humans own outcome, review, approval and risk acceptance.</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background p-4">
                    <Bot className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-medium text-foreground">AI side</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">AI helps with acceleration only inside the structure humans have already defined.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Why the structure matters</CardTitle>
              <CardDescription>Without structure, AI can still produce output, but the output becomes much harder to trust, review and reuse.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <div className="flex items-center gap-3">
                  <Waypoints className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground">Value Spine turns output into governed delivery</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  In the operating model, Value Spine is not just a documentation pattern. It is the control mechanism that makes AI usage
                  compatible with enterprise requirements for transparency, reviewability and responsibility.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Outcome defines the business effect, the owner and the baseline.",
                  "Epic groups a meaningful value slice so scope and direction stay understandable.",
                  "Story becomes the smallest governed delivery unit with acceptance criteria, tests and AI scope.",
                  "Test provides the evidence that the intended change actually happened."
                ].map((item) => (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            defaultOpen
            description="A calmer, more detailed reading of the AAS method and where this application fits in."
            title="AAS method deep dive"
          >
            <div className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                AAS describes four connected phases: Framing, Design, Build and Transfer. The important idea is that the organization
                should not jump straight from a vague need into AI-assisted implementation. First the effect is defined, then the work is
                structured, then implementation is accelerated and finally the result is transferred into ongoing ownership.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {processSteps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div className="rounded-3xl border border-border/70 bg-muted/10 p-5" key={step.title}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-border/70 bg-background/90 p-2">
                          <Icon className={`h-5 w-5 ${step.iconClass}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{step.title}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="AAS treats AI usage as an explicit acceleration level, not as an informal habit."
            title="AI levels and human mandate"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
              <div className="space-y-3">
                {levelNotes.map((item) => (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                    <div className="flex items-start gap-3">
                      <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <p className="font-semibold text-foreground">Review and approval are not the same</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Review verifies artifact quality against requirements, architecture and tests. Approval is the formal human decision to
                  accept remaining risk and allow release or transition. AAS keeps both visible because human mandate remains.
                </p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </section>
    </AppShell>
  );
}
