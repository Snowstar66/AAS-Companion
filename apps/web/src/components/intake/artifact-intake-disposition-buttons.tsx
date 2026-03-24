"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@aas-companion/ui";

type DispositionAction = "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";

type DispositionOption = {
  label: string;
  value: DispositionAction;
};

type ArtifactIntakeDispositionButtonsProps =
  | {
      kind: "candidate";
      candidateId: string;
      candidateType: "outcome" | "epic" | "story";
      issueId: string;
      initialAction?: string | null | undefined;
      initialStatus: "resolved" | "unresolved";
      resolvedActions: DispositionAction[];
      actions: DispositionOption[];
      submitCandidateDisposition: (input: {
        candidateId: string;
        candidateType: "outcome" | "epic" | "story";
        issueId: string;
        issueAction: DispositionAction;
      }) => Promise<{ ok: true; selectedAction: DispositionAction } | { ok: false; message: string }>;
    }
  | {
      kind: "section";
      fileId: string;
      sectionId: string;
      initialAction?: string | null | undefined;
      initialStatus: "resolved" | "unresolved";
      resolvedActions: DispositionAction[];
      actions: DispositionOption[];
      submitSectionDisposition: (input: {
        fileId: string;
        sectionId: string;
        action: DispositionAction;
      }) => Promise<{ ok: true; selectedAction: DispositionAction } | { ok: false; message: string }>;
    };

function buttonClasses(action: DispositionAction, selected: boolean) {
  if (selected && action === "blocked") {
    return {
      variant: "secondary" as const,
      className: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
    };
  }

  if (selected && action === "pending") {
    return {
      variant: "secondary" as const,
      className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
    };
  }

  if (selected) {
    return {
      variant: "secondary" as const,
      className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
    };
  }

  return {
    variant: "ghost" as const,
    className: ""
  };
}

export function ArtifactIntakeDispositionButtons(props: ArtifactIntakeDispositionButtonsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(props.initialAction ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const optimisticStatus = useMemo(() => {
    if (!selectedAction) {
      return props.initialStatus;
    }

    return props.resolvedActions.includes(selectedAction as DispositionAction) ? "resolved" : "unresolved";
  }, [props.initialStatus, props.resolvedActions, selectedAction]);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {props.actions.map((action) => {
          const selected = selectedAction === action.value;
          const appearance = buttonClasses(action.value, selected);

          return (
            <Button
              className={appearance.className}
              disabled={isPending}
              key={action.value}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result =
                    props.kind === "candidate"
                      ? await props.submitCandidateDisposition({
                          candidateId: props.candidateId,
                          candidateType: props.candidateType,
                          issueId: props.issueId,
                          issueAction: action.value
                        })
                      : await props.submitSectionDisposition({
                          fileId: props.fileId,
                          sectionId: props.sectionId,
                          action: action.value
                        });

                  if (!result.ok) {
                    setError(result.message);
                    return;
                  }

                  setSelectedAction(result.selectedAction);
                });
              }}
              size="sm"
              type="button"
              variant={appearance.variant}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 font-semibold ${
            optimisticStatus === "resolved"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {optimisticStatus}
        </span>
        {selectedAction ? <span className="text-muted-foreground">Selected: {selectedAction.replaceAll("_", " ")}</span> : null}
        {isPending ? <span className="text-muted-foreground">Saving...</span> : null}
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
