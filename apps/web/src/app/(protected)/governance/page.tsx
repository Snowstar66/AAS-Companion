import Link from "next/link";
import { BriefcaseBusiness, Shield, ShieldAlert, Sparkles } from "lucide-react";
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

type GovernanceViewKey = "directory" | "agents" | "authority" | "readiness" | "signoffs";
type GovernanceLevelKey = "level_1" | "level_2" | "level_3";

const governanceViewOptions: Array<{ key: GovernanceViewKey; label: string }> = [
  { key: "directory", label: "Party Directory" },
  { key: "agents", label: "Agent Registry" },
  { key: "authority", label: "Authority Matrix" },
  { key: "readiness", label: "Readiness Gaps" },
  { key: "signoffs", label: "Sign-off Traceability" }
];

const governanceViewCopy: Record<
  GovernanceViewKey,
  {
    title: string;
    description: string;
    focusQuestion: string;
  }
> = {
  directory: {
    title: "Who is named in the human role model?",
    description: "Use the directory to see which real people are currently carrying customer and supplier responsibilities.",
    focusQuestion: "Which named people are carrying the required roles on the customer and supplier sides?"
  },
  agents: {
    title: "Which agents are active and who is supervising them?",
    description: "Use the agent registry to verify active agents, their permitted scope and the named human supervisor behind each one.",
    focusQuestion: "Does every active agent have a clear human owner who can intervene?"
  },
  authority: {
    title: "Who is expected to own, review or approve each responsibility area?",
    description: "Use the authority matrix to compare the intended authority model with the people that are actually assigned today.",
    focusQuestion: "Are the right people attached to the right authority decisions?"
  },
  readiness: {
    title: "What currently blocks this AI level from being governance-ready?",
    description: "Use readiness to inspect staffing gaps, separation-of-duties conflicts and missing supervision before you trust the selected AI level.",
    focusQuestion: "Which staffing gaps or risk flags stop this AI level from being credible right now?"
  },
  signoffs: {
    title: "What human review and approval evidence already exists?",
    description: "Use sign-off traceability to inspect who approved what, when they did it and what evidence was attached.",
    focusQuestion: "Can we prove the right human sign-offs happened for this project or linked artifact?"
  }
};

const governanceLevelCopy: Record<
  GovernanceLevelKey,
  {
    title: string;
    description: string;
    governanceShift: string;
  }
