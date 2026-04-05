"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ClipboardList, Clock3, FolderKanban, GitBranch, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";

type HomeDashboardHeroProps = {
  dashboard: {
    state: "live" | "empty" | "unavailable";
    message?: string | null;
    projectPhase: {
      key: string;
      label: string;
      detail: string;
    };
    storyIdeaStats: {
      framingReady: number;
    };
    deliveryStoryStats: {
      readyToStartBuild: number;
    };
    topBlockers: Array<{
      id: string;
      title: string;
      detail: string;
      href?: string | null;
    }>;
    pendingActions: Array<{
      id: string;
      title: string;
      detail: string;
      href?: string | null;
    }>;
  };
  activeProjectName?: string | null;
  hasAuthenticatedUser: boolean;
  isDemoSession: boolean;
};

function attentionTone(kind: "blocker" | "pending") {
  if (kind === "blocker") {
    return "border-rose-200/80 bg-rose-50/70";
  }

  return "border-amber-200/80 bg-amber-50/70";
}

function deriveProjectStatus(
  input: {
    hasActiveProject: boolean;
    dashboardState: "live" | "empty" | "unavailable";
    blockedCount: number;
    pendingCount: number;
    readyCount: number;
  },
  language: "en" | "sv"
) {
  if (!input.hasActiveProject) {
    return language === "sv"
      ? { label: "Inget aktivt projekt", detail: "Välj ett projekt, skapa ett nytt eller öppna Demo uttryckligen innan operativt arbete börjar." }
      : { label: "No active project", detail: "Choose an existing project, create one, or open Demo explicitly before entering operational work." };
  }

  if (input.dashboardState === "unavailable") {
    return language === "sv"
      ? { label: "Nedsatt läge", detail: "Projektdata är delvis otillgänglig just nu." }
      : { label: "Degraded", detail: "Project data is partially unavailable right now." };
  }

  if (input.dashboardState === "empty") {
    return language === "sv"
      ? { label: "Redo att börja", detail: "Projektet är aktivt men har ännu inget Framing-case." }
      : { label: "Ready to begin", detail: "This project is active but still has no Framing case." };
  }

  if (input.blockedCount > 0) {
    return language === "sv"
      ? { label: "Behöver uppmärksamhet", detail: "Blockerande framing- eller storyfrågor behöver fortfarande hanteras." }
      : { label: "Needs attention", detail: "Blocking framing or story issues still need attention." };
  }

  if (input.pendingCount > 0) {
    return language === "sv"
      ? { label: "Väntar på review", detail: "Review- eller uppföljningsåtgärder är fortfarande öppna i projektet." }
      : { label: "Awaiting review", detail: "Review or follow-up actions are still open in this project." };
  }

  if (input.readyCount > 0) {
    return language === "sv"
      ? { label: "Redo att gå vidare", detail: "Minst en gren är redo att fortsätta djupare in i leveransen." }
      : { label: "Ready to move", detail: "At least one branch is ready to continue deeper into delivery." };
  }

  return language === "sv"
    ? { label: "Pågår", detail: "Arbete pågår i det aktuella projektet." }
    : { label: "In progress", detail: "Work is active inside the current project." };
}

