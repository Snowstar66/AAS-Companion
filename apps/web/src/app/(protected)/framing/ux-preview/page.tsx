import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  FileText,
  LayoutDashboard,
  MonitorSmartphone,
  Palette,
  PenTool,
  Smartphone,
  Workflow
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";

type UxProfileKey =
  | "enterprise-control-plane"
  | "operational-workflow"
  | "customer-portal"
  | "creative-workspace"
  | "knowledge-hub"
  | "minimal-utility";

type TargetSurfaceKey = "responsive-web" | "desktop-web" | "mobile-app" | "omnichannel";
type ColorSchemaKey = "nordic-blue" | "forest-green" | "warm-amber" | "violet-studio" | "graphite";

type UxPreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const profiles: Array<{
  key: UxProfileKey;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  accent: string;
  tint: string;
  border: string;
  description: string;
  bestFor: string[];
  sampleNav: string[];
  sampleWork: string[];
  statusLabel: string;
  signatureComponents: Array<{
    name: string;
    role: string;
    usage: string;
  }>;
  visualGrammar: string[];
  instruction: string;
}> = [
  {
    key: "enterprise-control-plane",
    label: "Enterprise control plane",
    shortLabel: "Control plane",
    icon: LayoutDashboard,
    accent: "bg-sky-700 text-white",
    tint: "bg-sky-50",
    border: "border-sky-200",
    description: "Structured governance, status, readiness, and repeatable operational work.",
    bestFor: ["Internal SaaS", "Governance", "Dashboards", "Approval flows"],
    sampleNav: ["Dashboard", "Framing", "Review", "Governance"],
    sampleWork: ["Outcome readiness", "Tollgate status", "Owner action list"],
    statusLabel: "Ready for approval",
    signatureComponents: [
      {
        name: "Approval matrix",
        role: "Decision table",
        usage: "Use for governance-heavy screens where owners, evidence, risk, and approval state must be compared."
      },
      {
        name: "Audit trail rail",
        role: "Right-side context",
        usage: "Use beside forms and review screens to keep version, reviewer, timestamp, and decision history visible."
      },
      {
        name: "Readiness scorecard",
        role: "Status dashboard",
        usage: "Use when multiple criteria must be scanned before a tollgate, release, or portfolio decision."
      }
    ],
    visualGrammar: [
      "Use dense control-plane layouts with compact rectangular cards, tables, right rails, and persistent navigation.",
      "Prefer squared or small-radius controls, clear borders, muted surfaces, and high information density.",
      "Place owner, status, evidence, version, and governance action together so the decision context is never hidden."
    ],
    instruction:
      "Use a calm enterprise SaaS control-plane UX with compact workspaces, clear status/readiness signals, persistent navigation, and governance-aware actions."
  },
  {
    key: "operational-workflow",
    label: "Operational workflow tool",
    shortLabel: "Workflow",
    icon: Workflow,
    accent: "bg-emerald-700 text-white",
    tint: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Stepwise work, queues, checklists, handoffs, and exception handling.",
    bestFor: ["Case work", "Service operations", "Back-office flows", "Task queues"],
    sampleNav: ["Queue", "In progress", "Blocked", "Done"],
    sampleWork: ["Next task", "SLA risk", "Handoff checklist"],
    statusLabel: "3 tasks due",
    signatureComponents: [
      {
        name: "Queue lane board",
        role: "Primary workspace",
        usage: "Use when the user processes repeated work items across New, In progress, Blocked, and Done states."
      },
      {
        name: "SLA task card",
        role: "Operational card",
        usage: "Use for each work item so due time, owner, blocker, and next action are visible without opening details."
      },
      {
        name: "Handoff checklist",
        role: "Completion control",
        usage: "Use before moving work between roles, teams, or lifecycle states."
      }
    ],
    visualGrammar: [
      "Use queue/lane layouts, stacked task cards, checklist rows, compact state chips, and visible due-time pressure.",
      "Make primary actions short and repeated; keep escalation and handoff controls close to the work item.",
      "Favor operational rhythm over decoration: columns, lanes, progress, blockers, owner, next action."
    ],
    instruction:
      "Use an operational workflow UX with strong task hierarchy, queue visibility, checklist states, escalation points, and fast repeated actions."
  },
  {
    key: "customer-portal",
    label: "Customer portal",
    shortLabel: "Portal",
    icon: BriefcaseBusiness,
    accent: "bg-cyan-700 text-white",
    tint: "bg-cyan-50",
    border: "border-cyan-200",
    description: "External-facing clarity for status, documents, messages, and approvals.",
    bestFor: ["Client portals", "Status tracking", "Document exchange", "Approvals"],
    sampleNav: ["Overview", "Documents", "Messages", "Approvals"],
    sampleWork: ["Project status", "Required input", "Latest decision"],
    statusLabel: "Input requested",
    signatureComponents: [
      {
        name: "Status timeline",
        role: "Customer progress",
        usage: "Use to explain where the customer is in the process and what has happened so far."
      },
      {
        name: "Input request card",
        role: "Customer action",
        usage: "Use for document uploads, approvals, and questions where the customer needs one clear next step."
      },
      {
        name: "Message thread",
        role: "Trust surface",
        usage: "Use when customer communication needs context, plain language, and visible response expectations."
      }
    ],
    visualGrammar: [
      "Use spacious customer-facing panels, friendly rounded cards, plain-language status summaries, and obvious next steps.",
      "Avoid internal terms; put documents, messages, approvals, and support actions in language a customer would understand.",
      "Prefer reassurance, progress, and clarity over dense admin controls."
    ],
    instruction:
      "Use a customer portal UX with plain-language status, confidence-building summaries, transparent next steps, and minimal internal jargon."
  },
  {
    key: "creative-workspace",
    label: "Creative workspace",
    shortLabel: "Workspace",
    icon: PenTool,
    accent: "bg-violet-700 text-white",
    tint: "bg-violet-50",
    border: "border-violet-200",
    description: "Exploration, drafting, ideation, AI collaboration, and flexible canvases.",
    bestFor: ["Research", "Ideation", "Writing", "AI-assisted design"],
    sampleNav: ["Canvas", "Sources", "Drafts", "Review"],
    sampleWork: ["Idea cluster", "AI suggestion", "Draft direction"],
    statusLabel: "Draft evolving",
    signatureComponents: [
      {
        name: "Canvas note cluster",
        role: "Exploration space",
        usage: "Use for ideas, user quotes, risks, and AI suggestions that need to be compared before structure hardens."
      },
      {
        name: "Source tray",
        role: "Evidence shelf",
        usage: "Use to keep interviews, research, uploaded material, and AI synthesis visible while drafting."
      },
      {
        name: "Decision frame",
        role: "Synthesis component",
        usage: "Use when turning messy exploration into a clear direction, assumption, or next experiment."
      }
    ],
    visualGrammar: [
      "Use canvas-like layouts, flexible clusters, note cards, source trays, and provisional states that invite iteration.",
      "Allow visual comparison and synthesis before structure hardens; comments and AI suggestions should feel easy to rearrange.",
      "Use more whitespace and looser grouping than an operational tool."
    ],
    instruction:
      "Use a creative workspace UX with generous thinking space, visible sources, lightweight structure, and clear ways to turn exploration into decisions."
  },
  {
    key: "knowledge-hub",
    label: "Knowledge hub",
    shortLabel: "Knowledge",
    icon: BookOpen,
    accent: "bg-indigo-700 text-white",
    tint: "bg-indigo-50",
    border: "border-indigo-200",
    description: "Documentation, guidance, policies, search, learning paths, and reference material.",
    bestFor: ["Help centers", "Policy hubs", "Documentation", "Learning systems"],
    sampleNav: ["Search", "Guides", "Policies", "Updates"],
    sampleWork: ["Recommended guide", "Policy match", "Recent update"],
    statusLabel: "Verified source",
    signatureComponents: [
      {
        name: "Search command bar",
        role: "Primary entry",
        usage: "Use as the main starting point for finding policies, guides, examples, and decisions."
      },
      {
        name: "Verified source card",
        role: "Search result",
        usage: "Use to show source confidence, owner, freshness, and why the result matches the query."
      },
      {
        name: "Article reading pane",
        role: "Knowledge detail",
        usage: "Use for long-form guidance with anchors, related content, provenance, and next reading paths."
      }
    ],
    visualGrammar: [
      "Use search-first layouts, readable article cards, topic navigation, source confidence, and related-content paths.",
      "Prioritize reading comfort, provenance, taxonomy, and skim-friendly document structure.",
      "Avoid dashboard clutter unless it directly improves findability."
    ],
    instruction:
      "Use a knowledge hub UX with strong search, scannable content structure, source confidence, topic navigation, and clear reading paths."
  },
  {
    key: "minimal-utility",
    label: "Minimal utility",
    shortLabel: "Utility",
    icon: CheckCircle2,
    accent: "bg-slate-800 text-white",
    tint: "bg-slate-50",
    border: "border-slate-200",
    description: "Small focused tools with one primary job, little chrome, and fast completion.",
    bestFor: ["Calculators", "Single-purpose tools", "Admin helpers", "Internal utilities"],
    sampleNav: ["Input", "Result", "History"],
    sampleWork: ["Primary input", "Computed result", "Save action"],
    statusLabel: "Ready",
    signatureComponents: [
      {
        name: "Single input panel",
        role: "Primary task",
        usage: "Use when one form or value drives the whole experience."
      },
      {
        name: "Immediate result panel",
        role: "Feedback surface",
        usage: "Use to show the result, reason, and one next action without sending the user elsewhere."
      },
      {
        name: "Inline history strip",
        role: "Lightweight memory",
        usage: "Use only when previous runs or saved outputs help repeat the task faster."
      }
    ],
    visualGrammar: [
      "Use a centered single-purpose layout with minimal navigation, one primary input path, and one obvious result.",
      "Remove decorative chrome, secondary panels, and unrelated links unless they directly support completion.",
      "Prefer sparse surfaces, direct labels, immediate feedback, and one dominant action."
    ],
    instruction:
      "Use a minimal utility UX with one obvious primary task, reduced navigation, direct inputs, immediate feedback, and minimal decorative structure."
  }
];

