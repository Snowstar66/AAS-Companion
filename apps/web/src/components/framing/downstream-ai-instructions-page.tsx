"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, FileCheck2, RotateCcw, Zap } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { FramingPackagePageHero } from "@/components/framing/framing-package-page-hero";
import { CustomInstructionsEditor } from "@/components/framing/custom-instructions-editor";
import { DownstreamAiInstructionSection } from "@/components/framing/downstream-ai-instruction-section";
import {
  TRACEABLE_AI_DELIVERY_PROTOCOL_ID,
  createDefaultDownstreamAiInstructions,
  createTraceableAiDeliveryProtocolInstruction,
  downstreamPreferenceGroupLabels,
  mapAiAccelerationLevelToDownstreamAiLevel,
  parseDownstreamAiInstructions,
  seededRefinementPreferenceCatalog
} from "@/lib/framing/downstreamInstructionCatalog";
import { analyzeDownstreamAiInstructions } from "@/lib/framing/downstreamValidation";
import type {
  CustomInstruction,
  DownstreamAiInstructions,
  DownstreamPreferenceGroup,
  RefinementPreferenceSelection
} from "@/lib/framing/downstreamInstructionTypes";

type OutcomeWorkspaceData = Extract<Awaited<ReturnType<typeof getOutcomeWorkspaceService>>, { ok: true }>["data"];

type DownstreamAiInstructionsPageProps = {
  data: OutcomeWorkspaceData;
  saveAction: (formData: FormData) => void | Promise<void>;
  runAgentAction: (formData: FormData) => Promise<unknown>;
  flash?: {
    save?: "success" | "error" | null;
    message?: string | null;
  };
};

