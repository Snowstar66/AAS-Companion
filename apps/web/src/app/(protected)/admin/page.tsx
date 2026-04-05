import { cookies } from "next/headers";
import { AlertTriangle, DatabaseZap, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { loadOperationalLogs } from "@/lib/admin/operational-logs";
import { loadHomeDashboard } from "@/lib/home/dashboard";
import { clearOperationalLogsAction, hardDeleteProjectsAction } from "./actions";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AppLanguage = "en" | "sv";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getLogTone(status: string) {
  if (status === "error") {
    return "border-red-200 bg-red-50/80 text-red-900";
  }

  if (status === "started") {
    return "border-amber-200 bg-amber-50/80 text-amber-900";
  }

  if (status === "success") {
    return "border-emerald-200 bg-emerald-50/80 text-emerald-900";
  }

  return "border-border/70 bg-background text-foreground";
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const query = searchParams ? await searchParams : {};
  const language = await getServerLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const flashError = getParamValue(query.error);
  const flashMessage = getParamValue(query.message);
  const { activeProject, canManageProjects, isDemoSession, projects } = await loadHomeDashboard();
  const operationalLogs =
    activeProject && !isDemoSession
      ? await loadOperationalLogs(30, language)
      : {
          state: "unavailable" as const,
          items: [],
          message: t("Open a normal active project to inspect operational logs.", "Öppna ett vanligt aktivt projekt för att granska operativa loggar."),
          organizationName: activeProject?.organizationName ?? t("Unknown project", "Okänt projekt")
        };

  return (
    <AppShell
      {...(activeProject?.organizationName ? { activeProjectName: activeProject.organizationName } : {})}
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        title: t("Admin", "Administration"),
        badge: t("Cleanup", "Rensning")
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-red-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(254,242,242,0.95))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-900">
                <DatabaseZap className="h-3.5 w-3.5" />
                {t("Admin cleanup", "Administrativ rensning")}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("Aggressive project cleanup", "Aggressiv projektrensning")}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {t(
                    "Use this page to remove test projects completely. Deletion is hard and cascades through framing, imports, review data, stories, tollgates, and activity history.",
                    "Använd den här sidan för att ta bort testprojekt helt. Borttagningen är hård och går igenom framing, importer, reviewdata, stories, tollgates och aktivitetshistorik."
                  )}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm leading-6 text-red-900 lg:max-w-sm">
              <p className="font-semibold">{t("No undo", "Ingen ångra")}</p>
              <p className="mt-2">
                {t("This page is intentionally blunt. Only select projects you truly want to purge from the database.", "Den här sidan är medvetet hård. Välj bara projekt som du verkligen vill rensa bort från databasen.")}
              </p>
            </div>
          </div>
        </div>

        {flashError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{flashError}</div>
        ) : null}
        {flashMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {flashMessage}
          </div>
        ) : null}

        {!canManageProjects || isDemoSession ? (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
              <CardTitle>{t("Admin cleanup is unavailable", "Administrativ rensning är inte tillgänglig")}</CardTitle>
              <CardDescription>{t("Open a normal signed-in project account before trying to remove persisted data.", "Öppna ett vanligt inloggat projektkonto innan du försöker ta bort sparad data.")}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t("Demo stays isolated on purpose, so destructive cleanup is disabled there.", "Demo är medvetet isolerad, så destruktiv rensning är avstängd där.")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{t("Projects", "Projekt")}</CardTitle>
                <CardDescription>{t("Mark one or more projects, then hard delete the selection in one operation.", "Markera ett eller flera projekt och hårdradera sedan urvalet i en operation.")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                    {t("No removable normal projects exist for this account right now.", "Det finns inga borttagbara vanliga projekt för det här kontot just nu.")}
                  </div>
                ) : (
                  <form action={hardDeleteProjectsAction} className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/65 px-4 py-3 text-sm text-amber-900">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                          {t(
                            "Hard delete removes the selected projects entirely. If the active project is included, the app will also clear the active project context.",
                            "Hårdradering tar bort de valda projekten helt. Om det aktiva projektet ingår rensar appen också den aktiva projektkontexten."
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {projects.map((project) => (
                        <label
                          className={`flex cursor-pointer items-start gap-4 rounded-3xl border p-5 shadow-sm transition ${
                            project.isActive
                              ? "border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.96),rgba(255,255,255,0.98))]"
                              : "border-border/70 bg-background/95 hover:border-red-200/70"
                          }`}
                          key={project.organizationId}
                        >
                          <input
                            className="mt-1 h-4 w-4 rounded border-border text-red-600 focus:ring-red-500"
                            name="organizationIds"
                            type="checkbox"
                            value={project.organizationId}
                          />
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-foreground">{project.organizationName}</p>
                              {project.isActive ? (
                                <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                                  {t("Active project", "Aktivt projekt")}
                                </span>
                              ) : null}
                              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                {project.organizationSlug}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                {t("Outcomes", "Outcomes")} <span className="ml-1 font-semibold text-foreground">{project.counts.outcomes}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                {t("Epics", "Epics")} <span className="ml-1 font-semibold text-foreground">{project.counts.epics}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                {t("Stories", "Stories")} <span className="ml-1 font-semibold text-foreground">{project.counts.stories}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                {t("Events", "Händelser")} <span className="ml-1 font-semibold text-foreground">{project.counts.activityEvents}</span>
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/45 p-4">
                      <p className="text-sm text-red-900">{t("Selected projects will be deleted permanently from the database.", "Valda projekt raderas permanent från databasen.")}</p>
                      <PendingFormButton
                        className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                        icon={<Trash2 className="h-4 w-4" />}
                        label={t("Hard delete selected projects", "Hårdradera valda projekt")}
                        pendingLabel={t("Deleting selected projects...", "Raderar valda projekt...")}
                        showPendingCursor
                      />
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle>{t("Operational logs", "Operativa loggar")}</CardTitle>
                    <CardDescription>
                      {t(
                        "Lightweight troubleshooting for the active project. Slow or failed imports and approvals show up here with timing.",
                        "Lättviktig felsökning för det aktiva projektet. Långsamma eller misslyckade importer och godkännanden visas här med tidmätning."
                      )}
                    </CardDescription>
                  </div>
                  <form action={clearOperationalLogsAction}>
                    <PendingFormButton
                      className="gap-2"
                      label={t("Clear all logs", "Rensa alla loggar")}
                      pendingLabel={t("Clearing logs...", "Rensar loggar...")}
                      showPendingCursor
                      variant="secondary"
                    />
                  </form>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                  {operationalLogs.message}
                </div>
                {operationalLogs.state !== "ready" || operationalLogs.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
                    {t("No operational logs are visible yet for the active project.", "Inga operativa loggar syns ännu för det aktiva projektet.")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {operationalLogs.items.map((item) => (
                      <div className={`rounded-3xl border p-4 shadow-sm ${getLogTone(item.status)}`} key={item.id}>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full border border-current/20 bg-white/70 px-2.5 py-1 font-semibold uppercase tracking-[0.16em]">
                            {item.scope.replaceAll("_", " ")}
                          </span>
                          <span className="rounded-full border border-current/20 bg-white/70 px-2.5 py-1 font-medium">
                            {item.status}
                          </span>
                          {item.durationMs !== null ? (
                            <span className="rounded-full border border-current/20 bg-white/70 px-2.5 py-1 font-medium">
                              {item.durationMs} ms
                            </span>
                          ) : null}
                          {item.itemCount !== null ? (
                            <span className="rounded-full border border-current/20 bg-white/70 px-2.5 py-1 font-medium">
                              {item.itemCount} {t("items", "objekt")}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-semibold">{item.summary}</p>
                        <p className="mt-2 text-sm opacity-80">
                          {item.action.replaceAll("_", " ")} {t("on", "på")} {item.entityType.replaceAll("_", " ")} {item.entityId}
                        </p>
                        {item.detail ? <p className="mt-2 text-sm opacity-80">{item.detail}</p> : null}
                        <p className="mt-3 text-xs opacity-70">
                          {item.createdAt.toLocaleString(language === "sv" ? "sv-SE" : "en-US")}
                          {item.actorName ? ` • ${item.actorName}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </AppShell>
  );
}
