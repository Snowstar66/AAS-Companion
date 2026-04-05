import Link from "next/link";
import { cookies } from "next/headers";
import { AlertTriangle, Bot, Shield, UsersRound } from "lucide-react";
import { getGovernanceWorkspaceService } from "@aas-companion/api";
import { aiAccelerationLevels } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { GovernanceAgentRegistryView } from "@/components/governance/governance-agent-registry-view";
import { GovernanceDirectoryView } from "@/components/governance/governance-directory-view";
import { AppShell } from "@/components/layout/app-shell";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { requireOrganizationContext } from "@/lib/auth/guards";
import {
  createAgentRegistryEntryAction,
  createPartyRoleEntryAction,
  updateAgentRegistryEntryAction,
  updatePartyRoleEntryAction
} from "./actions";

type GovernancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type AppLanguage = "en" | "sv";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function buildGovernanceHref(input: {
  level?: string | undefined;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
  status?: string | undefined;
  message?: string | undefined;
}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (!value) {
      continue;
    }

    query.set(key, value);
  }

  const queryString = query.toString();
  return queryString ? `/governance?${queryString}` : "/governance";
}

function getGapTargetHref(targetSection: "human_roles" | "ai_agents") {
  return targetSection === "human_roles" ? "#human-roles" : "#ai-agents";
}

function getReadinessTone(readiness: "ready" | "partial" | "not_ready") {
  if (readiness === "ready") {
    return "border-emerald-200 bg-emerald-50/80";
  }

  if (readiness === "partial") {
    return "border-amber-200 bg-amber-50/80";
  }

  return "border-rose-200 bg-rose-50/80";
}

