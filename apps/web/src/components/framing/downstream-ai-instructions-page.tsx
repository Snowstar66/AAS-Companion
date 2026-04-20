"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { getOutcomeWorkspaceService } from "@aas-companion/api";
import { CustomInstructionsEditor } from "@/components/framing/custom-instructions-editor";
import { DownstreamAiInstructionSection } from "@/components/framing/downstream-ai-instruction-section";
import {
  createDefaultDownstreamAiInstructions,
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
  flash?: {
    save?: "success" | "error" | null;
    message?: string | null;
  };
};

const groupDescriptions: Record<DownstreamPreferenceGroup, string> = {
  epic: "Configure how downstream AI should shape and decompose Epics before later Design and Build steps.",
  story: "Control how downstream AI should refine Story Ideas into clearer, more testable, context-aware candidates.",
  journey: "Control how downstream AI should use Journey Context when it exists and how it should behave when it does not.",
  design: "Guide how downstream AI should behave in Design while inheriting source-of-truth constraints and guidance.",
  build: "Guide how downstream AI should behave in Build around traceability, review, testing, release evidence, and rollout."
};

const groupOrder: DownstreamPreferenceGroup[] = ["epic", "story", "journey", "design", "build"];

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

function normalizeInitiativeType(value: unknown) {
  return value === "AD" || value === "AT" || value === "AM" ? value : null;
}

export function DownstreamAiInstructionsPage({ data, saveAction, flash }: DownstreamAiInstructionsPageProps) {
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

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Downstream AI Instructions</CardTitle>
          <CardDescription>
            Configure how downstream AI should interpret and refine this Framing package during later Design and Build steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              Initiative Type: {deliveryType}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              AI Level: {aiLevel}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Configurable preferences</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{instructions.refinementPreferences.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Deviations from defaults</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{analysis.deviations.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">N/A selections</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{naCount}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Custom instructions</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{instructions.customInstructions.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            Use this page to control how downstream AI should refine Epics, Story Ideas, Journey Context, Design, and Build behavior before export. The settings here do not replace the main Framing structure - they guide how AI should work with it.
          </div>

          {flash?.save === "success" ? <FlashBanner message="Downstream AI Instructions saved to the Framing package." tone="success" /> : null}
          {flash?.save === "error" && flash.message ? <FlashBanner message={flash.message} tone="error" /> : null}

          {!downstreamAiInstructionsStorageAvailable ? (
            <FlashBanner
              message="Downstream AI Instructions are visible, but the latest database migration is not applied yet. The page still loads, but changes cannot be saved until the migration runs."
              tone="error"
            />
          ) : null}

          {normalizeInitiativeType(data.outcome.deliveryType) ? null : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Delivery type is not set in Framing Overview, so this page is currently using a fallback initiative type of {deliveryType} for defaults.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <form action={saveAction}>
              <input name="outcomeId" type="hidden" value={data.outcome.id} />
              <input name="downstreamAiInstructionsJson" type="hidden" value={serializedInstructions} />
              <Button type="submit">Save Downstream AI Instructions</Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Always-on Controls</CardTitle>
          <CardDescription>These controls always apply to downstream AI behavior and are included in export automatically.</CardDescription>
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
                  Always on
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Refinement Preferences</CardTitle>
          <CardDescription>
            Configure the dimensions where downstream AI should be explicit. Use N/A only when you intentionally want to leave a refinement decision open for downstream AI. N/A does not disable mandatory controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            N/A helper: Use N/A only when you intentionally want to leave a refinement decision open for downstream AI. N/A does not disable mandatory controls.
          </div>
        </CardContent>
      </Card>

      {groupOrder.map((group) => (
        <DownstreamAiInstructionSection
          description={groupDescriptions[group]}
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

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Warnings / Validation Notes</CardTitle>
          <CardDescription>Review validation issues and warnings before exporting the Framing package downstream.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.hardIssues.length > 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
              <p className="font-medium">Hard validation issues</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.hardIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.warnings.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              <p className="font-medium">Warnings</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {analysis.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {analysis.hardIssues.length === 0 && analysis.warnings.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              No active warnings or hard validation issues right now.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Generated Downstream Guidance</CardTitle>
          <CardDescription>
            This is the structured guidance package that will be included in export when Downstream AI Instructions are present.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
            <p className="font-medium text-foreground">Deviations from Recommended Defaults</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {analysis.generatedGuidance.deviationsSummary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
            <p className="font-medium text-foreground">Custom Instruction Appendix</p>
            {analysis.generatedGuidance.customInstructionAppendix.length > 0 ? (
              <div className="mt-3 space-y-3">
                {analysis.generatedGuidance.customInstructionAppendix.map((instruction) => (
                  <div className="rounded-2xl border border-border/70 bg-background px-4 py-4" key={`${instruction.priority}-${instruction.title}`}>
                    <p className="font-medium text-foreground">{instruction.title || "Untitled instruction"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{instruction.category} · {instruction.priority}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{instruction.body || "No body captured yet."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No custom instructions added.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <form action={saveAction}>
            <input name="outcomeId" type="hidden" value={data.outcome.id} />
            <input name="downstreamAiInstructionsJson" type="hidden" value={serializedInstructions} />
            <Button type="submit">Save Downstream AI Instructions</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
