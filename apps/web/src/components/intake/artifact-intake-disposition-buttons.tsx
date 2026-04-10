"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
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

function selectedActionLabel(action: string) {
  if (action === "not_relevant") {
    return "removed";
  }

  if (action === "corrected") {
    return "worked off";
  }

  if (action === "blocked") {
    return "marked blocker";
  }

  if (action === "pending") {
    return "kept pending";
  }

  return action.replaceAll("_", " ");
}

export function ArtifactIntakeDispositionButtons(props: ArtifactIntakeDispositionButtonsProps) {
  const router = useRouter();
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
                  router.refresh();
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
        {selectedAction ? <span className="text-muted-foreground">Selected: {selectedActionLabel(selectedAction)}</span> : null}
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            Saving...
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}

type ArtifactIntakeQuickDispositionButtonProps = {
  fileId: string;
  sectionId: string;
  label: string;
  helperText?: string;
  action: DispositionAction;
  submitSectionDisposition: (input: {
    fileId: string;
    sectionId: string;
    action: DispositionAction;
  }) => Promise<{ ok: true; selectedAction: DispositionAction } | { ok: false; message: string }>;
};

export function ArtifactIntakeQuickDispositionButton(props: ArtifactIntakeQuickDispositionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        className="gap-2 border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await props.submitSectionDisposition({
              fileId: props.fileId,
              sectionId: props.sectionId,
              action: props.action
            });

            if (!result.ok) {
              setError(result.message);
              return;
            }

            router.refresh();
          });
        }}
        size="sm"
        type="button"
        variant="secondary"
      >
        <Trash2 className="h-4 w-4" />
        {props.label}
      </Button>
      {props.helperText ? <p className="text-xs text-muted-foreground">{props.helperText}</p> : null}
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
