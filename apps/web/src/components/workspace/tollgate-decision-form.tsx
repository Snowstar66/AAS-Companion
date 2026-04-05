"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { PendingFormButton } from "@/components/shared/pending-form-button";

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

type TollgateDecisionFormProps = {
  reviewActions: TollgateAction[];
  approvalActions: TollgateAction[];
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
  hiddenFields?: Array<{ name: string; value: string }> | undefined;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function TollgateDecisionForm(props: TollgateDecisionFormProps) {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const decisionOptions = useMemo(
    () => [
      ...props.reviewActions.map((action) => ({
        key: `review|${action.roleType}|${action.organizationSide}`,
        label: `${t("Review", "Granskning")}: ${action.label}`,
        decisionKind: "review",
        roleType: action.roleType,
        organizationSide: action.organizationSide,
        pending: action.pending,
        assignedPeople: action.assignedPeople.map((person) => ({
          id: person.partyRoleEntryId,
          fullName: person.fullName,
          roleTitle: person.roleTitle,
          roleType: action.roleType,
          organizationSide: action.organizationSide
        }))
      })),
      ...props.approvalActions.map((action) => ({
        key: `approval|${action.roleType}|${action.organizationSide}`,
        label: `${t("Approval", "Godkannande")}: ${action.label}`,
        decisionKind: "approval",
        roleType: action.roleType,
        organizationSide: action.organizationSide,
        pending: action.pending,
        assignedPeople: action.assignedPeople.map((person) => ({
          id: person.partyRoleEntryId,
          fullName: person.fullName,
          roleTitle: person.roleTitle,
          roleType: action.roleType,
          organizationSide: action.organizationSide
        }))
      })),
      {
        key: "escalation",
        label: t("Escalation record", "Eskaleringspost"),
        decisionKind: "escalation",
        roleType: props.availablePeople[0]?.roleType ?? "value_owner",
        organizationSide: props.availablePeople[0]?.organizationSide ?? "customer",
        pending: false,
        assignedPeople: props.availablePeople
      }
    ],
    [language, props.approvalActions, props.availablePeople, props.reviewActions]
  );

  const initialDecisionKey =
    decisionOptions.find((option) => option.pending && option.assignedPeople.length > 0)?.key ??
    decisionOptions.find((option) => option.pending)?.key ??
    decisionOptions[0]?.key ??
    "escalation";
  const [decisionKey, setDecisionKey] = useState(initialDecisionKey);
  const selectedLane = decisionOptions.find((option) => option.key === decisionKey) ?? decisionOptions[0];
  const signerOptions =
    selectedLane?.decisionKind === "escalation"
      ? props.availablePeople
      : (selectedLane?.assignedPeople ?? []).map((person) => ({
          id: person.id,
          fullName: person.fullName,
          roleTitle: person.roleTitle,
          roleType: person.roleType,
          organizationSide: person.organizationSide
        }));
  const [selectedSignerId, setSelectedSignerId] = useState(signerOptions[0]?.id ?? "");
  const selectedLaneLabel = selectedLane?.label.toLowerCase() ?? t("selected", "valt");

  useEffect(() => {
    if (!signerOptions.some((person) => person.id === selectedSignerId)) {
      setSelectedSignerId(signerOptions[0]?.id ?? "");
    }
  }, [selectedSignerId, signerOptions]);

  return (
    <form action={props.formAction} className="space-y-4 rounded-2xl border border-border/70 bg-background p-4">
      {props.hiddenFields?.map((field) => (
        <input key={`${field.name}:${field.value}`} name={field.name} type="hidden" value={field.value} />
      ))}
      <input name="entityId" type="hidden" value={props.entityId} />
      <input name="entityType" type="hidden" value={props.entityType} />
      <input name="tollgateType" type="hidden" value={props.tollgateType} />
      <input name="aiAccelerationLevel" type="hidden" value={props.aiAccelerationLevel} />
      <div className="grid gap-4 xl:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t("Decision lane", "Beslutsspar")}</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            name="decisionKey"
            onChange={(event) => setDecisionKey(event.target.value)}
            value={decisionKey}
          >
            {decisionOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t("Human signer", "Mansklig signerare")}</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            disabled={signerOptions.length === 0}
            name="actualPartyRoleEntryId"
            onChange={(event) => setSelectedSignerId(event.target.value)}
            value={selectedSignerId}
          >
            {signerOptions.length > 0 ? (
              signerOptions.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.fullName} - {person.roleTitle} ({formatLabel(person.roleType)} / {person.organizationSide})
                </option>
              ))
            ) : (
              <option value="">{t("No active signer assigned for this lane", "Ingen aktiv signerare tilldelad for detta spar")}</option>
            )}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t("Decision", "Beslut")}</span>
          <select
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            defaultValue="approved"
            name="decisionStatus"
          >
            <option value="approved">{t("Approve", "Godkann")}</option>
            <option value="rejected">{t("Reject", "Avvisa")}</option>
            <option value="changes_requested">{t("Request changes", "Begar andringar")}</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">{t("Evidence reference", "Evidensreferens")}</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
            name="evidenceReference"
            type="text"
          />
        </label>
      </div>
      {selectedLane?.decisionKind !== "escalation" ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 px-3 py-3 text-sm text-sky-950">
          {signerOptions.length > 0
            ? t(
                `Signer is preselected from the required ${selectedLaneLabel} lane.`,
                `Signeraren ar forvald fran det obligatoriska sparet for ${selectedLaneLabel}.`
              )
            : t(
                `This ${selectedLaneLabel} lane has no active assigned signer yet.`,
                `Detta spar for ${selectedLaneLabel} har annu ingen aktivt tilldelad signerare.`
              )}
        </div>
      ) : null}
      <label className="space-y-2">
        <span className="text-sm font-medium text-foreground">{t("Note", "Notering")}</span>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
          name="note"
        />
      </label>
      <PendingFormButton
        className="gap-2 whitespace-nowrap"
        disabled={signerOptions.length === 0}
        label={t("Record approval or review", "Registrera godkannande eller granskning")}
        pendingLabel={t("Recording decision...", "Registrerar beslut...")}
      />
    </form>
  );
}
