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

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Open, resume, or create projects."
  },
  {
    label: "Admin",
    href: "/admin",
    description: "Bulk cleanup and hard deletion of test projects."
  },
  {
    label: "Framing",
    href: "/framing",
    description: "Business case, baseline, owner, and direction."
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Commercial fit, readiness, risks, and model advice."
  },
  {
    label: "Value Spine",
    href: "/workspace",
    description: "Framing, Epics, Stories, and readiness in one spine."
  },
  {
    label: "Import",
    href: "/intake",
    description: "Upload and parse external source artifacts."
  },
  {
    label: "Human Review",
    href: "/review",
    description: "Review, correct, confirm, and approve imports."
  },
  {
    label: "Governance",
    href: "/governance",
    description: "Roles, AI level, risks, and sign-off traceability."
  },
  {
    label: "Help",
    href: "/help",
    description: "Method guide, process flow, and key concepts."
  }
];

export const dashboardHighlights: DashboardHighlight[] = [
  {
    title: "Project packages",
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
    description: "Value owner, AIDA, AQA, architect, delivery lead, and builder are available in Demo."
  }
];
