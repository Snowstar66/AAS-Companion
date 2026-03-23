export * from "./activity";
export * from "./auth";
export * from "./enums";
export * from "./organization";
export * from "./outcome";
export * from "./roles";
export * from "./story";
export * from "./tollgate";
export * from "./validators";

import type { MembershipRole } from "./enums";
import type { OrganizationContext } from "./organization";
import type { AppSession } from "./auth";

export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export type DashboardHighlight = {
  title: string;
  value: string;
  description: string;
};

export const DEMO_SESSION_COOKIE_NAME = "aas-demo-session";
export const ORG_CONTEXT_COOKIE_NAME = "aas-org-context";

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
    draft: "outcome_demo_governance_gap",
    almostReady: "outcome_demo_outcome_readiness"
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
  organizationName: "AAS Demo Organization",
  organizationSlug: "aas-demo-org",
  role: "value_owner"
};

export const DEMO_SESSION: AppSession = {
  mode: "demo",
  userId: DEMO_IDS.users.valueOwner,
  email: "value.owner@aas-companion.local",
  displayName: "Demo Value Owner",
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

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    description: "System overview and milestone status."
  },
  {
    label: "Framing",
    href: "/framing",
    description: "Outcome framing and baseline readiness."
  },
  {
    label: "Outcomes",
    href: "/outcomes",
    description: "Outcome workspace and tollgate progress."
  },
  {
    label: "Stories",
    href: "/stories",
    description: "Story workspace and validation checkpoints."
  },
  {
    label: "Governance",
    href: "/governance",
    description: "AI level, risk posture, and review traceability."
  }
];

export const dashboardHighlights: DashboardHighlight[] = [
  {
    title: "Workspace packages",
    value: "6",
    description: "Dedicated packages for UI, domain, DB, API, telemetry, and config."
  },
  {
    title: "Approved AI level",
    value: "Level 2",
    description: "Architecture remains ready for Level 3 without widening scope today."
  },
  {
    title: "Human review gate",
    value: "After Story 003",
    description: "Execution must stop for structure and naming review before UI expansion."
  },
  {
    title: "Demo roles",
    value: "6",
    description: "Value owner, AIDA, AQA, architect, delivery lead, and builder are seeded."
  }
];
