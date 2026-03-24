import { Bot, ChevronDown, Plus } from "lucide-react";
import { agentTypes } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { GovernanceIdentityBadge } from "./governance-identity-badge";

type ReturnParams = {
  view: string;
  level: string;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
};

type AgentView = {
  id: string;
  agentName: string;
  agentType: string;
  purpose: string;
  scopeOfWork: string;
  allowedArtifactTypes: string[];
  allowedActions: string[];
  supervisingPartyRoleId: string;
  isActive: boolean;
  supervisingPartyRole: {
    fullName: string;
    roleType?: string;
    isActive: boolean;
  };
};

type SupervisorView = {
  id: string;
  fullName: string;
  roleType: string;
};

type GovernanceAgentRegistryViewProps = {
  agents: AgentView[];
  activeSupervisors: SupervisorView[];
  returnParams: ReturnParams;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function ReturnInputs({ params }: { params: ReturnParams }) {
  return (
    <>
      <input name="returnView" type="hidden" value={params.view} />
      <input name="returnLevel" type="hidden" value={params.level} />
      <input name="returnSourceEntity" type="hidden" value={params.sourceEntity ?? ""} />
      <input name="returnSourceId" type="hidden" value={params.sourceId ?? ""} />
    </>
  );
}

export function GovernanceAgentRegistryView({
  agents,
  activeSupervisors,
  returnParams,
  createAction,
  updateAction
}: GovernanceAgentRegistryViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Bot className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <CardTitle>Agent registry</CardTitle>
              <CardDescription>
                Agents stay compact by default and expand only when you want to edit one.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <details className="group rounded-2xl border border-border/70 bg-muted/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-medium text-foreground">Add agent</p>
                <p className="mt-1 text-sm text-muted-foreground">Register a new governed AI or automation agent.</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </div>
            </summary>
            <div className="border-t border-border/70 px-4 py-4">
              <form action={createAction} className="grid gap-4 lg:grid-cols-2">
                <ReturnInputs params={returnParams} />
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
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {agents.map((agent) => (
          <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" key={agent.id}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <GovernanceIdentityBadge kind="agent" name={agent.agentName} />
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{agent.agentName}</p>
                    <span className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatLabel(agent.agentType)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        agent.isActive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-border/70 bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{agent.purpose}</p>
                  <p className="text-sm text-muted-foreground">
                    Supervisor: {agent.supervisingPartyRole.fullName}
                  </p>
                </div>
              </div>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
            </summary>

            <div className="border-t border-border/70 px-4 py-4">
              <form action={updateAction} className="space-y-4">
                <ReturnInputs params={returnParams} />
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
                <div>
                  <Button size="sm" type="submit">Save agent</Button>
                </div>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
