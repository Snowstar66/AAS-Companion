"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "@aas-companion/ui";

type FramingBulkDecision = "approve" | "reject";
const FRAMING_APPROVAL_STORY_FORM_BATCH_LIMIT = 10;

const decisionConfig: Record<
  FramingBulkDecision,
  {
    label: string;
    pendingLabel: string;
    Icon: typeof CheckCircle2;
    variant?: "default" | "secondary";
  }
> = {
  approve: {
    label: "Approve",
    pendingLabel: "Approving...",
    Icon: CheckCircle2
  },
  reject: {
    label: "Reject",
    pendingLabel: "Rejecting...",
    Icon: XCircle,
    variant: "secondary"
  }
};

function setHiddenValue(form: HTMLFormElement, name: string, value: string) {
  const existing = form.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`);

  if (existing) {
    existing.value = value;
    return;
  }

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.append(input);
}

function getCandidateFieldId(name: string) {
  const match = name.match(/^candidate:([^:]+):/);
  return match?.[1] ?? null;
}

export function prepareFramingApprovalFormBatch(form: HTMLFormElement) {
  const candidateCheckboxes = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="candidateIds"]'));
  const selectedCandidateIds = new Set(
    candidateCheckboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value)
  );
  const selectedStoryIds = candidateCheckboxes
    .filter((checkbox) => checkbox.checked && checkbox.dataset.candidateType === "story")
    .map((checkbox) => checkbox.value);
  const deferredStoryIds = new Set(selectedStoryIds.slice(FRAMING_APPROVAL_STORY_FORM_BATCH_LIMIT));

  setHiddenValue(form, "deferredStoryCandidateCount", String(deferredStoryIds.size));

  for (const checkbox of candidateCheckboxes) {
    if (!checkbox.checked || deferredStoryIds.has(checkbox.value)) {
      checkbox.disabled = true;
      selectedCandidateIds.delete(checkbox.value);
    }
  }

  for (const field of Array.from(form.elements)) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
      continue;
    }

    const candidateId = getCandidateFieldId(field.name);

    if (candidateId && !selectedCandidateIds.has(candidateId)) {
      field.disabled = true;
    }
  }
}

export function FramingImportBulkDecisionButtons() {
  const { pending } = useFormStatus();
  const [submittedDecision, setSubmittedDecision] = useState<FramingBulkDecision | null>(null);
  const activeDecision = pending ? submittedDecision : null;

  return (
    <div className="space-y-3">
      <div className={`flex flex-col gap-3 sm:flex-row ${pending ? "cursor-wait" : ""}`.trim()}>
        {(["approve", "reject"] as const).map((decision) => {
          const config = decisionConfig[decision];
          const isActive = activeDecision === decision;

          return (
            <Button
              aria-busy={isActive}
              className={`flex-1 gap-2 ${isActive ? "cursor-wait" : ""}`.trim()}
              data-pending={isActive ? "true" : undefined}
              disabled={pending}
              key={decision}
              name="decision"
              onClick={(event) => {
                setSubmittedDecision(decision);

                if (decision === "approve" && event.currentTarget.form) {
                  prepareFramingApprovalFormBatch(event.currentTarget.form);
                }
              }}
              type="submit"
              value={decision}
              variant={config.variant ?? "default"}
            >
              {isActive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <config.Icon className="h-4 w-4" />}
              {isActive ? config.pendingLabel : config.label}
            </Button>
          );
        })}
      </div>
      {pending ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>Saving selected framing items, promoting linked records, and refreshing the project views.</span>
        </div>
      ) : null}
    </div>
  );
}
