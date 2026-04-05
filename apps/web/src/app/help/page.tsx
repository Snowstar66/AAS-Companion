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
    description: "Define the outcome, baseline, AI level, risk, epics and story ideas before delivery structure becomes detailed."
  },
  {
    title: "Delivery",
    icon: Layers3,
    iconClass: "text-amber-700",
    description: "Refine story ideas into delivery stories, then add acceptance criteria, tests and build-level structure."
  },
  {
    title: "Feedback loop",
    icon: LibraryBig,
    iconClass: "text-emerald-700",
    description: "Learn from real delivery, extra stories and misalignment without turning feedback into a new gate."
  }
] as const;

const quickTakeaways = [
  "AAS is an operating layer on top of agile, DevOps and ITIL. It adds control rather than replacing existing delivery models.",
  "Value Spine creates traceability from business effect to implementation: Outcome -> Epic -> Story -> Test.",
  "Story Ideas live in Framing. Delivery Stories live later in Design/Build, even when they trace back to the same Epic and Outcome.",
  "No design should begin without a defined Outcome, and no implementation should begin without testable Delivery Stories.",
  "No AI-generated code should reach production without human review and formal approval."
] as const;

const principles = [
  {
    title: "Outcome before output",
    detail: "Start from the effect the business wants to achieve. That keeps teams from producing more code without producing more value."
  },
  {
    title: "Value Spine is mandatory",
    detail: "Outcome, Epic, Story and Test stay connected so delivery remains traceable, reviewable and tied to business intent."
  },
  {
    title: "AI is a level, not a tool choice",
    detail: "AI usage is chosen as an explicit acceleration level. Review depth, evidence and role clarity then scale with that choice."
  },
  {
    title: "Test and quality are integrated from the start",
    detail: "Stories should be testable before build work begins. Quality is built into the structure, not added afterwards."
  },
  {
    title: "Human mandate remains",
    detail: "AI can assist with analysis, content, tests and code, but review, approval and risk acceptance stay with named people."
  }
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

const platformNotes = [
  "One project stays active at a time, so Framing, Value Spine, Import and Review remain project-scoped instead of blending unrelated work.",
  "Readiness, tollgates, sign-off and lineage are shown close to the work instead of being hidden in a separate governance tool.",
  "Native and imported work can coexist, but imported material keeps its review trail until humans decide to promote it.",
  "The current product defaults are Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Supabase, Prisma, PostHog and OpenTelemetry."
] as const;

const deliveryTypeMatrix = [
  {
    dimension: "Primär fråga i Framing",
    ad: "Vad ska vi bygga för att skapa nytt värde?",
    at: "Vad i nuvarande system hindrar värde?",
    am: "Hur optimerar vi befintlig leverans?"
  },
  {
    dimension: "Typ av förändring",
    ad: "Ny funktionalitet / ny kapacitet",
    at: "Strukturell förändring av befintligt",
    am: "Kontinuerlig förbättring"
  },
  {
    dimension: "Utgångsläge (baseline)",
    ad: "Ofta svag eller saknas",
    at: "Obligatorisk och datadriven",
    am: "Objektspecifik och operativ"
  },
  {
    dimension: "Baseline-exempel",
    ad: "Nuvarande manuellt arbetssätt",
    at: "Lead time, tech debt, kostnad, incidenter",
    am: "SLA, incidentdata, kostnad per ärende"
  },
  {
    dimension: "Outcome-typ",
    ad: "Affärsvärde / användarvärde",
    at: "Strukturell effekt (hastighet, kostnad, risk)",
    am: "Stabilitet, effektivitet, kostnad"
  },
  {
    dimension: "Outcome-exempel",
    ad: "\"Öka konvertering med 15%\"",
    at: "\"Halvera lead time\"",
    am: "\"Minska MTTR från 6h → 2h\""
  },
  {
    dimension: "Beviskrav i Framing",
    ad: "Hypotes + rimlighet",
    at: "Mätbar problemverifiering krävs",
    am: "Dataanalys av driftmönster"
  },
  {
    dimension: "Problemdefinition",
    ad: "Hypotesbaserad",
    at: "Faktabaserad och kvantifierad",
    am: "Datadriven och repetitiv"
  },
  {
    dimension: "Epics karaktär",
    ad: "Funktionella capabilities",
    at: "Strukturella förändringar",
    am: "Förbättrings- och automationsområden"
  },
  {
    dimension: "Exempel Epics",
    ad: "UI, API, onboarding",
    at: "Modularisering, CI/CD, dependency cleanup",
    am: "Incident automation, triage, monitoring"
  },
  {
    dimension: "Risktyp",
    ad: "Fel funktion (lågt nyttjande)",
    at: "Drift, regression, systempåverkan",
    am: "Felaktig optimering/automation"
  },
  {
    dimension: "Risknivå (typiskt)",
    ad: "Medel",
    at: "Högst",
    am: "Låg–medel"
  },
  {
    dimension: "Scope-stabilitet",
    ad: "Kan vara explorativ",
    at: "Måste stabiliseras tidigt",
    am: "Kontinuerlig och iterativ"
  },
  {
    dimension: "AI Acceleration Level (typiskt)",
    ad: "Level 1–2 (3 möjligt)",
    at: "Level 1–2 (3 strikt kontrollerat)",
    am: "Level 1–3 (hög potential)"
  },
  {
    dimension: "AI-roll i Framing",
    ad: "Stöd för idéer och struktur",
    at: "Analys av kod, beroenden, tech debt",
    am: "Mönsteridentifiering, incidentanalys"
  },
  {
    dimension: "Governance-krav i Framing",
    ad: "Outcome + Value Owner",
    at: "Outcome + baseline + risk + AI-nivå strikt",
    am: "Outcome + operativ baseline"
  },
  {
    dimension: "Vanligt fel",
    ad: "Bygga features utan Outcome",
    at: "Modernisera utan effektmål",
    am: "Köra drift utan förbättringsmål"
  },
  {
    dimension: "Vad AAS skyddar mot",
    ad: "Output utan värde",
    at: "Teknikdriven transformation utan effekt",
    am: "Reaktiv support utan utveckling"
  },
  {
    dimension: "Framing-tyngd",
    ad: "Medel",
    at: "Högst (kritisk fas)",
    am: "Medel"
  },
  {
    dimension: "Konsekvens av dålig framing",
    ad: "Fel produkt",
    at: "Misslyckad transformation (dyr)",
    am: "Ineffektiv drift"
  }
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
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.94))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <AasBrandMark subtitle="Operating model for controlled AI delivery" />
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <CircleHelp className="h-3.5 w-3.5 text-primary" />
                  Help
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What is this tool?</h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts,
                  you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.
                </p>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
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

            <div className="rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Framing -&gt; Delivery -&gt; Feedback loop</p>
              <div className="mt-4 space-y-3">
                {processSteps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 p-3.5" key={step.title}>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-border/70 bg-background/90 p-2">
                          <Icon className={`h-4.5 w-4.5 ${step.iconClass}`} />
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
              <CardTitle>AAS in practice</CardTitle>
              <CardDescription>What the operating model adds on top of ordinary delivery work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickTakeaways.map((item) => (
                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>What this tool does NOT do</CardTitle>
              <CardDescription>It improves readiness and governance. It is not automation by default.</CardDescription>
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

        <div className="space-y-3">
          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="A compact visual sketch of how Framing, Story Ideas, Delivery Stories and feedback are meant to work together."
            title="Framing roundtrip"
          >
            <div className="space-y-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(0,0.9fr)]">
                <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">1. Framing</p>
                  <p className="mt-2 text-lg font-semibold text-sky-950">Define direction and intent</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-sky-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-950">What belongs here</p>
                      <p className="mt-2">Outcome, problem, baseline, value owner, AI level, risk profile, epics and story ideas.</p>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-950">Story Idea content</p>
                      <p className="mt-2">Title, linked epic, value intent and expected behavior. Not acceptance criteria, tests or DoD.</p>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                      <p className="font-semibold text-sky-950">Ready for review</p>
                      <p className="mt-2">A Story Idea is framing ready when value intent, epic link and expected behavior exist.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">2. Delivery</p>
                  <p className="mt-2 text-lg font-semibold text-amber-950">Refine, build and verify</p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-950">AI refinement</p>
                      <p className="mt-2">A Story Idea can be split, merged or clarified by AI before becoming one or more Delivery Stories.</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-950">Delivery Stories</p>
                      <p className="mt-2">These are verifiable execution units with Value Spine validation, acceptance criteria and test definition.</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      <p className="font-semibold text-slate-950">Minimal lifecycle</p>
                      <p className="mt-2">Needs action {"->"} Ready for review {"->"} Approved is the user-facing status flow, with build progress tracked separately.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">3. Feedback loop</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-950">Learn without blocking delivery</p>
                  <div className="mt-4 grid gap-3">
                    {[
                      "Stable: delivery followed the idea as planned.",
                      "Expanded: additional delivery stories were needed.",
                      "Misaligned: delivery moved away from the original value intent."
                    ].map((item) => (
                      <div className="rounded-2xl border border-emerald-200 bg-white p-4 text-sm leading-6 text-slate-700" key={item}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                <p className="font-semibold text-foreground">Roundtrip in plain language</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Start with a framing brief. Add Epics and Story Ideas. Use AI to refine structure, then turn one Story Idea into one or more Delivery Stories when the work becomes concrete enough to test and verify. After delivery, use the feedback counters in Value Spine to see whether the original Story Idea was stable, expanded or misaligned.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="A tighter explanation of the four AAS phases and why the sequence matters."
            title="AAS method deep dive"
          >
            <div className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                AAS describes connected phases, but the product flow here is intentionally simplified to Framing, Delivery and Feedback Loop. The central idea is that teams should not jump
                straight from a vague need into AI-assisted implementation. First the effect is defined, then the work is structured, then
                implementation is accelerated and finally the result is learned from and fed back into the framing model.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {processSteps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div className="rounded-3xl border border-border/70 bg-muted/10 p-4" key={step.title}>
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
            description="Use this matrix when you choose Delivery type in Framing. It explains what should become heavier, stricter or more data-driven depending on project posture."
            title="Choosing AD, AT or AM in Framing"
          >
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">AD</p>
                  <p className="mt-2 font-semibold text-sky-950">Application Development</p>
                  <p className="mt-2 text-sm leading-6 text-sky-950">
                    Best when the main challenge is to create new value or a new capability, and the baseline is still lighter or partly hypothesis-led.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">AT</p>
                  <p className="mt-2 font-semibold text-amber-950">Application Transformation</p>
                  <p className="mt-2 text-sm leading-6 text-amber-950">
                    Best when the main challenge is structural change in an existing landscape and Framing must prove the current problem with stronger evidence.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">AM</p>
                  <p className="mt-2 font-semibold text-emerald-950">Application Management</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950">
                    Best when the main challenge is to improve an active service with operational data, recurring patterns and continuous delivery reality.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-border/70 bg-background">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/20 text-left">
                      <th className="px-4 py-3 font-semibold text-foreground">Dimension</th>
                      <th className="px-4 py-3 font-semibold text-sky-900">AD – Application Development</th>
                      <th className="px-4 py-3 font-semibold text-amber-900">AT – Application Transformation</th>
                      <th className="px-4 py-3 font-semibold text-emerald-900">AM – Application Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryTypeMatrix.map((row) => (
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

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="The operating model principles that shape the interface and the workflow."
            title="Five core principles"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {principles.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item.title}>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="How AAS thinks about acceleration levels, human review and formal approval."
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
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-foreground">Review and approval are not the same</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Review verifies artifact quality against requirements, architecture and tests. Approval is the formal human decision to
                  accept remaining risk and allow release or transition. AAS keeps both visible because human mandate remains.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="The compact structural explanation behind Outcome, Epic, Story and Test."
            title="Why the Value Spine matters"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                  <div className="flex items-center gap-3">
                    <Waypoints className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-foreground">Outcome -&gt; Epic -&gt; Story -&gt; Test</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    In the operating model, Value Spine is not just a documentation pattern. It is the control mechanism that makes AI
                    usage compatible with transparency, reviewability and responsibility.
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-muted/10 p-5">
                  <p className="text-sm font-medium text-foreground">Compact diagram</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Outcome</div>
                    <div className="pl-4">
                      <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Epic</div>
                    </div>
                    <div className="pl-8">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Delivery Story</div>
                    </div>
                    <div className="pl-12">
                      <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium text-foreground">Test</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Outcome defines the business effect, owner and baseline.",
                  "Epic groups a meaningful value slice so scope and direction stay understandable.",
                  "Story Idea captures intent in Framing. Delivery Story becomes the smallest governed execution unit later.",
                  "Test provides evidence that the intended change actually happened."
                ].map((item) => (
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

          <CollapsibleSection
            accentClassName="border-border/70 bg-background/95"
            description="A compact explanation of the product assumptions that used to sit in the right rail."
            title="How this app is built"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {platformNotes.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item}>
                  <div className="flex items-start gap-3">
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </section>
    </AppShell>
  );
}