const surfaces: Array<{
  key: TargetSurfaceKey;
  label: string;
  icon: typeof MonitorSmartphone;
  description: string;
}> = [
  {
    key: "responsive-web",
    label: "Responsive web app",
    icon: MonitorSmartphone,
    description: "Default. One web app that adapts from laptop to mobile browser."
  },
  {
    key: "desktop-web",
    label: "Desktop web app",
    icon: LayoutDashboard,
    description: "Dense workspace optimized for laptop and large screens."
  },
  {
    key: "mobile-app",
    label: "Native mobile app",
    icon: Smartphone,
    description: "Focused mobile-first flows with bottom actions and compact context."
  },
  {
    key: "omnichannel",
    label: "Omnichannel",
    icon: MonitorSmartphone,
    description: "One UX direction translated across desktop, mobile, and customer touchpoints."
  }
];

const colorSchemas: Array<{
  key: ColorSchemaKey;
  label: string;
  description: string;
  accent: string;
  accentText: string;
  tint: string;
  border: string;
  panel: string;
  nav: string;
  navActive: string;
  primaryButton: string;
  secondaryButton: string;
  chip: string;
  swatches: string[];
}> = [
  {
    key: "nordic-blue",
    label: "Nordic blue",
    description: "Cool, calm SaaS default with strong control-plane readability.",
    accent: "bg-sky-700 text-white",
    accentText: "text-sky-800",
    tint: "bg-sky-50",
    border: "border-sky-200",
    panel: "bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(255,255,255,0.98))]",
    nav: "bg-[#102033] text-slate-50",
    navActive: "bg-white text-slate-950",
    primaryButton: "bg-sky-700 text-white",
    secondaryButton: "border-sky-200 bg-white text-sky-950",
    chip: "border-sky-200 bg-sky-50 text-sky-950",
    swatches: ["bg-[#102033]", "bg-sky-700", "bg-sky-100", "bg-white"]
  },
  {
    key: "forest-green",
    label: "Forest green",
    description: "Operational, grounded, good for workflow and field-service tools.",
    accent: "bg-emerald-700 text-white",
    accentText: "text-emerald-800",
    tint: "bg-emerald-50",
    border: "border-emerald-200",
    panel: "bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))]",
    nav: "bg-[#123126] text-emerald-50",
    navActive: "bg-emerald-50 text-emerald-950",
    primaryButton: "bg-emerald-700 text-white",
    secondaryButton: "border-emerald-200 bg-white text-emerald-950",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-950",
    swatches: ["bg-[#123126]", "bg-emerald-700", "bg-emerald-100", "bg-white"]
  },
  {
    key: "warm-amber",
    label: "Warm amber",
    description: "Human, service-oriented, useful when trust and guidance matter.",
    accent: "bg-amber-700 text-white",
    accentText: "text-amber-800",
    tint: "bg-amber-50",
    border: "border-amber-200",
    panel: "bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))]",
    nav: "bg-[#332412] text-amber-50",
    navActive: "bg-amber-50 text-amber-950",
    primaryButton: "bg-amber-700 text-white",
    secondaryButton: "border-amber-200 bg-white text-amber-950",
    chip: "border-amber-200 bg-amber-50 text-amber-950",
    swatches: ["bg-[#332412]", "bg-amber-700", "bg-amber-100", "bg-white"]
  },
  {
    key: "violet-studio",
    label: "Violet studio",
    description: "Exploratory and AI-forward without becoming playful or decorative.",
    accent: "bg-violet-700 text-white",
    accentText: "text-violet-800",
    tint: "bg-violet-50",
    border: "border-violet-200",
    panel: "bg-[linear-gradient(180deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))]",
    nav: "bg-[#261a3f] text-violet-50",
    navActive: "bg-violet-50 text-violet-950",
    primaryButton: "bg-violet-700 text-white",
    secondaryButton: "border-violet-200 bg-white text-violet-950",
    chip: "border-violet-200 bg-violet-50 text-violet-950",
    swatches: ["bg-[#261a3f]", "bg-violet-700", "bg-violet-100", "bg-white"]
  },
  {
    key: "graphite",
    label: "Graphite",
    description: "Neutral, dense, and quiet for admin tools and strict customer brands.",
    accent: "bg-slate-800 text-white",
    accentText: "text-slate-800",
    tint: "bg-slate-50",
    border: "border-slate-200",
    panel: "bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))]",
    nav: "bg-slate-950 text-slate-50",
    navActive: "bg-white text-slate-950",
    primaryButton: "bg-slate-900 text-white",
    secondaryButton: "border-slate-300 bg-white text-slate-950",
    chip: "border-slate-300 bg-slate-50 text-slate-950",
    swatches: ["bg-slate-950", "bg-slate-800", "bg-slate-200", "bg-white"]
  }
];

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getActiveProfile(value: string | undefined) {
  return profiles.find((profile) => profile.key === value) ?? profiles[0]!;
}