> = {
  level_1: {
    title: "Level 1",
    description: "Human-led delivery with lighter AI assistance.",
    governanceShift: "The bar is lighter: fewer named roles are required and supervision is usually straightforward."
  },
  level_2: {
    title: "Level 2",
    description: "Shared execution between humans and AI.",
    governanceShift: "The bar rises: clearer reviewers, stronger handoffs and more explicit responsibility coverage are expected."
  },
  level_3: {
    title: "Level 3",
    description: "High AI acceleration with the strongest governance expectations.",
    governanceShift: "The bar is highest: named staffing, separation of duties and agent supervision all need to hold up clearly."
  }
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function buildGovernanceHref(input: {
  view?: string | undefined;
  level?: string | undefined;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
  side?: string | undefined;
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

export default async function GovernancePage({ searchParams }: GovernancePageProps) {
  const organization = await requireOrganizationContext();
  const query = searchParams ? await searchParams : {};
  const view = getParamValue(query.view) ?? "directory";
  const level = getParamValue(query.level) ?? undefined;
  const sourceEntity = getParamValue(query.sourceEntity) as "outcome" | "story" | undefined;
  const sourceId = getParamValue(query.sourceId) ?? undefined;
  const directorySide = getParamValue(query.side) ?? undefined;
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

  const governance = await getGovernanceWorkspaceService({
    ...request,
    includeSignoffRecords: view === "signoffs"
  });

  if (!governance.ok) {
    throw new Error(governance.errors[0]?.message ?? "Governance workspace could not be loaded.");
  }

  const data = governance.data;
  const selectedLevel = data.selectedAiLevel as GovernanceLevelKey;
  const selectedView = (view in governanceViewCopy ? view : "directory") as GovernanceViewKey;
  const selectedViewCopy = governanceViewCopy[selectedView];
  const selectedLevelCopy = governanceLevelCopy[selectedLevel];
  const activePeople = data.people.filter((person) => person.isActive);
  const customerPeople = data.people.filter((person) => person.organizationSide === "customer");
  const supplierPeople = data.people.filter((person) => person.organizationSide === "supplier");
  const visibleCustomerPeople = directorySide === "supplier" ? [] : customerPeople;
  const visibleSupplierPeople = directorySide === "customer" ? [] : supplierPeople;
  const activeSupervisors = activePeople;
  const returnParams = {
    view,
    level: selectedLevel,
    sourceEntity,
    sourceId,
    side: directorySide
  };
  const sourceHref =
    data.sourceContext?.entityType === "outcome"
      ? `/outcomes/${data.sourceContext.entityId}`
      : data.sourceContext?.entityType === "story"
        ? `/stories/${data.sourceContext.entityId}`
        : null;

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        eyebrow: "AAS Companion",
        projectName: organization.organizationName,
        sectionLabel: "Governance",
        badge: selectedLevel.replaceAll("_", " ")
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(17,94,89,0.18),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Human roles, agents and readiness
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Governance cockpit</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Governance is reduced to three plain-language checks at the top level: do we have the right named people,
            are conflicting duties separated, and does every active agent have human supervision? The detailed views
            below answer those questions from different angles.
          </p>
          {data.sourceContext ? (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/90 p-4 text-sm text-sky-950">
              <p className="font-medium">
                Context linked from {formatLabel(data.sourceContext.entityType)} {data.sourceContext.key}
              </p>
              <p className="mt-2">
                {data.sourceContext.title} is currently using {formatLabel(data.sourceContext.aiAccelerationLevel)}.
              </p>
              {sourceHref ? (
                <div className="mt-3">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={sourceHref}>Back to linked {formatLabel(data.sourceContext.entityType)}</Link>
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
            actionHref={buildGovernanceHref({ view: "directory", level: selectedLevel, sourceEntity, sourceId })}
            actionLabel="Open party directory"
            className={
              data.readiness.validation.missingRoleCount === 0
                ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                : "border-rose-200 bg-rose-50/80 shadow-sm"
            }
            description={
              data.readiness.validation.missingRoleCount === 0
                ? `Every human role required for ${formatLabel(selectedLevel)} has a named active person assigned.`
                : `${data.readiness.validation.missingRoleCount} required role assignment(s) are still missing for ${formatLabel(selectedLevel)}.`
            }
            label="Named people for required roles"
            value={data.readiness.validation.missingRoleCount === 0 ? "Ready" : `${data.readiness.validation.missingRoleCount} gap`}
          />
          <ActionSummaryCard
            actionHref={buildGovernanceHref({ view: "readiness", level: selectedLevel, sourceEntity, sourceId })}
            actionLabel="Open separation risks"
            className={
              data.readiness.validation.riskyCombinationCount === 0
                ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                : "border-amber-200 bg-amber-50/80 shadow-sm"
            }
            description={
              data.readiness.validation.riskyCombinationCount === 0
                ? "No active person currently holds a conflicting mix of duties that should stay separated."
                : `${data.readiness.validation.riskyCombinationCount} conflict pair(s) need to be split across different people.`
            }
            label="Separation of duties"
            value={data.readiness.validation.riskyCombinationCount === 0 ? "Clear" : `${data.readiness.validation.riskyCombinationCount} conflict`}
          />
          <ActionSummaryCard
            actionHref={buildGovernanceHref({ view: "agents", level: selectedLevel, sourceEntity, sourceId })}
            actionLabel="Open agent registry"
            className={
              data.readiness.validation.supervisionGapCount === 0
                ? "border-emerald-200 bg-emerald-50/80 shadow-sm"
                : "border-rose-200 bg-rose-50/80 shadow-sm"
            }
            description={
              data.readiness.validation.supervisionGapCount === 0
                ? "Every active agent has a named active human supervisor who can review and intervene."
                : `${data.readiness.validation.supervisionGapCount} active agent(s) are still missing a valid human supervisor.`
            }
            label="Human supervision of agents"
            value={data.readiness.validation.supervisionGapCount === 0 ? "Covered" : `${data.readiness.validation.supervisionGapCount} gap`}
          />
        </div>

        {data.readiness.validation.recommendations.length > 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Recommended next actions</CardTitle>
              <CardDescription>Only the most important governance actions are surfaced at the top level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.readiness.validation.recommendations.slice(0, 3).map((recommendation, index) => (
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    recommendation.priority === "high"
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
                  key={`${recommendation.kind}-${index}`}
                >
                  <p className="font-medium">
                    {recommendation.priority === "high" ? "High-priority action" : "Medium-priority action"}
                  </p>
                  <p className="mt-2">{recommendation.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Governance views and AI levels</CardTitle>
            <CardDescription>
              Each view answers a different governance question, and each AI level raises the staffing and oversight bar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {governanceViewOptions.map((item) => (
                  <Button asChild key={item.key} size="sm" variant={view === item.key ? "default" : "secondary"}>
                    <Link
                      href={buildGovernanceHref({
                        view: item.key,
                        level: selectedLevel,
                        sourceEntity,
                        sourceId,
                        side: item.key === "directory" ? directorySide : undefined
                      })}
                    >
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/75 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Current governance focus</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-sky-950">{selectedViewCopy.title}</p>
              <p className="mt-2 text-sm leading-6 text-sky-900">{selectedViewCopy.description}</p>
              <p className="mt-3 text-sm font-medium text-sky-950">This view answers: {selectedViewCopy.focusQuestion}</p>
            </div>

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
                        view,
                        level: candidateLevel,
                        sourceEntity,
                        sourceId,
                        side: view === "directory" ? directorySide : undefined
                      })}
                    >
                      {formatLabel(candidateLevel)}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">What changes between level 1, 2 and 3?</p>
                <p className="text-sm text-muted-foreground">
                  Higher AI acceleration raises the governance bar, even when the rest of the screen looks familiar.
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {aiAccelerationLevels.map((candidateLevel) => {
                  const levelCopy = governanceLevelCopy[candidateLevel as GovernanceLevelKey];
                  const isSelected = candidateLevel === selectedLevel;

                  return (
                    <div
                      className={`rounded-2xl border p-4 ${
                        isSelected
                          ? "border-emerald-200 bg-emerald-50/80"
                          : "border-border/70 bg-muted/20"
                      }`}
                      key={candidateLevel}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {levelCopy.title}
                      </p>
                      <p className="mt-2 font-medium text-foreground">{levelCopy.description}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{levelCopy.governanceShift}</p>
                      {isSelected ? (
                        <p className="mt-3 text-sm font-medium text-emerald-800">Current selection</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Selected now: {selectedLevelCopy.title}</p>
                <p className="mt-2">{selectedLevelCopy.governanceShift}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {view === "directory" ? (
          <div className="space-y-4">
            {directorySide ? (
              <Card className="border-border/70 shadow-sm">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Directory filtered to {formatLabel(directorySide)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use this drill-down to inspect one side quickly while staying inside the active project.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link
                      href={buildGovernanceHref({
                        view: "directory",
                        level: selectedLevel,
                        sourceEntity,
                        sourceId
                      })}
                    >
                      Show both sides
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <GovernanceDirectoryView
              createAction={createPartyRoleEntryAction}
              customerPeople={visibleCustomerPeople}
              returnParams={returnParams}
              supplierPeople={visibleSupplierPeople}
              updateAction={updatePartyRoleEntryAction}
            />
          </div>
        ) : null}

        {view === "agents" ? (
          <GovernanceAgentRegistryView
            activeSupervisors={activeSupervisors}
            agents={data.agents}
            createAction={createAgentRegistryEntryAction}
            returnParams={returnParams}
            updateAction={updateAgentRegistryEntryAction}
          />
        ) : null}

        {view === "authority" ? (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Authority matrix</CardTitle>
                    <CardDescription>
                      See which customer, supplier and AI governance roles are expected to own, review or approve each
                      major responsibility area.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              {data.authorityMatrix.map((rule) => (
                <Card className="border-border/70 shadow-sm" key={rule.responsibilityArea}>
                  <CardHeader>
                    <CardTitle>{rule.summaryLabel}</CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="font-medium text-foreground">Customer: {formatLabel(rule.customerAssignment)}</p>
                      <p className="mt-2">
                        Expected roles:{" "}
                        {rule.customerRoleTypes.length > 0
                          ? rule.customerRoleTypes.map(formatLabel).join(", ")
                          : "None"}
                      </p>
                      <p className="mt-2">
                        Assigned people:{" "}
                        {rule.customerAssignments.length > 0
                          ? rule.customerAssignments.map((person) => person.fullName).join(", ")
                          : "No named person yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="font-medium text-foreground">Supplier: {formatLabel(rule.supplierAssignment)}</p>
                      <p className="mt-2">
                        Expected roles:{" "}
                        {rule.supplierRoleTypes.length > 0
                          ? rule.supplierRoleTypes.map(formatLabel).join(", ")
                          : "None"}
                      </p>
                      <p className="mt-2">
                        Assigned people:{" "}
                        {rule.supplierAssignments.length > 0
                          ? rule.supplierAssignments.map((person) => person.fullName).join(", ")
                          : "No named person yet"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="font-medium text-foreground">AI governance: {formatLabel(rule.aiGovernanceAssignment)}</p>
                      <p className="mt-2">
                        Expected roles:{" "}
                        {rule.aiGovernanceRoleTypes.length > 0
                          ? rule.aiGovernanceRoleTypes.map(formatLabel).join(", ")
                          : "None"}
                      </p>
                      <p className="mt-2">
                        Assigned people:{" "}
                        {rule.aiGovernanceAssignments.length > 0
                          ? rule.aiGovernanceAssignments.map((person) => person.fullName).join(", ")
                          : "No named person yet"}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl border px-4 py-3 ${
                        rule.isCovered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {rule.isCovered
                        ? "Authority coverage is present."
                        : "At least one required authority assignment is still missing."}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {view === "readiness" ? (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>AI level staffing validation</CardTitle>
                    <CardDescription>
                      Validate whether the current project's named staffing, separation and agent supervision support {formatLabel(selectedLevel)}.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    data.readiness.validation.status === "supports_selected_level"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : data.readiness.validation.status === "needs_attention"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  <p className="font-medium">{data.readiness.validation.summaryTitle}</p>
                  <p className="mt-2">{data.readiness.validation.summaryMessage}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected level</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{formatLabel(selectedLevel)}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Missing roles</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{data.readiness.validation.missingRoleCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risky combinations</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{data.readiness.validation.riskyCombinationCount}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Supervision gaps</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{data.readiness.validation.supervisionGapCount}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                  <p className="font-medium">Staffing validation is distinct from final approval</p>
                  <p className="mt-2">
                    Even if staffing supports the selected AI level, final sign-off, tollgate approval and later delivery readiness still remain separate.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>AAS recommendations</CardTitle>
                <CardDescription>Action-oriented next steps when staffing or role separation does not yet support the selected AI level.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.readiness.validation.recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    No immediate staffing recommendations are open for {formatLabel(selectedLevel)}.
                  </div>
                ) : (
                  data.readiness.validation.recommendations.map((recommendation, index) => (
                    <div
                      className={`rounded-2xl border px-4 py-4 text-sm ${
                        recommendation.priority === "high"
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : "border-amber-200 bg-amber-50 text-amber-900"
                      }`}
                      key={`${recommendation.kind}-${index}`}
                    >
                      <p className="font-medium">{recommendation.title}</p>
                      <p className="mt-2">{recommendation.description}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Coverage requirements</CardTitle>
                <CardDescription>Each requirement shows how many active named people currently satisfy it.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.readiness.coverage.map((item) => (
                  <div
                    className={`rounded-2xl border px-4 py-4 ${
                      item.status === "satisfied"
                        ? "border-emerald-200 bg-emerald-50/80"
                        : item.status === "partially_covered"
                          ? "border-amber-200 bg-amber-50/80"
                          : "border-rose-200 bg-rose-50/80"
                    }`}
                    key={`${item.aiAccelerationLevel}-${item.organizationSide}-${item.roleType}`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {formatLabel(item.organizationSide)} / {formatLabel(item.roleType)}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{item.rationale}</p>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {item.matchedCount} / {item.minimumCount} staffed
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Matched people:{" "}
                      {item.matchedPeople.length > 0
                        ? item.matchedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                        : "None yet"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Risk combinations</CardTitle>
                    <CardDescription>
                      These flags appear only when the same person occupies combinations that should stay separated.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.readiness.riskFlags.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    No risky role combinations are currently detected for {formatLabel(selectedLevel)}.
                  </div>
                ) : (
                  data.readiness.riskFlags.map((flag) => (
                    <div
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
                      key={`${flag.primaryRoleType}-${flag.conflictingRoleType}`}
                    >
                      <p className="font-medium">
                        {formatLabel(flag.primaryRoleType)} conflicts with {formatLabel(flag.conflictingRoleType)}
                      </p>
                      <p className="mt-2">{flag.message}</p>
                      <p className="mt-2">People involved: {flag.people.map((person) => person.fullName).join(", ")}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Agent supervision</CardTitle>
                <CardDescription>Active agents must have an active supervising human before staffing can be trusted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.readiness.supervisionGaps.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    All active agents currently have an active supervising human.
                  </div>
                ) : (
                  data.readiness.supervisionGaps.map((gap) => (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900" key={gap.agentId}>
                      <p className="font-medium">{gap.agentName}</p>
                      <p className="mt-2">{gap.message}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {view === "signoffs" ? (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Sign-off traceability</CardTitle>
                    <CardDescription>
                      Review who signed off, when, on what entity and with which evidence reference.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Approval and review history</CardTitle>
                <CardDescription>
                  {data.sourceContext
                    ? `Showing sign-off history scoped to ${formatLabel(data.sourceContext.entityType)} ${data.sourceContext.key}.`
                    : "Showing sign-off history for the active project."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.signoffRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                    No sign-off records are available yet for this context.
                  </div>
                ) : (
                  data.signoffRecords.map((record) => (
                    <div
                      className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground"
                      key={record.id}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {formatLabel(record.decisionKind)} for {formatLabel(record.entityType)} {record.entityId}
                          </p>
                          <p className="mt-2">
                            Required role: {formatLabel(record.requiredRoleType)} / {record.organizationSide}
                          </p>
                          <p className="mt-2">
                            Signed by: {record.actualPersonName} ({record.actualRoleTitle})
                          </p>
                        </div>
                        <div className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {formatLabel(record.decisionStatus)}
                        </div>
                      </div>
                      {record.note ? <p className="mt-3">{record.note}</p> : null}
                      <p className="mt-3">
                        Evidence: {record.evidenceReference ? record.evidenceReference : "No evidence reference recorded."}
                      </p>
                      <p className="mt-2">{new Date(record.createdAt).toLocaleString("en-US")}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
