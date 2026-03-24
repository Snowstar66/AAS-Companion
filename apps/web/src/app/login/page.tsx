import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole, Sparkles, UserCircle2 } from "lucide-react";
import { isDemoAuthEnabled, isLocalAuthEnabled, isSupabaseConfigured } from "@aas-companion/config";
import { listAppUsers } from "@aas-companion/db";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { getAppSession, getSignedInAccountIdentity } from "@/lib/auth/server";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAppSession();
  const account = await getSignedInAccountIdentity();

  if (session && (session.mode !== "demo" || account)) {
    redirect("/");
  }

  const params = searchParams ? await searchParams : {};
  const error = getParamValue(params.error);
  const email = getParamValue(params.email);
  const sent = getParamValue(params.sent) === "1";
  const signedOut = getParamValue(params.signedOut) === "1";
  const redirectTo = getParamValue(params.redirectTo) ?? "/";
  const demoEnabled = isDemoAuthEnabled(process.env);
  const localAuthEnabled = isLocalAuthEnabled(process.env);
  const supabaseEnabled = isSupabaseConfigured(process.env);
  const knownUsers = localAuthEnabled
    ? (await listAppUsers()).filter((user) => !user.userId.startsWith("user_demo_") && !user.email.endsWith("@aas-companion.local"))
    : [];

  return (
    <AppShell>
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Sign in to the control plane</CardTitle>
            <CardDescription>
              Sign in to your current project, or explicitly choose Demo when you want reference content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            {signedOut ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                You signed out successfully.
              </div>
            ) : null}
            {sent && email ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Magic link requested for <strong>{email}</strong>. Check your inbox to continue.
              </div>
            ) : null}

            {localAuthEnabled ? (
              <Card className="border-border/70 bg-muted/25">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    Local dev sign-in
                  </CardTitle>
                  <CardDescription>
                    Fast local login for development. Use an existing app user or create one with just an email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <form action="/auth/local" className="space-y-4" method="post">
                    <input name="redirectTo" type="hidden" value={redirectTo} />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">Email</span>
                      <input
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                        defaultValue={email}
                        name="email"
                        placeholder="you@company.com"
                        type="email"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">Name (optional)</span>
                      <input
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                        name="fullName"
                        placeholder="Pat Hellgren"
                        type="text"
                      />
                    </label>
                    <Button className="gap-2" type="submit">
                      Continue with local user
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  {knownUsers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Known local users</p>
                      <div className="grid gap-3">
                        {knownUsers.map((user) => (
                          <form action="/auth/local" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3" key={user.userId} method="post">
                            <input name="redirectTo" type="hidden" value={redirectTo} />
                            <input name="email" type="hidden" value={user.email} />
                            <input name="fullName" type="hidden" value={user.fullName ?? ""} />
                            <div>
                              <p className="text-sm font-medium text-foreground">{user.fullName ?? user.email}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Button type="submit" variant="secondary">
                              Sign in as this user
                            </Button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No local users exist yet. The first email you enter above will create one automatically.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-border/70 bg-muted/25">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Supabase magic link
                </CardTitle>
                <CardDescription>
                  Supabase remains the approved auth strategy, with a demo-safe path available while local auth is being
                  prepared.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/auth/magic-link" className="space-y-4" method="post">
                  <input name="redirectTo" type="hidden" value={redirectTo} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">Work email</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={email}
                      name="email"
                      placeholder="you@company.com"
                      type="email"
                    />
                  </label>
                  <Button className="gap-2" disabled={!supabaseEnabled} type="submit">
                    Send magic link
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {!supabaseEnabled ? (
                    <p className="text-sm text-muted-foreground">
                      Supabase environment variables are not configured yet, so use local dev sign-in or Demo for now.
                    </p>
                  ) : null}
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-muted/25">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Demo project access
                </CardTitle>
                <CardDescription>
                  The Demo project includes all six BMAD-aligned delivery roles and reference records for guided exploration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action="/auth/demo" className="space-y-4" method="post">
                  <input name="redirectTo" type="hidden" value={redirectTo} />
                  <Button className="gap-2" disabled={!demoEnabled} type="submit">
                    Enter demo project
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Demo org: <strong>AAS Demo Organization</strong>. Primary login lands as the{" "}
                    <strong>Value Owner</strong>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>What this story adds</CardTitle>
              <CardDescription>Auth and tenancy foundations without leaking Demo into normal project work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Protected routes with server-side session checks and a protected layout group.</p>
              <p>Explicit organization context for the current project and for Demo access.</p>
              <p>Six demo roles for governance-aware exploration before wider UI work begins.</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
                <CardTitle>Governance guardrails</CardTitle>
                <CardDescription>These remain unchanged.</CardDescription>
              </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>No business approvals live only in the UI.</p>
              <p>Tenant context stays explicit and cookie-backed.</p>
              <p>Execution still stops after M1-STORY-003 for human review.</p>
              <Button asChild className="w-full gap-2" variant="secondary">
                <Link href="/">
                  Back to Home
                  <LockKeyhole className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
