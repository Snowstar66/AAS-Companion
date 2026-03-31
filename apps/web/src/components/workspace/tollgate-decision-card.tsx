import type { ReactNode } from "react";
import { ChevronDown, CircleAlert, CircleCheckBig, GitBranch, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { TollgateDecisionForm } from "@/components/workspace/tollgate-decision-form";

type TollgateAction = {
  decisionKind: string;
  roleType: string;
  organizationSide: string;
  label: string;
  assignedPeople: Array<{
    partyRoleEntryId: string;
    fullName: string;
    email: string;
    roleTitle: string;
  }>;
  completedRecords: Array<{
    id: string;
    actualPersonName: string;
    decisionStatus: string;
    note?: string | null;
    evidenceReference?: string | null;
    createdAt: Date;
  }>;
  pending: boolean;
  blockedReasons: string[];
};

type TollgateDecisionCardProps = {
  title: string;
  description: string;
  hideHeader?: boolean;
  status: "blocked" | "ready" | "approved";
  blockers: string[];
  comments?: string | null;
  reviewActions: TollgateAction[];
  approvalActions: TollgateAction[];
  pendingActions: Array<{
    label: string;
    roleType: string;
    organizationSide: string;
  }>;
  blockedActions: Array<{
    label: string;
    blockedReasons: string[];
  }>;
  signoffRecords: Array<{
    id: string;
    decisionKind: string;
    requiredRoleType: string;
    actualPersonName: string;
    actualRoleTitle: string;
    organizationSide: string;
    decisionStatus: string;
    note?: string | null;
    evidenceReference?: string | null;
    createdAt: Date;
  }>;
  availablePeople: Array<{
    id: string;
    fullName: string;
    roleType: string;
    organizationSide: string;
    roleTitle: string;
  }>;
  aiAccelerationLevel: string;
  tollgateType: string;
  entityType: "outcome" | "story";
  entityId: string;
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Array<{ name: string; value: string }>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getPendingToneClasses(hasItems: boolean) {
  return hasItems
    ? "border-amber-200/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(255,255,255,0.92))] text-amber-950"
    : "border-border/70 bg-muted/10 text-muted-foreground";
}

function getBlockedToneClasses(hasItems: boolean) {
  return hasItems
    ? "border-rose-200/70 bg-[linear-gradient(135deg,rgba(244,63,94,0.08),rgba(255,255,255,0.92))] text-rose-950"
    : "border-border/70 bg-muted/10 text-muted-foreground";
}

function CollapsibleSection(props: {
  title: string;
  description: string;
  badge?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-muted/20" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{props.title}</p>
            {props.badge ? (
              <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {props.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-4 py-4">{props.children}</div>
    </details>
  );
}

export function TollgateDecisionCard(props: TollgateDecisionCardProps) {
  const statusTone =
    props.status === "approved"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
      : props.status === "ready"
        ? "border-sky-200 bg-sky-50/80 text-sky-900"
        : "border-amber-200 bg-amber-50/80 text-amber-900";

  const pendingCount = props.pendingActions.length;
  const blockedCount = props.blockedActions.length;
  const signoffCount = props.signoffRecords.length;
  const reviewCount = props.reviewActions.length;
  const approvalCount = props.approvalActions.length;
  const hasOpenReviewWork = props.reviewActions.some((action) => action.pending);
  const hasOpenApprovalWork = props.approvalActions.some((action) => action.pending);

  return (
    <Card className="border-border/70 shadow-sm">
      {props.hideHeader ? null : (
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <div className={`rounded-2xl border px-4 py-4 text-sm ${statusTone}`}>
          <div className="flex items-center gap-2 font-medium">
            {props.status === "approved" ? (
              <CircleCheckBig className="h-4 w-4" />
            ) : props.status === "ready" ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <CircleAlert className="h-4 w-4" />
            )}
            {props.status === "approved"
              ? "Tollgate approved"
              : props.status === "ready"
                ? "Tollgate submitted and awaiting sign-off"
                : "Tollgate blocked"}
          </div>
          <p className="mt-2 leading-6">
            {props.blockers.length > 0 ? props.blockers.join(" ") : "No explicit blockers are currently recorded."}
          </p>
          {props.comments ? <p className="mt-3 text-sm">Current note: {props.comments}</p> : null}
        </div>

        {pendingCount > 0 || blockedCount > 0 ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 text-sm text-sky-950">
            <p className="font-medium">Approval and review are recorded here</p>
            <p className="mt-2 leading-6">
              Open the approval lanes and the record section below to capture the named human decisions before build starts.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review lanes</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{reviewCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Approval lanes</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{approvalCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Open actions</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {pendingCount} pending / {blockedCount} blocked
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recorded sign-offs</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{signoffCount}</p>
          </div>
        </div>

        <div className="space-y-4">
          <CollapsibleSection
            badge={`${reviewCount}`}
            defaultOpen={hasOpenReviewWork}
            description="Required human reviews for this tollgate."
            title="Required review roles"
          >
            <div className="grid gap-3">
              {props.reviewActions.map((action) => (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm" key={`${action.decisionKind}:${action.roleType}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        <p className="font-medium text-foreground">{action.label}</p>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Assigned:{" "}
                        {action.assignedPeople.length > 0
                          ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                          : "No assigned human"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-muted-foreground">
                        Completed {action.completedRecords.length}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          action.pending
                            ? "border-amber-200/80 bg-amber-50/70 text-amber-950"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                        }`}
                      >
                        {action.pending ? "Pending" : "Complete"}
                      </span>
                    </div>
                  </div>
                  {action.completedRecords.length > 0 ? (
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      {action.completedRecords.map((record) => (
                        <p key={record.id}>
                          Signed by {record.actualPersonName} on {new Date(record.createdAt).toLocaleString("en-US")}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {action.blockedReasons.length > 0 ? (
                    <div className="mt-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-3 py-3 text-amber-950">
                      {action.blockedReasons.join(" ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            badge={`${approvalCount}`}
            defaultOpen={hasOpenApprovalWork}
            description="Required human approvals for this tollgate."
            title="Required approval roles"
          >
            <div className="grid gap-3">
              {props.approvalActions.map((action) => (
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm" key={`${action.decisionKind}:${action.roleType}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <p className="font-medium text-foreground">{action.label}</p>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Assigned:{" "}
                        {action.assignedPeople.length > 0
                          ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                          : "No assigned human"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-muted-foreground">
                        Completed {action.completedRecords.length}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          action.pending
                            ? "border-amber-200/80 bg-amber-50/70 text-amber-950"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                        }`}
                      >
                        {action.pending ? "Pending" : "Complete"}
                      </span>
                    </div>
                  </div>
                  {action.completedRecords.length > 0 ? (
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      {action.completedRecords.map((record) => (
                        <p key={record.id}>
                          Approved by {record.actualPersonName} on {new Date(record.createdAt).toLocaleString("en-US")}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {action.blockedReasons.length > 0 ? (
                    <div className="mt-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-3 py-3 text-amber-950">
                      {action.blockedReasons.join(" ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <div className="grid gap-4 xl:grid-cols-2">
            <CollapsibleSection
              badge={`${pendingCount}`}
              defaultOpen={pendingCount > 0}
              description="Review or approval work still waiting for completion."
              title="Pending actions"
            >
              <div className="grid gap-3 text-sm text-muted-foreground">
                {props.pendingActions.length === 0 ? (
                  <p>No pending review or approval actions remain.</p>
                ) : (
                  props.pendingActions.map((action) => (
                    <div
                      className={`rounded-2xl border px-3 py-3 ${getPendingToneClasses(true)}`}
                      key={`${action.label}:${action.roleType}`}
                    >
                      {action.label} still needs {formatLabel(action.roleType)} on the {action.organizationSide} side.
                    </div>
                  ))
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              badge={`${blockedCount}`}
              defaultOpen={blockedCount > 0}
              description="Actions that cannot proceed until staffing or governance gaps are cleared."
              title="Blocked actions"
            >
              <div className="grid gap-3 text-sm text-muted-foreground">
                {props.blockedActions.length === 0 ? (
                  <p>No blocked sign-off actions are currently visible.</p>
                ) : (
                  props.blockedActions.map((action) => (
                    <div className={`rounded-2xl border px-3 py-3 ${getBlockedToneClasses(true)}`} key={action.label}>
                      <p className="font-medium">{action.label}</p>
                      <p className="mt-2">{action.blockedReasons.join(" ")}</p>
                    </div>
                  ))
                )}
              </div>
            </CollapsibleSection>
          </div>

          <CollapsibleSection
            badge={props.availablePeople.length > 0 ? `${props.availablePeople.length} signers` : "No signers"}
            defaultOpen={pendingCount > 0 || blockedCount > 0}
            description="Capture one review, approval or escalation decision with the human signer and evidence trail."
            title="Record approval or review"
          >
            <TollgateDecisionForm
              aiAccelerationLevel={props.aiAccelerationLevel}
              approvalActions={props.approvalActions}
              availablePeople={props.availablePeople}
              entityId={props.entityId}
              entityType={props.entityType}
              formAction={props.formAction}
              hiddenFields={props.hiddenFields}
              reviewActions={props.reviewActions}
              tollgateType={props.tollgateType}
            />
          </CollapsibleSection>

          <CollapsibleSection
            badge={`${signoffCount}`}
            defaultOpen={signoffCount > 0}
            description="Completed reviews, approvals and escalations recorded for this tollgate."
            title="Sign-off history"
          >
            <div className="space-y-3">
              {props.signoffRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sign-off records exist yet for this tollgate.</p>
              ) : (
                props.signoffRecords.map((record) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground" key={record.id}>
                    <p className="font-medium text-foreground">
                      {formatLabel(record.decisionKind)} by {record.actualPersonName}
                    </p>
                    <p className="mt-2">
                      {formatLabel(record.requiredRoleType)} / {record.organizationSide} / {formatLabel(record.decisionStatus)}
                    </p>
                    {record.note ? <p className="mt-2">{record.note}</p> : null}
                    {record.evidenceReference ? <p className="mt-2">Evidence: {record.evidenceReference}</p> : null}
                    <p className="mt-2">{new Date(record.createdAt).toLocaleString("en-US")}</p>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>
        </div>
      </CardContent>
    </Card>
  );
}