async function getServerLanguage(): Promise<AppLanguage> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function GovernancePage({ searchParams }: GovernancePageProps) {
  const organization = await requireOrganizationContext();
  const language = await getServerLanguage();
  const query = searchParams ? await searchParams : {};
  const level = getParamValue(query.level) ?? undefined;
  const sourceEntity = getParamValue(query.sourceEntity) as "outcome" | "story" | undefined;
  const sourceId = getParamValue(query.sourceId) ?? undefined;
  const status = getParamValue(query.status);
  const message = getParamValue(query.message);
  const request: {
    organizationId: string;
    aiAccelerationLevel?: "level_1" | "level_2" | "level_3";
    sourceEntity?: "outcome" | "story";
    sourceId?: string;
  } = {
    organizationId: organization.organizationId
  };

  if (level) {
    request.aiAccelerationLevel = level as "level_1" | "level_2" | "level_3";
  }

  if (sourceEntity) {
    request.sourceEntity = sourceEntity;
  }

  if (sourceId) {
    request.sourceId = sourceId;
  }

  const governance = await getGovernanceWorkspaceService(request);

  if (!governance.ok) {
    throw new Error(governance.errors[0]?.message ?? t(language, "Governance workspace could not be loaded.", "Governance-arbetsytan kunde inte laddas."));
  }

  const data = governance.data;
  const selectedLevel = data.selectedAiLevel;
  const cockpit = data.adaptive.cockpit;
  const levelDefinition = data.adaptive.levelDefinition;
  const roleBuckets = data.adaptive.roleBuckets;
  const readinessGaps = data.adaptive.readinessGaps;
  const activeAgents = data.agents.filter((agent) => agent.isActive);
  const sourceHref =
    data.sourceContext?.entityType === "outcome"
      ? `/outcomes/${data.sourceContext.entityId}`
      : data.sourceContext?.entityType === "story"
        ? `/stories/${data.sourceContext.entityId}`
        : null;
  const returnParams = {
    view: "governance",
    level: selectedLevel,
    sourceEntity,
    sourceId
  };
  const keyMissingSummary =
    cockpit.keyMissingItems.length > 0 ? cockpit.keyMissingItems[0] : t(language, "No visible governance gaps for the selected AI level.", "Inga synliga governance-gap finns för vald AI-nivå.");

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: t(language, "Governance", "Governance"),
        badge: formatLabel(selectedLevel)
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(17,94,89,0.18),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            {t(language, "Adaptive governance", "Adaptiv governance")}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">{t(language, "Governance cockpit", "Governance-cockpit")}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            {t(
              language,
              "The selected AI level decides what coverage is expected. This page keeps it simple: named humans, governed agents, and visible gaps.",
              "Den valda AI-nivån avgör vilken täckning som förväntas. Den här sidan håller det enkelt: namngivna människor, styrda agenter och synliga gap."
            )}
          </p>

          {data.sourceContext ? (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 text-sm text-sky-950">
              <p className="font-medium">
                {t(language, "Context linked from", "Kontext länkad från")} {formatLabel(data.sourceContext.entityType)} {data.sourceContext.key}
              </p>
              <p className="mt-2">
                {data.sourceContext.title} {t(language, "is currently using", "använder just nu")} {formatLabel(data.sourceContext.aiAccelerationLevel)}.
              </p>
              {sourceHref ? (
                <div className="mt-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={sourceHref}>{t(language, "Back to linked", "Tillbaka till länkad")} {formatLabel(data.sourceContext.entityType)}</Link>
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              status === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ActionSummaryCard
            className="border-sky-200 bg-sky-50/80 shadow-sm"
            description={levelDefinition.description}
            label={t(language, "Selected AI level", "Vald AI-nivå")}
            value={levelDefinition.title}
          />
          <ActionSummaryCard
            actionHref="#readiness-gaps"
            actionLabel={t(language, "Open readiness gaps", "Öppna readiness-gap")}
            className={`${getReadinessTone(cockpit.readiness)} shadow-sm`}
            description={cockpit.readinessDetail}
            label={t(language, "Overall readiness", "Övergripande readiness")}
            value={cockpit.readinessLabel}
          />
          <ActionSummaryCard
            actionHref={readinessGaps[0] ? getGapTargetHref(readinessGaps[0].targetSection) : undefined}
            actionLabel={readinessGaps[0] ? t(language, "Open first gap", "Öppna första gapet") : undefined}
            className={
              readinessGaps.length === 0
                ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                : "border-amber-200 bg-amber-50/80 shadow-sm"
            }
            description={keyMissingSummary}
            label={t(language, "Key missing items", "Viktigaste saknade delar")}
            value={readinessGaps.length}
          />
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{t(language, "AI level switcher", "AI-nivåväxlare")}</CardTitle>
            <CardDescription>{t(language, "Change level and the role, agent and readiness expectations update immediately.", "Byt nivå så uppdateras förväntningar på roller, agenter och readiness direkt.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {aiAccelerationLevels.map((candidateLevel) => (
                  <Button
                    asChild
                    key={candidateLevel}
                    size="sm"
                    variant={candidateLevel === selectedLevel ? "default" : "secondary"}
                  >
                    <Link
                      href={buildGovernanceHref({
                        level: candidateLevel,
                        sourceEntity,
                        sourceId
                      })}
                    >
                      {formatLabel(candidateLevel)}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t(language, "Human mandate always applies", "Mänskligt mandat gäller alltid")}</p>
              <p className="mt-2">
                {t(language, "Humans still own decisions, risk acceptance and supervision. Higher AI acceleration only raises the expected coverage.", "Människor äger fortfarande beslut, riskacceptans och tillsyn. Högre AI-acceleration höjer bara den förväntade täckningen.")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="human-roles">
          <CardHeader>
            <div className="flex items-start gap-3">
              <UsersRound className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t(language, "Human roles", "Mänskliga roller")}</CardTitle>
                <CardDescription>{t(language, "Required roles must be named. Recommended and optional roles stay visible without creating process overhead.", "Obligatoriska roller måste vara namngivna. Rekommenderade och valfria roller förblir synliga utan att skapa processöverlast.")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-3">
              {roleBuckets.map((bucket) => (
                <div className="rounded-2xl border border-border/70 bg-background/90 p-4" key={bucket.category}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{bucket.title}</p>
                  <div className="mt-4 space-y-3">
                    {bucket.items.map((item) => (
                      <div className="rounded-2xl border border-border/70 bg-muted/10 p-3" key={`${bucket.category}-${item.organizationSide}-${item.roleType}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{item.label}</p>
                          <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {formatLabel(item.organizationSide)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.status === "covered"
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : item.category === "required"
                                  ? "border border-rose-200 bg-rose-50 text-rose-800"
                                  : "border border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            {item.status === "covered"
                              ? t(language, "Ready", "Redo")
                              : item.category === "required"
                                ? t(language, "Gap", "Gap")
                                : t(language, "Open", "Öppen")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.assignedPeople.length > 0
                            ? item.assignedPeople.map((person) => person.fullName).join(", ")
                            : t(language, "No named active person yet.", "Ingen namngiven aktiv person ännu.")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t(language, "Separation rule", "Separationsregel")}</p>
              <p className="mt-2">
                {t(language, "Level 1 can tolerate one person covering several roles. At Level 2-3, conflicting combinations are shown as warnings but do not block work.", "Nivå 1 kan tolerera att en person täcker flera roller. På nivå 2-3 visas konflikterande kombinationer som varningar men blockerar inte arbetet.")}
              </p>
            </div>

            <GovernanceDirectoryView
              createAction={createPartyRoleEntryAction}
              customerPeople={data.people.filter((person) => person.organizationSide === "customer")}
              language={language}
              returnParams={returnParams}
              supplierPeople={data.people.filter((person) => person.organizationSide === "supplier")}
              updateAction={updatePartyRoleEntryAction}
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="ai-agents">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Bot className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t(language, "AI agent setup", "AI-agentuppsättning")}</CardTitle>
                <CardDescription>{t(language, "Agents stay simple: clear purpose, clear scope, named supervisor and visible status.", "Agenter hålls enkla: tydligt syfte, tydlig scope, namngiven supervisor och synlig status.")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Allowed for this level", "Tillåtet på denna nivå")}</p>
                <div className="mt-4 space-y-3">
                  {data.adaptive.agentGuidance.allowedAgents.map((agent) => (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 p-3" key={agent.label}>
                      <p className="font-medium text-foreground">{agent.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.purpose}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Level rules", "Nivåregler")}</p>
                <div className="mt-4 space-y-3">
                  {data.adaptive.agentGuidance.rules.map((rule) => (
                    <div className="rounded-2xl border border-border/70 bg-muted/10 px-3 py-3 text-sm text-muted-foreground" key={rule}>
                      {rule}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t(language, "Current setup", "Nuvarande uppsättning")}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-3">
                    <p className="text-sm text-muted-foreground">{t(language, "Active agents", "Aktiva agenter")}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{activeAgents.length}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-3">
                    <p className="text-sm text-muted-foreground">{t(language, "Supervised agents", "Superviserade agenter")}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{data.summaries.supervisedAgents}</p>
                  </div>
                </div>
              </div>
            </div>

            <GovernanceAgentRegistryView
              activeSupervisors={data.people.filter((person) => person.isActive)}
              agents={data.agents}
              createAction={createAgentRegistryEntryAction}
              language={language}
              returnParams={returnParams}
              updateAction={updateAgentRegistryEntryAction}
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm" id="readiness-gaps">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t(language, "Readiness gaps", "Readiness-gap")}</CardTitle>
                <CardDescription>{t(language, "Auto-generated, plain-language gaps for the currently selected AI level.", "Autogenererade gap i klarspråk för den AI-nivå som är vald just nu.")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {readinessGaps.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                {t(language, "Governance looks ready for", "Governance ser redo ut för")} {formatLabel(selectedLevel)}. {t(language, "Required roles are named and active agents are supervised.", "Obligatoriska roller är namngivna och aktiva agenter är superviserade.")}
              </div>
            ) : (
              readinessGaps.map((gap) => (
                <div
                  className={`rounded-2xl border px-4 py-4 ${
                    gap.status === "gap"
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                  key={gap.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{gap.message}</p>
                      <p className="mt-2 text-sm leading-6">{gap.guidance}</p>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={getGapTargetHref(gap.targetSection)}>{t(language, "Open relevant section", "Öppna relevant sektion")}</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
