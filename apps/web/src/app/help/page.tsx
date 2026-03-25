import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
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
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <CircleHelp className="h-3.5 w-3.5 text-primary" />
            Quick start
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">What is this tool?</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts,
            you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href={returnTo}>
                Back to work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>How it fits into AI development</CardTitle>
                <CardDescription>This tool focuses on Framing and Design before AI build starts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-4 font-medium text-sky-950">
                  <code>Framing -&gt; Design -&gt; Build (AI tools)</code>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="font-medium text-foreground">Framing</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Agree what to achieve and why.</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="font-medium text-foreground">Design</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Break work into testable pieces.</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="font-medium text-foreground">Build</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Use AI tools like Codex or BMAD.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>What happens in each step</CardTitle>
                <CardDescription>Keep the split simple: humans decide what and how, AI helps build it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-medium text-foreground">Framing (you + customer)</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                    <li>define the problem</li>
                    <li>define the outcome</li>
                    <li>set baseline and success</li>
                    <li>decide AI level</li>
                    <li>outline high-level direction</li>
                  </ul>
                  <p className="mt-3 text-sm font-medium text-foreground">Result: clear intent</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-medium text-foreground">Design (team)</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                    <li>create Epics</li>
                    <li>create Stories</li>
                    <li>define acceptance criteria</li>
                    <li>define tests before build</li>
                    <li>define AI usage scope</li>
                  </ul>
                  <p className="mt-3 text-sm font-medium text-foreground">Result: build-ready input</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="font-medium text-foreground">Build (AI tools)</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                    <li>Codex / BMAD generate code</li>
                    <li>tests are executed</li>
                    <li>iteration happens</li>
                  </ul>
                  <p className="mt-3 text-sm font-medium text-foreground">This tool does not build the code</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>When to use this tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                <p>Use this tool when you start a new feature.</p>
                <p>Use it when requirements are unclear.</p>
                <p>Use it when AI will be used heavily.</p>
                <p>Use it when you need control and traceability.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>What this tool does NOT do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                <p>It does not generate code.</p>
                <p>It does not replace developers.</p>
                <p>It does not auto-approve decisions.</p>
                <p>It does not replace agile methods.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Key principles</CardTitle>
                <CardDescription>AAS-aligned, but expressed in practical language.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950">
                  Outcome before output
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-950">
                  Test before build
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
                  AI is controlled acceleration
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-foreground">
                  Human remains responsible
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Two quick diagrams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-foreground">
                  <code>Customer -&gt; Framing -&gt; Design -&gt; AI Build</code>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-foreground">
                  <code>{`Outcome\n  -> Epic\n    -> Story\n      -> Test`}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
