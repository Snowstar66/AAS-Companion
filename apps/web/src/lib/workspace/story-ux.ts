import { getStoryHandoffReadiness } from "@aas-companion/domain/story";

type AppLanguage = "en" | "sv";

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

function translate(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function getLifecycleStepDefinitions(language: AppLanguage) {
  return [
    {
      key: "needs_action",
      label: translate(language, "Needs action", "Behöver åtgärd"),
      description: translate(language, "One or more required delivery inputs are still missing.", "En eller flera obligatoriska leveransindata saknas fortfarande.")
    },
    {
      key: "design_ready",
      label: translate(language, "Design ready", "Designredo"),
      description: translate(language, "All required delivery inputs are present and the story is ready to hand over into external build work.", "All obligatorisk leveransindata finns och storyn är redo att lämnas över till externt buildarbete.")
    },
    {
      key: "in_build",
      label: translate(language, "In build", "I build"),
      description: translate(language, "Build work is active for this delivery story.", "Buildarbete pågår för den här delivery storyn.")
    }
  ] as const;
}

function getMissingInputActions(input: StoryUxInput, language: AppLanguage) {
  const actions: StoryUxAction[] = [];

  if (!input.testDefinition?.trim()) {
    actions.push({
      label: translate(language, "Add test definition", "Lägg till testdefinition"),
      description: translate(language, "Describe how this Story will be verified before build starts.", "Beskriv hur den här storyn ska verifieras innan build startar."),
      href: "#story-handoff-inputs"
    });
  }

  if (input.acceptanceCriteria.length === 0) {
    actions.push({
      label: translate(language, "Add acceptance criteria", "Lägg till acceptanskriterier"),
      description: translate(language, "Capture at least one checkable outcome for the Story.", "Fånga minst ett verifierbart utfall för storyn."),
      href: "#story-handoff-inputs"
    });
  }

  if (input.definitionOfDone.length === 0) {
    actions.push({
      label: translate(language, "Add definition of done", "Lägg till definition of done"),
      description: translate(language, "State the minimum conditions for considering this Story complete.", "Ange miniminivån för när den här storyn kan räknas som klar."),
      href: "#story-handoff-inputs"
    });
  }

  return actions;
}

export function getStoryUxModel(input: StoryUxInput, language: AppLanguage = "en"): StoryUxModel {
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
  const lifecycleStepDefinitions = getLifecycleStepDefinitions(language);

  let statusLabel = translate(language, "Needs action", "Behöver åtgärd");
  let statusDetail = translate(language, "One or more required delivery inputs are still missing.", "En eller flera obligatoriska leveransindata saknas fortfarande.");
  let tone: StoryUxTone = "neutral";

  if (isArchived) {
    statusLabel = translate(language, "Archived", "Arkiverad");
    statusDetail = translate(language, "This Story is currently out of the active workflow until it is restored.", "Den här storyn ligger utanför det aktiva arbetsflödet tills den återställs.");
    tone = "archived";
  } else if (isInDelivery) {
    statusLabel = translate(language, "In build", "I build");
    statusDetail = translate(language, "Build work is already active for this Delivery Story.", "Buildarbete pågår redan för den här delivery storyn.");
    tone = "success";
  } else if (isDesignReady) {
    statusLabel = translate(language, "Design ready", "Designredo");
    statusDetail = translate(language, "Required delivery inputs are present. This Delivery Story is ready to export into build work.", "Nödvändig leveransindata finns. Den här delivery storyn är redo att exporteras till buildarbete.");
    tone = "success";
  } else if (blockers.length > 0) {
    statusLabel = translate(language, "Needs action", "Behöver åtgärd");
    statusDetail = blockers[0] ?? translate(language, "Important delivery inputs are still missing.", "Viktig leveransindata saknas fortfarande.");
    tone = "warning";
  }

  const readinessLabel = isInDelivery
    ? translate(language, "In build", "I build")
    : isReadyForHandoff
      ? translate(language, "Design ready", "Designredo")
      : translate(language, "Needs action", "Behöver åtgärd");
  const readinessDetail = isInDelivery
    ? translate(language, "Build is already active for this Delivery Story.", "Build är redan aktiv för den här delivery storyn.")
    : isReadyForHandoff
      ? translate(language, "Acceptance criteria, Test Definition and Definition of Done are all present.", "Acceptanskriterier, testdefinition och definition of done finns alla på plats.")
      : blockers[0] ?? translate(language, "Complete the missing delivery inputs before handing this over into build work.", "Komplettera saknad leveransindata innan den här lämnas över till buildarbete.");

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
          label: translate(language, "Restore Story", "Återställ story"),
          description: translate(language, "Return this Story to the active workflow before making changes or design decisions.", "Återför den här storyn till det aktiva arbetsflödet innan du gör ändringar eller designbeslut."),
          href: "#story-lifecycle"
        },
        {
          label: translate(language, "Review lifecycle history", "Granska livscykelhistorik"),
          description: translate(language, "Check why the Story was archived and what governance state is attached to it.", "Kontrollera varför storyn arkiverades och vilket governance-läge som är kopplat till den."),
          href: "#story-lifecycle"
        }
      ]
    : isInDelivery
      ? [
          {
            label: translate(language, "Continue delivery coordination", "Fortsätt leveranskoordinering"),
            description: translate(language, "Track implementation progress, blockers and any follow-up decisions that still need to be recorded.", "Följ implementationsprogress, blockerare och eventuella uppföljningsbeslut som fortfarande behöver registreras."),
            href: input.id ? `/stories/${input.id}` : "#story-value-spine"
          },
          {
            label: translate(language, "Review build package", "Granska buildpaket"),
            description: translate(language, "Re-open the execution package whenever delivery needs the approved build payload.", "Öppna exekveringspaketet igen när leveransen behöver det godkända buildunderlaget."),
            href: input.id ? `/handoff/${input.id}` : "#story-value-spine"
          },
          {
            label: translate(language, "Check Value Spine context", "Kontrollera Value Spine-kontext"),
            description: translate(language, "Keep the Story aligned with its Framing branch and Epic while delivery is active.", "Håll storyn i linje med sin Framing-gren och sitt epic medan leverans pågår."),
            href: "#story-value-spine"
          }
        ]
      : readiness.state !== "ready"
      ? getMissingInputActions(input, language)
      : [
              {
                label: translate(language, "Open build package", "Öppna buildpaket"),
                description: translate(language, "Preview the build package that will be used outside this tool for implementation work.", "Förhandsgranska buildpaketet som ska användas utanför verktyget för implementationsarbete."),
                href: input.id ? `/handoff/${input.id}` : "#story-value-spine"
              },
              {
                label: translate(language, "Review branch context", "Granska grenkontext"),
                description: translate(language, "Confirm that the Story still belongs to the intended Framing and Epic.", "Bekräfta att storyn fortfarande hör till avsedd Framing och avsett epic."),
                href: "#story-value-spine"
              },
              {
                label: translate(language, "Check governance coverage", "Kontrollera governance-täckning"),
                description: translate(language, "Verify that the project is staffed for the current AI level before external build work begins.", "Verifiera att projektet är bemannat för aktuell AI-nivå innan externt buildarbete startar."),
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
