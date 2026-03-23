import { z } from "zod";
import { membershipRoleSchema } from "./enums";

export const organizationContextSchema = z.object({
  organizationId: z.string().min(1),
  organizationName: z.string().min(1),
  organizationSlug: z.string().min(1),
  role: membershipRoleSchema
});

export const organizationSummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type OrganizationContext = z.infer<typeof organizationContextSchema>;
export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;
