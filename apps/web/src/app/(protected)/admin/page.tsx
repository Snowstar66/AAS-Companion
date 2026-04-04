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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const query = searchParams ? await searchParams : {};
  const flashError = getParamValue(query.error);
  const flashMessage = getParamValue(query.message);
  const { activeProject, canManageProjects, isDemoSession, projects } = await loadHomeDashboard();
  const operationalLogs =
    activeProject && !isDemoSession ? await loadOperationalLogs(30) : { state: "unavailable" as const, items: [], message: "Open a normal active project to inspect operational logs.", organizationName: activeProject?.organizationName ?? "Unknown project" };

  return (
    <AppShell
      {...(activeProject?.organizationName ? { activeProjectName: activeProject.organizationName } : {})}
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Admin",
        badge: "Cleanup"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-red-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(254,242,242,0.95))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-900">
                <DatabaseZap className="h-3.5 w-3.5" />
                Admin cleanup
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Aggressive project cleanup</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Use this page to remove test projects completely. Deletion is hard and cascades through framing,
                  imports, review data, stories, tollgates, and activity history.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm leading-6 text-red-900 lg:max-w-sm">
              <p className="font-semibold">No undo</p>
              <p className="mt-2">
                This page is intentionally blunt. Only select projects you truly want to purge from the database.
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
              <CardTitle>Admin cleanup is unavailable</CardTitle>
              <CardDescription>Open a normal signed-in project account before trying to remove persisted data.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Demo stays isolated on purpose, so destructive cleanup is disabled there.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Mark one or more projects, then hard delete the selection in one operation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                    No removable normal projects exist for this account right now.
                  </div>
                ) : (
                  <form action={hardDeleteProjectsAction} className="space-y-4">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/65 px-4 py-3 text-sm text-amber-900">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                          Hard delete removes the selected projects entirely. If the active project is included, the app
                          will also clear the active project context.
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
                                  Active project
                                </span>
                              ) : null}
                              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                {project.organizationSlug}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                Outcomes <span className="ml-1 font-semibold text-foreground">{project.counts.outcomes}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                Epics <span className="ml-1 font-semibold text-foreground">{project.counts.epics}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                Stories <span className="ml-1 font-semibold text-foreground">{project.counts.stories}</span>
                              </span>
                              <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                Events <span className="ml-1 font-semibold text-foreground">{project.counts.activityEvents}</span>
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/45 p-4">
                      <p className="text-sm text-red-900">Selected projects will be deleted permanently from the database.</p>
                      <PendingFormButton
                        className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                        icon={<Trash2 className="h-4 w-4" />}
                        label="Hard delete selected projects"
                        pendingLabel="Deleting selected projects..."
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
                    <CardTitle>Operational logs</CardTitle>
                    <CardDescription>
                      Lightweight troubleshooting for the active project. Slow or failed imports and approvals show up here with timing.
                    </CardDescription>
                  </div>
                  <form action={clearOperationalLogsAction}>
                    <PendingFormButton
                      className="gap-2"
                      label="Clear all logs"
                      pendingLabel="Clearing logs..."
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
                    No operational logs are visible yet for the active project.
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
                              {item.itemCount} items
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-semibold">{item.summary}</p>
                        <p className="mt-2 text-sm opacity-80">
                          {item.action.replaceAll("_", " ")} on {item.entityType.replaceAll("_", " ")} {item.entityId}
                        </p>
                        {item.detail ? <p className="mt-2 text-sm opacity-80">{item.detail}</p> : null}
                        <p className="mt-3 text-xs opacity-70">
                          {item.createdAt.toLocaleString("sv-SE")}
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
