import type { MembershipRole } from "./enums";
import type { AppSession } from "./auth";
import type { OrganizationContext } from "./organization";

export const DEMO_IDS = {
  organizationId: "org_demo_control_plane",
  users: {
    valueOwner: "user_demo_value_owner",
    aida: "user_demo_aida",
    aqa: "user_demo_aqa",
    architect: "user_demo_architect",
    deliveryLead: "user_demo_delivery_lead",
    builder: "user_demo_builder"
  },
  outcomes: {
    primary: "outcome_demo_governance_gap"
  },
  epicId: "epic_demo_framing",
  stories: {
    blocked: "story_demo_outcome_workspace",
    ready: "story_demo_execution_contract",
    draft: "story_demo_activity_timeline"
  },
  tollgateId: "tollgate_demo_baseline_blocked"
} as const;

export const DEMO_ORGANIZATION: OrganizationContext = {
  organizationId: DEMO_IDS.organizationId,
  organizationName: "OrderFlow AAS Test Organization",
  organizationSlug: "aas-demo-org",
  role: "value_owner"
};

export const DEMO_SESSION: AppSession = {
  mode: "demo",
  userId: DEMO_IDS.users.valueOwner,
  email: "value.owner@orderflow-aas.local",
  displayName: "Anna Lund",
  organization: DEMO_ORGANIZATION
};

export const demoMembershipRoles: MembershipRole[] = [
  "value_owner",
  "aida",
  "aqa",
  "architect",
  "delivery_lead",
  "builder"
];