const groupOrder: DownstreamPreferenceGroup[] = ["epic", "story", "journey", "design", "build"];
const DISCOVERY_LOOP_ACCELERATOR_ID = "discovery-loop-accelerator";

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function getGroupDescription(language: "en" | "sv", group: DownstreamPreferenceGroup) {
  switch (group) {
    case "epic":
      return t(language, "Configure how downstream AI should shape and decompose Epics before later Design and Build steps.", "Styr hur downstream AI ska forma och dela upp Epics före senare design- och buildsteg.");
    case "story":
      return t(language, "Control how downstream AI should refine Story Ideas into clearer, more testable, context-aware candidates.", "Styr hur downstream AI ska förfina Story Ideas till tydligare, mer testbara och mer kontextmedvetna kandidater.");
    case "journey":
      return t(language, "Control how downstream AI should use Journey Context when it exists and how it should behave when it does not.", "Styr hur downstream AI ska använda Journey Context när det finns och hur det ska bete sig när det saknas.");
    case "design":
      return t(language, "Guide how downstream AI should behave in Design while inheriting source-of-truth constraints and guidance.", "Styr hur downstream AI ska arbeta i Design samtidigt som det ärver givna ramar och constraints.");
    case "build":
      return t(language, "Guide how downstream AI should behave in Build around traceability, review, testing, release evidence, and rollout.", "Styr hur downstream AI ska arbeta i Build kring spårbarhet, granskning, test, releaseunderlag och utrullning.");
  }
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function FlashBanner(props: { tone: "success" | "error"; message: string }) {
  const classes =
    props.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>{props.message}</div>;
}

function createEmptyCustomInstruction(): CustomInstruction {
  return {
    id: createId("custom-instruction"),
    title: "",
    body: "",
    category: "General",
    priority: "Normal"
  };
}

function createDiscoveryLoopAcceleratorInstruction(): CustomInstruction {
  return {
    id: DISCOVERY_LOOP_ACCELERATOR_ID,
    title: "Discovery loop accelerator",
    category: "General",
    priority: "High",
    body: [
      "Downstream AI should run an accelerated discovery loop from this Framing package instead of asking for approval at every ordinary refinement step.",
      "Start by inspecting Outcome, Epics, Story Ideas, Journey Context, constraints, AI level, risk posture and approval context.",
      "Use available specialist agents or BMAD-style roles when helpful, for example analyst, product, UX, architect, dev and QA perspectives, but return one consolidated source-of-truth output.",
      "Make reasonable documented assumptions, batch open questions, and continue until a meaningful refinement package exists.",
      "Escalate to the human only for governance-sensitive decisions, missing critical facts, material scope changes, high-risk data/security/privacy issues, or approval/sign-off boundaries.",
      "Return traceable discovery outputs linked back to Outcome -> Epic -> Story Idea -> Journey where applicable, plus assumptions, risks, suggested next experiments and validation checks."
    ].join("\n")
  };
}

function normalizeInitiativeType(value: unknown) {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

export function DownstreamAiInstructionsPage({ data, saveAction, runAgentAction: _runAgentAction, flash }: DownstreamAiInstructionsPageProps) {
  void _runAgentAction;
  const { language } = useAppChromeLanguage();
  const feedbackTimerRef = useRef<number | null>(null);
  const deliveryType = normalizeInitiativeType(data.outcome.deliveryType) ?? normalizeInitiativeType(data.outcome.downstreamAiInstructions?.initiativeType) ?? "AD";
  const aiLevel = data.outcome.downstreamAiInstructions?.aiLevel ?? mapAiAccelerationLevelToDownstreamAiLevel(data.outcome.aiAccelerationLevel);
  const downstreamAiInstructionsStorageAvailable =
    (data.outcome as { downstreamAiInstructionsStorageAvailable?: boolean }).downstreamAiInstructionsStorageAvailable !== false;
  const journeyContextExists = (data.outcome.journeyContexts?.length ?? 0) > 0;
  const [instructions, setInstructions] = useState<DownstreamAiInstructions>(() => {
    return (
      parseDownstreamAiInstructions(data.outcome.downstreamAiInstructions, {
        initiativeType: deliveryType,
        aiLevel
      }) ??
      createDefaultDownstreamAiInstructions({
        initiativeType: deliveryType,
        aiLevel
      })
    );
  });
  const analysis = analyzeDownstreamAiInstructions({
    instructions,
    hasJourneyContext: journeyContextExists
  });
  const [localFeedback, setLocalFeedback] = useState<{
    tone: "success" | "warning";
    message: string;
  } | null>(null);
  const hasDiscoveryLoopAccelerator = instructions.customInstructions.some(
    (instruction) => instruction.id === DISCOVERY_LOOP_ACCELERATOR_ID
  );
  const hasTraceableAiDeliveryProtocol = instructions.customInstructions.some(
    (instruction) => instruction.id === TRACEABLE_AI_DELIVERY_PROTOCOL_ID
  );
  const naCount = instructions.refinementPreferences.filter((preference) => preference.selectedValue === "N/A").length;
  const serializedInstructions = JSON.stringify(instructions);
  const groupedPreferences: Record<
    DownstreamPreferenceGroup,
    Array<{
      preference: RefinementPreferenceSelection;
      catalogEntry: (typeof seededRefinementPreferenceCatalog)[number];
    }>
  > = {
    epic: [],
    story: [],
    journey: [],
    design: [],
    build: []
  };

  for (const preference of instructions.refinementPreferences) {
    const catalogEntry = seededRefinementPreferenceCatalog.find((entry) => entry.id === preference.id);

    if (!catalogEntry) {
      continue;
    }

    groupedPreferences[preference.group].push({
      preference,
      catalogEntry
    });
  }
  const generatedGuideSections: Array<[string, string[]]> = [
    ["Epic Refinement Guide", analysis.generatedGuidance.epicRefinementGuide],
    ["Story Idea Refinement Guide", analysis.generatedGuidance.storyIdeaRefinementGuide],
    ["Journey Usage Guide", analysis.generatedGuidance.journeyUsageGuide],
    ["Design AI Guidance", analysis.generatedGuidance.designAiGuidance],
    ["Build AI Guidance", analysis.generatedGuidance.buildAiGuidance]
  ];

  function updatePreference(preferenceId: string, updater: (preference: RefinementPreferenceSelection) => RefinementPreferenceSelection) {
    setInstructions((current) => ({
      ...current,
      initiativeType: deliveryType,
      aiLevel,
      refinementPreferences: current.refinementPreferences.map((preference) =>
        preference.id === preferenceId ? updater(preference) : preference
      )
    }));
  }

  function updateCustomInstruction(instructionId: string, nextInstruction: CustomInstruction) {
    setInstructions((current) => ({
      ...current,
      initiativeType: deliveryType,
      aiLevel,
      customInstructions: current.customInstructions.map((instruction) =>
        instruction.id === instructionId ? nextInstruction : instruction
      )
    }));
  }

  function showLocalFeedback(tone: "success" | "warning", message: string) {
    setLocalFeedback({ tone, message });

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setLocalFeedback(null);
      feedbackTimerRef.current = null;
    }, 3500);
  }

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  function moveCustomInstruction(instructionId: string, direction: "up" | "down") {
    setInstructions((current) => {
      const index = current.customInstructions.findIndex((instruction) => instruction.id === instructionId);

      if (index === -1) {
        return current;
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= current.customInstructions.length) {
        return current;
      }

      const nextInstructions = [...current.customInstructions];
      const [instruction] = nextInstructions.splice(index, 1);

      if (!instruction) {
        return current;
      }

      nextInstructions.splice(swapIndex, 0, instruction);

      return {
        ...current,
        initiativeType: deliveryType,
        aiLevel,
        customInstructions: nextInstructions
      };
    });
  }

  function resetToSuggestedProfile() {
    setInstructions((current) => ({
      ...createDefaultDownstreamAiInstructions({
        initiativeType: deliveryType,
        aiLevel
      }),
      customInstructions: current.customInstructions
    }));
    showLocalFeedback(
      "success",
      t(language, "Suggested profile restored. Custom instructions were kept.", "Föreslagen profil återställdes. Egna instruktioner behölls.")
    );
  }

  function addDiscoveryLoopAccelerator() {
    setInstructions((current) => {
      const preset = createDiscoveryLoopAcceleratorInstruction();
      const existingIndex = current.customInstructions.findIndex((instruction) => instruction.id === preset.id);
      const customInstructions =
        existingIndex >= 0
          ? current.customInstructions.map((instruction, index) => (index === existingIndex ? preset : instruction))
          : [preset, ...current.customInstructions];

      return {
        ...current,
        initiativeType: deliveryType,
        aiLevel,
        customInstructions
      };
    });
    showLocalFeedback(
      hasDiscoveryLoopAccelerator ? "warning" : "success",
      hasDiscoveryLoopAccelerator
        ? t(language, "Discovery loop accelerator was already active and has been refreshed.", "Discovery loop-acceleratorn var redan aktiv och har uppdaterats.")
        : t(language, "Discovery loop accelerator added. Save the tuning to persist it in the export package.", "Discovery loop-acceleratorn lades till. Spara tuningen för att behålla den i exportpaketet.")
    );
  }

  function addTraceableAiDeliveryProtocol() {
    setInstructions((current) => {
      const preset = createTraceableAiDeliveryProtocolInstruction();
      const existingIndex = current.customInstructions.findIndex((instruction) => instruction.id === preset.id);
      const customInstructions =
        existingIndex >= 0
          ? current.customInstructions.map((instruction, index) => (index === existingIndex ? preset : instruction))
          : [preset, ...current.customInstructions];

      return {
        ...current,
        initiativeType: deliveryType,
        aiLevel,
        customInstructions
      };
    });
    showLocalFeedback(
      hasTraceableAiDeliveryProtocol ? "warning" : "success",
      hasTraceableAiDeliveryProtocol
        ? t(language, "Traceable AI Delivery Protocol was already active and has been refreshed.", "Traceable AI Delivery Protocol var redan aktivt och har uppdaterats.")
        : t(language, "Traceable AI Delivery Protocol added. Save the tuning to persist it in the export package.", "Traceable AI Delivery Protocol lades till. Spara tuningen för att behålla det i exportpaketet.")
    );
  }

  return (
    <div className="space-y-6">
      <FramingPackagePageHero
        actions={
          <form action={saveAction}>
            <input name="outcomeId" type="hidden" value={data.outcome.id} />
            <input name="downstreamAiInstructionsJson" type="hidden" value={serializedInstructions} />
            <Button type="submit">{t(language, "Save Downstream AI Tuning", "Spara downstream AI-tuning")}</Button>
          </form>
        }
        badge={t(language, "Downstream AI Tuning", "Downstream AI-tuning")}
        chips={
          <>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
              {t(language, "Initiative Type", "Initiativtyp")}: {deliveryType}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {t(language, "AI Level", "AI-nivå")}: {aiLevel}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              {instructions.customInstructions.length} {t(language, instructions.customInstructions.length === 1 ? "custom instruction" : "custom instructions", instructions.customInstructions.length === 1 ? "egen instruktion" : "egna instruktioner")}
            </span>
          </>
        }
        description={t(
          language,
          "Optional AI architect controls for the exported handoff. Defaults already follow the Framing package; open this only when you need stronger steering for the next AI tool stack.",
          "Frivilliga AI-arkitektkontroller för det exporterade handoff-paketet. Standardvalen följer redan Framing-paketet; öppna detta bara när du behöver starkare styrning för nästa AI-tool-stack."
        )}
        title={t(language, "Downstream AI Tuning", "Downstream AI-tuning")}
      >
        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
              <p className="font-medium">{t(language, "What belongs here", "Det här hör hemma här")}</p>
              <p className="mt-2">
                {t(
                  language,
                  "Use this page to shape the exported AI handoff when an AI architect wants stronger control over later refinement, design or build behavior.",
                  "Använd sidan för att forma det exporterade AI-handoffet när en AI-arkitekt vill ha starkare kontroll över senare refinement-, design- eller buildbeteende."
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t(language, "Current profile summary", "Sammanfattning av nuvarande profil")}</p>
              <p className="mt-2">
                {t(
                  language,
                  `${analysis.deviations.length} override(s), ${instructions.customInstructions.length} custom instruction(s), ${naCount} N/A selection(s). Keep the defaults unless you intentionally want the next AI stack to behave differently.`,
                  `${analysis.deviations.length} avvikelse(r), ${instructions.customInstructions.length} egen instruktion(er), ${naCount} N/A-val. Behåll standardvalen om du inte medvetet vill att nästa AI-stack ska bete sig annorlunda.`
                )}
              </p>
            </div>
          </div>

          {flash?.save === "success" ? <FlashBanner message={t(language, "Downstream AI Instructions saved to the Framing package.", "Downstream AI-instruktioner sparades i Framing-paketet.")} tone="success" /> : null}
          {flash?.save === "error" && flash.message ? <FlashBanner message={flash.message} tone="error" /> : null}
          {localFeedback ? (
            <FlashBanner
              message={localFeedback.message}
              tone={localFeedback.tone === "success" ? "success" : "error"}
            />
          ) : null}

          {!downstreamAiInstructionsStorageAvailable ? (
            <FlashBanner
              message={t(language, "Downstream AI Instructions are visible, but the latest database migration is not applied yet. The page still loads, but changes cannot be saved until the migration runs.", "Downstream AI-instruktioner syns, men den senaste databasmigreringen är ännu inte körd. Sidan laddas ändå, men ändringar kan inte sparas förrän migreringen har körts.")}
              tone="error"
            />
          ) : null}

          {normalizeInitiativeType(data.outcome.deliveryType) ? null : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {t(
                language,
                `Delivery type is not set in Framing Overview, so this page is currently using a fallback initiative type of ${deliveryType} for defaults.`,
                `Initiativtyp är inte satt i Framing Overview, så den här sidan använder just nu fallback-typen ${deliveryType} för standardval.`
              )}
            </div>
          )}

        </div>
      </FramingPackagePageHero>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "Simple help", "Enkel hjälp")}</CardTitle>
          <CardDescription>
            {t(
              language,
              "This page uses a suggested starting profile, warnings, and custom instructions. No separate AI chat is needed here.",
              "Den här sidan använder en föreslagen startprofil, varningar och egna instruktioner. Ingen separat AI-chat behövs här."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            {t(
              language,
              `Start with the suggested profile for ${deliveryType}. Change only the parts where you genuinely want to steer downstream AI in another direction. Then add custom instructions only for things that truly must survive later refinement.`,
              `Börja med den föreslagna profilen för ${deliveryType}. Ändra bara där du faktiskt vill styra downstream AI i en annan riktning. Lägg sedan till egna instruktioner bara för sådant som verkligen måste leva vidare i senare förfining.`
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2" onClick={resetToSuggestedProfile} type="button" variant="secondary">
              <RotateCcw className="h-4 w-4" />
              {t(language, "Reset to suggested profile", "Återställ föreslagen profil")}
            </Button>
            <Button className="gap-2" onClick={addDiscoveryLoopAccelerator} type="button" variant="secondary">
              {hasDiscoveryLoopAccelerator ? <CheckCircle2 className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              {hasDiscoveryLoopAccelerator
                ? t(language, "Discovery loop accelerator active", "Discovery loop-accelerator aktiv")
                : t(language, "Add discovery loop accelerator", "Lägg till discovery loop-accelerator")}
            </Button>
            <Button className="gap-2" onClick={addTraceableAiDeliveryProtocol} type="button" variant="secondary">
              {hasTraceableAiDeliveryProtocol ? <CheckCircle2 className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}
              {hasTraceableAiDeliveryProtocol
                ? t(language, "Traceable delivery active", "Spårbar leverans aktiv")
                : t(language, "Add traceable delivery protocol", "Lägg till spårbar leverans")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasDiscoveryLoopAccelerator ? (
        <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <Zap className="h-5 w-5" />
              {t(language, "Discovery loop accelerator active", "Discovery loop-accelerator aktiv")}
            </CardTitle>
            <CardDescription className="text-amber-900">
              {t(
                language,
                "Downstream AI will be instructed to work more independently, use available specialist or BMAD-style agents when helpful, batch questions, and escalate only when governance or risk requires human input.",
                "Downstream AI instrueras att arbeta mer självständigt, använda tillgängliga specialist- eller BMAD-liknande agenter där det hjälper, samla frågor och bara eskalera när governance eller risk kräver mänsklig input."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-amber-950">
              {t(
                language,
                "The Governance Envelope still applies. Save Downstream AI Tuning before export if this accelerator should follow the handoff package.",
                "Governance envelope gäller fortfarande. Spara Downstream AI-tuning före export om acceleratorn ska följa med handoff-paketet."
              )}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {hasTraceableAiDeliveryProtocol ? (
        <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-950">
              <FileCheck2 className="h-5 w-5" />
              {t(language, "Traceable AI Delivery Protocol active", "Traceable AI Delivery Protocol aktivt")}
            </CardTitle>
            <CardDescription className="text-emerald-900">
              {t(
                language,
                "Downstream AI will be instructed to freeze a baseline, classify changes, maintain trace IDs, decision logs, implementation maps, verification evidence, and final traceability reporting.",
                "Downstream AI instrueras att frysa baseline, klassificera ändringar, behålla trace-ID:n, decision log, implementation map, verifieringsunderlag och slutlig traceability-rapportering."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-emerald-950">
              {t(
                language,
                "Use this for BMAD or implementation handoffs where every delivered artifact needs a documented reason. Save Downstream AI Tuning before export if this protocol should follow the handoff package.",
                "Använd detta för BMAD- eller implementation-handoffs där varje levererad artefakt behöver ett dokumenterat varför. Spara Downstream AI-tuning före export om protokollet ska följa med handoff-paketet."
              )}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "Governance Envelope", "Governance envelope")}</CardTitle>
          <CardDescription>{t(language, "These controls always apply to downstream AI behavior and are included in export automatically.", "De här styrningarna gäller alltid för downstream AI och följer med automatiskt i exporten.")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {instructions.mandatoryControls.map((control) => (
            <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4" key={control.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{control.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.description}</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  {t(language, "Always on", "Alltid aktiv")}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "AI Architect Controls", "AI-arkitektkontroller")}</CardTitle>
          <CardDescription>
            {t(
              language,
              "Advanced controls for explicit overrides, custom instructions and generated handoff guidance. Leave this closed if the suggested profile is already good enough.",
              "Avancerade kontroller för explicita avvikelser, egna instruktioner och genererad handoff-vägledning. Låt denna vara stängd om den föreslagna profilen redan är tillräckligt bra."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <details className="group rounded-2xl border border-border/70 bg-background shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-medium text-foreground marker:hidden">
              <div className="min-w-0">
                <span>{t(language, "Open advanced tuning", "Öppna avancerad tuning")}</span>
                <p className="mt-1 text-xs text-muted-foreground">{t(language, "Overrides, custom instructions and export guidance", "Avvikelser, egna instruktioner och exportvägledning")}</p>
              </div>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-white shadow-sm">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
              </span>
            </summary>
            <div className="space-y-6 border-t border-border/70 px-4 py-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                {t(language, "N/A helper: Use N/A only when you intentionally want to leave a refinement decision open for downstream AI. This preserves room for later AI reasoning without weakening the governance envelope.", "N/A-hjälp: Använd N/A bara när du medvetet vill lämna ett förfiningsbeslut öppet för downstream AI. Det bevarar utrymme för senare AI-resonemang utan att försvaga governance envelope.")}
              </div>

              {groupOrder.map((group) => (
                <DownstreamAiInstructionSection
                  description={getGroupDescription(language, group)}
                  initiativeType={deliveryType}
                  key={group}
                  onChangeRationale={(preferenceId, value) =>
                    updatePreference(preferenceId, (preference) => ({
                      ...preference,
                      rationale: value
                    }))
                  }
                  onChangeSelection={(preferenceId, value) =>
                    updatePreference(preferenceId, (preference) => ({
                      ...preference,
                      selectedValue: value,
                      rationale:
                        value === seededRefinementPreferenceCatalog.find((entry) => entry.id === preferenceId)?.defaultByMode[deliveryType]
                          ? ""
                          : preference.rationale ?? ""
                    }))
                  }
                  rows={groupedPreferences[group]}
                  title={downstreamPreferenceGroupLabels[group]}
                />
              ))}

              <CustomInstructionsEditor
                instructions={instructions.customInstructions}
                onAdd={() =>
                  setInstructions((current) => ({
                    ...current,
                    initiativeType: deliveryType,
                    aiLevel,
                    customInstructions: [...current.customInstructions, createEmptyCustomInstruction()]
                  }))
                }
                onChange={updateCustomInstruction}
                onDelete={(instructionId) =>
                  setInstructions((current) => ({
                    ...current,
                    initiativeType: deliveryType,
                    aiLevel,
                    customInstructions: current.customInstructions.filter((instruction) => instruction.id !== instructionId)
                  }))
                }
                onMove={moveCustomInstruction}
              />

              <div className="space-y-5">
                <div>
                  <p className="font-medium text-foreground">{t(language, "Generated export guidance", "Genererad exportvägledning")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t(language, "This structured package follows the export automatically when Downstream AI Tuning is present.", "Det här strukturerade paketet följer automatiskt med exporten när Downstream AI-tuning finns.")}
                  </p>
                </div>

                {generatedGuideSections.map(([title, lines]) => (
                  <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4" key={title}>
                    <p className="font-medium text-foreground">{title}</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                      {lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                  <p className="font-medium text-foreground">{t(language, "Overrides from Suggested Profile", "Avvikelser från föreslagen profil")}</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                    {analysis.generatedGuidance.deviationsSummary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                  <p className="font-medium text-foreground">{t(language, "Custom Instruction Appendix", "Bilaga med egna instruktioner")}</p>
                  {analysis.generatedGuidance.customInstructionAppendix.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {analysis.generatedGuidance.customInstructionAppendix.map((instruction) => (
                        <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={`${instruction.priority}-${instruction.title}`}>
                          <p className="font-medium text-foreground">{instruction.title || t(language, "Untitled instruction", "Namnlös instruktion")}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{instruction.category} · {instruction.priority}</p>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{instruction.body || t(language, "No body captured yet.", "Ingen brödtext fångad ännu.")}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">{t(language, "No custom instructions added.", "Inga egna instruktioner tillagda.")}</p>
                  )}
                </div>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "Warnings / Validation Notes", "Varningar / valideringsnoteringar")}</CardTitle>
          <CardDescription>{t(language, "Review validation issues and warnings before exporting the Framing package downstream.", "Granska valideringsproblem och varningar innan Framing-paketet exporteras vidare.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.hardIssues.length > 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
              <p className="font-medium">{t(language, "Hard validation issues", "Hårda valideringsproblem")}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.hardIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.warnings.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              <p className="font-medium">{t(language, "Warnings", "Varningar")}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.hardIssues.length === 0 && analysis.warnings.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              {t(language, "No active warnings or hard validation issues right now.", "Inga aktiva varningar eller hårda valideringsproblem just nu.")}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <form action={saveAction}>
            <input name="outcomeId" type="hidden" value={data.outcome.id} />
            <input name="downstreamAiInstructionsJson" type="hidden" value={serializedInstructions} />
            <Button type="submit">{t(language, "Save Downstream AI Tuning", "Spara downstream AI-tuning")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

