import { cookies } from "next/headers";
import {
  AlertTriangle,
  ChevronDown,
  DatabaseZap,
  Sparkles,
  ShieldAlert,
  Trash2,
  UserRoundCog
} from "lucide-react";
import { membershipRoles } from "@aas-companion/domain";
import { listOrganizationProjectUsers, listPartyRoleEntries } from "@aas-companion/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { demoRoleSeeds } from "@/lib/admin/demo-role-catalog";
import { loadOperationalLogs } from "@/lib/admin/operational-logs";
import { loadHomeDashboard } from "@/lib/home/dashboard";
import {
  applyDemoRoleBulkAction,
  clearOperationalLogsAction,
  hardDeleteProjectsAction,
  removeProjectUserAction,
  updateProjectUserAction
} from "./actions";

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

  if (status === "warning") {
    return "border-amber-200 bg-amber-50/80 text-amber-900";
  }

  if (status === "success") {
    return "border-emerald-200 bg-emerald-50/80 text-emerald-900";
  }

  return "border-slate-200 bg-slate-50/80 text-slate-900";
}

function getLogStatusLabel(language: AppLanguage, status: string) {
  if (status === "error") {
    return language === "sv" ? "fel" : "error";
  }

  if (status === "warning") {
    return language === "sv" ? "varning" : "warning";
  }

  if (status === "success") {
    return language === "sv" ? "lyckad" : "success";
  }

  if (status === "started") {
    return language === "sv" ? "paborjad" : "started";
  }

  return language === "sv" ? "info" : "info";
}

function formatRoleLabel(language: AppLanguage, role: string) {
  const sv: Record<string, string> = {
    value_owner: "Vardeagare",
    aida: "AIDA",
    aqa: "AQA",
    architect: "Arkitekt",
    delivery_lead: "Leveransledare",
    builder: "Byggare"
  };

  if (language === "sv") {
    return sv[role] ?? role.replaceAll("_", " ");
  }

  return role.replaceAll("_", " ");
}

