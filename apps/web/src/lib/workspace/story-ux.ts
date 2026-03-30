import { getStoryHandoffReadiness } from "@aas-companion/domain/story";

type StoryUxInput = {
  id?: string | null;
  key: string;
  outcomeId?: string | null;
  epicId?: string | null;
  status: string;
  lifecycleState: string;
  testDefinition: string | null;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  tollgateStatus?: "blocked" | "ready" | "approved" | null;
  blockers?: string[] | undefined;
  pendingActionCount?: number | undefined;
  blockedActionCount?: number | undefined;
};

export type StoryUxTone = "neutral" | "warning" | "progress" | "success" | "archived";

export type StoryUxStepState = "complete" | "current" | "upcoming" | "attention";

export type StoryUxAction = {
  label: string;
  description: string;
  href: string;
};

export type StoryUxModel = {
  statusLabel: string;
  statusDetail: string;
  tone: StoryUxTone;
  readinessLabel: string;
  readinessDetail: string;
  missingSignoffCount: number;
  openActionCount: number;
  isReadyForHandoff: boolean;
  blockers: string[];
  lifecycleSteps: Array<{
    key: string;
    label: string;
    description: string;
    state: StoryUxStepState;
  }>;
  nextActions: StoryUxAction[];
};

const lifecycleStepDefinitions = [
  {
    key: "draft",
    label: "Draft delivery story",
    description: "Core delivery inputs are still being written."
  },
  {
    key: "review_ready",
    label: "Delivery review",
    description: "The Delivery Story is going through the human checks needed before handoff."
  },
  {
    key: "handoff_ready",
    label: "Ready for handoff",
    description: "Required delivery checks are complete and the handoff package can be finalized."
  }
] as const;

function getMissingInputActions(input: StoryUxInput) {
  const actions: StoryUxAction[] = [];

  if (!input.testDefinition?.trim()) {
    actions.push({
      label: "Add test definition",
      description: "Describe how this Story will be verified before handoff.",
      href: "#story-handoff-inputs"
    });
  }

  if (input.acceptanceCriteria.length === 0) {
    actions.push({
      label: "Add acceptance criteria",
      description: "Capture at least one checkable outcome for the Story.",
      href: "#story-handoff-inputs"
    });
  }

  if (input.definitionOfDone.length === 0) {
    actions.push({
      label: "Add definition of done",
      description: "State the minimum conditions for considering this Story complete.",
      href: "#story-handoff-inputs"
    });
  }

  return actions;
}