function MetricCard(props: {
  label: string;
  value: number;
  description: string;
  className: string;
  href?: string | undefined;
  actionLabel?: string | undefined;
  icon: typeof FolderKanban;
}) {
  const Icon = props.icon;

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${props.className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{props.label}</p>
        <Icon className="h-4 w-4 opacity-80" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{props.value}</p>
      <p className="mt-2 text-sm leading-6 opacity-90">{props.description}</p>
      {props.href && props.actionLabel ? (
        <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
          <Link href={props.href}>
            {props.actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export function HomeDashboardHero(props: HomeDashboardHeroProps) {
  const { language } = useAppChromeLanguage();
  const readyStoriesMetric =
    props.dashboard.projectPhase.key === "framing"
      ? props.dashboard.storyIdeaStats.framingReady
      : props.dashboard.deliveryStoryStats.readyToStartBuild;
  const blockedCount = props.dashboard.topBlockers.length;
  const pendingCount = props.dashboard.pendingActions.length;
  const hasActiveProject = Boolean(props.activeProjectName);
  const status = deriveProjectStatus(
    {
      hasActiveProject,
      dashboardState: props.dashboard.state,
      blockedCount,
      pendingCount,
      readyCount: readyStoriesMetric
    },
    language
  );

  const copy =
    language === "sv"
      ? {
          badgeActive: "Projektöversikt",
          badgeInactive: "Projektåtkomst",
          titleActive: "Projektöversikt",
          titleInactive: "Välj hur du går in i arbetet",
          bodyActive: "Nuvarande fas, redo arbete, blockeringar och snabbaste vägen tillbaka till rätt arbetsyta.",
          bodyInactive: "Öppna ett befintligt projekt, skapa ett nytt eller öppna Demo uttryckligen innan operativa vyer fylls med innehåll.",
          openFraming: "Öppna Framing",
          openValueSpine: "Öppna Value Spine",
          openReview: "Öppna Review",
          openImport: "Öppna Import",
          currentProject: "Nuvarande projekt",
          noActiveProject: "Inget aktivt projekt valt",
          currentProjectDescription: props.isDemoSession
            ? "Demo hålls isolerat och visas bara eftersom det valdes uttryckligen."
            : "Endast det här projektets Framing-, Value Spine-, Import- och Review-poster visas här.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "Du är inloggad, men inget operativt projekt är aktivt förrän du väljer eller skapar ett."
            : "Logga in och välj sedan ett befintligt projekt, skapa ett nytt eller gå in i Demo uttryckligen.",
          currentPhase: "Nuvarande fas",
          currentPosture: "Nuvarande läge",
          needsAttention: "Behöver uppmärksamhet",
          readyStoryIdeas: "Redo Story Ideas",
          readyDeliveryStories: "Redo Delivery Stories",
          blockers: "Öppna blockeringar",
          pending: "Väntande arbete",
          openFirstBlocker: "Öppna första blockeraren",
          openFirstPending: "Öppna första väntande posten",
          blockersDescription: "Blockerade tollgates eller Value Spine-luckor som stoppar nästa steg.",
          pendingDescription: "Insända framing- eller leveransposter som fortfarande väntar på human review eller uppföljning.",
          readyFramingDescription: `Story Ideas redo för framing: ${props.dashboard.storyIdeaStats.framingReady}. Delivery Stories redo att starta build: ${props.dashboard.deliveryStoryStats.readyToStartBuild}.`,
          readyDeliveryDescription: `Delivery Stories redo att starta build: ${props.dashboard.deliveryStoryStats.readyToStartBuild}. Story Ideas redo för framing: ${props.dashboard.storyIdeaStats.framingReady}.`,
          sectionTitle: "Behöver uppmärksamhet",
          sectionDescription: "De tydligaste blockeringarna och väntande posterna i det aktiva projektet.",
          open: "Öppna",
          noItems: "Inga aktiva blockeringar eller väntande review-poster syns just nu.",
          inactiveTitle: "Översikten tänds när ett projekt är aktivt",
          inactiveDescription: "Fram till dess hålls blockers, review-köer, Value Spine och handoff-status avsiktligt tomma.",
          framing: "Framing",
          review: "Review",
          delivery: "Delivery",
          inactive: "Inaktiv"
        }
      : {
          badgeActive: "Project dashboard",
          badgeInactive: "Project access",
          titleActive: "Project dashboard",
          titleInactive: "Choose how to enter work",
          bodyActive: "Current phase, ready work, blockers and the fastest route back into the right workspace.",
          bodyInactive: "Open an existing project, create a new one, or open Demo explicitly before operational views are populated.",
          openFraming: "Open Framing",
          openValueSpine: "Open Value Spine",
          openReview: "Open Review",
          openImport: "Open Import",
          currentProject: "Current project",
          noActiveProject: "No active project selected",
          currentProjectDescription: props.isDemoSession
            ? "Demo stays isolated and only appears because it was chosen explicitly."
            : "Only this project's Framing, Value Spine, Import and Review records are visible here.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "You are signed in, but no operational project is active until you select or create one."
            : "Sign in, then choose an existing project, create a new one, or enter Demo explicitly.",
          currentPhase: "Current phase",
          currentPosture: "Current posture",
          needsAttention: "Needs attention",
          readyStoryIdeas: "Ready Story Ideas",
          readyDeliveryStories: "Ready Delivery Stories",
          blockers: "Open blockers",
          pending: "Pending work",
          openFirstBlocker: "Open first blocker",
          openFirstPending: "Open first pending item",
          blockersDescription: "Blocked tollgates or Value Spine gaps that stop the next step.",
          pendingDescription: "Submitted framing or delivery items that still wait on human review or a follow-up decision.",
          readyFramingDescription: `Story Ideas ready for framing: ${props.dashboard.storyIdeaStats.framingReady}. Delivery Stories ready to start build: ${props.dashboard.deliveryStoryStats.readyToStartBuild}.`,
          readyDeliveryDescription: `Delivery Stories ready to start build: ${props.dashboard.deliveryStoryStats.readyToStartBuild}. Story Ideas ready for framing: ${props.dashboard.storyIdeaStats.framingReady}.`,
          sectionTitle: "Needs attention",
          sectionDescription: "The clearest blockers and pending items in the active project.",
          open: "Open",
          noItems: "No active blockers or pending review items are currently surfaced.",
          inactiveTitle: "Dashboard will light up when a project is active",
          inactiveDescription: "Until then, blockers, review queues, Value Spine and handoff status stay intentionally empty.",
          framing: "Framing",
          review: "Review",
          delivery: "Delivery",
          inactive: "Inactive"
        };

  const quickLinks = [
    { href: "/framing", label: copy.openFraming, icon: FolderKanban },
    { href: "/workspace", label: copy.openValueSpine, icon: GitBranch },
    { href: "/review", label: copy.openReview, icon: ShieldCheck },
    { href: "/intake", label: copy.openImport, icon: ClipboardList }
  ];

  return (
    <>
      <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5 text-primary" />
              {hasActiveProject ? copy.badgeActive : copy.badgeInactive}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {hasActiveProject ? copy.titleActive : copy.titleInactive}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                {hasActiveProject ? copy.bodyActive : copy.bodyInactive}
              </p>
            </div>
            {hasActiveProject ? (
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button asChild className="gap-2" key={item.href} size="sm" variant="secondary">
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.currentProject}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{props.activeProjectName ?? copy.noActiveProject}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{hasActiveProject ? copy.currentProjectDescription : copy.noProjectDescription}</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">{copy.currentPhase}</p>
              <p className="mt-2 text-base font-semibold text-sky-950">{props.dashboard.projectPhase.label}</p>
              <p className="mt-2 text-sm leading-6 text-sky-900">{props.dashboard.projectPhase.detail}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.currentPosture}</p>
              <p className="mt-2 text-base font-semibold text-foreground">{status.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
            </div>
          </div>
        </div>
        {props.dashboard.state !== "live" && props.dashboard.message ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
            {props.dashboard.message}
          </div>
        ) : null}
      </div>

      {hasActiveProject ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              actionLabel={readyStoriesMetric > 0 ? copy.openFraming : undefined}
              className="border-emerald-200 bg-emerald-50/75 text-emerald-950"
              description={props.dashboard.projectPhase.key === "framing" ? copy.readyFramingDescription : copy.readyDeliveryDescription}
              href={readyStoriesMetric > 0 ? (props.dashboard.projectPhase.key === "framing" ? "/framing" : "/stories?state=ready") : undefined}
              icon={GitBranch}
              label={props.dashboard.projectPhase.key === "framing" ? copy.readyStoryIdeas : copy.readyDeliveryStories}
              value={readyStoriesMetric}
            />
            <MetricCard
              actionLabel={blockedCount > 0 ? copy.openFirstBlocker : undefined}
              className="border-rose-200 bg-rose-50/75 text-rose-950"
              description={copy.blockersDescription}
              href={props.dashboard.topBlockers[0]?.href ?? undefined}
              icon={AlertTriangle}
              label={copy.blockers}
              value={blockedCount}
            />
            <MetricCard
              actionLabel={pendingCount > 0 ? copy.openFirstPending : undefined}
              className="border-amber-200 bg-amber-50/75 text-amber-950"
              description={copy.pendingDescription}
              href={props.dashboard.pendingActions[0]?.href ?? undefined}
              icon={Clock3}
              label={copy.pending}
              value={pendingCount}
            />
          </div>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>{copy.sectionTitle}</CardTitle>
              <CardDescription>{copy.sectionDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...props.dashboard.topBlockers.slice(0, 3), ...props.dashboard.pendingActions.slice(0, 3)].length > 0 ? (
                [
                  ...props.dashboard.topBlockers.slice(0, 3).map((item) => ({ ...item, attentionKind: "blocker" as const })),
                  ...props.dashboard.pendingActions.slice(0, 3).map((item) => ({ ...item, attentionKind: "pending" as const }))
                ].map((item) => (
                  <div className={`rounded-2xl border p-4 ${attentionTone(item.attentionKind)}`} key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                      </div>
                      {item.href ? (
                        <Button asChild className="gap-2" size="sm" variant="secondary">
                          <Link href={item.href}>
                            {copy.open}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">{copy.noItems}</div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>{copy.inactiveTitle}</CardTitle>
            <CardDescription>{copy.inactiveDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.framing}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{copy.inactive}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.review}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{copy.inactive}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.delivery}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{copy.inactive}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
