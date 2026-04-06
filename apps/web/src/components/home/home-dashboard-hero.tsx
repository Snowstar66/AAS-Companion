"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, FolderKanban, GitBranch, ShieldCheck } from "lucide-react";
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
      total: number;
      framingReady: number;
      started?: number;
    };
    deliveryStoryStats: {
      total: number;
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
      ? { label: "Inget aktivt projekt", detail: "Välj ett projekt, skapa ett nytt eller öppna Demo innan operativt arbete börjar." }
      : { label: "No active project", detail: "Choose an existing project, create one, or open Demo before entering operational work." };
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
      ? { label: "Behöver uppmärksamhet", detail: "Blockerande frågor behöver fortfarande hanteras." }
      : { label: "Needs attention", detail: "Blocking issues still need attention." };
  }

  if (input.pendingCount > 0) {
    return language === "sv"
      ? { label: "Väntar på review", detail: "Review- eller uppföljningsåtgärder är fortfarande öppna." }
      : { label: "Awaiting review", detail: "Review or follow-up actions are still open." };
  }

  if (input.readyCount > 0) {
    return language === "sv"
      ? { label: "Redo att gå vidare", detail: "Projektet har tydligt definierade delar som kan tas vidare." }
      : { label: "Ready to move", detail: "The project has clearly defined branches that can move forward." };
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
    </div>
  );
}

export function HomeDashboardHero(props: HomeDashboardHeroProps) {
  const { language } = useAppChromeLanguage();
  const blockedCount = props.dashboard.topBlockers.length;
  const pendingCount = props.dashboard.pendingActions.length;
  const hasActiveProject = Boolean(props.activeProjectName);
  const readyCount =
    props.dashboard.projectPhase.key === "framing"
      ? props.dashboard.storyIdeaStats.framingReady
      : props.dashboard.deliveryStoryStats.readyToStartBuild;

  const status = deriveProjectStatus(
    {
      hasActiveProject,
      dashboardState: props.dashboard.state,
      blockedCount,
      pendingCount,
      readyCount
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
          bodyActive: "En kompakt lägesbild av projektets fas, struktur och vad som faktiskt behöver uppmärksamhet.",
          bodyInactive: "Öppna ett befintligt projekt, skapa ett nytt eller öppna Demo uttryckligen innan operativa vyer fylls med innehåll.",
          currentProject: "Nuvarande projekt",
          noActiveProject: "Inget aktivt projekt valt",
          currentProjectDescription: props.isDemoSession
            ? "Demo visas bara eftersom det valdes uttryckligen."
            : "Översikten gäller bara det aktiva projektet.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "Välj eller skapa ett projekt för att tända dashboarden."
            : "Logga in och välj sedan ett projekt eller öppna Demo uttryckligen.",
          currentPhase: "Nuvarande fas",
          currentPosture: "Nuvarande läge",
          storyIdeasTotal: "Story Ideas",
          storyIdeasReady: "Framing-redo",
          deliveryStoriesTotal: "Delivery Stories",
          readyToBuild: "Redo för build",
          storyIdeasTotalDescription: `${props.dashboard.storyIdeaStats.started ?? 0} påbörjade · ${props.dashboard.storyIdeaStats.framingReady} redo för review`,
          storyIdeasReadyDescription: "Story Ideas som redan är tillräckligt tydliga för nästa steg i framing.",
          deliveryStoriesTotalDescription: `${props.dashboard.deliveryStoryStats.readyToStartBuild} redo att gå vidare`,
          readyToBuildDescription: "Delivery Stories med tillräcklig struktur för att kunna tas vidare till build.",
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
          bodyActive: "A compact view of project phase, structure, and what actually needs attention.",
          bodyInactive: "Open an existing project, create a new one, or open Demo explicitly before operational views are populated.",
          currentProject: "Current project",
          noActiveProject: "No active project selected",
          currentProjectDescription: props.isDemoSession
            ? "Demo only appears because it was chosen explicitly."
            : "This overview only reflects the active project.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "Select or create a project to light up the dashboard."
            : "Sign in, then choose a project or enter Demo explicitly.",
          currentPhase: "Current phase",
          currentPosture: "Current posture",
          storyIdeasTotal: "Story Ideas",
          storyIdeasReady: "Framing-ready",
          deliveryStoriesTotal: "Delivery Stories",
          readyToBuild: "Ready for build",
          storyIdeasTotalDescription: `${props.dashboard.storyIdeaStats.started ?? 0} started · ${props.dashboard.storyIdeaStats.framingReady} review-ready`,
          storyIdeasReadyDescription: "Story Ideas already clear enough for the next step in framing.",
          deliveryStoriesTotalDescription: `${props.dashboard.deliveryStoryStats.readyToStartBuild} ready to move forward`,
          readyToBuildDescription: "Delivery Stories structured enough to move into build.",
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

  return (
    <>
      <div className="rounded-3xl border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,248,252,0.94))] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
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
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.currentProject}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{props.activeProjectName ?? copy.noActiveProject}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {hasActiveProject ? copy.currentProjectDescription : copy.noProjectDescription}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">{copy.currentPhase}</p>
                  <p className="mt-2 text-base font-semibold text-sky-950">{props.dashboard.projectPhase.label}</p>
                  <p className="mt-2 text-sm leading-6 text-sky-900">{props.dashboard.projectPhase.detail}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.currentPosture}</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{status.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.detail}</p>
                </div>
              </div>
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
              className="border-sky-200 bg-sky-50/75 text-sky-950"
              description={copy.storyIdeasTotalDescription}
              icon={GitBranch}
              label={copy.storyIdeasTotal}
              value={props.dashboard.storyIdeaStats.total}
            />
            <MetricCard
              className="border-emerald-200 bg-emerald-50/75 text-emerald-950"
              description={copy.storyIdeasReadyDescription}
              icon={ShieldCheck}
              label={copy.storyIdeasReady}
              value={props.dashboard.storyIdeaStats.framingReady}
            />
            <MetricCard
              className="border-amber-200 bg-amber-50/75 text-amber-950"
              description={copy.deliveryStoriesTotalDescription}
              icon={Clock3}
              label={copy.deliveryStoriesTotal}
              value={props.dashboard.deliveryStoryStats.total}
            />
            <MetricCard
              className="border-violet-200 bg-violet-50/75 text-violet-950"
              description={copy.readyToBuildDescription}
              icon={AlertTriangle}
              label={copy.readyToBuild}
              value={props.dashboard.deliveryStoryStats.readyToStartBuild}
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