function getActiveSurface(value: string | undefined) {
  return surfaces.find((surface) => surface.key === value) ?? surfaces[0]!;
}

function getActiveColorSchema(value: string | undefined) {
  return colorSchemas.find((schema) => schema.key === value) ?? colorSchemas[0]!;
}

function buildHref(profile: UxProfileKey, surface: TargetSurfaceKey, color: ColorSchemaKey) {
  return `/framing/ux-preview?profile=${profile}&surface=${surface}&color=${color}`;
}

export default async function UxDirectionPreviewPage({ searchParams }: UxPreviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const activeProfile = getActiveProfile(getParamValue(query.profile));
  const activeSurface = getActiveSurface(getParamValue(query.surface));
  const activeColor = getActiveColorSchema(getParamValue(query.color));
  const ActiveProfileIcon = activeProfile.icon;

  return (
    <AppShell
      topbarProps={{
        projectName: "AAS Companion",
        sectionLabel: "Framing",
        badge: "UX direction preview"
      }}
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.94))] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Framing UX direction</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Preview the style before sending it downstream
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use this as a reference page for the future Framing UX Direction panel. Pick one experience profile and one target surface, then send one resolved direction downstream.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/framing">Back to Framing</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <aside className="space-y-5">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Experience profile</CardTitle>
                <CardDescription>Choose one primary UX model for the Framing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {profiles.map((profile) => {
                  const Icon = profile.icon;
                  const active = profile.key === activeProfile.key;
                  return (
                    <Button
                      asChild
                      className={`h-auto w-full justify-start whitespace-normal rounded-2xl px-3 py-3 text-left ${
                        active ? "border-primary bg-secondary text-foreground" : ""
                      }`}
                      key={profile.key}
                      variant="secondary"
                    >
                      <Link href={buildHref(profile.key, activeSurface.key, activeColor.key)}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{profile.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Target surface</CardTitle>
                <CardDescription>Default to responsive web unless the product clearly needs another delivery surface.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {surfaces.map((surface) => {
                  const Icon = surface.icon;
                  const active = surface.key === activeSurface.key;
                  return (
                    <Button
                      asChild
                      className={`h-auto w-full justify-start whitespace-normal rounded-2xl px-3 py-3 text-left ${
                        active ? "border-primary bg-secondary text-foreground" : ""
                      }`}
                      key={surface.key}
                      variant="secondary"
                    >
                      <Link href={buildHref(activeProfile.key, surface.key, activeColor.key)}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{surface.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Color schema</CardTitle>
                <CardDescription>Choose the visual palette independently from the UX model.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {colorSchemas.map((schema) => {
                  const active = schema.key === activeColor.key;
                  return (
                    <Button
                      asChild
                      className={`h-auto w-full justify-start whitespace-normal rounded-2xl px-3 py-3 text-left ${
                        active ? "border-primary bg-secondary text-foreground" : ""
                      }`}
                      key={schema.key}
                      variant="secondary"
                    >
                      <Link href={buildHref(activeProfile.key, activeSurface.key, schema.key)}>
                        <Palette className="h-4 w-4 shrink-0" />
                        <span className="min-w-0">
                          <span className="block">{schema.label}</span>
                          <span className="mt-2 flex gap-1">
                            {schema.swatches.map((swatch) => (
                              <span className={`h-3 w-6 rounded-full border border-black/10 ${swatch}`} key={swatch} />
                            ))}
                          </span>
                        </span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-5">
            <Card className={`border ${activeColor.border} shadow-sm`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeColor.accent}`}>
                      <ActiveProfileIcon className="h-3.5 w-3.5" />
                      {activeProfile.shortLabel}
                    </div>
                    <CardTitle className="mt-4 text-2xl">{activeProfile.label}</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl leading-6">{activeProfile.description}</CardDescription>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">{activeSurface.label}</p>
                    <p className="mt-1 max-w-xs leading-6 text-muted-foreground">{activeSurface.description}</p>
                    <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${activeColor.accentText}`}>
                      {activeColor.label}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ReferencePreview color={activeColor} profile={activeProfile} surface={activeSurface.key} />
                <ComponentReference color={activeColor} profile={activeProfile} surface={activeSurface.key} />

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best for</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeProfile.bestFor.map((item) => (
                        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-foreground" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resolved downstream instruction</p>
                    <p className="mt-3 text-sm leading-6 text-foreground">{activeProfile.instruction}</p>
                    <div className="mt-4 space-y-2">
                      {activeProfile.visualGrammar.map((rule) => (
                        <p className="rounded-xl border border-border/70 bg-background px-3 py-2 text-xs leading-5 text-muted-foreground" key={rule}>
                          {rule}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </AppShell>
  );
}

function ReferencePreview(props: {
  color: (typeof colorSchemas)[number];
  profile: (typeof profiles)[number];
  surface: TargetSurfaceKey;
}) {
  if (props.surface === "mobile-app") {
    return <MobileReference color={props.color} profile={props.profile} />;
  }

  if (props.surface === "omnichannel") {
    return <OmnichannelReference color={props.color} profile={props.profile} />;
  }

  return <DesktopReference color={props.color} dense={props.surface === "desktop-web"} profile={props.profile} />;
}

const componentExamples: Record<
  UxProfileKey,
  {
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    selectLabel: string;
    selectOptions: string[];
    fieldLabel: string;
    fieldValue: string;
    statusLabel: string;
    guidance: string;
    companionTitle: string;
    companionBody: string;
  }
> = {
  "enterprise-control-plane": {
    title: "Governed control components",
    description: "Compact controls for decisions, status, ownership, and auditability.",
    primaryAction: "Approve gate",
    secondaryAction: "Request review",
    selectLabel: "Risk posture",
    selectOptions: ["Controlled", "Needs review", "Blocked"],
    fieldLabel: "Decision owner",
    fieldValue: "Value owner",
    statusLabel: "Audit ready",
    guidance: "Show owner, version, evidence, and decision state close to every primary action.",
    companionTitle: "Audit card",
    companionBody: "Version, reviewer, timestamp, and evidence remain visible."
  },
  "operational-workflow": {
    title: "Workflow action components",
    description: "Fast controls for queues, repeated actions, exceptions, and handoffs.",
    primaryAction: "Start task",
    secondaryAction: "Escalate",
    selectLabel: "Queue lane",
    selectOptions: ["New", "In progress", "Blocked"],
    fieldLabel: "SLA note",
    fieldValue: "2h remaining",
    statusLabel: "Due soon",
    guidance: "Make the next action, blocker, due time, and assignee visible without opening another view.",
    companionTitle: "Queue card",
    companionBody: "Small cards carry owner, due date, blocker, and the next available action."
  },
  "customer-portal": {
    title: "Customer-facing components",
    description: "Friendly controls for status, documents, messages, and low-friction approvals.",
    primaryAction: "Send update",
    secondaryAction: "Ask question",
    selectLabel: "Customer view",
    selectOptions: ["Overview", "Documents", "Messages"],
    fieldLabel: "Message subject",
    fieldValue: "Input needed",
    statusLabel: "Waiting for customer",
    guidance: "Use plain language, avoid internal jargon, and explain what happens after each action.",
    companionTitle: "Next step card",
    companionBody: "One clear request, why it matters, and when the team will respond."
  },
  "creative-workspace": {
    title: "Creative workspace components",
    description: "Flexible pieces for capture, synthesis, comments, and turning exploration into decisions.",
    primaryAction: "Create draft",
    secondaryAction: "Add note",
    selectLabel: "Canvas mode",
    selectOptions: ["Explore", "Cluster", "Decide"],
    fieldLabel: "Idea prompt",
    fieldValue: "What might be true?",
    statusLabel: "Draft evolving",
    guidance: "Components should feel movable and provisional, with easy paths from notes to decisions.",
    companionTitle: "Canvas note",
    companionBody: "Ideas, quotes, risks, and AI suggestions can sit side by side before being structured."
  },
  "knowledge-hub": {
    title: "Knowledge components",
    description: "Search-first controls for guidance, policies, provenance, and reusable context.",
    primaryAction: "Open guide",
    secondaryAction: "Save source",
    selectLabel: "Content type",
    selectOptions: ["Guide", "Policy", "Decision"],
    fieldLabel: "Search query",
    fieldValue: "approval rules",
    statusLabel: "Verified source",
    guidance: "Emphasize search, source confidence, related material, and readable long-form content.",
    companionTitle: "Source card",
    companionBody: "Each result shows topic, confidence, owner, and the next useful reading path."
  },
  "minimal-utility": {
    title: "Minimal utility components",
    description: "Reduced controls for one clear job, immediate feedback, and fast completion.",
    primaryAction: "Run check",
    secondaryAction: "Reset",
    selectLabel: "Mode",
    selectOptions: ["Simple", "Advanced", "History"],
    fieldLabel: "Input value",
    fieldValue: "42",
    statusLabel: "Ready",
    guidance: "Hide chrome, keep one primary action, and show a direct result without extra navigation.",
    companionTitle: "Result card",
    companionBody: "The result, reason, and single next action are the whole interface."
  }
};

const profileTreatments: Record<
  UxProfileKey,
  {
    sectionClass: string;
    controlCardClass: string;
    companionClass: string;
    sampleCardClass: string;
    labelClass: string;
    buttonShape: string;
    inputShape: string;
    statusShape: string;
    gridOverride?: string;
  }
> = {
  "enterprise-control-plane": {
    sectionClass: "rounded-lg border-slate-300 bg-white shadow-none",
    controlCardClass: "rounded-lg border-slate-300 bg-slate-50 p-3 shadow-none",
    companionClass: "rounded-lg border-l-4 border-slate-400 bg-white p-4 shadow-none",
    sampleCardClass: "rounded-md border-slate-300 bg-white px-3 py-2",
    labelClass: "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600",
    buttonShape: "rounded-md",
    inputShape: "rounded-md",
    statusShape: "rounded-md",
    gridOverride: "grid gap-3 lg:grid-cols-[0.9fr_1fr_1fr_1.3fr]"
  },
  "operational-workflow": {
    sectionClass: "rounded-2xl border-emerald-300 bg-emerald-50 shadow-sm",
    controlCardClass: "rounded-xl border-emerald-200 bg-white p-3 shadow-sm",
    companionClass: "rounded-xl border-emerald-300 bg-white p-4 shadow-sm",
    sampleCardClass: "rounded-lg border-emerald-200 bg-white px-3 py-2 before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-emerald-600",
    labelClass: "text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800",
    buttonShape: "rounded-lg",
    inputShape: "rounded-lg",
    statusShape: "rounded-lg",
    gridOverride: "grid gap-3 md:grid-cols-2 xl:grid-cols-4"
  },
  "customer-portal": {
    sectionClass: "rounded-[32px] border-cyan-100 bg-white shadow-[0_24px_80px_rgba(8,145,178,0.14)]",
    controlCardClass: "rounded-[28px] border-cyan-100 bg-white p-5 shadow-sm",
    companionClass: "rounded-[28px] border-cyan-100 bg-cyan-50 p-5 shadow-sm",
    sampleCardClass: "rounded-full border-cyan-200 bg-white px-4 py-2",
    labelClass: "text-xs font-semibold text-cyan-900",
    buttonShape: "rounded-full",
    inputShape: "rounded-2xl",
    statusShape: "rounded-full"
  },
  "creative-workspace": {
    sectionClass: "rounded-[30px] border-dashed border-violet-300 bg-violet-50 shadow-sm",
    controlCardClass: "rounded-[26px] border-violet-200 bg-white p-4 shadow-sm",
    companionClass: "rounded-[30px] border-dashed border-violet-300 bg-white p-5 shadow-sm",
    sampleCardClass: "rounded-2xl border-amber-200 bg-amber-50 px-4 py-3 shadow-sm odd:-rotate-1 even:rotate-1",
    labelClass: "text-xs font-semibold text-violet-900",
    buttonShape: "rounded-[20px]",
    inputShape: "rounded-[22px]",
    statusShape: "rounded-[20px]",
    gridOverride: "grid gap-4 lg:grid-cols-[0.9fr_1fr_1fr_1.1fr]"
  },
  "knowledge-hub": {
    sectionClass: "rounded-2xl border-indigo-200 bg-white shadow-sm",
    controlCardClass: "rounded-xl border-indigo-100 bg-white p-4 shadow-sm",
    companionClass: "rounded-xl border-indigo-200 bg-white p-5 shadow-sm",
    sampleCardClass: "rounded-xl border-indigo-100 bg-indigo-50 px-4 py-3",
    labelClass: "text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-800",
    buttonShape: "rounded-xl",
    inputShape: "rounded-full",
    statusShape: "rounded-xl",
    gridOverride: "grid gap-4 lg:grid-cols-[0.8fr_1.3fr_1fr_1fr]"
  },
  "minimal-utility": {
    sectionClass: "mx-auto max-w-2xl rounded-xl border-slate-200 bg-white shadow-none",
    controlCardClass: "rounded-xl border-slate-200 bg-white p-4 shadow-none",
    companionClass: "rounded-xl border-slate-200 bg-slate-50 p-4 shadow-none",
    sampleCardClass: "rounded-lg border-slate-200 bg-white px-3 py-2",
    labelClass: "text-xs font-medium text-slate-700",
    buttonShape: "rounded-lg",
    inputShape: "rounded-lg",
    statusShape: "rounded-lg",
    gridOverride: "grid gap-3"
  }
};

const surfaceTreatments: Record<
  TargetSurfaceKey,
  {
    title: string;
    description: string;
    shellClass: string;
    gridClass: string;
    controlRadius: string;
    buttonClass: string;
    inputClass: string;
    statusClass: string;
    companionClass: string;
  }
> = {
  "responsive-web": {
    title: "Responsive component set",
    description: "Balanced controls that can collapse from desktop to mobile browser.",
    shellClass: "",
    gridClass: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
    controlRadius: "rounded-2xl",
    buttonClass: "h-11 rounded-2xl px-4",
    inputClass: "h-11 rounded-2xl px-3",
    statusClass: "rounded-2xl px-3 py-2",
    companionClass: "rounded-2xl"
  },
  "desktop-web": {
    title: "Desktop-dense component set",
    description: "Tighter controls, side-by-side fields, and more visible operational context.",
    shellClass: "border-l-4",
    gridClass: "grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr]",
    controlRadius: "rounded-xl",
    buttonClass: "h-9 rounded-xl px-3",
    inputClass: "h-9 rounded-xl px-3",
    statusClass: "rounded-xl px-3 py-2",
    companionClass: "rounded-xl"
  },
  "mobile-app": {
    title: "Mobile-first component set",
    description: "Stacked, thumb-friendly controls with one primary action in focus.",
    shellClass: "mx-auto max-w-[390px]",
    gridClass: "grid gap-3",
    controlRadius: "rounded-[24px]",
    buttonClass: "h-12 rounded-[22px] px-4",
    inputClass: "h-12 rounded-[20px] px-4",
    statusClass: "rounded-[20px] px-4 py-3",
    companionClass: "rounded-[24px]"
  },
  omnichannel: {
    title: "Omnichannel component set",
    description: "The same state expressed for workspace, mobile touchpoint, and customer update.",
    shellClass: "",
    gridClass: "grid gap-4 lg:grid-cols-[1fr_0.8fr_0.8fr]",
    controlRadius: "rounded-2xl",
    buttonClass: "h-11 rounded-2xl px-4",
    inputClass: "h-11 rounded-2xl px-3",
    statusClass: "rounded-2xl px-3 py-2",
    companionClass: "rounded-2xl"
  }
};

function ComponentReference({
  color,
  profile,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profile: (typeof profiles)[number];
  surface: TargetSurfaceKey;
}) {
  const example = componentExamples[profile.key];
  const treatment = surfaceTreatments[surface];
  const profileTreatment = profileTreatments[profile.key];

  return (
    <Card className={`border ${color.border} ${color.panel} shadow-sm`}>
      <CardHeader className="pb-4">
        <CardTitle>{example.title}</CardTitle>
        <CardDescription>
          {treatment.title}. {example.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 border p-4 ${treatment.shellClass} ${profileTreatment.sectionClass}`}>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{treatment.description}</p>
          <div className={`grid gap-3 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-3"}`}>
            {profile.signatureComponents.map((component, index) => (
              <div className={`border p-4 ${index === 0 ? profileTreatment.companionClass : profileTreatment.controlCardClass}`} key={component.name}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={profileTreatment.labelClass}>{component.role}</p>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{component.name}</h3>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold ${profileTreatment.statusShape} ${color.accent}`}>
                    {index === 0 ? "Primary" : "Pattern"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{component.usage}</p>
              </div>
            ))}
          </div>
          <SignatureWorkbench color={color} profile={profile} profileTreatment={profileTreatment} surface={surface} />

          <div className={`border ${color.border} ${profileTreatment.companionClass}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className={profileTreatment.labelClass}>{profile.shortLabel} pattern</p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{example.companionTitle}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{example.companionBody}</p>
              </div>
              <span className={`shrink-0 px-3 py-1 text-xs font-semibold ${profileTreatment.statusShape} ${color.accent}`}>{color.label}</span>
            </div>
            <div className={`mt-4 grid gap-3 ${surface === "mobile-app" ? "grid-cols-1" : "md:grid-cols-3"}`}>
              {profile.sampleWork.map((item) => (
                <div className={`border text-sm font-medium ${profileTreatment.sampleCardClass}`} key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className={`grid gap-2 ${profile.key === "minimal-utility" ? "hidden" : "md:grid-cols-3"}`}>
            {profile.visualGrammar.map((rule) => (
              <p className={`border text-xs leading-5 text-muted-foreground ${profileTreatment.sampleCardClass}`} key={rule}>
                {rule}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ProfileTreatment = (typeof profileTreatments)[UxProfileKey];

function SignatureWorkbench({
  color,
  profile,
  profileTreatment,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profile: (typeof profiles)[number];
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  if (profile.key === "enterprise-control-plane") {
    return <EnterpriseSignature color={color} profileTreatment={profileTreatment} surface={surface} />;
  }

  if (profile.key === "operational-workflow") {
    return <WorkflowSignature color={color} profileTreatment={profileTreatment} surface={surface} />;
  }

  if (profile.key === "customer-portal") {
    return <PortalSignature profileTreatment={profileTreatment} surface={surface} />;
  }

  if (profile.key === "creative-workspace") {
    return <CreativeSignature color={color} profileTreatment={profileTreatment} surface={surface} />;
  }

  if (profile.key === "knowledge-hub") {
    return <KnowledgeSignature profileTreatment={profileTreatment} surface={surface} />;
  }

  return <UtilitySignature color={color} profileTreatment={profileTreatment} surface={surface} />;
}

function EnterpriseSignature({
  color,
  profileTreatment,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  const compact = surface === "mobile-app";

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.5fr)_260px]"}`}>
      <div className={`border ${profileTreatment.companionClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={profileTreatment.labelClass}>Approval matrix</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Tollgate decision readiness</h3>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold ${profileTreatment.statusShape} ${color.accent}`}>3/4 ready</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-300">
          {[
            ["Outcome", "Owner", "Evidence", "Approved"],
            ["Value case", "Anna", "Strong", "Yes"],
            ["Risk posture", "Mikael", "Medium", "Review"],
            ["Scope", "Nora", "Strong", "Yes"]
          ].map((row, index) => (
            <div className={`grid grid-cols-4 gap-2 px-3 py-2 text-xs ${index === 0 ? "bg-slate-100 font-semibold text-slate-700" : "border-t border-slate-200 bg-white"}`} key={row.join("-")}>
              {row.map((cell) => (
                <span className="truncate" key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Audit trail rail</p>
        <div className="mt-4 space-y-3">
          {["v4 submitted", "AI review passed", "Pontus requested approval"].map((item) => (
            <div className="border-l-2 border-slate-300 pl-3 text-sm" key={item}>
              <p className="font-medium text-foreground">{item}</p>
              <p className="text-xs text-muted-foreground">Timestamp and actor visible</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowSignature({
  color,
  profileTreatment,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  const columns = surface === "mobile-app" ? ["Next", "Blocked"] : ["New", "In progress", "Blocked"];

  return (
    <div className={`grid gap-3 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-3"}`}>
      {columns.map((column, index) => (
        <div className={`min-h-48 border ${profileTreatment.controlCardClass}`} key={column}>
          <div className="flex items-center justify-between">
            <p className={profileTreatment.labelClass}>{column}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${index === 2 ? "bg-red-50 text-red-700" : color.chip}`}>{index + 1}</span>
          </div>
          <div className="mt-4 space-y-3">
            {["Validate intake", "Assign owner"].map((item) => (
              <div className={`border p-3 ${profileTreatment.sampleCardClass}`} key={`${column}-${item}`}>
                <p className="font-medium text-foreground">{item}</p>
                <p className="mt-1 text-xs text-muted-foreground">SLA 2h - owner visible - next action ready</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PortalSignature({
  profileTreatment,
  surface
}: {
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  return (
    <div className={`grid gap-4 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-[0.9fr_1.1fr_0.9fr]"}`}>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Status timeline</p>
        <div className="mt-4 space-y-4">
          {["Request received", "Team reviewed", "Your input needed"].map((item, index) => (
            <div className="flex gap-3" key={item}>
              <span className={`mt-1 h-3 w-3 rounded-full ${index === 2 ? "bg-cyan-700" : "bg-cyan-200"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="text-xs text-muted-foreground">{index === 2 ? "Upload the missing file to continue." : "Completed and visible to customer."}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`border ${profileTreatment.companionClass}`}>
        <p className={profileTreatment.labelClass}>Input request card</p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">We need one document from you</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A plain-language explanation says why the document matters and what happens next.</p>
        <div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-white p-5 text-center text-sm font-medium text-cyan-900">
          Drop file here or choose upload
        </div>
      </div>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Message thread</p>
        <div className="mt-4 space-y-3">
          {["Customer question", "Team reply", "Next response by Friday"].map((item) => (
            <div className={`px-3 py-2 text-sm ${profileTreatment.sampleCardClass}`} key={item}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreativeSignature({
  color,
  profileTreatment,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  return (
    <div className={`grid gap-4 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Source tray</p>
        <div className="mt-4 space-y-3">
          {["Interview clip", "AI synthesis", "Market note"].map((item) => (
            <div className={`border ${profileTreatment.sampleCardClass}`} key={item}>{item}</div>
          ))}
        </div>
      </div>
      <div className={`min-h-72 border ${profileTreatment.companionClass}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={profileTreatment.labelClass}>Canvas note cluster</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Explore before deciding</h3>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold ${profileTreatment.statusShape} ${color.accent}`}>Draft</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {["User quote", "Open risk", "Promising angle", "AI idea", "Decision frame", "Next experiment"].map((item, index) => (
            <div
              className={`min-h-24 border p-3 text-sm shadow-sm ${index % 2 === 0 ? "rotate-1 border-amber-200 bg-amber-50" : "-rotate-1 border-violet-200 bg-violet-50"}`}
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KnowledgeSignature({
  profileTreatment,
  surface
}: {
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  return (
    <div className={`grid gap-4 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_280px]"}`}>
      <div className={`border ${profileTreatment.companionClass}`}>
        <p className={profileTreatment.labelClass}>Search command bar</p>
        <div className="mt-4 rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm text-slate-700">
          Search policies, guides, decisions...
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Verified source card", "Related decision", "Recommended guide", "Recent update"].map((item) => (
            <div className={`border ${profileTreatment.sampleCardClass}`} key={item}>
              <p className="font-medium text-foreground">{item}</p>
              <p className="mt-1 text-xs text-muted-foreground">Confidence, owner, freshness, match reason.</p>
            </div>
          ))}
        </div>
      </div>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Article reading pane</p>
        <h3 className="mt-3 text-base font-semibold text-foreground">Approval rules</h3>
        <div className="mt-4 space-y-2">
          <div className="h-2 rounded-full bg-indigo-100" />
          <div className="h-2 w-4/5 rounded-full bg-indigo-100" />
          <div className="h-2 w-2/3 rounded-full bg-indigo-100" />
        </div>
        <div className={`mt-4 border ${profileTreatment.sampleCardClass}`}>Related: Tollgate checklist</div>
      </div>
    </div>
  );
}

function UtilitySignature({
  color,
  profileTreatment,
  surface
}: {
  color: (typeof colorSchemas)[number];
  profileTreatment: ProfileTreatment;
  surface: TargetSurfaceKey;
}) {
  return (
    <div className={`grid gap-4 ${surface === "mobile-app" ? "grid-cols-1" : "lg:grid-cols-[1fr_1fr]"}`}>
      <div className={`border ${profileTreatment.controlCardClass}`}>
        <p className={profileTreatment.labelClass}>Single input panel</p>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-foreground">Readiness threshold</span>
          <input className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm" defaultValue="80%" />
        </label>
        <button className={`mt-4 h-11 w-full rounded-lg text-sm font-medium ${color.primaryButton}`} type="button">Run check</button>
      </div>
      <div className={`border ${profileTreatment.companionClass}`}>
        <p className={profileTreatment.labelClass}>Immediate result panel</p>
        <h3 className="mt-3 text-2xl font-semibold text-foreground">Ready</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The result, reason, and single next action are visible without extra navigation.</p>
        <div className="mt-4 flex gap-2 text-xs">
          {["Last run", "Saved", "Copy result"].map((item) => (
            <span className="rounded-lg border border-slate-200 bg-white px-2 py-1" key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopReference({
  color,
  dense,
  profile
}: {
  color: (typeof colorSchemas)[number];
  dense: boolean;
  profile: (typeof profiles)[number];
}) {
  if (profile.key === "operational-workflow") {
    return <WorkflowReference color={color} />;
  }

  if (profile.key === "customer-portal") {
    return <PortalReference color={color} profile={profile} />;
  }

  if (profile.key === "creative-workspace") {
    return <CreativeReference color={color} />;
  }

  if (profile.key === "knowledge-hub") {
    return <KnowledgeReference color={color} profile={profile} />;
  }

  if (profile.key === "minimal-utility") {
    return <UtilityReference color={color} />;
  }

  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className={`grid gap-4 ${dense ? "lg:grid-cols-[180px_minmax(0,1fr)_220px]" : "lg:grid-cols-[200px_minmax(0,1fr)]"}`}>
        <div className={`rounded-3xl p-4 ${color.nav}`}>
          <p className="text-sm font-semibold">Reference app</p>
          <div className="mt-5 space-y-2">
            {profile.sampleNav.map((item, index) => (
              <div className={`rounded-2xl px-3 py-2 text-sm ${index === 0 ? color.navActive : "bg-white/8 text-current"}`} key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-border/70 bg-background/95 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Primary workspace</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{profile.sampleWork[0]}</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color.accent}`}>{profile.statusLabel}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {profile.sampleWork.map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item}>
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Preview content shows how this profile frames information density and action priority.</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Decision summary
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full bg-muted" />
              <div className="h-2 w-4/5 rounded-full bg-muted" />
              <div className="h-2 w-2/3 rounded-full bg-muted" />
            </div>
          </div>
        </div>
        {dense ? (
          <div className="space-y-3 rounded-3xl border border-border/70 bg-background/95 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Right rail</p>
            {["Signals", "Risks", "Next actions"].map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-3 text-sm font-medium" key={item}>
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WorkflowReference({ color }: { color: (typeof colorSchemas)[number] }) {
  const columns = [
    { title: "New", items: ["Validate intake", "Assign owner"] },
    { title: "In progress", items: ["Resolve blocker", "Prepare handoff"] },
    { title: "Done", items: ["Approval recorded"] }
  ];

  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className={`rounded-3xl border ${color.border} bg-white/95 p-4 shadow-sm`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${color.accentText}`}>Operations queue</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">Work moves left to right</h2>
          </div>
          <button className={`h-9 rounded-full px-3 text-sm font-medium ${color.primaryButton}`} type="button">Start next task</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {columns.map((column) => (
            <div className={`min-h-56 rounded-2xl border ${color.border} ${color.tint} p-3`} key={column.title}>
              <p className={`text-sm font-semibold ${color.accentText}`}>{column.title}</p>
              <div className="mt-3 space-y-3">
                {column.items.map((item) => (
                  <div className={`rounded-2xl border ${color.border} bg-white p-3 text-sm shadow-sm`} key={item}>
                    <p className="font-medium text-foreground">{item}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Owner, due date, and next action visible.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortalReference({ color, profile }: { color: (typeof colorSchemas)[number]; profile: (typeof profiles)[number] }) {
  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className={`overflow-hidden rounded-3xl border ${color.border} bg-white shadow-sm`}>
        <div className={`border-b ${color.border} bg-white px-5 py-4`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-950">Customer workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">Plain-language status, documents, messages, approvals.</p>
            </div>
            <div className="flex gap-2 text-sm">
              {profile.sampleNav.map((item) => (
                <span className={`rounded-full border px-3 py-1 ${color.chip}`} key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className={`rounded-3xl p-6 ${color.accent}`}>
            <p className="text-sm font-medium opacity-80">Current status</p>
            <h2 className="mt-3 text-2xl font-semibold">Input requested from customer</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-90">A friendly summary explains what is needed, why it matters, and when the team will respond.</p>
          </div>
          <div className="space-y-3">
            {["Upload document", "Review decision", "Message team"].map((item) => (
              <div className={`rounded-2xl border p-4 text-sm font-medium ${color.chip}`} key={item}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreativeReference({ color }: { color: (typeof colorSchemas)[number] }) {
  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className={`rounded-3xl border ${color.border} bg-white/90 p-4 shadow-sm`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${color.accentText}`}>Sources</p>
          <div className="mt-4 space-y-3">
            {["Interview notes", "AI synthesis", "Draft brief"].map((item) => (
              <div className={`rounded-2xl border p-3 text-sm ${color.chip}`} key={item}>{item}</div>
            ))}
          </div>
        </div>
        <div className={`min-h-80 rounded-3xl border ${color.border} bg-white p-5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${color.accentText}`}>Exploration canvas</p>
            <button className={`h-9 rounded-full border px-3 text-sm font-medium ${color.secondaryButton}`} type="button">Turn into decision</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Idea cluster", "Open question", "Promising direction", "Risk to test", "User quote", "Next draft"].map((item, index) => (
              <div
                className={`min-h-28 rotate-0 rounded-2xl border p-4 text-sm shadow-sm ${
                  index % 3 === 0 ? "border-amber-200 bg-amber-50" : index % 3 === 1 ? "border-violet-200 bg-violet-50" : "border-sky-200 bg-sky-50"
                }`}
                key={item}
              >
                <p className="font-medium text-foreground">{item}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Flexible thinking space before structure hardens.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeReference({ color, profile }: { color: (typeof colorSchemas)[number]; profile: (typeof profiles)[number] }) {
  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className={`rounded-3xl border ${color.border} bg-white p-5 shadow-sm`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${color.accentText}`}>Knowledge hub</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Find trusted guidance fast</h2>
          <div className={`mt-5 rounded-full border px-5 py-3 text-left text-sm ${color.chip}`}>
            Search policies, guides, decisions, and examples
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            {profile.sampleNav.map((item) => (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${color.chip}`} key={item}>{item}</div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {["Recommended guide", "Verified policy", "Related decision", "Recent update"].map((item) => (
              <div className="rounded-2xl border border-border/70 bg-background p-4" key={item}>
                <p className="font-medium text-foreground">{item}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Scannable content with source confidence and next reading path.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UtilityReference({ color }: { color: (typeof colorSchemas)[number] }) {
  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className={`mx-auto max-w-xl rounded-3xl border ${color.border} bg-white p-6 shadow-sm`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${color.accentText}`}>Single purpose tool</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Calculate readiness</h2>
        <div className="mt-5 space-y-4">
          {["Input value", "Threshold", "Decision rule"].map((item) => (
            <label className="block space-y-2" key={item}>
              <span className="text-sm font-medium text-foreground">{item}</span>
              <div className={`h-11 rounded-2xl border ${color.border} bg-white`} />
            </label>
          ))}
        </div>
        <div className={`mt-5 rounded-2xl border p-4 ${color.chip}`}>
          <p className="text-sm font-semibold text-foreground">Result: Ready</p>
          <p className="mt-1 text-sm text-muted-foreground">One result, one primary action, very little chrome.</p>
        </div>
        <button className={`mt-5 h-11 w-full rounded-full text-sm font-medium ${color.primaryButton}`} type="button">Save result</button>
      </div>
    </div>
  );
}

function MobileReference({ color, profile }: { color: (typeof colorSchemas)[number]; profile: (typeof profiles)[number] }) {
  return (
    <div className={`flex justify-center rounded-[28px] border ${color.border} ${color.tint} p-5`}>
      <div className={`w-full max-w-[360px] rounded-[32px] border ${color.border} ${color.nav} p-3 shadow-[0_24px_80px_rgba(15,23,42,0.22)]`}>
        <div className="rounded-[26px] bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{profile.shortLabel}</p>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${color.accent}`}>{profile.statusLabel}</span>
          </div>
          <div className="mt-5 space-y-3">
            {profile.sampleWork.map((item) => (
              <div className={`rounded-2xl border ${color.border} ${color.tint} p-4`} key={item}>
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Mobile preview keeps one clear action in focus.</p>
              </div>
            ))}
          </div>
          <button className={`mt-5 h-11 w-full rounded-full text-sm font-medium ${color.primaryButton}`} type="button">Continue</button>
        </div>
      </div>
    </div>
  );
}

function OmnichannelReference({ color, profile }: { color: (typeof colorSchemas)[number]; profile: (typeof profiles)[number] }) {
  return (
    <div className={`rounded-[28px] border ${color.border} ${color.tint} p-4`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <DesktopReference color={color} dense={false} profile={profile} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MiniChannel color={color} title="Mobile touchpoint" profile={profile} icon={Smartphone} />
          <MiniChannel color={color} title="Customer update" profile={profile} icon={Compass} />
        </div>
      </div>
    </div>
  );
}

function MiniChannel({
  color,
  icon: Icon,
  profile,
  title
}: {
  color: (typeof colorSchemas)[number];
  icon: typeof Smartphone;
  profile: (typeof profiles)[number];
  title: string;
}) {
  return (
    <div className={`rounded-3xl border ${color.border} bg-background/95 p-4 shadow-sm`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className={`h-4 w-4 ${color.accentText}`} />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        The same UX direction is translated to this channel without creating a second design style.
      </p>
      <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color.accent}`}>{profile.statusLabel}</span>
    </div>
  );
}
