import { membershipRoleSchema, membershipRoles, type MembershipRole } from "./enums";

export { membershipRoleSchema, membershipRoles };
export type { MembershipRole };

export const membershipRoleLabels: Record<MembershipRole, string> = {
  value_owner: "Value Owner",
  aida: "AIDA",
  aqa: "AQA",
  architect: "Architect",
  delivery_lead: "Delivery Lead",
  builder: "Builder"
};
