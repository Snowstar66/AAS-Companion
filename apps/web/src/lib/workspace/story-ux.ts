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
    key: "needs_action",
    label: "Needs action",
    description: "One or more required delivery inputs are still missing."
  },
  {
    key: "design_ready",
    label: "Design ready",
    description: "All required delivery inputs are present and the story is ready to hand over into external build work."
  },
  {
    key: "in_build",
    label: "In build",
    description: "Build work is active for this delivery story."
  }
] as const;

function getMissingInputActions(input: StoryUxInput) {
  const actions: StoryUxAction[] = [];

  if (!input.testDefinition?.trim()) {
    actions.push({
      label: "Add test definition",
      description: "Describe how this Story will be verified before build starts.",
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
  const openActionCount = 0;
  const missingSignoffCount = 0;
  const isArchived = input.lifecycleState === "archived";
  const isInDelivery = input.status === "in_progress";
  const isReadyForHandoff = readiness.state === "ready" || input.status === "ready_for_handoff";
  const isDesignReady = readiness.state === "ready" && !isInDelivery;

  let statusLabel = "Needs action";
  let statusDetail = "One or more required delivery inputs are still missing.";
  let tone: StoryUxTone = "neutral";

  if (isArchived) {
    statusLabel = "Archived";
    statusDetail = "This Story is currently out of the active workflow until it is restored.";
    tone = "archived";
  } else if (isInDelivery) {
    statusLabel = "In build";
    statusDetail = "Build work is already active for this Delivery Story.";
    tone = "success";
  } else if (isDesignReady) {
    statusLabel = "Design ready";
    statusDetail = "Required delivery inputs are present. This Delivery Story is ready to export into build work.";
    tone = "success";
  } else if (blockers.length > 0) {
    statusLabel = "Needs action";
    statusDetail = blockers[0] ?? "Important delivery inputs are still missing.";
    tone = "warning";
  }

  const readinessLabel = isInDelivery ? "In build" : isReadyForHandoff ? "Design ready" : "Needs action";
  const readinessDetail = isInDelivery
    ? "Build is already active for this Delivery Story."
    : isReadyForHandoff
      ? "Acceptance criteria, Test Definition and Definition of Done are all present."
      : blockers[0] ?? "Complete the missing delivery inputs before handing this over into build work.";

  const currentStepIndex = isInDelivery ? 2 : isDesignReady ? 1 : 0;
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
            label: "Review build package",
            description: "Re-open the execution package whenever delivery needs the approved build payload.",
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
      : [
              {
                label: "Open build package",
                description: "Preview the build package that will be used outside this tool for implementation work.",
                href: input.id ? `/handoff/${input.id}` : "#story-value-spine"
              },
              {
                label: "Review branch context",
                description: "Confirm that the Story still belongs to the intended Framing and Epic.",
                href: "#story-value-spine"
              },
              {
                label: "Check governance coverage",
                description: "Verify that the project is staffed for the current AI level before external build work begins.",
                href: "#story-governance"
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
