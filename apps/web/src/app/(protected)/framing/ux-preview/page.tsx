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
                <ComponentReference color={activeColor} />

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

function ComponentReference({ color }: { color: (typeof colorSchemas)[number] }) {
  return (
    <Card className={`border ${color.border} ${color.panel} shadow-sm`}>
      <CardHeader className="pb-4">
        <CardTitle>Component examples</CardTitle>
        <CardDescription>Basic UI elements rendered with the selected color schema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Buttons</p>
            <button className={`h-11 rounded-full px-4 text-sm font-medium shadow-sm ${color.primaryButton}`} type="button">
              Primary action
            </button>
            <button className={`h-11 rounded-full border px-4 text-sm font-medium shadow-sm ${color.secondaryButton}`} type="button">
              Secondary
            </button>
          </div>
          <label className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dropdown</span>
            <select className={`h-11 w-full rounded-2xl border ${color.border} bg-white px-3 text-sm outline-none`}>
              <option>{color.label}</option>
              <option>Strict customer style</option>
              <option>Default product style</option>
            </select>
          </label>
          <label className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Input</span>
            <input className={`h-11 w-full rounded-2xl border ${color.border} bg-white px-3 text-sm outline-none`} defaultValue="UX direction note" />
          </label>
          <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${color.chip}`}>Ready for downstream</span>
            <div className={`rounded-2xl border p-3 text-sm ${color.chip}`}>Inline guidance follows this palette.</div>
          </div>
        </div>
      </CardContent>
    </Card>
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
