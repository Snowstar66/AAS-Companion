import { z } from "zod";
import {
  governedLifecycleStateSchema,
  governedRemovalActionKindSchema,
  governedValueSpineObjectTypeSchema
} from "./enums";

export const governedChildImpactSchema = z.object({
  objectType: governedValueSpineObjectTypeSchema,
  id: z.string().min(1),
  key: z.string().min(1),
  title: z.string().min(1),
  lifecycleState: governedLifecycleStateSchema
});

export const governedRemovalGovernanceImpactSchema = z.object({
  activityEventCount: z.number().int().nonnegative(),
  tollgateCount: z.number().int().nonnegative(),
  hasLineage: z.boolean(),
  importedReadinessState: z.string().nullish()
});

export const governedActionPreviewSchema = z.object({
  kind: governedRemovalActionKindSchema,
  allowed: z.boolean(),
  reversible: z.boolean(),
  reasonRequired: z.boolean(),
  summary: z.string().min(1),
  blockers: z.array(z.string().min(1)),
  affectedChildren: z.array(governedChildImpactSchema),
  affectedActiveChildCount: z.number().int().nonnegative(),
  governanceImpact: governedRemovalGovernanceImpactSchema
});

export const governedRemovalDecisionSchema = z.object({
  objectType: governedValueSpineObjectTypeSchema,
  lifecycleState: governedLifecycleStateSchema,
  recommendedAction: governedRemovalActionKindSchema,
  hardDelete: governedActionPreviewSchema,
  archive: governedActionPreviewSchema,
  restore: governedActionPreviewSchema
});

export type GovernedChildImpact = z.infer<typeof governedChildImpactSchema>;
export type GovernedRemovalGovernanceImpact = z.infer<typeof governedRemovalGovernanceImpactSchema>;
export type GovernedActionPreview = z.infer<typeof governedActionPreviewSchema>;
export type GovernedRemovalDecision = z.infer<typeof governedRemovalDecisionSchema>;

export type GovernedRemovalContext = {
  objectType: z.infer<typeof governedValueSpineObjectTypeSchema>;
  key: string;
  title: string;
  originType: "seeded" | "native" | "imported";
  createdMode: "demo" | "clean" | "promotion";
  lifecycleState: "active" | "archived";
  status: string;
  lineageReference?: {
    sourceType: string;
    sourceId: string;
    note?: string | null;
  } | null;
  importedReadinessState?: string | null;
  activityEventCount: number;
  tollgateCount: number;
  activeChildren: GovernedChildImpact[];
  archivedAncestorLabels?: string[];
};

function objectLabel(objectType: GovernedRemovalContext["objectType"]) {
  if (objectType === "test") {
    return "Test";
  }

  return objectType.charAt(0).toUpperCase() + objectType.slice(1);
}

function childSummary(children: GovernedChildImpact[]) {
  if (children.length === 0) {
    return "No child objects are affected.";
  }

  return `${children.length} child object${children.length === 1 ? "" : "s"} will be affected.`;
}

function buildGovernanceImpact(input: GovernedRemovalContext): GovernedRemovalGovernanceImpact {
  return {
    activityEventCount: input.activityEventCount,
    tollgateCount: input.tollgateCount,
    hasLineage: Boolean(input.lineageReference?.sourceId),
    importedReadinessState: input.importedReadinessState ?? null
  };
}

function getHardDeleteBlockers(input: GovernedRemovalContext) {
  const blockers: string[] = [];

  if (input.lifecycleState === "archived") {
    blockers.push("Archived objects cannot be hard deleted through the normal workspace flow.");
  }

  if (input.originType !== "native") {
    blockers.push("Only native objects can be hard deleted.");
  }

  if (input.status !== "draft") {
    blockers.push("Hard delete is limited to draft objects.");
  }

  if (input.tollgateCount > 0) {
    blockers.push("Hard delete is blocked because governance or tollgate state already exists.");
  }

  if (input.activityEventCount > 1) {
    blockers.push("Hard delete is blocked because the object already has meaningful activity history.");
  }

  if (input.lineageReference?.sourceId) {
    blockers.push("Hard delete is blocked because lineage traceability already exists.");
  }

  if (input.importedReadinessState) {
    blockers.push("Hard delete is blocked because imported readiness state is already attached.");
  }

  if (input.activeChildren.length > 0) {
    blockers.push("Hard delete is blocked because active child objects must be withdrawn with archive semantics.");
  }

  return blockers;
}

