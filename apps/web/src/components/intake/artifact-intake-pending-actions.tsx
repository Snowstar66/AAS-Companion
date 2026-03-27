"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheckBig, GitBranch, LoaderCircle, Upload, XCircle } from "lucide-react";
import { Button } from "@aas-companion/ui";

type ReviewIntent = "edit" | "confirm" | "follow_up" | "reject" | "promote";

const reviewActionConfig: Array<{
  intent: ReviewIntent;
  label: string;
  pendingLabel: string;
  pendingMessage: string;
  variant?: "default" | "secondary";
  Icon: typeof GitBranch;
}> = [
  {
    intent: "edit",
    label: "Save corrections",
    pendingLabel: "Saving corrections...",
    pendingMessage: "Saving your corrections and refreshing the imported candidate.",
    variant: "secondary",
    Icon: GitBranch
  },
  {
    intent: "confirm",
    label: "Confirm review state",
    pendingLabel: "Confirming review state...",
    pendingMessage: "Recording confirmation and recalculating import approval readiness.",
    Icon: CircleCheckBig
  },
  {
    intent: "follow_up",
    label: "Keep follow-up open",
    pendingLabel: "Keeping follow-up open...",
    pendingMessage: "Saving the follow-up state for continued human review.",
    variant: "secondary",
    Icon: CircleAlert
  },
  {
    intent: "reject",
    label: "Discard or reject candidate",
    pendingLabel: "Discarding candidate...",
    pendingMessage: "Recording the rejection and updating the intake queue.",
    variant: "secondary",
    Icon: XCircle
  },
  {
    intent: "promote",
    label: "Approve import into project",
    pendingLabel: "Approving import...",
    pendingMessage: "Creating governed project records and moving the import into the normal project workflow.",
    Icon: Upload
  }
];

export function ArtifactIntakeUploadSubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="gap-2" disabled={disabled || pending} type="submit">
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      {pending ? "Creating import session..." : "Create import session"}
    </Button>
  );
}

export function ArtifactIntakeReviewSubmitButtons() {
  const { pending } = useFormStatus();
  const [submittedIntent, setSubmittedIntent] = useState<ReviewIntent | null>(null);
  const activeIntent = pending ? submittedIntent : null;
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
