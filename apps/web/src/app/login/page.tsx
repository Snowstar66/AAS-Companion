import Link from "next/link";
import { cookies } from "next/headers";
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

type AppLanguage = "en" | "sv";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAppSession();
  const account = await getSignedInAccountIdentity();
  const language = await getServerLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);

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
  const environmentLabel = isProduction
    ? t("Production environment", "Produktionsmiljo")
    : t("Development environment", "Utvecklingsmiljo");
  const knownUsers = localAuthEnabled
    ? (await listAppUsers()).filter((user) => !user.userId.startsWith("user_demo_") && !user.email.endsWith("@aas-companion.local"))
    : [];
  const emailButtonLabel = localAuthEnabled ? t("Continue with email", "Fortsatt med e-post") : t("Send magic link", "Skicka magic link");
  const knownUserHint = email
    ? knownUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
    : null;

  return (
    <AppShell>
      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{t("Sign in to the control plane", "Logga in i kontrollplanet")}</CardTitle>
            <CardDescription>
              {t(
                "Sign in to your current project, or explicitly choose Demo when you want reference content.",
                "Logga in i ditt aktuella projekt, eller valj uttryckligen Demo nar du vill ha referensmaterial."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
            {signedOut ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {t("You signed out successfully.", "Du loggades ut utan problem.")}
              </div>
            ) : null}
            {sent && email ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {localAuthEnabled ? (
                  <>
                    {t("No direct internal user matched ", "Ingen direkt intern anvandare matchade ")}
                    <strong>{email}</strong>
                    {t(", so a magic link was sent. Check your inbox to continue.", ", sa en magic link skickades. Kontrollera din inkorg for att fortsatta.")}
                  </>
                ) : (
                  <>
                    {t("Magic link requested for ", "Magic link begard for ")}
                    <strong>{email}</strong>
                    {t(". Check your inbox to continue.", ". Kontrollera din inkorg for att fortsatta.")}
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
                    {t("Environment auth mode", "Miljons autentiseringslage")}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {environmentLabel}:{" "}
                    {localAuthEnabled
                      ? t("Direct sign-in is active", "Direktinloggning ar aktiv")
                      : t("Magic link only", "Endast magic link")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {localAuthEnabled
                      ? t(
                          "Known internal users can go straight in here. Unknown emails still fall back to inbox verification.",
                          "Kanda interna anvandare kan ga rakt in har. Okanda adresser faller fortfarande tillbaka till verifiering via inkorg."
                        )
                      : t(
                          "This environment requires verified email login unless you explicitly enable direct internal sign-in.",
                          "Den har miljon kraver verifierad e-postinloggning om du inte uttryckligen aktiverar direkt intern inloggning."
                        )}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    localAuthEnabled
                      ? "border-emerald-200 bg-white text-emerald-800"
                      : "border-amber-200 bg-white text-amber-800"
                  }`}
                >
                  {localAuthEnabled ? t("Direct sign-in ON", "Direktinloggning PA") : t("Direct sign-in OFF", "Direktinloggning AV")}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Direct sign-in", "Direktinloggning")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {localAuthEnabled ? t("Enabled in this environment", "Aktiverad i denna miljo") : t("Disabled in this environment", "Avstangd i denna miljo")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {localAuthEnabled
                    ? t(
                        "Known internal users can sign in immediately in this environment.",
                        "Kanda interna anvandare kan logga in direkt i denna miljo."
                      )
                    : t(
                        "Known users still use email verification here because direct sign-in is disabled.",
                        "Kanda anvandare maste fortfarande verifiera e-post har eftersom direktinloggning ar avstangd."
                      )}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Magic link", "Magic link")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {supabaseEnabled ? t("Verified email sign-in", "Verifierad e-postinloggning") : t("Not configured here", "Inte konfigurerad har")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {supabaseEnabled
                    ? t(
                        "Unknown or untrusted emails continue through inbox verification.",
                        "Okanda eller icke betrodda adresser fortsatter via verifiering i inkorgen."
                      )
                    : t(
                        "Without Supabase, only direct internal sign-in or Demo can be used.",
                        "Utan Supabase kan bara direkt intern inloggning eller Demo anvandas."
                      )}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Demo", "Demo")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{t("Reference-only access", "Endast referensatkomst")}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(
                    "Open the Demo project explicitly when you want seeded example material instead of your own project work.",
                    "Oppna Demo-projektet uttryckligen nar du vill ha seedat exempelmaterial i stallet for ditt eget projektarbete."
                  )}
                </p>
              </div>
            </div>

            {localAuthEnabled ? (
              <Card className="border-border/70 bg-muted/25">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    {t("Internal direct sign-in", "Intern direktinloggning")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "Immediate access for trusted internal use. Existing users sign in instantly, and the known-user list below gives one-click entry.",
                      "Omedelbar atkomst for betrodd intern anvandning. Befintliga anvandare loggar in direkt, och listan med kanda anvandare nedan ger ett-klicks-intrade."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        {t(
                          "Direct sign-in bypasses email verification and should only be enabled in trusted internal environments.",
                          "Direktinloggning hoppar over e-postverifiering och bor bara vara aktiverad i betrodda interna miljoer."
                        )}
                        {isProduction ? t(" This production environment currently allows that shortcut.", " Den har produktionsmiljon tillater for narvarande den genvagen.") : null}
                      </p>
                    </div>
                  </div>

                  <form action="/auth/local" className="space-y-4" method="post">
                    <input name="redirectTo" type="hidden" value={redirectTo} />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">{t("Email", "E-post")}</span>
                      <input
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                        defaultValue={email}
                        name="email"
                        placeholder="you@company.com"
                        type="email"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-foreground">{t("Name (optional)", "Namn (valfritt)")}</span>
                      <input
                        className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                        name="fullName"
                        placeholder="Pat Hellgren"
                        type="text"
                      />
                    </label>
                    <Button className="gap-2" type="submit">
                      {t("Continue with direct sign-in", "Fortsatt med direktinloggning")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>

                  {knownUsers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">{t("Known internal users", "Kanda interna anvandare")}</p>
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
                              {t("Sign in as this user", "Logga in som denna anvandare")}
                            </Button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "No internal users exist yet. The first email you enter above will create one automatically.",
                        "Inga interna anvandare finns annu. Den forsta e-postadressen du anger ovan skapar en automatiskt."
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/70 bg-muted/25">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    {t("Direct sign-in is off here", "Direktinloggning ar av har")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "This environment is using verified email login, so even known users continue through magic link.",
                      "Den har miljon anvander verifierad e-postinloggning, sa aven kanda anvandare fortsatter via magic link."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    {t("If you want instant sign-in on a trusted internal deployment, enable", "Om du vill ha omedelbar inloggning i en betrodd intern deployment, aktivera")}{" "}
                    <strong> NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true</strong> {t("in the environment settings.", "i miljoinstallningarna.")}
                  </p>
                  <p>
                    {t(
                      "That shortcut trades away email verification, so it should not be enabled casually in public-facing production environments.",
                      "Den genvagen byter bort e-postverifiering och bor darfor inte aktiveras lattvindigt i publikt exponerade produktionsmiljoer."
                    )}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/70 bg-muted/25">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MailCheck className="h-4 w-4 text-primary" />
                    {localAuthEnabled ? t("Email continue", "Fortsatt via e-post") : t("Supabase magic link", "Supabase magic link")}
                  </CardTitle>
                  <CardDescription>
                    {localAuthEnabled
                      ? t(
                          "Known internal users go straight in. Unknown emails continue through inbox verification.",
                          "Kanda interna anvandare gar rakt in. Okanda adresser fortsatter via verifiering i inkorgen."
                        )
                      : t(
                          "Supabase remains the approved auth strategy for verified email login in this environment.",
                          "Supabase ar fortfarande den godkanda autentiseringsstrategin for verifierad e-postinloggning i denna miljo."
                        )}
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <form action="/auth/magic-link" className="space-y-4" method="post">
                  <input name="redirectTo" type="hidden" value={redirectTo} />
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t("Work email", "Arbetsadress")}</span>
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
                      {t(
                        "Supabase environment variables are not configured yet, so use direct internal sign-in or Demo for now.",
                        "Supabase-miljovariablerna ar inte konfigurerade annu, sa anvand direkt intern inloggning eller Demo tills vidare."
                      )}
                    </p>
                  ) : null}
                </form>
                {localAuthEnabled ? (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p>
                        {t("Enter a known internal email here to sign in immediately.", "Ange en kand intern e-postadress har for att logga in direkt.")}
                        {knownUserHint
                          ? t(` ${knownUserHint.email} is already known and should go straight in.`, ` ${knownUserHint.email} ar redan kand och bor ga rakt in.`)
                          : ""}
                        {t(" Unknown emails will receive a magic link instead.", " Okanda adresser far i stallet en magic link.")}
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
                    {t("Demo project access", "Atkomst till Demo-projekt")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "The Demo project includes AAS-aligned delivery roles and seeded OrderFlow reference records for guided exploration.",
                      "Demo-projektet innehaller AAS-anpassade leveransroller och seedade referensposter for OrderFlow for guidad utforskning."
                    )}
                  </CardDescription>
                </CardHeader>
              <CardContent>
                <form action="/auth/demo" className="space-y-4" method="post">
                  <input name="redirectTo" type="hidden" value={redirectTo} />
                  <Button className="gap-2" disabled={!demoEnabled} type="submit">
                    {t("Enter demo project", "Ga in i Demo-projekt")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {t("Demo org:", "Demo-organisation:")} <strong>OrderFlow AAS Test Organization</strong>.{" "}
                    {t("Primary login lands as the", "Primar inloggning hamnar som")} <strong>{t("Value Owner", "Value Owner")}</strong>.
                  </p>
                </form>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("What this story adds", "Vad denna story tillfor")}</CardTitle>
              <CardDescription>
                {t(
                  "Auth and tenancy foundations without leaking Demo into normal project work.",
                  "Grund for autentisering och tenancy utan att Demo spiller over i vanligt projektarbete."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("Protected routes with server-side session checks and a protected layout group.", "Skyddade routes med serverside-sessionkontroller och en skyddad layoutgrupp.")}</p>
              <p>{t("Explicit organization context for the current project and for Demo access.", "Explicit organisationskontext for aktuellt projekt och for Demo-atkomst.")}</p>
              <p>{t("Seeded OrderFlow AAS roles for governance-aware exploration before wider UI work begins.", "Seedade OrderFlow AAS-roller for governance-medveten utforskning innan bredare UI-arbete borjar.")}</p>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("Governance guardrails", "Governance-racken")}</CardTitle>
              <CardDescription>{t("These remain unchanged.", "Dessa forblir oforandrade.")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("No business approvals live only in the UI.", "Inga affarsgodkannanden lever bara i UI:t.")}</p>
              <p>{t("Tenant context stays explicit and cookie-backed.", "Tenant-kontexten forblir explicit och cookie-backad.")}</p>
              <p>{t("Execution still stops after M1-STORY-003 for human review.", "Exekveringen stannar fortfarande efter M1-STORY-003 for mansklig review.")}</p>
              <Button asChild className="w-full gap-2" variant="secondary">
                <Link href="/">
                  {t("Back to Home", "Tillbaka till Home")}
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
