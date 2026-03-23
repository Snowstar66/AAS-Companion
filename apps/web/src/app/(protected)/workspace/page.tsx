import Link from "next/link";
import { ArrowRight, Building2, Fingerprint, LogOut, ShieldCheck, User2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { requireProtectedSession } from "@/lib/auth/guards";

export default async function WorkspacePage() {
  const session = await requireProtectedSession();

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,246,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Protected Workspace Ready
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">Welcome, {session.displayName}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  You are inside the protected workspace with explicit organization context, seeded roles, and the core
                  M1 persistence model beneath it.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/">
                  Back to landing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <form action="/auth/logout" method="post">
                <Button className="gap-2" type="submit">
                  Sign out
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User2 className="h-4 w-4 text-primary" />
                Session
              </CardTitle>
              <CardDescription>Current access mode and actor identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Mode:</strong> {session.mode}</p>
              <p><strong>User ID:</strong> {session.userId}</p>
              <p><strong>Email:</strong> {session.email}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" />
                Organization Context
              </CardTitle>
              <CardDescription>Explicit tenant scope for all seeded M1 persistence work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>Name:</strong> {session.organization.organizationName}</p>
              <p><strong>Slug:</strong> {session.organization.organizationSlug}</p>
              <p><strong>Role:</strong> {session.organization.role}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Fingerprint className="h-4 w-4 text-primary" />
                M1 Foundation
              </CardTitle>
              <CardDescription>M1 now extends into workspace, handoff, telemetry, and e2e verification flows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Demo data includes two outcomes, one epic, three stories, one blocked tollgate, and activity events.</p>
              <p>The remaining M1 work now focuses on demonstrating coherent end-to-end behavior across those seeded records.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
