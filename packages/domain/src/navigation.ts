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
    description: "Choose, resume, or create a project."
  },
  {
    label: "Framing",
    href: "/framing",
    description: "Define the business case and baseline for the active project."
  },
  {
    label: "Value Spine",
    href: "/workspace",
    description: "Inspect the active project's Framing, Epics, and Stories in one spine."
  },
  {
    label: "Import",
    href: "/intake",
    description: "Import external source artifacts into the active project."
  },
  {
    label: "Human Review",
    href: "/review",
    description: "Clear approval-readiness actions before promotion into the active project."
  },
  {
    label: "Governance",
    href: "/governance",
    description: "See AI level, risk posture, and traceability for the active project."
  },
  {
    label: "Help",
    href: "/help",
    description: "Understand what the tool is for and how Framing, Design and AI Build fit together."
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
