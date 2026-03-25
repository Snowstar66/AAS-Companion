import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole, MailCheck, ShieldAlert, Sparkles, UserCircle2 } from "lucide-react";
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
  const isProduction = process.env.NODE_ENV === "production";
  const environmentLabel = isProduction ? "Production environment" : "Development environment";
  const knownUsers = localAuthEnabled
    ? (await listAppUsers()).filter((user) => !user.userId.startsWith("user_demo_") && !user.email.endsWith("@aas-companion.local"))
    : [];
  const emailButtonLabel = localAuthEnabled ? "Continue with email" : "Send magic link";
  const knownUserHint = email
    ? knownUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
    : null;

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
                {localAuthEnabled ? (
                  <>
                    No direct internal user matched <strong>{email}</strong>, so a magic link was sent. Check your inbox
                    to continue.
                  </>
                ) : (
                  <>
                    Magic link requested for <strong>{email}</strong>. Check your inbox to continue.
                  </>
                )}
              </div>
            ) : null}

            <div
              className={`rounded-2xl border px-4 py-4 ${
                localAuthEnabled ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Environment auth mode
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {environmentLabel}: {localAuthEnabled ? "Direct sign-in is active" : "Magic link only"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {localAuthEnabled
                      ? "Known internal users can go straight in here. Unknown emails still fall back to inbox verification."
                      : "This environment requires verified email login unless you explicitly enable direct internal sign-in."}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    localAuthEnabled
                      ? "border-emerald-200 bg-white text-emerald-800"
                      : "border-amber-200 bg-white text-amber-800"
                  }`}
                >
                  {localAuthEnabled ? "Direct sign-in ON" : "Direct sign-in OFF"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Direct sign-in</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {localAuthEnabled ? "Enabled in this environment" : "Disabled in this environment"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {localAuthEnabled
                    ? "Known internal users can sign in immediately in this environment."
                    : "Known users still use email verification here because direct sign-in is disabled."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Magic link</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {supabaseEnabled ? "Verified email sign-in" : "Not configured here"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {supabaseEnabled
                    ? "Unknown or untrusted emails continue through inbox verification."
                    : "Without Supabase, only direct internal sign-in or Demo can be used."}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Demo</p>
                <p className="mt-2 text-sm font-medium text-foreground">Reference-only access</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Open the Demo project explicitly when you want seeded example material instead of your own project work.
                </p>
              </div>
            </div>

            {localAuthEnabled ? (
              <Card className="border-border/70 bg-muted/25">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    Internal direct sign-in
                  </CardTitle>
                  <CardDescription>
                    Immediate access for trusted internal use. Existing users sign in instantly, and the known-user list
                    below gives one-click entry.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Direct sign-in bypasses email verification and should only be enabled in trusted internal
                        environments.
                        {isProduction ? " This production environment currently allows that shortcut." : null}
                      </p>
                    </div>
                  </div>

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
                      Continue with direct sign-in
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  {knownUsers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Known internal users</p>
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
                      No internal users exist yet. The first email you enter above will create one automatically.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/70 bg-muted/25">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    Direct sign-in is off here
                  </CardTitle>
                  <CardDescription>
                    This environment is using verified email login, so even known users continue through magic link.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    If you want instant sign-in on a trusted internal deployment, enable
                    <strong> NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true</strong> in the environment settings.
                  </p>
                  <p>
                    That shortcut trades away email verification, so it should not be enabled casually in public-facing
                    production environments.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/70 bg-muted/25">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MailCheck className="h-4 w-4 text-primary" />
                  {localAuthEnabled ? "Email continue" : "Supabase magic link"}
                </CardTitle>
                <CardDescription>
                  {localAuthEnabled
                    ? "Known internal users go straight in. Unknown emails continue through inbox verification."
                    : "Supabase remains the approved auth strategy for verified email login in this environment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    {emailButtonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {!supabaseEnabled ? (
                    <p className="text-sm text-muted-foreground">
                      Supabase environment variables are not configured yet, so use direct internal sign-in or Demo for now.
                    </p>
                  ) : null}
                </form>
                {localAuthEnabled ? (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p>
                        Enter a known internal email here to sign in immediately.
                        {knownUserHint ? ` ${knownUserHint.email} is already known and should go straight in.` : ""}
                        Unknown emails will receive a magic link instead.
                      </p>
                    </div>
                  </div>
                ) : null}
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
