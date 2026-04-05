import type { ReactNode } from "react";
import { ChevronDown, CircleAlert, CircleCheckBig, GitBranch, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
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
  pendingActions: Array<{ label: string; roleType: string; organizationSide: string }>;
  blockedActions: Array<{ label: string; blockedReasons: string[] }>;
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
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
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
  const isOutcomeTollgate = props.entityType === "outcome" && props.tollgateType === "tg1_baseline";

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
              ? t("Tollgate approved", "Tollgate godkand")
              : props.status === "ready"
                ? t("Tollgate submitted and awaiting sign-off", "Tollgate inskickad och vantar pa sign-off")
                : t("Tollgate blocked", "Tollgate blockerad")}
          </div>
          <p className="mt-2 leading-6">
            {props.blockers.length > 0
              ? props.blockers.join(" ")
              : t("No explicit blockers are currently recorded.", "Inga uttryckliga blockerare ar registrerade just nu.")}
          </p>
          {props.comments ? (
            <p className="mt-3 text-sm">
              {t("Current note", "Aktuell notering")}: {props.comments}
            </p>
          ) : null}
        </div>

        {pendingCount > 0 || blockedCount > 0 ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-4 text-sm text-sky-950">
            <p className="font-medium">
              {props.entityType === "outcome"
                ? t("Approve Tollgate 1 here", "Godkann Tollgate 1 har")
                : t("Record the required delivery decisions here", "Registrera nodvandiga leveransbeslut har")}
            </p>
            <p className="mt-2 leading-6">
              {props.entityType === "outcome"
                ? t(
                    "Use the role lanes and the form below to record the required Framing review and approval decisions.",
                    "Anvand rollsparen och formularet nedan for att registrera nodvandiga beslut for framinggranskning och godkannande."
                  )
                : t(
                    "Use the role lanes and the form below to record the required delivery review and approval decisions before build starts.",
                    "Anvand rollsparen och formularet nedan for att registrera nodvandiga beslut for leveransgranskning och godkannande innan build startar."
                  )}
            </p>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Review lanes", "Granskningsspar")}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{reviewCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Approval lanes", "Godkannandespar")}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{approvalCount}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Open actions", "Oppna atgarder")}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {language === "sv" ? `${pendingCount} vantande / ${blockedCount} blockerade` : `${pendingCount} pending / ${blockedCount} blocked`}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Recorded sign-offs", "Registrerade sign-offs")}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{signoffCount}</p>
          </div>
        </div>

        <div className="space-y-4">
          {isOutcomeTollgate ? (
            <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-sky-950">{t("Record Tollgate 1 approval now", "Registrera Tollgate 1-godkannande nu")}</p>
                <p className="mt-1 text-sm text-sky-900">
                  {t(
                    "Use the preselected lane and signer below. The required roles already match the current AI Acceleration Level.",
                    "Anvand det forvalda sparet och signeraren nedan. De nodvandiga rollerna matchar redan aktuell AI Acceleration Level."
                  )}
                </p>
              </div>
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
            </div>
          ) : null}

          <CollapsibleSection
            badge={`${reviewCount}`}
            defaultOpen={false}
            description={t("Required human reviews for this tollgate.", "Obligatoriska manskliga granskningar for denna tollgate.")}
            title={t("Required review roles", "Obligatoriska granskningsroller")}
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
                        {t("Assigned", "Tilldelad")}:{" "}
                        {action.assignedPeople.length > 0
                          ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                          : t("No assigned human", "Ingen manniska tilldelad")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-muted-foreground">
                        {language === "sv" ? `Klart ${action.completedRecords.length}` : `Completed ${action.completedRecords.length}`}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          action.pending
                            ? "border-amber-200/80 bg-amber-50/70 text-amber-950"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                        }`}
                      >
                        {action.pending ? t("Pending", "Vantar") : t("Complete", "Klart")}
                      </span>
                    </div>
                  </div>
                  {action.completedRecords.length > 0 ? (
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      {action.completedRecords.map((record) => (
                        <p key={record.id}>
                          {t("Signed by", "Signerad av")} {record.actualPersonName} {t("on", "den")}{" "}
                          {new Date(record.createdAt).toLocaleString(language === "sv" ? "sv-SE" : "en-US")}
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
            defaultOpen={false}
            description={t("Required human approvals for this tollgate.", "Obligatoriska manskliga godkannanden for denna tollgate.")}
            title={t("Required approval roles", "Obligatoriska godkannanderoller")}
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
                        {t("Assigned", "Tilldelad")}:{" "}
                        {action.assignedPeople.length > 0
                          ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                          : t("No assigned human", "Ingen manniska tilldelad")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-muted-foreground">
                        {language === "sv" ? `Klart ${action.completedRecords.length}` : `Completed ${action.completedRecords.length}`}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          action.pending
                            ? "border-amber-200/80 bg-amber-50/70 text-amber-950"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                        }`}
                      >
                        {action.pending ? t("Pending", "Vantar") : t("Complete", "Klart")}
                      </span>
                    </div>
                  </div>
                  {action.completedRecords.length > 0 ? (
                    <div className="mt-3 space-y-2 text-muted-foreground">
                      {action.completedRecords.map((record) => (
                        <p key={record.id}>
                          {t("Approved by", "Godkand av")} {record.actualPersonName} {t("on", "den")}{" "}
                          {new Date(record.createdAt).toLocaleString(language === "sv" ? "sv-SE" : "en-US")}
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
              defaultOpen={false}
              description={t("Review or approval work still waiting for completion.", "Granskning eller godkannande som fortfarande vantar pa att slutfors.")}
              title={t("Pending actions", "Vantande atgarder")}
            >
              <div className="grid gap-3 text-sm text-muted-foreground">
                {props.pendingActions.length === 0 ? (
                  <p>{t("No pending review or approval actions remain.", "Inga vantande gransknings- eller godkannandeatgarder aterstar.")}</p>
                ) : (
                  props.pendingActions.map((action) => (
                    <div className={`rounded-2xl border px-3 py-3 ${getPendingToneClasses(true)}`} key={`${action.label}:${action.roleType}`}>
                      {language === "sv"
                        ? `${action.label} behover fortfarande ${formatLabel(action.roleType)} pa ${action.organizationSide}-sidan.`
                        : `${action.label} still needs ${formatLabel(action.roleType)} on the ${action.organizationSide} side.`}
                    </div>
                  ))
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              badge={`${blockedCount}`}
              defaultOpen={false}
              description={t("Actions that cannot proceed until staffing or governance gaps are cleared.", "Atgarder som inte kan fortsatta forran bemanning eller governance-luckor ar losta.")}
              title={t("Blocked actions", "Blockerade atgarder")}
            >
              <div className="grid gap-3 text-sm text-muted-foreground">
                {props.blockedActions.length === 0 ? (
                  <p>{t("No blocked sign-off actions are currently visible.", "Inga blockerade sign-off-atgarder syns just nu.")}</p>
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

          {!isOutcomeTollgate ? (
            <CollapsibleSection
              badge={
                props.availablePeople.length > 0
                  ? language === "sv"
                    ? `${props.availablePeople.length} signerare`
                    : `${props.availablePeople.length} signers`
                  : t("No signers", "Inga signerare")
              }
              defaultOpen={false}
              description={t(
                "Capture one review, approval or escalation decision with the human signer and evidence trail.",
                "Registrera ett gransknings-, godkannande- eller eskaleringsbeslut med mansklig signerare och evidensspar."
              )}
              title={t("Record approval or review", "Registrera godkannande eller granskning")}
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
          ) : null}

          <CollapsibleSection
            badge={`${signoffCount}`}
            defaultOpen={false}
            description={t("Completed reviews, approvals and escalations recorded for this tollgate.", "Genomforda granskningar, godkannanden och eskaleringar som registrerats for denna tollgate.")}
            title={t("Sign-off history", "Sign-off-historik")}
          >
            <div className="space-y-3">
              {props.signoffRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("No sign-off records exist yet for this tollgate.", "Inga sign-off-poster finns annu for denna tollgate.")}</p>
              ) : (
                props.signoffRecords.map((record) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground" key={record.id}>
                    <p className="font-medium text-foreground">
                      {formatLabel(record.decisionKind)} {t("by", "av")} {record.actualPersonName}
                    </p>
                    <p className="mt-2">
                      {formatLabel(record.requiredRoleType)} / {record.organizationSide} / {formatLabel(record.decisionStatus)}
                    </p>
                    {record.note ? <p className="mt-2">{record.note}</p> : null}
                    {record.evidenceReference ? <p className="mt-2">{t("Evidence", "Evidens")}: {record.evidenceReference}</p> : null}
                    <p className="mt-2">{new Date(record.createdAt).toLocaleString(language === "sv" ? "sv-SE" : "en-US")}</p>
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
