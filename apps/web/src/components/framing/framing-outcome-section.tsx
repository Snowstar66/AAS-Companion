import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CircleAlert, CircleCheckBig, CircleHelp, Clock3, ShieldCheck } from "lucide-react";
import { type getOutcomeWorkspaceService } from "@aas-companion/api";
import {
  deriveOutcomeRiskProfile,
  getOutcomeAiAndRiskBlockers,
  getOutcomeFramingBlockers,
  parseFramingConstraintBundle
} from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type {
  OutcomeInlineSaveActionState,
  OutcomeFieldAiActionState,
  ReviewOutcomeFramingAiActionState,
  reviewOutcomeFramingWithAiAction
} from "@/app/(protected)/outcomes/[outcomeId]/actions";
import { FramingBriefExportPanel } from "@/components/framing/framing-brief-export-panel";
import {
  DeliveryTypeGuidanceProvider,
  DeliveryTypeGuidanceText,
  DeliveryTypeHelpCard as LiveDeliveryTypeHelpCard,
  DeliveryTypeHelperText,
  DeliveryTypeSelect
} from "@/components/framing/delivery-type-guidance-live";
import { OutcomeTollgateApprovalSection } from "@/components/review/outcome-tollgate-approval-section";
import { FramingGuidanceShell } from "@/components/framing/framing-guidance-shell";
import { InlineFieldGuidance } from "@/components/shared/context-help";
import { LocalizedText } from "@/components/shared/localized-text";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { OutcomeAiReviewDialog } from "@/components/workspace/outcome-ai-review-dialog";
import { OutcomeAiValidatedTextarea } from "@/components/workspace/outcome-ai-validated-textarea";
import { FramingContextCard } from "@/components/workspace/framing-context-card";
import { FramingValueSpineTree } from "@/components/workspace/framing-value-spine-tree";
import { GovernedLifecycleCard } from "@/components/workspace/governed-lifecycle-card";
import { OutcomeAiRiskPostureCard } from "@/components/workspace/outcome-ai-risk-posture-card";
import { WorkspaceStatusSummary } from "@/components/workspace/story-workspace-shared";
import { requireActiveProjectSession } from "@/lib/auth/guards";
import { getCachedOrganizationValueOwnersData, getCachedOutcomeTollgateReviewData } from "@/lib/cache/project-data";
import { buildFramingBriefExport, buildHumanFramingBriefExport } from "@/lib/framing/framing-brief-export";
import { buildOriginIntakeHref } from "@/lib/intake/origin-link";
import { isLikelyDeliveryStory } from "@/lib/framing/story-idea-delivery-feedback";
import { getInlineGuidance } from "@/lib/help/aas-help";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type FramingOutcomeSectionProps = {
  data: OutcomeWorkspaceData;
  language?: "en" | "sv";
  search: {
    created?: boolean;
    saveState?: string | null;
    submitState?: string | null;
    lifecycleState?: string | null;
    saveMessage?: string | null;
    blockersFromQuery?: string[];
    aiField?: "outcome_statement" | "baseline_definition" | null;
    aiVerdict?: "good" | "needs_revision" | "unclear" | null;
    aiConfidence?: "high" | "medium" | "low" | null;
    aiReason?: string | null;
    aiSuggestion?: string | null;
    aiError?: string | null;
    draftOutcomeStatement?: string | null;
    draftBaselineDefinition?: string | null;
  };
  embeddedInFraming?: boolean;
  saveAction: (formData: FormData) => void | Promise<void>;
  saveInlineAction: (formData: FormData) => Promise<OutcomeInlineSaveActionState>;
  createEpicAction: (formData: FormData) => void | Promise<void>;
  createStoryIdeaAction: (formData: FormData) => void | Promise<void>;
  archiveAction: (formData: FormData) => void | Promise<void>;
  hardDeleteAction: (formData: FormData) => void | Promise<void>;
  restoreAction: (formData: FormData) => void | Promise<void>;
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
  validateOutcomeStatementAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  validateBaselineDefinitionAiAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  reviewFramingAction: typeof reviewOutcomeFramingWithAiAction;
  initialReviewFramingState: ReviewOutcomeFramingAiActionState;
};

