import { z } from "zod";
import {
  aiAccelerationLevelSchema,
  membershipRoleSchema,
  tollgateEntityTypeSchema,
  tollgateStatusSchema,
  tollgateTypeSchema
} from "./enums";
import { signoffDecisionRequirementSchema, type SignoffDecisionRequirement, type SignoffRecord } from "./signoff";

export const tollgateRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  entityType: tollgateEntityTypeSchema,
  entityId: z.string().min(1),
  tollgateType: tollgateTypeSchema,
  status: tollgateStatusSchema,
  blockers: z.array(z.string().min(1)).default([]),
  approverRoles: z.array(membershipRoleSchema).default([]),
  submissionVersion: z.number().int().positive().nullish(),
  approvedVersion: z.number().int().positive().nullish(),
  approvalSnapshot: z.unknown().nullish(),
  decidedBy: z.string().nullish(),
  decidedAt: z.date().nullish(),
  comments: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const tollgateUpsertInputSchema = tollgateRecordSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    actorId: z.string().nullish()
  });

export const tollgateDecisionProfileSchema = z.object({
  reviewRequirements: z.array(signoffDecisionRequirementSchema),
  approvalRequirements: z.array(signoffDecisionRequirementSchema)
});

export type TollgateRecord = z.infer<typeof tollgateRecordSchema>;
export type TollgateUpsertInput = z.infer<typeof tollgateUpsertInputSchema>;
export type TollgateDecisionProfile = z.infer<typeof tollgateDecisionProfileSchema>;

function buildRequirement(
  decisionKind: "review" | "approval",
  roleType: SignoffDecisionRequirement["roleType"],
  organizationSide: SignoffDecisionRequirement["organizationSide"],
  label: string
) {
  return signoffDecisionRequirementSchema.parse({
    decisionKind,
    roleType,
    organizationSide,
    label
  });
}

export function getTollgateDecisionProfile(input: {
  tollgateType: TollgateRecord["tollgateType"];
  aiAccelerationLevel: z.infer<typeof aiAccelerationLevelSchema>;
}) {
  if (input.tollgateType === "tg1_baseline") {
    return tollgateDecisionProfileSchema.parse({
      reviewRequirements: [
        buildRequirement("review", "architect", "supplier", "Architecture review"),
        ...(input.aiAccelerationLevel === "level_3"
          ? [buildRequirement("review", "ai_governance_lead", "supplier", "AI governance review")]
          : [])
      ],
      approvalRequirements: [
        buildRequirement("approval", "value_owner", "customer", "Business value approval"),
        ...(input.aiAccelerationLevel === "level_3"
          ? [buildRequirement("approval", "customer_sponsor", "customer", "Sponsor sign-off")]
          : [])
      ]
    });
  }

  return tollgateDecisionProfileSchema.parse({
    reviewRequirements: [
      buildRequirement("review", "aqa", "supplier", "Quality review"),
      ...(input.aiAccelerationLevel === "level_3"
        ? [buildRequirement("review", "ai_governance_lead", "supplier", "AI governance review")]
        : [])
    ],
    approvalRequirements: [
      buildRequirement("approval", "delivery_lead", "supplier", "Delivery approval"),
      ...(input.aiAccelerationLevel === "level_3"
        ? [buildRequirement("approval", "risk_owner", "customer", "Risk acceptance")]
        : [])
    ]
  });
}

export function summarizeTollgateFromSignoffs(input: {
  blockers: string[];
  profile: TollgateDecisionProfile;
  signoffs: SignoffRecord[];
}) {
  const decisionRequirements = [...input.profile.reviewRequirements, ...input.profile.approvalRequirements];
  const rejectedOrChanged = input.signoffs.filter(
    (record) => record.decisionStatus === "rejected" || record.decisionStatus === "changes_requested"
  );

  if (input.blockers.length > 0 || rejectedOrChanged.length > 0) {
    return {
      status: "blocked" as const,
      pendingRequirements: decisionRequirements
    };
  }

  const approvedKeys = new Set(
    input.signoffs
      .filter((record) => record.decisionStatus === "approved")
      .map((record) => `${record.decisionKind}:${record.requiredRoleType}:${record.organizationSide}`)
  );

  const pendingRequirements = decisionRequirements.filter(
    (requirement) => !approvedKeys.has(`${requirement.decisionKind}:${requirement.roleType}:${requirement.organizationSide}`)
  );

  return {
    status: pendingRequirements.length === 0 ? ("approved" as const) : ("ready" as const),
    pendingRequirements
  };
}
