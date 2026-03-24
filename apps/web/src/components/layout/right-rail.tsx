import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

const checkpoints = [
  {
    title: "M1-STORY-001",
    status: "Approved",
    description: "Monorepo, shell, packages, and baseline tooling are in place."
  },
  {
    title: "M1-STORY-002",
    status: "Approved",
    description: "Auth, organization context, and explicit Demo access are available."
  },
  {
    title: "M1-STORY-003",
    status: "Approved",
    description: "Core schema, persistence, and structural checkpoint have passed human review."
  },
  {
    title: "M1-STORY-004",
    status: "Approved",
    description: "Home dashboard widgets, recent activity, and right-rail actions are available."
  },
  {
    title: "M1-STORY-005",
    status: "Approved",
    description: "Framing Cockpit list, filters, quick creation, and outcome navigation are available."
  },
  {
    title: "M1-STORY-006 to 010",
    status: "In progress",
    description: "Outcome and Story pages, handoff preview, telemetry, and end-to-end verification."
  }
];

export function RightRail() {
  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Delivery checkpoints</CardTitle>
          <CardDescription>Stories 001-005 are approved. The remaining M1 implementation slice is 006-010.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          {checkpoints.map((item) => (
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4" key={item.title}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Approved defaults</CardTitle>
          <CardDescription>Locked stack decisions for the first milestone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Next.js App Router, React, TypeScript, Tailwind, and shadcn/ui.</p>
          <p>Supabase, Prisma, PostHog, and OpenTelemetry remain the approved integration defaults.</p>
          <p>Product language stays English. Architecture targets Level 3 readiness from a Level 2 start.</p>
        </CardContent>
      </Card>
    </aside>
  );
}
