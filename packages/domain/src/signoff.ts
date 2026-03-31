import { z } from "zod";
import {
  organizationSideSchema,
  partyRoleTypeSchema,
  signoffDecisionKindSchema,
  signoffDecisionStatusSchema,
  tollgateEntityTypeSchema,
  tollgateTypeSchema
} from "./enums";

export const signoffRecordSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  entityType: tollgateEntityTypeSchema,
  entityId: z.string().min(1),
  entityVersion: z.number().int().positive().nullish(),
  tollgateId: z.string().min(1).nullish(),
  tollgateType: tollgateTypeSchema.nullish(),
  decisionKind: signoffDecisionKindSchema,
  requiredRoleType: partyRoleTypeSchema,
  actualPartyRoleEntryId: z.string().min(1),
  actualPersonName: z.string().min(1),
  actualPersonEmail: z.string().email(),
  actualRoleTitle: z.string().min(1),
  organizationSide: organizationSideSchema,
  decisionStatus: signoffDecisionStatusSchema,
  note: z.string().nullish(),
  evidenceReference: z.string().nullish(),
  createdBy: z.string().nullish(),
  createdAt: z.date()
});

export const signoffRecordCreateInputSchema = signoffRecordSchema.omit({
  id: true,
  actualPersonName: true,
  actualPersonEmail: true,
  actualRoleTitle: true,
  createdAt: true
});

export const recordTollgateDecisionInputSchema = signoffRecordCreateInputSchema.extend({
  actorId: z.string().nullish(),
  aiAccelerationLevel: z.enum(["level_1", "level_2", "level_3"])
});

export const signoffDecisionRequirementSchema = z.object({
  decisionKind: signoffDecisionKindSchema,
  roleType: partyRoleTypeSchema,
  organizationSide: organizationSideSchema,
  label: z.string().min(1)
});

export const signoffActionStateSchema = z.object({
  decisionKind: signoffDecisionKindSchema,
  roleType: partyRoleTypeSchema,
  organizationSide: organizationSideSchema,
  label: z.string().min(1),
  assignedPeople: z.array(
    z.object({
      partyRoleEntryId: z.string().min(1),
      fullName: z.string().min(1),
      email: z.string().email(),
      roleTitle: z.string().min(1)
    })
  ),
  completedRecords: z.array(signoffRecordSchema),
  pending: z.boolean(),
  blockedReasons: z.array(z.string().min(1))
});

export type SignoffRecord = z.infer<typeof signoffRecordSchema>;
export type SignoffRecordCreateInput = z.infer<typeof signoffRecordCreateInputSchema>;
export type RecordTollgateDecisionInput = z.infer<typeof recordTollgateDecisionInputSchema>;
export type SignoffDecisionRequirement = z.infer<typeof signoffDecisionRequirementSchema>;
export type SignoffActionState = z.infer<typeof signoffActionStateSchema>;
