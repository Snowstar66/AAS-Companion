"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Bot, GitBranch, LoaderCircle, Upload, XCircle } from "lucide-react";
import { Button } from "@aas-companion/ui";

type ReviewIntent = "edit" | "reject" | "promote";
type UploadProcessingMode = "ai_assisted";

function getReviewActionConfig(importTargetLabel: string) {
  return [
    {
      intent: "edit" as const,
      label: "Save corrections",
      pendingLabel: "Saving corrections...",
      pendingMessage: "Saving your corrections and refreshing the imported candidate.",
      variant: "secondary" as const,
      Icon: GitBranch
    },
    {
      intent: "reject" as const,
      label: "Reject import",
      pendingLabel: "Rejecting import...",
      pendingMessage: "Recording the rejection and updating the intake queue.",
      variant: "secondary" as const,
      Icon: XCircle
    },
    {
      intent: "promote" as const,
      label: `Approve as ${importTargetLabel}`,
      pendingLabel: `Approving ${importTargetLabel}...`,
      pendingMessage: `Creating governed ${importTargetLabel} records and moving the import into the normal project workflow.`,
      Icon: Upload
    }
  ];
}

export function ArtifactIntakeUploadSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const [submittedMode, setSubmittedMode] = useState<UploadProcessingMode | null>(null);
  const activeMode = pending ? submittedMode : null;

  return (
    <div className="space-y-3">
      <input name="processingMode" type="hidden" value="ai_assisted" />
      <div className="flex flex-wrap gap-3">
        <Button
          className="gap-2"
          disabled={disabled || pending}
          onClick={() => setSubmittedMode("ai_assisted")}
          type="submit"
        >
          {pending && activeMode === "ai_assisted" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          {pending && activeMode === "ai_assisted" ? "Running import..." : "Import"}
        </Button>
      </div>
      {pending ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>
            Classifying the files, extracting likely Value Spine candidates, and falling back to the built-in parser automatically if the AI response is incomplete.
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function ArtifactIntakeReviewSubmitButtons({ importTargetLabel = "project record" }: { importTargetLabel?: string }) {
  const { pending } = useFormStatus();
  const [submittedIntent, setSubmittedIntent] = useState<ReviewIntent | null>(null);
  const activeIntent = pending ? submittedIntent : null;
  const reviewActionConfig = getReviewActionConfig(importTargetLabel);
  const activeConfig = reviewActionConfig.find((entry) => entry.intent === activeIntent) ?? null;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {reviewActionConfig.map((action) => {
          const isActive = pending && activeIntent === action.intent;

          return (
            <Button
              className="gap-2 justify-start"
              disabled={pending}
              key={action.intent}
              name="intent"
              onClick={() => setSubmittedIntent(action.intent)}
              type="submit"
              value={action.intent}
              variant={action.variant ?? "default"}
            >
              {isActive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <action.Icon className="h-4 w-4" />}
              {isActive ? action.pendingLabel : action.label}
            </Button>
          );
        })}
      </div>
      {activeConfig ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>{activeConfig.pendingMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
