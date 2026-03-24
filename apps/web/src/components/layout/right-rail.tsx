import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

export function RightRail() {
  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Workspace guidance</CardTitle>
          <CardDescription>Quick reminders for working inside the current project scope.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">One project at a time</p>
            <p className="mt-2 leading-6">Home, Framing, Value Spine, Import and Review stay scoped to the active project only.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">Governance stays visible</p>
            <p className="mt-2 leading-6">Readiness, tollgates, sign-off and lineage are shown near the work instead of being buried in forms.</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">Native and imported can coexist</p>
            <p className="mt-2 leading-6">Native work remains first-class, while imported artifacts keep their review and lineage trail.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Platform defaults</CardTitle>
          <CardDescription>Stable stack assumptions that are active in the product right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Next.js App Router, React, TypeScript, Tailwind, and shadcn/ui.</p>
          <p>Supabase, Prisma, PostHog, and OpenTelemetry remain the integration defaults.</p>
          <p>Product language stays English, while project setup and delivery flow stay project-scoped.</p>
        </CardContent>
      </Card>
    </aside>
  );
}
