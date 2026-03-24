import Link from "next/link";
import { Bot, BriefcaseBusiness, Shield, ShieldAlert, Sparkles, UsersRound } from "lucide-react";
import { getGovernanceWorkspaceService } from "@aas-companion/api";
import { agentTypes, aiAccelerationLevels, organizationSides, partyRoleTypes } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
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

function ReturnInputs(props: {
  view: string;
  level: string;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
}) {
  return (
    <>
      <input name="returnView" type="hidden" value={props.view} />
      <input name="returnLevel" type="hidden" value={props.level} />
      <input name="returnSourceEntity" type="hidden" value={props.sourceEntity ?? ""} />
      <input name="returnSourceId" type="hidden" value={props.sourceId ?? ""} />
    </>
  );
}

export default async function GovernancePage({ searchParams }: GovernancePageProps) {
  const organization = await requireOrganizationContext();
  const query = searchParams ? await searchParams : {};
  const view = getParamValue(query.view) ?? "directory";
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
    throw new Error(governance.errors[0]?.message ?? "Governance workspace could not be loaded.");
  }

  const data = governance.data;
  const selectedLevel = data.selectedAiLevel;
  const activePeople = data.people.filter((person) => person.isActive);
  const customerPeople = data.people.filter((person) => person.organizationSide === "customer");
  const supplierPeople = data.people.filter((person) => person.organizationSide === "supplier");
  const activeSupervisors = activePeople;
  const sourceHref =
    data.sourceContext?.entityType === "outcome"
      ? `/outcomes/${data.sourceContext.entityId}`
      : data.sourceContext?.entityType === "story"
        ? `/stories/${data.sourceContext.entityId}`
        : null;

  return (
    <AppShell
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
            Manage who is accountable, which agents are allowed to operate, how authority is distributed and whether
            the active project is staffed strongly enough for the current AI acceleration level.
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active people</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{data.summaries.activePeople}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Customer roles</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{data.summaries.customerPeople}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Supplier roles</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{data.summaries.supplierPeople}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Active agents</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{data.summaries.activeAgents}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Readiness state</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight capitalize">{formatLabel(data.readiness.summaryStatus)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Governance views</CardTitle>
            <CardDescription>Switch between the human directory, agent registry, authority model and readiness gaps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                {[
                  { key: "directory", label: "Party Directory" },
                  { key: "agents", label: "Agent Registry" },
                  { key: "authority", label: "Authority Matrix" },
                  { key: "readiness", label: "Readiness Gaps" },
                  { key: "signoffs", label: "Sign-off Traceability" }
                ].map((item) => (
                  <Button asChild key={item.key} size="sm" variant={view === item.key ? "default" : "secondary"}>
                    <Link
                      href={buildGovernanceHref({
                        view: item.key,
                        level: selectedLevel,
                        sourceEntity,
                        sourceId
                      })}
                    >
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>
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
                        sourceId
                      })}
                    >
                      {formatLabel(candidateLevel)}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {view === "directory" ? (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <UsersRound className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Party and role directory</CardTitle>
                    <CardDescription>
                      Create named customer and supplier roles so readiness and authority can point to real people.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form action={createPartyRoleEntryAction} className="grid gap-4 lg:grid-cols-2">
                  <ReturnInputs level={selectedLevel} sourceEntity={sourceEntity} sourceId={sourceId} view={view} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Full name</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="fullName" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="email" type="email" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Organization side</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="customer" name="organizationSide">
                      {organizationSides.map((side) => (
                        <option key={side} value={side}>
                          {formatLabel(side)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Role type</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="value_owner" name="roleType">
                      {partyRoleTypes.map((roleType) => (
                        <option key={roleType} value={roleType}>
                          {formatLabel(roleType)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Role title</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="roleTitle" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Phone number</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="phoneNumber" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Mandate notes</span>
                    <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" name="mandateNotes" />
                  </label>
                  <div className="lg:col-span-2">
                    <Button className="gap-2" type="submit">
                      <UsersRound className="h-4 w-4" />
                      Add party role
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6 2xl:grid-cols-2">
              {[
                { label: "Customer side", people: customerPeople, tone: "border-sky-200 bg-sky-50/60" },
                { label: "Supplier side", people: supplierPeople, tone: "border-emerald-200 bg-emerald-50/60" }
              ].map((section) => (
                <Card className="border-border/70 shadow-sm" key={section.label}>
                  <CardHeader>
                    <CardTitle>{section.label}</CardTitle>
                    <CardDescription>Keep named owners, reviewers and approvers explicit for this project.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.people.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                        No roles have been added for this side yet.
                      </div>
                    ) : (
                      section.people.map((person) => (
                        <form action={updatePartyRoleEntryAction} className={`space-y-4 rounded-2xl border p-4 ${section.tone}`} key={person.id}>
                          <ReturnInputs level={selectedLevel} sourceEntity={sourceEntity} sourceId={sourceId} view={view} />
                          <input name="id" type="hidden" value={person.id} />
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Full name</span>
                              <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.fullName} name="fullName" type="text" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Email</span>
                              <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.email} name="email" type="email" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Role title</span>
                              <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleTitle} name="roleTitle" type="text" />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Role type</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleType} name="roleType">
                                {partyRoleTypes.map((roleType) => (
                                  <option key={roleType} value={roleType}>
                                    {formatLabel(roleType)}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Organization side</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.organizationSide} name="organizationSide">
                                {organizationSides.map((side) => (
                                  <option key={side} value={side}>
                                    {formatLabel(side)}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium text-foreground">Status</span>
                              <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={String(person.isActive)} name="isActive">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Mandate notes</span>
                            <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={person.mandateNotes ?? ""} name="mandateNotes" />
                          </label>
                          <div className="flex items-center gap-3">
                            <Button size="sm" type="submit">
                              Save role
                            </Button>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {person.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </form>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        {view === "agents" ? (
          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Bot className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Agent registry</CardTitle>
                    <CardDescription>
                      Every active agent must have a named human supervisor and a visible scope of work.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form action={createAgentRegistryEntryAction} className="grid gap-4 lg:grid-cols-2">
                  <ReturnInputs level={selectedLevel} sourceEntity={sourceEntity} sourceId={sourceId} view={view} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Agent name</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="agentName" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Agent type</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="bmad_agent" name="agentType">
                      {agentTypes.map((agentType) => (
                        <option key={agentType} value={agentType}>
                          {formatLabel(agentType)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Purpose</span>
                    <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" name="purpose" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Scope of work</span>
                    <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" name="scopeOfWork" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Allowed artifact types</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="allowedArtifactTypes" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Allowed actions</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="allowedActions" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Supervising party role</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="supervisingPartyRoleId">
                      {activeSupervisors.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.fullName} - {formatLabel(person.roleType)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="lg:col-span-2">
                    <Button className="gap-2" type="submit">
                      <Bot className="h-4 w-4" />
                      Add agent
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              {data.agents.map((agent) => (
                <Card className="border-border/70 shadow-sm" key={agent.id}>
                  <CardHeader>
                    <CardTitle>{agent.agentName}</CardTitle>
                    <CardDescription>
                      {formatLabel(agent.agentType)} supervised by {agent.supervisingPartyRole.fullName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={updateAgentRegistryEntryAction} className="space-y-4">
                      <ReturnInputs level={selectedLevel} sourceEntity={sourceEntity} sourceId={sourceId} view={view} />
                      <input name="id" type="hidden" value={agent.id} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Agent name</span>
                          <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={agent.agentName} name="agentName" type="text" />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Agent type</span>
                          <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={agent.agentType} name="agentType">
                            {agentTypes.map((agentType) => (
                              <option key={agentType} value={agentType}>
                                {formatLabel(agentType)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Purpose</span>
                        <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={agent.purpose} name="purpose" />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Scope of work</span>
                        <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={agent.scopeOfWork} name="scopeOfWork" />
                      </label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Allowed artifact types</span>
                          <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={agent.allowedArtifactTypes.join(", ")} name="allowedArtifactTypes" type="text" />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Allowed actions</span>
                          <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={agent.allowedActions.join(", ")} name="allowedActions" type="text" />
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Supervising party role</span>
                          <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={agent.supervisingPartyRoleId} name="supervisingPartyRoleId">
                            {activeSupervisors.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.fullName} - {formatLabel(person.roleType)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Status</span>
                          <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={String(agent.isActive)} name="isActive">
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="sm" type="submit">
                          Save agent
                        </Button>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {agent.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
                        Expected roles: {rule.customerRoleTypes.length > 0 ? rule.customerRoleTypes.map(formatLabel).join(", ") : "None"}
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
                        Expected roles: {rule.supplierRoleTypes.length > 0 ? rule.supplierRoleTypes.map(formatLabel).join(", ") : "None"}
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
                      {rule.isCovered ? "Authority coverage is present." : "At least one required authority assignment is still missing."}
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
                    <CardTitle>AI level readiness</CardTitle>
                    <CardDescription>
                      Evaluate whether the current project is staffed and separated appropriately for {formatLabel(selectedLevel)}.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected level</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{formatLabel(selectedLevel)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coverage items</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{data.readiness.coverage.length}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Risk flags</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{data.readiness.riskFlags.length}</p>
                </div>
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
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900" key={`${flag.primaryRoleType}-${flag.conflictingRoleType}`}>
                      <p className="font-medium">
                        {formatLabel(flag.primaryRoleType)} conflicts with {formatLabel(flag.conflictingRoleType)}
                      </p>
                      <p className="mt-2">{flag.message}</p>
                      <p className="mt-2">
                        People involved: {flag.people.map((person) => person.fullName).join(", ")}
                      </p>
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
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground" key={record.id}>
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