export function getStoryUxModel(input: StoryUxInput): StoryUxModel {
  const readiness = getStoryHandoffReadiness({
    key: input.key,
    outcomeId: input.outcomeId ?? "linked-outcome",
    epicId: input.epicId ?? "linked-epic",
    testDefinition: input.testDefinition,
    definitionOfDone: input.definitionOfDone,
    acceptanceCriteria: input.acceptanceCriteria,
    status: input.status as "draft" | "definition_blocked" | "ready_for_handoff" | "in_progress"
  });
  const blockers = input.blockers?.length ? input.blockers : readiness.reasons.map((reason) => reason.message);
  const openActionCount = input.pendingActionCount ?? 0;
  const blockedActionCount = input.blockedActionCount ?? 0;
  const hasTollgateStatus = input.tollgateStatus === "blocked" || input.tollgateStatus === "ready" || input.tollgateStatus === "approved";
  const missingSignoffCount =
    input.tollgateStatus === "approved" ? 0 : openActionCount + (input.tollgateStatus === "ready" ? 0 : blockedActionCount);
  const isArchived = input.lifecycleState === "archived";
  const isUnderSignoff = input.tollgateStatus === "ready" || input.tollgateStatus === "blocked";
  const isApproved = input.tollgateStatus === "approved";
  const isInDelivery = input.status === "in_progress";
  const isReadyForHandoff = hasTollgateStatus ? isApproved : isApproved || input.status === "ready_for_handoff";
  const isReviewReady = readiness.state === "ready" && !hasTollgateStatus && !isReadyForHandoff;

  let statusLabel = "Draft delivery story";
  let statusDetail = "This Delivery Story still needs key delivery inputs before review can start.";
  let tone: StoryUxTone = "neutral";

  if (isArchived) {
    statusLabel = "Archived";
    statusDetail = "This Story is currently out of the active workflow until it is restored.";
    tone = "archived";
  } else if (isInDelivery) {
    statusLabel = "In build";
    statusDetail = "Handoff is complete and active implementation work can proceed.";
    tone = "progress";
  } else if (isReadyForHandoff) {
    statusLabel = "Ready for handoff";
    statusDetail = "Required delivery checks are complete and the handoff package can now be finalized.";
    tone = "success";
  } else if (isUnderSignoff) {
    statusLabel = "Delivery review in progress";
    statusDetail =
      missingSignoffCount > 0
        ? `${missingSignoffCount} human review action${missingSignoffCount === 1 ? "" : "s"} still remain before handoff.`
        : "Human review is in progress for this Delivery Story.";
    tone = "progress";
  } else if (isReviewReady) {
    statusLabel = "Ready for delivery review";
    statusDetail = "All required design inputs are present. Submit the Delivery Story to begin human review.";
    tone = "progress";
  } else if (input.status === "in_progress") {
    statusLabel = "In build";
    statusDetail = "The Delivery Story has already moved beyond planning into active implementation work.";
    tone = "progress";
  } else if (blockers.length > 0) {
    statusLabel = "Needs updates";
    statusDetail = blockers[0] ?? "Important delivery inputs are still missing.";
    tone = "warning";
  }

  const readinessLabel = isInDelivery
    ? "Handoff completed"
    : isReadyForHandoff
      ? "Ready for handoff"
      : isUnderSignoff
        ? "Delivery review in progress"
        : readiness.state === "ready"
          ? "Ready for delivery review"
          : "Needs design inputs";
  const readinessDetail = isInDelivery
    ? "The Delivery Story has already been handed off and moved into active implementation."
    : isReadyForHandoff
      ? "Required delivery checks are complete and all inputs needed for handoff are present."
      : isUnderSignoff
        ? missingSignoffCount > 0
          ? `${missingSignoffCount} human review action${missingSignoffCount === 1 ? "" : "s"} still remain before handoff.`
          : "Human review is in progress for this Delivery Story."
        : readiness.state === "ready"
          ? "Test definition, acceptance criteria and definition of done are all present."
          : blockers[0] ?? "Complete the missing design inputs before submitting the Delivery Story.";

  const currentStepIndex = isReadyForHandoff || isInDelivery ? 2 : isUnderSignoff || isReviewReady ? 1 : 0;
  const lifecycleSteps = lifecycleStepDefinitions.map((step, index) => {
    const isCurrent = index === currentStepIndex;
    const state: StoryUxStepState =
      index < currentStepIndex
        ? "complete"
        : isCurrent
          ? tone === "warning"
            ? "attention"
            : "current"
          : "upcoming";

    return {
      ...step,
      state
    };
  });
  const visibleLifecycleSteps = isInDelivery
    ? lifecycleSteps.map((step) => ({
        ...step,
        state: "complete" as StoryUxStepState
      }))
    : lifecycleSteps;

  const nextActions: StoryUxAction[] = isArchived
    ? [
        {
          label: "Restore Story",
          description: "Return this Story to the active workflow before making changes or design decisions.",
          href: "#story-lifecycle"
        },
        {
          label: "Review lifecycle history",
          description: "Check why the Story was archived and what governance state is attached to it.",
          href: "#story-lifecycle"
        }
      ]
    : isInDelivery
      ? [
          {
          label: "Continue delivery coordination",
          description: "Track implementation progress, blockers and any follow-up decisions that still need to be recorded.",
            href: input.id ? `/stories/${input.id}` : "#story-value-spine"
          },
          {
            label: "Review execution contract",
            description: "Re-open the execution contract whenever delivery needs the approved handoff payload.",
            href: input.id ? `/handoff/${input.id}` : "#story-value-spine"
          },
          {
            label: "Check Value Spine context",
            description: "Keep the Story aligned with its Framing branch and Epic while delivery is active.",
            href: "#story-value-spine"
          }
        ]
      : readiness.state !== "ready"
      ? getMissingInputActions(input)
      : isApproved
        ? [
            ...(input.id
              ? [
                  {
                    label: "Finalize handoff package",
                    description: "Open the handoff page and finalize the approved package for build.",
                    href: `/handoff/${input.id}`
                  }
                ]
              : []),
            {
              label: "Review sign-off history",
              description: "See who reviewed and approved the Story.",
              href: "#story-signoff-history"
            },
            {
              label: "Check Value Spine context",
              description: "Confirm the Story still sits in the correct Framing branch and Epic.",
              href: "#story-value-spine"
            }
          ]
        : isUnderSignoff
          ? [
              {
                label: "Record remaining sign-offs",
                description:
                  missingSignoffCount > 0
                    ? `${missingSignoffCount} review or approval action${missingSignoffCount === 1 ? "" : "s"} still remain before handoff.`
                    : "Continue recording the human decisions that move this Delivery Story forward.",
                href: "#story-signoff"
              },
              ...(blockedActionCount > 0
                ? [
                    {
                      label: "Clear blocked lanes",
                      description: "Resolve staffing or governance gaps that are blocking sign-off.",
                      href: "#story-governance"
                    }
                  ]
                : []),
              {
                label: "Review current blockers",
                description: blockers[0] ?? "Check the current readiness and tollgate notes before proceeding.",
                href: "#story-blockers"
              }
            ]
          : [
              {
                label: "Start delivery review",
                description: "Freeze the current readiness state and start human review for this Delivery Story.",
                href: "#story-readiness"
              },
              {
                label: "Check governance coverage",
                description: "Make sure the required humans are available before sign-off begins.",
                href: "#story-governance"
              },
              {
                label: "Review branch context",
                description: "Confirm that the Story still belongs to the intended Framing and Epic.",
                href: "#story-value-spine"
              }
            ];

  return {
    statusLabel,
    statusDetail,
    tone,
    readinessLabel,
    readinessDetail,
    missingSignoffCount,
    openActionCount,
    isReadyForHandoff,
    blockers,
    lifecycleSteps: visibleLifecycleSteps,
    nextActions: nextActions.slice(0, 3)
  };
}

export function getStoryToneClasses(tone: StoryUxTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "progress":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "archived":
      return "border-slate-200 bg-slate-50 text-slate-900";
    default:
      return "border-border/70 bg-muted/15 text-foreground";
  }
}