function translate(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function localizeTollgateBlocker(blocker: string, language: "en" | "sv") {
  const reframingMatch = blocker.match(
    /^Framing changed after version (\d+)\. Submit version (\d+) to Tollgate 1 for a new approval\.$/
  );

  if (!reframingMatch) {
    return blocker;
  }

  return translate(
    language,
    blocker,
    `Framing ändrades efter version ${reframingMatch[1]}. Skicka in version ${reframingMatch[2]} till Tollgate 1 för ett nytt godkännande.`
  );
}

function getOriginLabel(originType: string, language: "en" | "sv") {
  if (originType === "seeded") return "Demo";
  if (originType === "native") return language === "sv" ? "Nativ" : "Native";
  return language === "sv" ? "Importerad" : "Imported";
}

function getOriginSummary(originType: string, language: "en" | "sv") {
  if (originType === "seeded") {
    return language === "sv"
      ? "Det här caset kommer från Demo-projektet för guidad utforskning."
      : "This case comes from the Demo project for guided exploration.";
  }
  if (originType === "native") {
    return language === "sv"
      ? "Det här caset har skapats nativt och representerar rent kundarbete."
      : "This case was authored natively and represents clean customer work.";
  }
  return language === "sv"
    ? "Det här caset har promoterats från importerat källmaterial."
    : "This case was promoted from imported source material.";
}

function getWorkspaceLabel(outcome: { originType: string; createdMode: string }, language: "en" | "sv") {
  return outcome.originType === "native" && outcome.createdMode === "clean"
    ? language === "sv"
      ? "Ren"
      : "Clean"
    : language === "sv"
      ? "Delad"
      : "Shared";
}

function formatRoleLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatPersonLabel(person: { fullName: string | null; email: string }) {
  if (person.fullName && person.email) {
    return `${person.fullName} (${person.email})`;
  }

  return person.fullName ?? person.email;
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("sv-SE");
}

type DeliveryTypeValue = "AD" | "AT" | "AM";

const deliveryTypeProfiles: Record<
  DeliveryTypeValue,
  {
    label: string;
    primaryQuestion: string;
    changeType: string;
    baselinePosition: string;
    baselineExamples: string;
    outcomeType: string;
    outcomeExample: string;
    evidenceNeed: string;
    problemDefinition: string;
    epicCharacter: string;
    epicExamples: string;
    riskType: string;
    riskLevel: string;
    scopeStability: string;
    aiLevel: string;
    aiRole: string;
    governanceNeeds: string;
    commonFailure: string;
    aasProtection: string;
    framingWeight: string;
    poorFramingImpact: string;
  }
> = {
  AD: {
    label: "Application Development",
    primaryQuestion: "Vad ska vi bygga för att skapa nytt värde?",
    changeType: "Ny funktionalitet eller ny kapacitet.",
    baselinePosition: "Ofta svag eller saknas.",
    baselineExamples: "Nuvarande manuellt arbetssätt eller dagens enkla workaround.",
    outcomeType: "Affärsvärde eller användarvärde.",
    outcomeExample: "\"Öka konvertering med 15%.\"",
    evidenceNeed: "Hypotes plus rimlighet räcker ofta i framing.",
    problemDefinition: "Hypotesbaserad men tydligt värdedriven.",
    epicCharacter: "Funktionella capabilities.",
    epicExamples: "UI, API, onboarding, self-service, reporting.",
    riskType: "Fel funktion eller lågt nyttjande.",
    riskLevel: "Medel.",
    scopeStability: "Kan vara mer explorativ i början.",
    aiLevel: "Typiskt Level 1-2, ibland 3.",
    aiRole: "Stöd för idéer, struktur och formulering.",
    governanceNeeds: "Outcome och Value Owner måste vara tydliga.",
    commonFailure: "Att bygga features utan ett verkligt outcome.",
    aasProtection: "Skyddar mot output utan värde.",
    framingWeight: "Medel.",
    poorFramingImpact: "Risk för fel produkt."
  },
  AT: {
    label: "Application Transformation",
    primaryQuestion: "Vad i nuvarande system hindrar värde?",
    changeType: "Strukturell förändring av befintligt.",
    baselinePosition: "Obligatorisk och datadriven.",
    baselineExamples: "Lead time, tech debt, kostnad, incidenter, förändringsfriktion.",
    outcomeType: "Strukturell effekt i hastighet, kostnad eller risk.",
    outcomeExample: "\"Halvera lead time.\"",
    evidenceNeed: "Mätbar problemverifiering krävs.",
    problemDefinition: "Faktabaserad och kvantifierad.",
    epicCharacter: "Strukturella förändringar.",
    epicExamples: "Modularisering, CI/CD, dependency cleanup, plattformsbyte.",
    riskType: "Drift, regression och systempåverkan.",
    riskLevel: "Högst.",
    scopeStability: "Måste stabiliseras tidigt.",
    aiLevel: "Typiskt Level 1-2, Level 3 bara strikt kontrollerat.",
    aiRole: "Analys av kod, beroenden och tech debt.",
    governanceNeeds: "Outcome, baseline, risk och AI-nivå måste vara strikta.",
    commonFailure: "Att modernisera utan effektmål.",
    aasProtection: "Skyddar mot teknikdriven transformation utan effekt.",
    framingWeight: "Högst.",
    poorFramingImpact: "Risk för dyr misslyckad transformation."
  },
  AM: {
    label: "Application Management",
    primaryQuestion: "Hur optimerar vi befintlig leverans?",
    changeType: "Kontinuerlig förbättring.",
    baselinePosition: "Objektspecifik och operativ.",
    baselineExamples: "SLA, incidentdata, kostnad per ärende, MTTR, återkommande driftmönster.",
    outcomeType: "Stabilitet, effektivitet eller kostnad.",
    outcomeExample: "\"Minska MTTR från 6h till 2h.\"",
    evidenceNeed: "Dataanalys av driftmönster behövs.",
    problemDefinition: "Datadriven och repetitiv.",
    epicCharacter: "Förbättrings- och automationsområden.",
    epicExamples: "Incident automation, triage, monitoring, knowledge capture.",
    riskType: "Felaktig optimering eller automation.",
    riskLevel: "Låg till medel.",
    scopeStability: "Kontinuerlig och iterativ.",
    aiLevel: "Typiskt Level 1-3 med hög potential.",
    aiRole: "Mönsteridentifiering och incidentanalys.",
    governanceNeeds: "Outcome och operativ baseline behöver finnas.",
    commonFailure: "Att köra drift utan förbättringsmål.",
    aasProtection: "Skyddar mot reaktiv support utan utveckling.",
    framingWeight: "Medel.",
    poorFramingImpact: "Risk för ineffektiv drift."
  }
};

function getDeliveryTypeProfile(value: "AD" | "AT" | "AM" | null | undefined) {
  return value ? deliveryTypeProfiles[value] : null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDeliveryTypeHelper(value: "AD" | "AT" | "AM" | null | undefined) {
  const profile = getDeliveryTypeProfile(value);

  if (!profile) {
    return "Choose the delivery posture that best describes this case so Framing can guide the business case, baseline, risks and hierarchy the right way from the start.";
  }

  return `${profile.label}: ${profile.primaryQuestion} ${profile.governanceNeeds}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDeliveryTypeContextualGuidance(value: "AD" | "AT" | "AM" | null | undefined) {
  const profile = getDeliveryTypeProfile(value);

  if (!profile) {
    return {
      businessCaseDescription: "Describe the case in a way that makes the value question, current reality and intended change visible before design starts.",
      timeframeDescription: "Describe the business window for this case, for example a pilot season, quarter, budget window or launch horizon. This is for business timing, not sprint planning.",
      valueOwnerDescription:
        "Choose the named person on the customer side who owns the business value, baseline and Tollgate 1 decision. The list shows people available in this project context.",
      problemDescription: "State the business problem clearly enough that the team can understand why this case exists before they talk about solutions.",
      outcomeDescription: "Write the effect that should become true if this Framing succeeds. Keep it outcome-oriented, not solution-oriented.",
      solutionContextDescription:
        "Capture only the context and constraints that Design needs to inherit. Use this to carry forward business context, existing landscape realities, integration expectations and non-negotiable boundaries without slipping into technical solution detail.",
      solutionContextFieldDescription:
        "Pass forward only the surrounding context that should shape Design. Include greenfield vs existing landscape, who will use it, and major external dependencies. If the context increases sensitivity or delivery complexity, it should inform both risk classification and AI acceleration decisions.",
      constraintsDescription:
        "Capture what Design must respect, not how to implement it. Good examples are operational limits, compliance obligations, must-keep integrations, rollout constraints and continuity requirements. If a constraint raises risk or demands more control, it should influence the AI/risk assessment.",
      uxDescription:
        "Put design-driving UX constraints here, not wireframes or page-by-page solutions. Use this when imported material contains UX expectations that must guide the design phase without freezing the solution too early.",
      nfrDescription:
        "Use this for cross-cutting quality requirements. If an NFR increases delivery sensitivity, supervision needs, or operational risk, it should also be reflected in AI and risk.",
      additionalRequirementsDescription:
        "Use this for imported additional requirements that are real and relevant, but that do not belong as Outcome, Epic or Story Idea content. These become part of the design input package for the next step.",
      dataSensitivityDescription: "List the relevant data types and why they matter for risk, compliance and delivery control.",
      baselineCardDescription: "These fields help ground the Framing before approval is recorded.",
      baselineSourceDescription: "Record where the baseline comes from so the team can trace the claim back to evidence.",
      aiRiskDescription: "Define AI usage intent, classify risk and record the framing-level AI decision before Tollgate 1.",
      structureDescription: "Capture scope boundaries through Epics and lightweight Story Ideas. Keep them directional, not operational.",
      quickEpicDescription: "Create the next scope boundary directly from Framing before you break it down into Story Ideas.",
      quickStoryIdeaDescription: "Create a new Story Idea directly from Framing and assign its Epic now, without opening the Epic first."
    };
  }

  return {
    businessCaseDescription: `${profile.primaryQuestion} ${profile.changeType} ${profile.outcomeType}`,
    timeframeDescription:
      profile.scopeStability === "Kontinuerlig och iterativ."
        ? "Describe the operating cadence or improvement window this work belongs to, for example monthly service improvement, incident reduction period or contract window."
        : profile.scopeStability === "Måste stabiliseras tidigt."
          ? "Describe the transition or transformation window this case must fit into, for example migration phase, modernization budget window or stabilization horizon."
          : "Describe the business window for the new value, for example pilot, launch horizon, funding window or adoption milestone.",
    valueOwnerDescription: `${profile.governanceNeeds} This person must be able to stand behind the effect, baseline and Tollgate 1 decision.`,
    problemDescription: `${profile.problemDefinition} ${profile.commonFailure}`,
    outcomeDescription: `${profile.outcomeType} Example: ${profile.outcomeExample}`,
    solutionContextDescription: `Context and constraints should reflect this as ${profile.label.toLowerCase()}. ${profile.aasProtection}`,
    solutionContextFieldDescription: `${profile.changeType} ${profile.epicExamples}`,
    constraintsDescription: `${profile.riskType} ${profile.aasProtection}`,
    uxDescription:
      value === "AD"
        ? "Use UX principles to steer the new experience without locking the solution too early."
        : value === "AT"
          ? "Use UX principles to protect continuity where users move between old and transformed experiences."
          : "Use UX principles to protect continuity, clarity and low-friction support flows in day-to-day operations.",
    nfrDescription: `${profile.riskLevel} ${profile.evidenceNeed}`,
    additionalRequirementsDescription:
      value === "AT"
        ? "Use this for migration dependencies, platform assumptions or transformation conditions that Design must inherit."
        : value === "AM"
          ? "Use this for operational assumptions, support boundaries or service rules that must not be lost."
          : "Use this for business rules, assumptions or external dependencies that still matter in Design.",
    dataSensitivityDescription:
      value === "AT"
        ? "Call out data that increases migration, regression or compliance risk across the current landscape."
        : value === "AM"
          ? "Call out operational data, support data and incident-related data that shape the service model."
          : "Call out the data involved in the new value flow and the sensitivity implications early.",
    baselineCardDescription: `${profile.baselinePosition} ${profile.baselineExamples}`,
    baselineSourceDescription: `${profile.evidenceNeed} Typical examples: ${profile.baselineExamples}`,
    aiRiskDescription: `${profile.aiRole} ${profile.riskType}`,
    structureDescription: `${profile.epicCharacter} Examples: ${profile.epicExamples}`,
    quickEpicDescription: `${profile.epicCharacter} Start by naming one scope boundary that moves the case toward the intended outcome.`,
    quickStoryIdeaDescription:
      value === "AT"
        ? "Create a directional Story Idea that clarifies one transformation effect or risk-reducing move under the chosen Epic."
        : value === "AM"
          ? "Create a directional Story Idea that improves service behavior, support flow or operational automation under the chosen Epic."
          : "Create a directional Story Idea that expresses one user-value move under the chosen Epic."
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DeliveryTypeHelpCard(props: { value: "AD" | "AT" | "AM" | null | undefined; language?: "en" | "sv" }) {
  const selectedProfile = getDeliveryTypeProfile(props.value);
  const language = props.language ?? "en";

  return (
    <details className="group rounded-2xl border border-border/70 bg-background/85 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30">
        <span className="inline-flex rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground">
          <CircleHelp className="h-3.5 w-3.5" />
        </span>
        <span>What project type means in Framing</span>
        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border/70 px-4 py-4">
        <p className="text-sm leading-6 text-muted-foreground">
          The selected project type should change how you frame baseline, outcomes, evidence, risks and the shape of Epics.
          {selectedProfile ? ` ${translate(language, "Current selection", "Nuvarande val")}: ${selectedProfile.label}.` : ""}
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.entries(deliveryTypeProfiles) as Array<[DeliveryTypeValue, (typeof deliveryTypeProfiles)[DeliveryTypeValue]]>).map(
            ([key, profile]) => (
              <div
                className={`rounded-2xl border p-4 ${
                  props.value === key
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/70 bg-muted/20"
                }`}
                key={key}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{profile.label}</p>
                  <span className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {key}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <p><strong className="text-foreground">{translate(language, "Primary question:", "Primär fråga:")}</strong> {profile.primaryQuestion}</p>
                  <p><strong className="text-foreground">Baseline:</strong> {profile.baselinePosition}</p>
                  <p><strong className="text-foreground">Outcome:</strong> {profile.outcomeType}</p>
                  <p><strong className="text-foreground">{translate(language, "Evidence:", "Bevis:")}</strong> {profile.evidenceNeed}</p>
                  <p><strong className="text-foreground">Epics:</strong> {profile.epicCharacter}</p>
                  <p><strong className="text-foreground">Risk:</strong> {profile.riskType}</p>
                  <p><strong className="text-foreground">{translate(language, "Governance:", "Governance:")}</strong> {profile.governanceNeeds}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </details>
  );
}

function CollapsibleFramingPanel(props: {
  title: string;
  description: ReactNode;
  defaultOpen?: boolean | undefined;
  badge?: ReactNode;
  teaser?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{props.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
          {props.teaser ? <div className="mt-3 text-sm text-foreground">{props.teaser}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {props.badge}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-border/70 px-6 py-5">{props.children}</div>
    </details>
  );
}

export function FramingOutcomeSection({
  data,
  language = "en",
  search,
  embeddedInFraming = false,
  saveAction,
  saveInlineAction,
  createEpicAction,
  createStoryIdeaAction,
  archiveAction,
  hardDeleteAction,
  restoreAction,
  recordTollgateDecisionAction,
  validateOutcomeStatementAiAction,
  validateBaselineDefinitionAiAction,
  reviewFramingAction,
  initialReviewFramingState
}: FramingOutcomeSectionProps) {
  const { outcome, tollgate, removal } = data;
  const computedBlockers = getOutcomeFramingBlockers({
    title: outcome.title,
    outcomeStatement: outcome.outcomeStatement ?? null,
    baselineDefinition: outcome.baselineDefinition ?? null,
    valueOwnerId: outcome.valueOwnerId ?? null,
    aiUsageRole:
      outcome.aiUsageRole === "support" ||
      outcome.aiUsageRole === "generation" ||
      outcome.aiUsageRole === "validation" ||
      outcome.aiUsageRole === "decision_support" ||
      outcome.aiUsageRole === "automation"
        ? outcome.aiUsageRole
        : null,
    aiExecutionPattern:
      outcome.aiExecutionPattern === "assisted" ||
      outcome.aiExecutionPattern === "step_by_step" ||
      outcome.aiExecutionPattern === "orchestrated"
        ? outcome.aiExecutionPattern
        : null,
    aiUsageIntent: outcome.aiUsageIntent ?? null,
    businessImpactLevel: outcome.businessImpactLevel ?? null,
    businessImpactRationale: outcome.businessImpactRationale ?? null,
    dataSensitivityLevel: outcome.dataSensitivityLevel ?? null,
    dataSensitivityRationale: outcome.dataSensitivityRationale ?? null,
    blastRadiusLevel: outcome.blastRadiusLevel ?? null,
    blastRadiusRationale: outcome.blastRadiusRationale ?? null,
    decisionImpactLevel: outcome.decisionImpactLevel ?? null,
    decisionImpactRationale: outcome.decisionImpactRationale ?? null,
    aiLevelJustification: outcome.aiLevelJustification ?? null,
    riskAcceptedAt: outcome.riskAcceptedAt ?? null,
    riskAcceptedByValueOwnerId: outcome.riskAcceptedByValueOwnerId ?? null,
    riskProfile: outcome.riskProfile,
    aiAccelerationLevel: outcome.aiAccelerationLevel,
    status: outcome.status,
    epicCount: outcome.epics.length
  });
  const blockers =
    search.blockersFromQuery && search.blockersFromQuery.length > 0
      ? search.blockersFromQuery
      : tollgate?.blockers ?? computedBlockers;
  const statusLabel =
    tollgate?.status === "approved"
      ? language === "sv"
        ? "Godkänd"
        : "Approved"
      : blockers.length > 0
        ? language === "sv"
          ? "Behöver åtgärd"
          : "Needs action"
        : language === "sv"
          ? "Redo för review"
          : "Ready for review";
  const statusTone = tollgate?.status === "approved" ? "approved" : blockers.length > 0 ? "needs_action" : "ready_for_review";
  const originLabel = getOriginLabel(outcome.originType, language);
  const workspaceLabel = getWorkspaceLabel(outcome, language);
  const isArchived = outcome.lifecycleState === "archived";
  const framingHref = `/framing?outcomeId=${outcome.id}`;
  const framingBriefExport = buildFramingBriefExport({
    outcome,
    blockers,
    tollgate
  });
  const humanFramingBrief = buildHumanFramingBriefExport({
    outcome,
    blockers,
    tollgate
  });
  const aiFeedback =
    search.aiField && search.aiVerdict && search.aiReason
      ? {
          field: search.aiField,
          verdict: search.aiVerdict,
          confidence: search.aiConfidence ?? "medium",
          rationale: search.aiReason,
          suggestedRewrite: search.aiSuggestion ?? null
        }
      : null;
  const returnPath = embeddedInFraming ? "/framing" : `/outcomes/${outcome.id}`;
  const draftOutcomeStatement = search.draftOutcomeStatement ?? outcome.outcomeStatement ?? "";
  const draftBaselineDefinition = search.draftBaselineDefinition ?? outcome.baselineDefinition ?? "";
  const derivedRiskProfile = deriveOutcomeRiskProfile({
    businessImpactLevel: outcome.businessImpactLevel ?? null,
    dataSensitivityLevel: outcome.dataSensitivityLevel ?? null,
    blastRadiusLevel: outcome.blastRadiusLevel ?? null,
    decisionImpactLevel: outcome.decisionImpactLevel ?? null
  });
  const aiRiskBlockers = getOutcomeAiAndRiskBlockers({
    aiUsageRole:
      outcome.aiUsageRole === "support" ||
      outcome.aiUsageRole === "generation" ||
      outcome.aiUsageRole === "validation" ||
      outcome.aiUsageRole === "decision_support" ||
      outcome.aiUsageRole === "automation"
        ? outcome.aiUsageRole
        : null,
    aiExecutionPattern:
      outcome.aiExecutionPattern === "assisted" ||
      outcome.aiExecutionPattern === "step_by_step" ||
      outcome.aiExecutionPattern === "orchestrated"
        ? outcome.aiExecutionPattern
        : null,
    aiUsageIntent: outcome.aiUsageIntent ?? null,
    businessImpactLevel: outcome.businessImpactLevel ?? null,
    businessImpactRationale: outcome.businessImpactRationale ?? null,
    dataSensitivityLevel: outcome.dataSensitivityLevel ?? null,
    dataSensitivityRationale: outcome.dataSensitivityRationale ?? null,
    blastRadiusLevel: outcome.blastRadiusLevel ?? null,
    blastRadiusRationale: outcome.blastRadiusRationale ?? null,
    decisionImpactLevel: outcome.decisionImpactLevel ?? null,
    decisionImpactRationale: outcome.decisionImpactRationale ?? null,
    aiLevelJustification: outcome.aiLevelJustification ?? null,
    riskProfile: outcome.riskProfile,
    aiAccelerationLevel: outcome.aiAccelerationLevel
  }).map((reason) => reason.message);
  const aiRiskStatusLabel = aiRiskBlockers.length > 0 ? translate(language, "Needs action", "Behöver åtgärd") : translate(language, "Ready for review", "Redo för granskning");
  const aiRiskBadgeClasses =
    aiRiskBlockers.length > 0
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-900";
  const seedsByEpicId = new Map<string, typeof outcome.directionSeeds>();

  for (const seed of outcome.directionSeeds) {
    const existing = seedsByEpicId.get(seed.epicId) ?? [];
    existing.push(seed);
    seedsByEpicId.set(seed.epicId, existing);
  }

  const legacyStoryIdeas = outcome.stories.filter((story) => {
    if (story.sourceDirectionSeedId) {
      return false;
    }

    const epicSeeds = seedsByEpicId.get(story.epicId) ?? [];
    const mappedSourceStoryIds = new Set(epicSeeds.map((seed) => seed.sourceStoryId).filter(Boolean));
    const hasExplicitStoryIdeas = epicSeeds.length > 0;

    return !hasExplicitStoryIdeas
      ? story.status === "draft" || story.status === "definition_blocked" || !isLikelyDeliveryStory(story, mappedSourceStoryIds)
      : !isLikelyDeliveryStory(story, mappedSourceStoryIds);
  });
  const visibleStoryIdeaCount = outcome.directionSeeds.length + legacyStoryIdeas.length;
  const canCreateStoryIdea = outcome.epics.length > 0 && !isArchived;
  const deliveryTypeValue =
    outcome.deliveryType === "AD" || outcome.deliveryType === "AT" || outcome.deliveryType === "AM" ? outcome.deliveryType : null;
  const structuredConstraints = parseFramingConstraintBundle(outcome.solutionConstraints ?? null);
  const framingCompleteItems = [
    outcome.outcomeStatement?.trim() ? translate(language, "Outcome statement is captured", "Outcome-beskrivning finns") : null,
    outcome.baselineDefinition?.trim() ? translate(language, "Baseline is defined", "Baseline finns") : null,
    outcome.valueOwnerId ? translate(language, "Value owner is assigned", "Value owner är satt") : null,
    derivedRiskProfile && blockers.every((blocker) => !blocker.toLowerCase().includes("risk") && !blocker.toLowerCase().includes("ai "))
      ? translate(language, "AI and risk decision is structured", "AI- och riskbeslutet är strukturerat")
      : null,
    outcome.epics.length > 0 ? translate(language, `${outcome.epics.length} Epic${outcome.epics.length === 1 ? "" : "s"} created`, `${outcome.epics.length} Epic skapade`) : null,
    tollgate?.status === "approved"
      ? translate(language, `Tollgate 1 approved${formatDateTime(tollgate.updatedAt) ? ` on ${formatDateTime(tollgate.updatedAt)}` : ""}`, `Tollgate 1 godkänd${formatDateTime(tollgate.updatedAt) ? ` ${formatDateTime(tollgate.updatedAt)}` : ""}`)
      : null
  ].filter((value): value is string => Boolean(value));
  const framingWarnings = blockers;
  const statusDetail =
    tollgate?.status === "approved"
      ? `Tollgate 1 approved for Framing version ${tollgate.approvedVersion ?? outcome.framingVersion}${formatDateTime(tollgate.updatedAt) ? ` on ${formatDateTime(tollgate.updatedAt)}` : ""}.`
      : framingWarnings.length > 0
        ? translate(language, `${framingWarnings.length} warning${framingWarnings.length === 1 ? "" : "s"} should be reviewed before you rely on this Framing.`, `${framingWarnings.length} varning${framingWarnings.length === 1 ? "" : "ar"} bör granskas innan du litar på den här Framing-versionen.`)
        : translate(language, "Framing is complete enough to collect the required Tollgate 1 approvals.", "Framingen är tillräckligt komplett för att samla in nödvändiga Tollgate 1-godkännanden.");
  const framingNextActionLabel =
    tollgate?.status === "approved"
      ? framingWarnings.length > 0
        ? translate(language, "Review warnings", "Granska varningar")
        : translate(language, "Export Framing and start design", "Exportera Framing och starta design")
      : framingWarnings.length > 0
        ? translate(language, "Review warnings and collect approvals", "Granska varningar och samla godkännanden")
        : translate(language, "Collect Tollgate 1 approvals", "Samla Tollgate 1-godkännanden");
  const framingNextActionDetail =
    tollgate?.status === "approved"
      ? framingWarnings.length > 0
        ? translate(language, "Tollgate 1 is already approved, but the open warnings should still be reviewed before you rely on this Framing version.", "Tollgate 1 är redan godkänd, men de öppna varningarna bör fortfarande granskas innan du förlitar dig på den här Framing-versionen.")
        : translate(language, "Use the approved Framing as the decision baseline, export it if needed, and continue into design.", "Använd den godkända Framingen som beslutsbaseline, exportera den vid behov och gå vidare till design.")
      : framingWarnings.length > 0
        ? translate(language, "Approvals are still possible now, but the open warnings should be reviewed before you rely on the Framing as a stable baseline.", "Godkännanden är fortfarande möjliga nu, men de öppna varningarna bör granskas innan du använder Framingen som stabil baseline.")
        : translate(language, "Framing is complete enough to collect the required Tollgate 1 approvals for the current AI level.", "Framingen är tillräckligt komplett för att samla in nödvändiga Tollgate 1-godkännanden för aktuell AI-nivå.");
  const aiAndRiskTeaser = [
    translate(language, `AI Level ${outcome.aiAccelerationLevel.replace("level_", "")}`, `AI-nivå ${outcome.aiAccelerationLevel.replace("level_", "")}`),
    translate(language, `Risk ${derivedRiskProfile ? derivedRiskProfile.charAt(0).toUpperCase() + derivedRiskProfile.slice(1) : "Not determined"}`, `Risk ${derivedRiskProfile ? derivedRiskProfile.charAt(0).toUpperCase() + derivedRiskProfile.slice(1) : "Inte fastställd"}`),
    aiRiskBlockers.length > 0 ? translate(language, `${aiRiskBlockers.length} action item${aiRiskBlockers.length === 1 ? "" : "s"}`, `${aiRiskBlockers.length} åtgärdspunkt${aiRiskBlockers.length === 1 ? "" : "er"}`) : translate(language, "Ready to review", "Redo för granskning"),
    aiRiskBlockers.length > 0 ? translate(language, "Expand to complete the missing classifications.", "Öppna för att komplettera de saknade klassificeringarna.") : translate(language, "Expand to review the rationale and governance fit.", "Öppna för att granska motivering och governance-passning.")
  ];
  const structureTeaser = [
    translate(language, `${outcome.epics.length} Epic${outcome.epics.length === 1 ? "" : "s"}`, `${outcome.epics.length} Epic`),
    translate(language, `${visibleStoryIdeaCount} Story Idea${visibleStoryIdeaCount === 1 ? "" : "s"}`, `${visibleStoryIdeaCount} Story Idea`),
    outcome.epics.length === 0
      ? translate(language, "Expand to create the first Epic and Story Ideas.", "Öppna för att skapa första Epic och Story Ideas.")
      : translate(language, "Expand to create new items and inspect the framing hierarchy.", "Öppna för att skapa nya poster och granska framing-hierarkin.")
  ];

  return (
    <section className="space-y-6">
      {search.created ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {translate(language, "Clean native case created and ready for framing work.", "Rent nativt case skapat och redo för framingarbete.")}
        </div>
      ) : null}
      {search.saveState === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {translate(language, "Outcome changes were saved successfully.", "Outcome-ändringarna sparades.")}
        </div>
      ) : null}
      {search.saveState === "error" && search.saveMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {search.saveMessage}
        </div>
      ) : null}
      {search.submitState === "blocked" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {translate(language, "Framing still has open recommendations. Approvals are allowed, but a fresh approval is recommended after the blockers are cleared.", "Framingen har fortfarande öppna rekommendationer. Godkännanden är tillåtna, men ett nytt godkännande rekommenderas när blockerarna är lösta.")}
        </div>
      ) : null}
      {search.submitState === "ready" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {translate(language, "A Framing approval was recorded. Remaining approver roles are still shown below.", "Ett Framing-godkännande registrerades. Kvarvarande godkännanderoller visas fortfarande nedan.")}
        </div>
      ) : null}
      {search.submitState === "approved" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {translate(language, "Required sign-offs are complete. Tollgate 1 is now approved.", "Nödvändiga sign-offs är klara. Tollgate 1 är nu godkänd.")}
        </div>
      ) : null}
      {search.lifecycleState === "archived" ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {translate(language, "Outcome archived. It is now removed from active working views but still traceable here.", "Outcome arkiverad. Den är nu borttagen från aktiva arbetsvyer men fortfarande spårbar här.")}
        </div>
      ) : null}
      {search.lifecycleState === "restored" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {translate(language, "Outcome restored to active work.", "Outcome återställd till aktivt arbete.")}
        </div>
      ) : null}
      {search.lifecycleState === "error" && search.saveMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {search.saveMessage}
        </div>
      ) : null}
      {isArchived ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          {translate(language, "This Outcome is archived and currently read-only. Restore it to continue active framing work.", "Det här Outcome är arkiverat och just nu skrivskyddat. Återställ det för att fortsätta aktivt framingarbete.")}
        </div>
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                {outcome.key}
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                {language === "sv" ? "Ursprung" : "Origin"}: {originLabel}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {language === "sv" ? "Projektläge" : "Project mode"}: {workspaceLabel}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : statusTone === "ready_for_review" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {language === "sv" ? "Status" : "Status"}: {statusLabel}
              </span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">{outcome.title}</CardTitle>
              <CardDescription className="max-w-4xl text-sm leading-7 sm:text-base">
                {getOriginSummary(outcome.originType, language)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <WorkspaceStatusSummary
            blockerEmptyText={
              language === "sv" ? "Inga varningar eller rekommendationer syns just nu." : "No warnings or recommendations are visible right now."
            }
            blockerTitle={language === "sv" ? "Varningar" : "Warnings"}
            blockers={framingWarnings}
            completeItems={framingCompleteItems}
            completeTitle={language === "sv" ? "Redan fångat" : "Already captured"}
            nextActionDetail={framingNextActionDetail}
            nextActionLabel={framingNextActionLabel}
            statusDetail={statusDetail}
            statusLabel={statusLabel}
            statusTone={statusTone}
          />
        </CardContent>
      </Card>

      {!embeddedInFraming ? (
        <>
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{language === "sv" ? "Casets ursprung" : "Case provenance"}</CardTitle>
              <CardDescription>
                {language === "sv"
                  ? "Använd den här lätta sammanfattningen för att skilja Demo-referensarbete från nativt kundarbete."
                  : "Use this lightweight summary to distinguish Demo reference work from native customer work."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  {language === "sv" ? "Ursprung" : "Origin"}: {originLabel}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {language === "sv" ? "Projektläge" : "Project mode"}: {workspaceLabel}
                </span>
                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {language === "sv" ? "Status" : "Status"}: {statusLabel}
                </span>
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {language === "sv" ? "Livscykel" : "Lifecycle"}: {outcome.lifecycleState.replaceAll("_", " ")}
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{getOriginSummary(outcome.originType, language)}</p>
            </CardContent>
          </Card>

        <FramingContextCard
          epic={null}
          language={language}
          outcome={{ id: outcome.id, key: outcome.key, title: outcome.title, href: framingHref }}
          summary={
            language === "sv"
              ? "När du öppnar den här Framing-vyn etableras den aktiva affärskontexten. Bara Epics och Story Ideas som hör till det här caset visas som standard."
              : "Opening this Framing establishes the active business context. Only Epics and Story Ideas attached to this case are shown by default."
          }
        />
        </>
      ) : null}

      <FramingGuidanceShell>
        <DeliveryTypeGuidanceProvider initialValue={deliveryTypeValue}>
        <form action={saveAction} className="space-y-6">
            <input name="outcomeId" type="hidden" value={outcome.id} />
            <input name="returnPath" type="hidden" value={returnPath} />
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{language === "sv" ? "Affärscase" : "Business case"}</CardTitle>
                <CardDescription>
                  <DeliveryTypeGuidanceText slot="businessCaseDescription" />
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 xl:grid-cols-2">
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Titel" : "Title"}</span>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.title}
                    disabled={isArchived}
                    name="title"
                    type="text"
                  />
                  <InlineFieldGuidance
                    guidance={
                      language === "sv"
                        ? "Använd ett kort affärsnära namn på caset som både kunden och leveransteamet känner igen."
                        : "Use a short business-facing case name that the customer and delivery team can both recognize."
                    }
                  />
                </label>
                <div className="space-y-2 xl:col-span-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="outcome-delivery-type">
                      {language === "sv" ? "Leveranstyp" : "Delivery type"}
                    </label>
                    <LiveDeliveryTypeHelpCard />
                  </div>
                  <DeliveryTypeSelect
                    defaultValue={outcome.deliveryType ?? ""}
                    disabled={isArchived}
                    id="outcome-delivery-type"
                    name="deliveryType"
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeHelperText />
                  </p>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.delivery_type", language)} />
                </div>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Tidsram" : "Timeframe"}</span>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.timeframe ?? ""}
                    disabled={isArchived}
                    name="timeframe"
                    type="text"
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.timeframe", language)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Värdeägare" : "Value owner"}</span>
                  <Suspense
                    fallback={
                      <ValueOwnerFieldFallback
                        currentOwnerLabel={outcome.valueOwner?.fullName ?? outcome.valueOwner?.email ?? null}
                        currentOwnerId={outcome.valueOwnerId ?? null}
                        disabled={isArchived}
                        language={language}
                      />
                    }
                  >
                    <DeferredValueOwnerField
                      currentOwnerId={outcome.valueOwnerId ?? null}
                      currentOwnerLabel={outcome.valueOwner?.fullName ?? outcome.valueOwner?.email ?? null}
                      disabled={isArchived}
                      language={language}
                      organizationId={outcome.organizationId}
                    />
                  </Suspense>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.value_owner", language)} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Problemformulering" : "Problem statement"}</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.problemStatement ?? ""}
                    disabled={isArchived}
                    name="problemStatement"
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeGuidanceText slot="problemDescription" />
                  </p>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.problem", language)} />
                </label>
                <div className="xl:col-span-2">
                  <OutcomeAiValidatedTextarea
                    disabled={isArchived}
                    field="outcome_statement"
                    guidance={
                      <>
                        <p className="text-sm leading-6 text-muted-foreground">
                          <DeliveryTypeGuidanceText slot="outcomeDescription" />
                        </p>
                        <InlineFieldGuidance guidance={getInlineGuidance("framing.outcome", language)} />
                      </>
                    }
                    initialError={search.aiField === "outcome_statement" ? search.aiError ?? null : null}
                    initialFeedback={search.aiField === "outcome_statement" ? aiFeedback : null}
                    initialValue={draftOutcomeStatement}
                    label={language === "sv" ? "Outcome-beskrivning" : "Outcome statement"}
                    name="outcomeStatement"
                    saveAction={saveInlineAction}
                    validateAction={validateOutcomeStatementAiAction}
                  />
                </div>
                <div className="xl:col-span-2 rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {language === "sv" ? "Lösningskontext och constraints" : "Solution context and constraints"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <DeliveryTypeGuidanceText slot="solutionContextDescription" />
                    </p>
                  </div>
                </div>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Lösningskontext" : "Solution context"}</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.solutionContext ?? ""}
                    disabled={isArchived}
                    name="solutionContext"
                    placeholder={
                      language === "sv"
                        ? "Beskriv affärskontext, användning, systemlandskap och viktiga beroenden som Design behöver ärva."
                        : "Describe the business context, usage, system landscape, and key dependencies that Design must inherit."
                    }
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.solution_context", language)} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Constraints" : "Constraints"}</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={structuredConstraints.generalConstraints}
                    disabled={isArchived}
                    name="generalSolutionConstraints"
                    placeholder={
                      language === "sv"
                        ? "Lista de affärs-, drift-, compliance- eller integrationsvillkor som inte får brytas."
                        : "List the business, operational, compliance, or integration conditions that cannot be broken."
                    }
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.solution_constraints", language)} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    {language === "sv" ? "UX-principer" : "UX principles"}
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={structuredConstraints.uxPrinciples}
                    disabled={isArchived}
                    name="uxPrinciples"
                    placeholder={
                      language === "sv"
                        ? "Fånga principer som tillgänglighet, tydlighet, kontinuitet eller andra UX-gränser som Design ska respektera."
                        : "Capture principles such as accessibility, clarity, continuity, or other UX boundaries that Design should respect."
                    }
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeGuidanceText slot="uxDescription" />
                  </p>
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    {language === "sv" ? "Non-functional requirements" : "Non-functional requirements"}
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={structuredConstraints.nonFunctionalRequirements}
                    disabled={isArchived}
                    name="nonFunctionalRequirements"
                    placeholder={
                      language === "sv"
                        ? "Fånga krav på till exempel prestanda, säkerhet, tillgänglighet, integritet, compliance eller driftsäkerhet."
                        : "Capture requirements such as performance, security, availability, privacy, compliance, accessibility, or reliability."
                    }
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeGuidanceText slot="nfrDescription" />
                  </p>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.non_functional_requirements", language)} />
                </label>
                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm font-medium text-foreground">
                    {language === "sv" ? "Ytterligare krav" : "Additional requirements"}
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={structuredConstraints.additionalRequirements}
                    disabled={isArchived}
                    name="additionalRequirements"
                    placeholder={
                      language === "sv"
                        ? "Fånga extra affärsregler, beroenden eller antaganden som inte får tappas bort."
                        : "Capture extra business rules, dependencies, or assumptions that must not be lost."
                    }
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeGuidanceText slot="additionalRequirementsDescription" />
                  </p>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Datakänslighet" : "Data sensitivity"}</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.dataSensitivity ?? ""}
                    disabled={isArchived}
                    name="dataSensitivity"
                    placeholder={
                      language === "sv"
                        ? "Lista vilka datatyper som berörs och varför de påverkar risk eller kontroll."
                        : "List the data types involved and why they change risk or control."
                    }
                  />
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.data_sensitivity", language)} />
                </label>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{language === "sv" ? "Baseline" : "Baseline"}</CardTitle>
                <CardDescription>
                  <DeliveryTypeGuidanceText slot="baselineCardDescription" />
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 xl:grid-cols-2">
                <OutcomeAiValidatedTextarea
                  disabled={isArchived}
                  field="baseline_definition"
                  guidance={
                    <>
                      <InlineFieldGuidance guidance={getInlineGuidance("framing.baseline_definition", language)} />
                    </>
                  }
                  initialError={search.aiField === "baseline_definition" ? search.aiError ?? null : null}
                  initialFeedback={search.aiField === "baseline_definition" ? aiFeedback : null}
                  initialValue={draftBaselineDefinition}
                  label={language === "sv" ? "Baseline-definition" : "Baseline definition"}
                  name="baselineDefinition"
                  saveAction={saveInlineAction}
                  validateAction={validateBaselineDefinitionAiAction}
                />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{language === "sv" ? "Baselinekälla" : "Baseline source"}</span>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                    defaultValue={outcome.baselineSource ?? ""}
                    disabled={isArchived}
                    name="baselineSource"
                  />
                  <p className="text-sm leading-6 text-muted-foreground">
                    <DeliveryTypeGuidanceText slot="baselineSourceDescription" />
                  </p>
                  <InlineFieldGuidance guidance={getInlineGuidance("framing.baseline_source", language)} />
                </label>
              </CardContent>
            </Card>

            <CollapsibleFramingPanel
              description={<DeliveryTypeGuidanceText slot="aiRiskDescription" />}
              badge={
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${aiRiskBadgeClasses}`}>
                  {aiRiskStatusLabel}
                </span>
              }
              teaser={<p className="leading-6 text-muted-foreground">{aiAndRiskTeaser.join(" · ")}</p>}
              title={language === "sv" ? "AI och risk" : "AI and risk"}
            >
              <OutcomeAiRiskPostureCard
                defaultAiLevelJustification={outcome.aiLevelJustification ?? null}
                defaultAiLevel={outcome.aiAccelerationLevel}
                defaultAiExecutionPattern={
                  outcome.aiExecutionPattern === "assisted" ||
                  outcome.aiExecutionPattern === "step_by_step" ||
                  outcome.aiExecutionPattern === "orchestrated"
                    ? outcome.aiExecutionPattern
                    : null
                }
                defaultAiUsageIntent={outcome.aiUsageIntent ?? null}
                defaultBlastRadiusLevel={outcome.blastRadiusLevel ?? null}
                defaultBlastRadiusRationale={outcome.blastRadiusRationale ?? null}
                defaultBusinessImpactLevel={outcome.businessImpactLevel ?? null}
                defaultBusinessImpactRationale={outcome.businessImpactRationale ?? null}
                defaultDataSensitivityLevel={outcome.dataSensitivityLevel ?? null}
                defaultDataSensitivityRationale={outcome.dataSensitivityRationale ?? null}
                defaultDecisionImpactLevel={outcome.decisionImpactLevel ?? null}
                defaultDecisionImpactRationale={outcome.decisionImpactRationale ?? null}
                defaultRiskProfile={outcome.riskProfile}
                disabled={isArchived}
                embedded
              />
            </CollapsibleFramingPanel>

            <CollapsibleFramingPanel
              description={<DeliveryTypeGuidanceText slot="structureDescription" />}
              teaser={<p className="leading-6 text-muted-foreground">{structureTeaser.join(" · ")}</p>}
              title={language === "sv" ? "Epics, Story Ideas och framinghierarki" : "Epics, Story Ideas and framing hierarchy"}
            >
              <div className="space-y-5">
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{language === "sv" ? "Skapa Epic snabbt" : "Quick create Epic"}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        <DeliveryTypeGuidanceText slot="quickEpicDescription" />
                      </p>
                    </div>
                    <div className="mt-3 space-y-3">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">{language === "sv" ? "Epic-titel" : "Epic title"}</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                          defaultValue={language === "sv" ? "Ny epic" : "New epic"}
                          disabled={isArchived}
                          name="quickEpicTitle"
                          type="text"
                        />
                      </label>
                      {!isArchived ? (
                        <PendingFormButton
                          className="gap-2 self-start px-5"
                          formAction={createEpicAction}
                          icon={<ArrowRight className="h-4 w-4" />}
                          label={language === "sv" ? "Skapa Epic" : "Create Epic"}
                          pendingLabel={language === "sv" ? "Skapar Epic..." : "Creating Epic..."}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {language === "sv"
                            ? "Återställ framingbriefen innan du skapar nya Epics."
                            : "Restore the Framing brief before creating new Epics."}
                        </p>
                      )}
                    </div>
                  </div>
                  {outcome.epics.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 xl:col-span-2">
                      <p className="font-medium text-foreground">
                        {language === "sv" ? "Inga Epics finns för det här caset ännu." : "No Epics exist for this case yet."}
                      </p>
                      <p className="mt-2 leading-6">
                        {isArchived
                          ? language === "sv"
                            ? "Återställ Outcome om du vill fortsätta bryta ned det."
                            : "Restore the Outcome if you want to continue breaking it down."
                          : language === "sv"
                            ? "Skapa den första natíva Epicen här. Inga Demo-Epics kopplas in som fallback."
                            : "Create the first native Epic here. No Demo Epics will be attached as fallback."}
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/45 p-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {language === "sv" ? "Skapa Story Idea snabbt" : "Quick create Story Idea"}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          <DeliveryTypeGuidanceText slot="quickStoryIdeaDescription" />
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-end">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">
                              {language === "sv" ? "Story Idea-titel" : "Story idea title"}
                            </span>
                            <input
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                              defaultValue={language === "sv" ? "Ny story idea" : "New story idea"}
                              disabled={!canCreateStoryIdea}
                              name="quickStoryIdeaTitle"
                              type="text"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-foreground">Epic</span>
                            <select
                              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
                              disabled={!canCreateStoryIdea}
                              name="quickStoryIdeaEpicId"
                              defaultValue={outcome.epics[0]?.id ?? ""}
                            >
                              {outcome.epics.map((epic) => (
                                <option key={epic.id} value={epic.id}>
                                  {epic.key} {epic.title}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <PendingFormButton
                          className="gap-2 self-start px-5"
                          disabled={!canCreateStoryIdea}
                          formAction={createStoryIdeaAction}
                          icon={<ArrowRight className="h-4 w-4" />}
                          label={language === "sv" ? "Skapa Story Idea" : "Create Story Idea"}
                          pendingLabel={language === "sv" ? "Skapar Story Idea..." : "Creating Story Idea..."}
                        />
                      </div>
                    </div>
                    {!canCreateStoryIdea ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {isArchived
                          ? language === "sv"
                            ? "Återställ framingbriefen innan du skapar nya Story Ideas."
                            : "Restore the framing brief before creating new Story Ideas."
                          : language === "sv"
                            ? "Skapa minst en Epic först, sedan kan du koppla en ny Story Idea direkt från Framing."
                            : "Create at least one Epic first, then you can assign a new Story Idea directly from Framing."}
                      </p>
                    ) : null}
                  </div>
                </div>
                <FramingValueSpineTree
                  description={
                    language === "sv"
                      ? "Läs den aktiva grenen som en sammanhållen framingbrief med Epics och Story Ideas i den hierarki som Design kommer att ärva."
                      : "Read the active branch as one framing brief with Epics and Story Ideas in the hierarchy Design will inherit."
                  }
                  language={language}
                  embedded
                  emptyEpicMessage={
                    isArchived
                      ? language === "sv"
                        ? "Arkiverade Outcomes visar inte längre aktivt Epic-arbete i den här grenen."
                        : "Archived Outcomes no longer surface active Epic work in this branch."
                      : language === "sv"
                        ? "Skapa den första natíva Epicen här. Tomma grenar förblir tomma tills du lägger till barnarbete."
                        : "Create the first native Epic here. Empty branches stay empty until you add child work."
                  }
                  emptyStoryMessage={
                    isArchived
                      ? language === "sv"
                        ? "Arkiverade Outcomes visar inte längre aktiva Story Ideas."
                        : "Archived Outcomes no longer surface active Story Ideas."
                      : language === "sv"
                        ? "Skapa Story Ideas från rätt Epic så att hierarkin förblir avgränsad till den här Framing-vyn."
                        : "Create Story Ideas from the relevant Epic so the hierarchy stays scoped to this Framing."
                  }
                  mode="framing"
                  epics={outcome.epics.map((epic) => ({
                    id: epic.id,
                    key: epic.key,
                    title: epic.title,
                    href: `/epics/${epic.id}`,
                    isCurrent: false,
                    scopeBoundary: epic.scopeBoundary ?? null,
                    purpose: epic.purpose ?? null,
                    originType: epic.originType,
                    lifecycleState: epic.lifecycleState,
                    importedReadinessState: epic.importedReadinessState ?? null,
                    lineageHref:
                      epic.lineageSourceType === "artifact_aas_candidate" && epic.lineageSourceId
                        ? buildOriginIntakeHref({
                            candidateId: epic.lineageSourceId,
                            entityId: epic.id,
                            entityType: "epic"
                          })
                        : null,
                    directionSeeds: outcome.directionSeeds
                      .filter((seed) => seed.epicId === epic.id)
                      .map((seed) => ({
                        id: seed.id,
                        key: seed.key,
                        title: seed.title,
                        href: `/story-ideas/${seed.id}`,
                        isCurrent: false,
                        shortDescription: seed.shortDescription ?? null,
                        expectedBehavior: seed.expectedBehavior ?? null,
                        uxSketchName: seed.uxSketchName ?? null,
                        uxSketchDataUrl: seed.uxSketchDataUrl ?? null,
                        sourceStoryId: seed.sourceStoryId ?? null,
                        originType: seed.originType,
                        lifecycleState: seed.lifecycleState,
                        importedReadinessState: seed.importedReadinessState ?? null,
                        lineageHref:
                          seed.lineageSourceType === "artifact_aas_candidate" && seed.lineageSourceId
                            ? buildOriginIntakeHref({
                                candidateId: seed.lineageSourceId,
                                entityId: seed.id,
                                entityType: "direction_seed"
                              })
                            : null
                      })),
                    stories: outcome.stories
                      .filter((story) => story.epicId === epic.id)
                      .map((story) => ({
                        id: story.id,
                        key: story.key,
                        title: story.title,
                        href: story.sourceDirectionSeedId ? `/stories/${story.id}` : `/story-ideas/${story.id}`,
                        isCurrent: false,
                        sourceDirectionSeedId: story.sourceDirectionSeedId ?? null,
                        valueIntent: story.valueIntent ?? null,
                        expectedBehavior: story.expectedBehavior ?? null,
                        testDefinition: story.testDefinition ?? null,
                        acceptanceCriteria: story.acceptanceCriteria,
                        definitionOfDone: story.definitionOfDone,
                        status: story.status,
                        originType: story.originType,
                        lifecycleState: story.lifecycleState,
                        importedReadinessState: story.importedReadinessState ?? null,
                        lineageHref:
                          story.lineageSourceType === "artifact_aas_candidate" && story.lineageSourceId
                            ? buildOriginIntakeHref({
                                candidateId: story.lineageSourceId,
                                entityId: story.id,
                                entityType: "story"
                              })
                            : null
                      }))
                  }))}
                  outcome={{
                    id: outcome.id,
                    key: outcome.key,
                    title: outcome.title,
                    href: framingHref,
                    isCurrent: true,
                    problemStatement: outcome.problemStatement ?? null,
                    outcomeStatement: outcome.outcomeStatement ?? null,
                    originType: outcome.originType,
                    lifecycleState: outcome.lifecycleState,
                    importedReadinessState: outcome.importedReadinessState ?? null,
                  lineageHref:
                    outcome.lineageSourceType === "artifact_aas_candidate" && outcome.lineageSourceId
                      ? buildOriginIntakeHref({
                          candidateId: outcome.lineageSourceId,
                          entityId: outcome.id,
                          entityType: "outcome"
                        })
                      : null
                  }}
                />
              </div>
            </CollapsibleFramingPanel>

            {!isArchived ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <PendingFormButton
                  className="gap-2"
                  icon={<ArrowRight className="h-4 w-4" />}
                  label={language === "sv" ? "Spara framingändringar" : "Save framing changes"}
                  pendingLabel={language === "sv" ? "Sparar framing..." : "Saving framing..."}
                />
                {!embeddedInFraming ? (
                  <Button asChild className="gap-2" variant="secondary">
                    <Link href="/framing">{language === "sv" ? "Tillbaka till Framing Cockpit" : "Back to Framing Cockpit"}</Link>
                  </Button>
                ) : null}
              </div>
            ) : !embeddedInFraming ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/framing">{language === "sv" ? "Tillbaka till Framing Cockpit" : "Back to Framing Cockpit"}</Link>
              </Button>
            ) : null}
        </form>
        </DeliveryTypeGuidanceProvider>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>
              <LocalizedText en="AI validation before Tollgate 1" sv="AI-validering inför Tollgate 1" />
            </CardTitle>
            <CardDescription>
              <LocalizedText
                en={`Review the current Framing against ${outcome.aiAccelerationLevel.replaceAll("_", " ")} before you record TG1 approvals. The report highlights readiness, gaps and possible AI-level corrections.`}
                sv={`Granska aktuell framing mot ${outcome.aiAccelerationLevel.replaceAll("_", " ")} innan du registrerar TG1-godkännanden. Rapporten lyfter readiness, luckor och eventuella justeringar av AI-nivån.`}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-start">
            <OutcomeAiReviewDialog
              action={reviewFramingAction}
              currentAiLevel={outcome.aiAccelerationLevel}
              initialState={initialReviewFramingState}
              outcomeId={outcome.id}
            />
          </CardContent>
        </Card>

        <Suspense fallback={<OutcomeTollgateSectionFallback />}>
          <OutcomeTollgateApprovalSection
            defaultBlockers={blockers}
            isArchived={isArchived}
            outcomeId={outcome.id}
            recordTollgateDecisionAction={recordTollgateDecisionAction}
          />
        </Suspense>

        {removal?.decision ? (
          <CollapsibleFramingPanel
            defaultOpen={false}
            description={
              language === "sv"
                ? "Hard delete hålls enkelt för utkast som är berättigade, medan styrt arbete arkiveras och återställs inom den aktuella projektkontexten."
                : "Hard delete stays easy for eligible drafts, while governed work is archived and restored inside the current project context."
            }
            title={language === "sv" ? "Ta bort eller arkivera i detta projekt" : "Remove or archive in this project"}
          >
            <GovernedLifecycleCard
              archiveAction={archiveAction}
              decision={removal.decision}
              entityId={outcome.id}
              entityLabel="Outcome"
              hardDeleteAction={hardDeleteAction}
              hideHeader
              restoreAction={restoreAction}
            />
          </CollapsibleFramingPanel>
        ) : null}

        <CollapsibleFramingPanel
          defaultOpen={false}
          description={
            language === "sv"
              ? "Expandera när du vill exportera kundens handshake till ett annat AI-verktyg eller arbetsflöde."
              : "Expand when you want to export the customer handshake into another AI tool or workflow."
          }
          teaser={
            <p className="leading-6 text-muted-foreground">
              {language === "sv"
                ? "Innehåller en mänskligt läsbar Framing Brief och en strukturerad AI Delivery Handoff med godkännandekontext och UX-referenser."
                : "Includes one human-readable Framing Brief and one structured AI Delivery Handoff with approval context and UX references."}
            </p>
          }
          title={language === "sv" ? "Exportera framingpaket" : "Export framing packages"}
        >
          <FramingBriefExportPanel
            aiMarkdown={framingBriefExport.markdown}
            aiPayload={framingBriefExport.payload}
            embedded
            disabled={isArchived}
            humanBrief={humanFramingBrief}
          />
        </CollapsibleFramingPanel>
      </FramingGuidanceShell>
    </section>
  );
}