function buildBlockedPreview(
  kind: GovernedActionPreview["kind"],
  summary: string,
  input: GovernedRemovalContext,
  blockers: string[],
  reversible: boolean,
  reasonRequired: boolean
): GovernedActionPreview {
  return {
    kind,
    allowed: false,
    reversible,
    reasonRequired,
    summary,
    blockers,
    affectedChildren: input.activeChildren,
    affectedActiveChildCount: input.activeChildren.length,
    governanceImpact: buildGovernanceImpact(input)
  };
}

export function buildGovernedRemovalDecision(input: GovernedRemovalContext): GovernedRemovalDecision {
  const label = objectLabel(input.objectType);
  const governanceImpact = buildGovernanceImpact(input);

  if (input.lifecycleState === "archived") {
    const restoreBlockers = input.archivedAncestorLabels?.length
      ? [
          `Restore is blocked until archived parent context is active again: ${input.archivedAncestorLabels.join(", ")}.`
        ]
      : [];

    return {
      objectType: input.objectType,
      lifecycleState: input.lifecycleState,
      recommendedAction: restoreBlockers.length === 0 ? "restore" : "blocked",
      hardDelete: buildBlockedPreview(
        "hard_delete",
        `${label} is archived, so hard delete is not available from the governed workspace flow.`,
        input,
        ["Restore or retain the archived object instead of hard deleting it here."],
        false,
        false
      ),
      archive: buildBlockedPreview(
        "archive",
        `${label} is already archived.`,
        input,
        ["No additional archive action is needed."],
        true,
        true
      ),
      restore: {
        kind: "restore",
        allowed: restoreBlockers.length === 0,
        reversible: true,
        reasonRequired: false,
        summary:
          restoreBlockers.length === 0
            ? `${label} can be restored to active work. ${childSummary(input.activeChildren)}`
            : `${label} cannot be restored yet.`,
        blockers: restoreBlockers,
        affectedChildren: input.activeChildren,
        affectedActiveChildCount: input.activeChildren.length,
        governanceImpact
      }
    };
  }

  const hardDeleteBlockers = getHardDeleteBlockers(input);
  const hardDeleteAllowed = hardDeleteBlockers.length === 0;

  return {
    objectType: input.objectType,
    lifecycleState: input.lifecycleState,
    recommendedAction: hardDeleteAllowed ? "hard_delete" : "archive",
    hardDelete: {
      kind: "hard_delete",
      allowed: hardDeleteAllowed,
      reversible: false,
      reasonRequired: false,
      summary: hardDeleteAllowed
        ? `${label} is still an eligible native draft. It can be permanently deleted. ${childSummary(input.activeChildren)}`
        : `Hard delete is not allowed for this ${label.toLowerCase()}.`,
      blockers: hardDeleteBlockers,
      affectedChildren: input.activeChildren,
      affectedActiveChildCount: input.activeChildren.length,
      governanceImpact
    },
    archive: {
      kind: "archive",
      allowed: true,
      reversible: true,
      reasonRequired: true,
      summary:
        input.activeChildren.length > 0
          ? `${label} will be archived together with ${input.activeChildren.length} active child object${
              input.activeChildren.length === 1 ? "" : "s"
            }.`
          : `${label} will be removed from active working views while preserving traceability.`,
      blockers: [],
      affectedChildren: input.activeChildren,
      affectedActiveChildCount: input.activeChildren.length,
      governanceImpact
    },
    restore: buildBlockedPreview(
      "restore",
      `${label} is already active.`,
      input,
      ["Restore becomes available only after the object has been archived."],
      true,
      false
    )
  };
}
