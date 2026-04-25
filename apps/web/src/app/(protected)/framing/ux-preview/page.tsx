import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  FileText,
  LayoutDashboard,
  MonitorSmartphone,
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

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getActiveProfile(value: string | undefined) {
  return profiles.find((profile) => profile.key === value) ?? profiles[0]!;
}

function getActiveSurface(value: string | undefined) {
  return surfaces.find((surface) => surface.key === value) ?? surfaces[0]!;
}

function buildHref(profile: UxProfileKey, surface: TargetSurfaceKey) {
  return `/framing/ux-preview?profile=${profile}&surface=${surface}`;
}

export default async function UxDirectionPreviewPage({ searchParams }: UxPreviewPageProps) {
  const query = searchParams ? await searchParams : {};
  const activeProfile = getActiveProfile(getParamValue(query.profile));
  const activeSurface = getActiveSurface(getParamValue(query.surface));
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
                      <Link href={buildHref(profile.key, activeSurface.key)}>
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
                      <Link href={buildHref(activeProfile.key, surface.key)}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{surface.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-5">
            <Card className={`border ${activeProfile.border} shadow-sm`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeProfile.accent}`}>
                      <ActiveProfileIcon className="h-3.5 w-3.5" />
                      {activeProfile.shortLabel}
                    </div>
                    <CardTitle className="mt-4 text-2xl">{activeProfile.label}</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl leading-6">{activeProfile.description}</CardDescription>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">{activeSurface.label}</p>
                    <p className="mt-1 max-w-xs leading-6 text-muted-foreground">{activeSurface.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ReferencePreview profile={activeProfile} surface={activeSurface.key} />

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
  profile: (typeof profiles)[number];
  surface: TargetSurfaceKey;
}) {
  if (props.surface === "mobile-app") {
    return <MobileReference profile={props.profile} />;
  }

  if (props.surface === "omnichannel") {
    return <OmnichannelReference profile={props.profile} />;
  }

  return <DesktopReference dense={props.surface === "desktop-web"} profile={props.profile} />;
}

function DesktopReference({ dense, profile }: { dense: boolean; profile: (typeof profiles)[number] }) {
  return (
    <div className={`rounded-[28px] border ${profile.border} ${profile.tint} p-4`}>
      <div className={`grid gap-4 ${dense ? "lg:grid-cols-[180px_minmax(0,1fr)_220px]" : "lg:grid-cols-[200px_minmax(0,1fr)]"}`}>
        <div className="rounded-3xl bg-[#102033] p-4 text-slate-50">
          <p className="text-sm font-semibold">Reference app</p>
          <div className="mt-5 space-y-2">
            {profile.sampleNav.map((item, index) => (
              <div className={`rounded-2xl px-3 py-2 text-sm ${index === 0 ? "bg-white text-slate-950" : "bg-white/8 text-slate-200"}`} key={item}>
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
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.accent}`}>{profile.statusLabel}</span>
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

function MobileReference({ profile }: { profile: (typeof profiles)[number] }) {
  return (
    <div className={`flex justify-center rounded-[28px] border ${profile.border} ${profile.tint} p-5`}>
      <div className="w-full max-w-[360px] rounded-[32px] border border-slate-300 bg-slate-950 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="rounded-[26px] bg-background p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{profile.shortLabel}</p>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${profile.accent}`}>{profile.statusLabel}</span>
          </div>
          <div className="mt-5 space-y-3">
            {profile.sampleWork.map((item) => (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4" key={item}>
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Mobile preview keeps one clear action in focus.</p>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full">Continue</Button>
        </div>
      </div>
    </div>
  );
}

function OmnichannelReference({ profile }: { profile: (typeof profiles)[number] }) {
  return (
    <div className={`rounded-[28px] border ${profile.border} ${profile.tint} p-4`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <DesktopReference dense={false} profile={profile} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MiniChannel title="Mobile touchpoint" profile={profile} icon={Smartphone} />
          <MiniChannel title="Customer update" profile={profile} icon={Compass} />
        </div>
      </div>
    </div>
  );
}

function MiniChannel({
  icon: Icon,
  profile,
  title
}: {
  icon: typeof Smartphone;
  profile: (typeof profiles)[number];
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/95 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        The same UX direction is translated to this channel without creating a second design style.
      </p>
      <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${profile.accent}`}>{profile.statusLabel}</span>
    </div>
  );
}
