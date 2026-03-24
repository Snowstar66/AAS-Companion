import { z } from "zod";
import {
  governedObjectCreatedModeSchema,
  governedLifecycleStateSchema,
  governedObjectOriginTypeSchema,
  lineageSourceTypeSchema,
  readinessBlockReasonSeveritySchema,
  readinessStateSchema
} from "./enums";

const DEMO_ORGANIZATION_ID = "org_demo_control_plane";

export const governedLineageReferenceSchema = z.object({
  sourceType: lineageSourceTypeSchema,
  sourceId: z.string().min(1),
  note: z.string().min(1).nullish()
});

export const governedObjectProvenanceSchema = z.object({
  originType: governedObjectOriginTypeSchema,
  createdMode: governedObjectCreatedModeSchema,
  lineageReference: governedLineageReferenceSchema.nullish()
}).superRefine((value, context) => {
  if (value.originType === "seeded" && value.createdMode !== "demo") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Seeded governed objects must use demo created mode.",
      path: ["createdMode"]
    });
  }

  if (value.originType === "native" && !["demo", "clean"].includes(value.createdMode)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Native governed objects must use demo or clean created mode.",
      path: ["createdMode"]
    });
  }

  if (value.originType === "imported" && value.createdMode !== "promotion") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Imported governed objects must use promotion created mode.",
      path: ["createdMode"]
    });
  }

  if (value.createdMode === "promotion" && value.originType !== "imported") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Promotion mode is reserved for imported governed objects.",
      path: ["originType"]
    });
  }

  if (value.originType === "imported" && !value.lineageReference) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Imported governed objects require a lineage reference.",
      path: ["lineageReference"]
    });
  }
});

export const governedObjectProvenanceInputSchema = z
  .object({
    originType: governedObjectOriginTypeSchema.optional(),
    createdMode: governedObjectCreatedModeSchema.optional(),
    lineageReference: governedLineageReferenceSchema.nullish()
  })
  .superRefine((value, context) => {
    if ((value.originType && !value.createdMode) || (!value.originType && value.createdMode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "originType and createdMode must be provided together when overriding provenance."
      });
      return;
    }

    if (value.originType && value.createdMode) {
      const parsed = governedObjectProvenanceSchema.safeParse({
        originType: value.originType,
        createdMode: value.createdMode,
        lineageReference: value.lineageReference ?? null
      });

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          context.addIssue(issue);
        }
      }
    }
  });

export const readinessBlockReasonSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  severity: readinessBlockReasonSeveritySchema
});

export const readinessAssessmentSchema = z.object({
  state: readinessStateSchema,
  reasons: z.array(readinessBlockReasonSchema)
});

export const governedLifecycleSchema = z.object({
  lifecycleState: governedLifecycleStateSchema,
  archivedAt: z.date().nullish(),
  archiveReason: z.string().min(1).nullish()
});

export type GovernedLineageReference = z.infer<typeof governedLineageReferenceSchema>;
export type GovernedObjectProvenance = z.infer<typeof governedObjectProvenanceSchema>;
export type GovernedObjectProvenanceInput = z.infer<typeof governedObjectProvenanceInputSchema>;
export type ReadinessBlockReason = z.infer<typeof readinessBlockReasonSchema>;
export type ReadinessAssessment = z.infer<typeof readinessAssessmentSchema>;
export type GovernedLifecycle = z.infer<typeof governedLifecycleSchema>;

export function inferCreatedModeForOrganization(organizationId: string) {
  return organizationId === DEMO_ORGANIZATION_ID ? "demo" : "clean";
}

export function createNativeProvenance(input: {
  organizationId: string;
  lineageReference?: GovernedLineageReference | null;
}): GovernedObjectProvenance {
  return {
    originType: "native",
    createdMode: inferCreatedModeForOrganization(input.organizationId),
    lineageReference: input.lineageReference ?? null
  };
}

export function createSeededProvenance(
  lineageReference: GovernedLineageReference | null = null
): GovernedObjectProvenance {
  return {
    originType: "seeded",
    createdMode: "demo",
    lineageReference
  };
}

export function createImportedPromotionProvenance(lineageReference: GovernedLineageReference): GovernedObjectProvenance {
  return {
    originType: "imported",
    createdMode: "promotion",
    lineageReference
  };
}

export function createReadinessAssessment(input: {
  reasons: ReadinessBlockReason[];
  isReadyForProgression?: boolean;
}): ReadinessAssessment {
  if (input.reasons.length > 0) {
    return {
      state: "blocked",
      reasons: input.reasons
    };
  }

  if (input.isReadyForProgression === false) {
    return {
      state: "in_progress",
      reasons: []
    };
  }

  return {
    state: "ready",
    reasons: []
  };
}