function groupRoleSeedsBySide() {
  return {
    customer: demoRoleSeeds.filter((seed) => seed.organizationSide === "customer"),
    supplier: demoRoleSeeds.filter((seed) => seed.organizationSide === "supplier")
  };
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
  const { activeProject, canManageProjects, isDemoSession, projects, session } = await loadHomeDashboard();
  const operationalLogs =
    activeProject && !isDemoSession
      ? await loadOperationalLogs(30, language)
      : {
          state: "unavailable" as const,
          items: [],
          message: t(
            "Open a normal active project to inspect operational logs.",
            "Oppna ett vanligt aktivt projekt for att granska operativa loggar."
          ),
          organizationName: activeProject?.organizationName ?? t("Unknown project", "Okant projekt")
        };
  const projectUsers =
    activeProject && !isDemoSession ? await listOrganizationProjectUsers(activeProject.organizationId) : [];
  const partyRoles =
    activeProject && !isDemoSession
      ? await listPartyRoleEntries(activeProject.organizationId, { includeInactive: true })
      : [];
  const roleSeedsBySide = groupRoleSeedsBySide();
  const rolePresenceByKey = new Map<
    string,
    {
      activeCount: number;
      totalCount: number;
    }
  >();

  for (const role of partyRoles) {
    const key = `${role.organizationSide}:${role.roleType}`;
    const existing = rolePresenceByKey.get(key) ?? {
      activeCount: 0,
      totalCount: 0
    };
    existing.totalCount += 1;
    if (role.isActive) {
      existing.activeCount += 1;
    }
    rolePresenceByKey.set(key, existing);
  }

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
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("Aggressive project cleanup", "Aggressiv projektrensning")}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {t(
                    "Use this page to remove test projects completely, manage internal project users, and inspect active troubleshooting logs.",
                    "Anvand den har sidan for att ta bort testprojekt helt, hantera interna projektanvandare och granska aktiva felsokningsloggar."
                  )}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm leading-6 text-red-900 lg:max-w-sm">
              <p className="font-semibold">{t("No undo", "Ingen angra")}</p>
              <p className="mt-2">
                {t(
                  "Project deletion is permanent. User removal only affects the active project and is blocked for the last remaining member.",
                  "Projektborttagning ar permanent. User removal paverkar bara det aktiva projektet och blockeras for sista kvarvarande medlemmen."
                )}
              </p>
            </div>
          </div>
        </div>

        {flashError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {flashError}
          </div>
        ) : null}
        {flashMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {flashMessage}
          </div>
        ) : null}

        {!canManageProjects || isDemoSession ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{t("Admin cleanup is unavailable", "Administrativ rensning ar inte tillganglig")}</CardTitle>
              <CardDescription>
                {t(
                  "Open a normal signed-in project account before trying to remove persisted data.",
                  "Oppna ett vanligt inloggat projektkonto innan du forsoker ta bort sparad data."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {t(
                "Demo stays isolated on purpose, so destructive cleanup is disabled there.",
                "Demo ar medvetet isolerad, sa destruktiv rensning ar avstangd dar."
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <UserRoundCog className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{t("Internal users in active project", "Interna anvandare i aktivt projekt")}</CardTitle>
                    <CardDescription>
                      {t(
                        "Update the user profile shown in local sign-in and around the app, change the role in this project, or remove the project membership safely.",
                        "Uppdatera anvandarprofilen som visas i lokal inloggning och runtom i appen, andra rollen i detta projekt eller ta bort projektmembership pa ett sakert satt."
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      {t(
                        "Profile edits update the same internal account everywhere it appears. Removing a user here only removes access to this active project, and active outcome owner assignments are cleared here before membership is removed.",
                        "Profilandringar uppdaterar samma interna konto overallt dar det visas. Remove har tar bara bort access till detta aktiva projekt, och aktiva outcome-agarskap rensas har innan membership tas bort."
                      )}
                    </p>
                  </div>
                </div>

                {projectUsers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                    {t(
                      "No internal users are linked to the active project yet.",
                      "Inga interna anvandare ar kopplade till det aktiva projektet annu."
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectUsers.map((user) => (
                      <details className="group rounded-3xl border border-border/70 bg-background shadow-sm" key={user.userId}>
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-foreground">{user.fullName ?? user.email}</p>
                              {user.userId === session?.userId ? (
                                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                  {t("You", "Du")}
                                </span>
                              ) : null}
                              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                {formatRoleLabel(language, user.role)}
                              </span>
                              {user.activeOutcomeOwnerCount > 0 ? (
                                <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
                                  {user.activeOutcomeOwnerCount}{" "}
                                  {t("active outcome owner assignment(s)", "aktiv(a) outcome-agarskap")}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                        </summary>

                        <div className="border-t border-border/70 px-5 py-4">
                          <form action={updateProjectUserAction} className="grid gap-4 lg:grid-cols-2">
                            <input name="userId" type="hidden" value={user.userId} />
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">
                                {t("Full name", "Fullstandigt namn")}
                              </span>
                              <input
                                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                defaultValue={user.fullName ?? ""}
                                name="fullName"
                                type="text"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">{t("Email", "E-post")}</span>
                              <input
                                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                defaultValue={user.email}
                                name="email"
                                type="email"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">
                                {t("Project role", "Projektroll")}
                              </span>
                              <select
                                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                                defaultValue={user.role}
                                name="role"
                              >
                                {membershipRoles.map((role) => (
                                  <option key={role} value={role}>
                                    {formatRoleLabel(language, role)}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
                              {user.activeOutcomeOwnerCount > 0
                                ? t(
                                    "Removing this user clears their active outcome owner assignments in this project before the membership is removed.",
                                    "Om du tar bort denna anvandare rensas deras aktiva outcome-agarskap i detta projekt innan membership tas bort."
                                  )
                                : t(
                                    "This user currently has no active outcome owner assignments in the project.",
                                    "Denna anvandare har inga aktiva outcome-agarskap i projektet just nu."
                                  )}
                            </div>
                            <div className="lg:col-span-2">
                              <PendingFormButton
                                className="gap-2"
                                label={t("Save user", "Spara anvandare")}
                                pendingLabel={t("Saving user...", "Sparar anvandare...")}
                                showPendingCursor
                              />
                            </div>
                          </form>

                          <form action={removeProjectUserAction} className="mt-4">
                            <input name="userId" type="hidden" value={user.userId} />
                            <PendingFormButton
                              className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                              disabled={projectUsers.length <= 1}
                              icon={<Trash2 className="h-4 w-4" />}
                              label={t("Remove from active project", "Ta bort fran aktivt projekt")}
                              pendingLabel={t("Removing from project...", "Tar bort fran projekt...")}
                              showPendingCursor
                            />
                          </form>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{t("Demo role bulk tools", "Demo-rollverktyg i bulk")}</CardTitle>
                    <CardDescription>
                      {t(
                        "Create or remove a ready-made customer and supplier role set for the active project. Each row uses a generated demo portrait, fixed role title, and mandate text aligned with the help guidance.",
                        "Skapa eller ta bort en fardig uppsattning kund- och leverantorsroller for det aktiva projektet. Varje rad anvander ett genererat demoportatt, fast rolltitel och mandattext som foljer hjalpens guidance."
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      {t(
                        "Remove is intentionally broad on this admin surface. It deletes all matching roles in the active project for the selected role type and side, even if they were created manually.",
                        "Remove ar medvetet bred pa denna adminyta. Den tar bort alla matchande roller i det aktiva projektet for vald rolltyp och sida, aven om de skapades manuellt."
                      )}
                    </p>
                  </div>
                </div>

                <form action={applyDemoRoleBulkAction} className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    {([
                      ["customer", roleSeedsBySide.customer, t("Customer roles", "Kundroller")],
                      ["supplier", roleSeedsBySide.supplier, t("Supplier roles", "Leverantorsroller")]
                    ] as const).map(([side, seeds, heading]) => (
                      <div className="space-y-3" key={side}>
                        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                          <p className="text-sm font-semibold text-foreground">{heading}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {side === "customer"
                              ? t(
                                  "Customer-side authority for sponsorship, domain, value and risk.",
                                  "Kundsidesansvar for sponsorskap, doman, varde och risk."
                                )
                              : t(
                                  "Supplier-side authority for architecture, AI execution, quality and delivery.",
                                  "Leverantorssidesansvar for arkitektur, AI-exekvering, kvalitet och leverans."
                                )}
                          </p>
                        </div>

                        {seeds.map((seed) => {
                          const presence =
                            rolePresenceByKey.get(`${seed.organizationSide}:${seed.roleType}`) ?? {
                              activeCount: 0,
                              totalCount: 0
                            };

                          return (
                            <div className="rounded-3xl border border-border/70 bg-background p-4 shadow-sm" key={seed.id}>
                              <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                                  <img
                                    alt={seed.fullName}
                                    className="h-full w-full object-cover"
                                    src={seed.previewAvatarUrl}
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-foreground">{seed.roleLabel}</p>
                                    <span className="rounded-full border border-border/70 bg-muted/20 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                      {seed.roleTitle}
                                    </span>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        presence.activeCount > 0
                                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                          : "border border-border/70 bg-muted/20 text-muted-foreground"
                                      }`}
                                    >
                                      {presence.activeCount > 0
                                        ? t(
                                            `${presence.activeCount} active / ${presence.totalCount} total`,
                                            `${presence.activeCount} aktiv(a) / ${presence.totalCount} totalt`
                                          )
                                        : t("No current role", "Ingen nuvarande roll")}
                                    </span>
                                  </div>
                                  <div className="text-sm leading-6">
                                    <p className="font-medium text-foreground">{seed.fullName}</p>
                                    <p className="text-muted-foreground">{seed.email}</p>
                                  </div>
                                  <p className="text-sm leading-6 text-muted-foreground">{seed.mandateNotes}</p>
                                  <div className="flex flex-wrap gap-6 pt-1">
                                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                      <input
                                        className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                                        name="createRoleIds"
                                        type="checkbox"
                                        value={seed.id}
                                      />
                                      <span>{t("Create", "Create")}</span>
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                      <input
                                        className="h-4 w-4 rounded border-border text-red-600 focus:ring-red-500"
                                        name="removeRoleIds"
                                        type="checkbox"
                                        value={seed.id}
                                      />
                                      <span>{t("Remove", "Remove")}</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/45 p-4">
                    <p className="text-sm text-sky-900">
                      {t(
                        "Apply all checked demo role changes for the active project in one bulk action.",
                        "Kor alla markerade demo-rollandringar for det aktiva projektet i en bulk-action."
                      )}
                    </p>
                    <PendingFormButton
                      className="gap-2"
                      label={t("Apply demo role changes", "Kor demo-rollandringar")}
                      pendingLabel={t("Applying demo role changes...", "Korar demo-rollandringar...")}
                      showPendingCursor
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{t("Projects", "Projekt")}</CardTitle>
                  <CardDescription>
                    {t(
                      "Mark one or more projects, then hard delete the selection in one operation.",
                      "Markera ett eller flera projekt och hardradera sedan urvalet i en operation."
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                      {t(
                        "No removable normal projects exist for this account right now.",
                        "Det finns inga borttagbara vanliga projekt for det har kontot just nu."
                      )}
                    </div>
                  ) : (
                    <form action={hardDeleteProjectsAction} className="space-y-4">
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/65 px-4 py-3 text-sm text-amber-900">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>
                            {t(
                              "Hard delete removes the selected projects entirely. If the active project is included, the app will also clear the active project context.",
                              "Hardradering tar bort de valda projekten helt. Om det aktiva projektet ingar rensar appen ocksa den aktiva projektkontexten."
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
                                  {t("Outcomes", "Outcomes")}{" "}
                                  <span className="ml-1 font-semibold text-foreground">{project.counts.outcomes}</span>
                                </span>
                                <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                  {t("Epics", "Epics")}{" "}
                                  <span className="ml-1 font-semibold text-foreground">{project.counts.epics}</span>
                                </span>
                                <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                  {t("Stories", "Stories")}{" "}
                                  <span className="ml-1 font-semibold text-foreground">{project.counts.stories}</span>
                                </span>
                                <span className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-muted-foreground">
                                  {t("Events", "Handelser")}{" "}
                                  <span className="ml-1 font-semibold text-foreground">{project.counts.activityEvents}</span>
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/45 p-4">
                        <p className="text-sm text-red-900">
                          {t(
                            "Selected projects will be deleted permanently from the database.",
                            "Valda projekt raderas permanent fran databasen."
                          )}
                        </p>
                        <PendingFormButton
                          className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                          icon={<Trash2 className="h-4 w-4" />}
                          label={t("Hard delete selected projects", "Hardradera valda projekt")}
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
                          "Lattviktig felsokning for det aktiva projektet. Langsamma eller misslyckade importer och godkannanden visas har med tidmatning."
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
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-xs text-muted-foreground">
                    {t(
                      "Green means success, yellow means warning, red means failure, and gray means an operation is still in progress.",
                      "Gront betyder lyckad, gult betyder varning, rott betyder fel och gratt betyder att en operation fortfarande pagar."
                    )}
                  </div>
                  {operationalLogs.state !== "ready" || operationalLogs.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-5 text-sm text-muted-foreground">
                      {t(
                        "No operational logs are visible yet for the active project.",
                        "Inga operativa loggar syns annu for det aktiva projektet."
                      )}
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
                              {getLogStatusLabel(language, item.status)}
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
                            {item.action.replaceAll("_", " ")} {t("on", "pa")}{" "}
                            {item.entityType.replaceAll("_", " ")} {item.entityId}
                          </p>
                          {item.detail ? <p className="mt-2 text-sm opacity-80">{item.detail}</p> : null}
                          <p className="mt-3 text-xs opacity-70">
                            {item.createdAt.toLocaleString(language === "sv" ? "sv-SE" : "en-US")}
                            {item.actorName ? ` - ${item.actorName}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