export async function DeferredOutcomeTollgateSection(props: {
  outcomeId: string;
  isArchived: boolean;
  defaultBlockers: string[];
  language?: "en" | "sv";
  submitTollgateAction: (formData: FormData) => void | Promise<void>;
  recordTollgateDecisionAction: (formData: FormData) => void | Promise<void>;
}) {
  void props.submitTollgateAction;
  const language = props.language ?? "en";
  let tollgateResult: Awaited<ReturnType<typeof getCachedOutcomeTollgateReviewData>>;

  try {
    const session = await requireActiveProjectSession();
    tollgateResult = await getCachedOutcomeTollgateReviewData(
      session.organization.organizationId,
      props.outcomeId
    );
  } catch (error) {
    console.error("Failed to load Framing tollgate section", error);

    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
            <LocalizedText en="Tollgate follow-up is unavailable" sv="Tollgate-uppfÃ¶ljning Ã¤r inte tillgÃ¤nglig" />
          </CardTitle>
          <CardDescription>
            <LocalizedText en="The Tollgate workspace hit a server-side loading problem." sv="Tollgate-arbetsytan stÃ¶tte pÃ¥ ett serverfel vid inlÃ¤sning." />
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!tollgateResult.ok) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
            <LocalizedText en="Tollgate follow-up is unavailable" sv="Tollgate-uppföljning är inte tillgänglig" />
          </CardTitle>
          <CardDescription>
            {tollgateResult.errors[0]?.message ?? (
              <LocalizedText en="The Tollgate workspace could not be loaded right now." sv="Tollgate-arbetsytan kunde inte laddas just nu." />
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { outcome, blockers, tollgateReview } = tollgateResult.data;
  const visibleBlockers = blockers.length > 0 ? blockers : props.defaultBlockers;
  const hasApprovedDocument = Boolean(tollgateReview.approvalSnapshot);
  const approvedVersion = tollgateReview.approvedVersion ?? null;
  const currentFramingVersion = outcome.framingVersion;
  const activeSubmissionVersion = tollgateReview.activeSubmissionVersion ?? currentFramingVersion;
  const approvedSnapshotVersion =
    tollgateReview.approvalSnapshot &&
    typeof tollgateReview.approvalSnapshot === "object" &&
    typeof (tollgateReview.approvalSnapshot as { approvedVersion?: unknown }).approvedVersion === "number"
      ? ((tollgateReview.approvalSnapshot as { approvedVersion: number }).approvedVersion)
      : approvedVersion;
  const currentVersionApproved = approvedVersion === currentFramingVersion && tollgateReview.status === "approved";
  const completedApprovals = tollgateReview.approvalActions.filter((action) => action.completedRecords.length > 0);
  const hasPartialApprovals =
    !currentVersionApproved &&
    completedApprovals.length > 0;
  const versionRecommendationVisible = Boolean(approvedVersion && approvedVersion !== currentFramingVersion);
  const latestApprovalRecord =
    completedApprovals
      .flatMap((action) => action.completedRecords)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
  const primaryStatusClasses = currentVersionApproved
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : visibleBlockers.length > 0 || versionRecommendationVisible
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-sky-200 bg-sky-50 text-sky-900";
  const primaryStatusIcon = currentVersionApproved ? (
    <CircleCheckBig className="h-4 w-4" />
  ) : visibleBlockers.length > 0 || versionRecommendationVisible ? (
    <CircleAlert className="h-4 w-4" />
  ) : (
    <Clock3 className="h-4 w-4" />
  );
  const primaryStatusTitle = currentVersionApproved
    ? translate(language, "Tollgate 1 is approved for the current Framing version.", "Tollgate 1 är godkänd för aktuell Framing-version.")
    : hasPartialApprovals
      ? translate(language, "Framing approvals are in progress for the current version.", "Framing-godkännanden pågår för aktuell version.")
      : translate(language, "Tollgate 1 approvals can be recorded now.", "Tollgate 1-godkännanden kan registreras nu.");
  const primaryStatusDetail = currentVersionApproved
    ? translate(
        language,
        `The required approval roles for the current AI level signed off on Framing version ${currentFramingVersion}${latestApprovalRecord ? ` on ${formatDateTime(latestApprovalRecord.createdAt)}` : ""}.`,
        `De godkännanderoller som krävs för aktuell AI-nivå har signerat Framing-version ${currentFramingVersion}${latestApprovalRecord ? ` den ${formatDateTime(latestApprovalRecord.createdAt)}` : ""}.`
      )
    : versionRecommendationVisible
      ? translate(
          language,
          `Framing changed after version ${approvedVersion}. A fresh approval is recommended for version ${currentFramingVersion}.`,
          `Framing ändrades efter version ${approvedVersion}. Ett nytt godkännande rekommenderas för version ${currentFramingVersion}.`
        )
      : visibleBlockers.length > 0
      ? translate(
          language,
          "Approvals are still allowed, but the open warnings below should be reviewed before you rely on this Framing as a stable baseline.",
          "Godkännanden är fortfarande tillåtna, men de öppna varningarna nedan bör granskas innan du förlitar dig på denna Framing som stabil baseline."
        )
        : translate(
            language,
            "The Framing looks complete enough. Record the required approvals for the current AI level below.",
            "Framingen ser tillräckligt komplett ut. Registrera de godkännanden som krävs för aktuell AI-nivå nedan."
          );
  const riskSummaryRows = [
    {
      label: "AI Level",
      value: outcome.aiAccelerationLevel.replaceAll("_", " ")
    },
    {
      label: translate(language, "Risk profile", "Riskprofil"),
      value: outcome.riskProfile ? outcome.riskProfile.charAt(0).toUpperCase() + outcome.riskProfile.slice(1) : translate(language, "Not determined", "Inte fastställd")
    },
    {
      label: "Business impact",
      value: outcome.businessImpactLevel
        ? `${outcome.businessImpactLevel.charAt(0).toUpperCase() + outcome.businessImpactLevel.slice(1)}${outcome.businessImpactRationale ? ` - ${outcome.businessImpactRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Data sensitivity",
      value: outcome.dataSensitivityLevel
        ? `${outcome.dataSensitivityLevel.charAt(0).toUpperCase() + outcome.dataSensitivityLevel.slice(1)}${outcome.dataSensitivityRationale ? ` - ${outcome.dataSensitivityRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Blast radius",
      value: outcome.blastRadiusLevel
        ? `${outcome.blastRadiusLevel.charAt(0).toUpperCase() + outcome.blastRadiusLevel.slice(1)}${outcome.blastRadiusRationale ? ` - ${outcome.blastRadiusRationale}` : ""}`
        : "Not classified"
    },
    {
      label: "Decision impact",
      value: outcome.decisionImpactLevel
        ? `${outcome.decisionImpactLevel.charAt(0).toUpperCase() + outcome.decisionImpactLevel.slice(1)}${outcome.decisionImpactRationale ? ` - ${outcome.decisionImpactRationale}` : ""}`
        : "Not classified"
    }
  ];

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>
            <LocalizedText en="Tollgate 1 approval" sv="Tollgate 1-godkännande" />
          </CardTitle>
          <CardDescription>
            <LocalizedText
              en="Tollgate 1 applies to the Framing brief as a whole. Review lanes are not used here. Record approvals directly from the required roles for the current AI level."
              sv="Tollgate 1 gäller hela framingbriefen. Review-spår används inte här. Registrera godkännanden direkt från de roller som krävs för aktuell AI-nivå."
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`rounded-2xl border px-4 py-4 text-sm ${primaryStatusClasses}`}>
            <div className="flex items-center gap-2 font-medium">
              {primaryStatusIcon}
              {primaryStatusTitle}
            </div>
            <p className="mt-2 leading-6">{primaryStatusDetail}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{translate(language, "Approval overview", "Godkännandeöversikt")}</p>
                  <p className="mt-2 leading-6 text-foreground">
                    {translate(
                      language,
                      `${completedApprovals.length} of ${tollgateReview.approvalActions.length} approvals recorded for submission version ${activeSubmissionVersion}`,
                      `${completedApprovals.length} av ${tollgateReview.approvalActions.length} godkannanden registrerade for submissionsversion ${activeSubmissionVersion}`
                    )}
                  </p>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {translate(language, "Submitted framing", "Inskickad framing")}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {translate(language, `Version ${activeSubmissionVersion}`, `Version ${activeSubmissionVersion}`)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {translate(language, "Approved baseline", "Godkand baseline")}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {approvedSnapshotVersion
                          ? translate(language, `Version ${approvedSnapshotVersion}`, `Version ${approvedSnapshotVersion}`)
                          : translate(language, "Not stored yet", "Inte sparad annu")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {translate(language, "Current working framing", "Nuvarande arbetsframing")}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {translate(language, `Version ${currentFramingVersion}`, `Version ${currentFramingVersion}`)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {approvedSnapshotVersion
                      ? approvedSnapshotVersion === currentFramingVersion
                        ? translate(
                            language,
                            "The approved baseline and the current working Framing are the same version.",
                            "Den godkanda baselinen och aktuell arbetsframing ar samma version."
                          )
                        : translate(
                            language,
                            "The saved approval record points to an earlier approved baseline than the current working Framing.",
                            "Det sparade godkannandet pekar pa en tidigare godkand baseline an den nuvarande arbetsframingen."
                          )
                      : translate(
                          language,
                          "No approved baseline is stored yet for this Framing.",
                          "Ingen godkand baseline finns annu sparad for den har framingen."
                        )}
                  </p>
                </div>
                {versionRecommendationVisible ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                    {translate(language, "New approval recommended", "Nytt godkännande rekommenderas")}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {tollgateReview.approvalActions.map((action) => {
                  const assignedPeopleLabel =
                    action.assignedPeople.length > 0
                      ? action.assignedPeople.map((person) => person.fullName).join(", ")
                      : "No active assignee";

                  return (
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={`required-${action.roleType}-${action.organizationSide}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{action.label}</p>
                        <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {formatRoleLabel(action.roleType)}
                        </span>
                        <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {action.organizationSide}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground">{assignedPeopleLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/55 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">AI and risk summary for approval</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {riskSummaryRows.map((row) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-3" key={row.label}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</p>
                    <p className="mt-2 leading-6 text-foreground">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {visibleBlockers.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-medium">{translate(language, "Warnings before relying on this approval", "Varningar innan du förlitar dig på detta godkännande")}</p>
              <ul className="mt-3 space-y-2">
                {visibleBlockers.map((blocker) => (
                  <li key={blocker}>• {localizeTollgateBlocker(blocker, language)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasApprovedDocument ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="gap-2" variant="secondary">
                <Link href={`/outcomes/${props.outcomeId}/approval-document`}>
                  {approvedVersion === currentFramingVersion
                    ? translate(language, "Open approved framing document", "Öppna godkänt framingdokument")
                    : translate(language, "Open last approved framing document", "Öppna senast godkända framingdokumentet")}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                {translate(language, "Open the saved approval record and print it as a PDF with the full Framing, approvals and dates.", "Öppna det sparade godkännandet och skriv ut det som PDF med full Framing, godkännanden och datum.")}
              </p>
            </div>
          ) : null}

        </CardContent>
      </Card>

      <div className="space-y-4" id="tollgate-review">
        {tollgateReview.approvalActions.map((action) => {
          const completedRecord = action.completedRecords[0] ?? null;
          const hasAssignedPeople = action.assignedPeople.length > 0;

          return (
            <div
              className="rounded-2xl border border-border/70 bg-background px-4 py-4 shadow-sm"
              key={`${action.decisionKind}:${action.roleType}:${action.organizationSide}`}
            >
              <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{action.label}</p>
                    <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {formatRoleLabel(action.roleType)}
                    </span>
                    <span className="rounded-full border border-border/70 bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {action.organizationSide}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {hasAssignedPeople
                      ? action.assignedPeople.map((person) => `${person.fullName} (${person.roleTitle})`).join(", ")
                      : "No active person is assigned for this approval role yet."}
                  </p>
                </div>

                <div className="text-sm">
                  {completedRecord ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
                      <div className="flex items-center gap-2 font-medium">
                        <CircleCheckBig className="h-4 w-4" />
                        {translate(language, "Approved by", "Godkänd av")} {completedRecord.actualPersonName}
                      </div>
                      <p className="mt-2 leading-6">{formatDateTime(completedRecord.createdAt)}</p>
                      {completedRecord.note ? <p className="mt-2 leading-6">{translate(language, "Motivation", "Motivering")}: {completedRecord.note}</p> : null}
                    </div>
                  ) : props.isArchived ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-muted-foreground">
                      {translate(language, "Restore the Framing brief to continue approvals.", "Återställ framingbriefen för att fortsätta godkännanden.")}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">{translate(language, "Pending approval", "Väntar på godkännande")}</p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                    completedRecord
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {completedRecord ? translate(language, "Approved", "Godkänd") : translate(language, "Pending", "Väntar")}
                </span>
              </div>

              {!completedRecord && !props.isArchived ? (
                hasAssignedPeople ? (
                  <form action={props.recordTollgateDecisionAction} className="mt-4 space-y-3 border-t border-border/70 pt-4">
                    <input name="outcomeId" type="hidden" value={props.outcomeId} />
                    <input name="entityId" type="hidden" value={props.outcomeId} />
                    <input name="aiAccelerationLevel" type="hidden" value={outcome.aiAccelerationLevel} />
                    <input
                      name="decisionKey"
                      type="hidden"
                      value={`approval|${action.roleType}|${action.organizationSide}`}
                    />
                    <input name="decisionStatus" type="hidden" value="approved" />
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">{translate(language, "Approver", "Godkännare")}</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={action.assignedPeople[0]?.partyRoleEntryId ?? ""}
                          name="actualPartyRoleEntryId"
                        >
                          {action.assignedPeople.map((person) => (
                            <option key={person.partyRoleEntryId} value={person.partyRoleEntryId}>
                              {person.fullName} - {person.roleTitle}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">{translate(language, "Motivation", "Motivering")}</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          name="note"
                          required
                          type="text"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-3 text-sm">
                        <input className="mt-1 h-4 w-4" name="confirmApproval" required type="checkbox" value="yes" />
                        <span className="leading-6 text-foreground">
                          {translate(language, "I confirm that this Framing version can be approved from the perspective of this role.", "Jag bekräftar att denna Framing-version kan godkännas från den här rollens perspektiv.")}
                        </span>
                      </label>
                      <PendingFormButton
                        className="gap-2 whitespace-nowrap"
                        showPendingCursor
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label={translate(language, `Approve as ${action.label}`, `Godkänn som ${action.label}`)}
                        pendingLabel={translate(language, "Recording approval...", "Registrerar godkännande...")}
                      />
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                    {translate(language, "Assign an active", "Tilldela en aktiv")} {formatRoleLabel(action.roleType)} {translate(language, "on the", "på")} {action.organizationSide} {translate(language, "side before this approval can be recorded.", "sidan innan detta godkännande kan registreras.")}
                  </div>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

function OutcomeTollgateSectionFallback() {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>
          <LocalizedText en="Loading tollgate follow-up" sv="Laddar Tollgate-uppföljning" />
        </CardTitle>
        <CardDescription>
          <LocalizedText
            en="Approval roles and current Framing sign-offs are loading separately."
            sv="Godkännanderoller och aktuella sign-offs för Framing laddas separat."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
        <div className="h-28 rounded-2xl border border-border/70 bg-muted/20" />
      </CardContent>
    </Card>
  );
}

async function DeferredValueOwnerField(props: {
  organizationId: string;
  currentOwnerId: string | null;
  currentOwnerLabel: string | null;
  disabled: boolean;
  language: "en" | "sv";
}) {
  let ownersResult: Awaited<ReturnType<typeof getCachedOrganizationValueOwnersData>>;

  try {
    ownersResult = await getCachedOrganizationValueOwnersData(props.organizationId);
  } catch (error) {
    console.error("Failed to load Framing value owners", error);
    return (
      <ValueOwnerFieldFallback
        currentOwnerId={props.currentOwnerId}
        currentOwnerLabel={props.currentOwnerLabel}
        disabled={props.disabled}
        language={props.language}
      />
    );
  }

  if (!ownersResult.ok) {
    return (
      <ValueOwnerFieldFallback
        currentOwnerId={props.currentOwnerId}
        currentOwnerLabel={props.currentOwnerLabel}
        disabled={props.disabled}
        language={props.language}
      />
    );
  }

  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.currentOwnerId ?? ""}
      disabled={props.disabled}
      name="valueOwnerId"
    >
      <option value="">{props.language === "sv" ? "Ej tilldelad" : "Unassigned"}</option>
      {props.currentOwnerId && !ownersResult.data.some((owner) => owner.userId === props.currentOwnerId) ? (
        <option value={props.currentOwnerId}>
          {props.currentOwnerLabel ?? (props.language === "sv" ? "Nuvarande värdeägare" : "Current value owner")}
        </option>
      ) : null}
      {ownersResult.data.map((owner) => (
        <option key={owner.userId} value={owner.userId}>
          {formatPersonLabel(owner)}
        </option>
      ))}
    </select>
  );
}

function ValueOwnerFieldFallback(props: {
  currentOwnerId: string | null;
  currentOwnerLabel: string | null;
  disabled: boolean;
  language: "en" | "sv";
}) {
  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.currentOwnerId ?? ""}
      disabled
      name="valueOwnerId"
    >
      <option value="">
        {props.currentOwnerLabel ? (
          <LocalizedText
            en={`Loading owners... Current: ${props.currentOwnerLabel}`}
            sv={`Laddar ägare... Nuvarande: ${props.currentOwnerLabel}`}
          />
        ) : (
          <LocalizedText en="Loading owners..." sv="Laddar ägare..." />
        )}
      </option>
    </select>
  );
}
