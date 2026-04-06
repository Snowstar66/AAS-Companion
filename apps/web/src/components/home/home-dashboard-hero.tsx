"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
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

  const primaryFocus = props.dashboard.topBlockers[0] ?? props.dashboard.pendingActions[0] ?? null;

  const copy =
    language === "sv"
      ? {
          badgeActive: "Projektöversikt",
          badgeInactive: "Projektåtkomst",
          titleActive: "Projektöversikt",
          titleInactive: "Välj hur du går in i arbetet",
          bodyActive: "Se var projektet står just nu, vad som faktiskt blockerar flödet och vilket nästa steg som behöver tas först.",
          bodyInactive: "Aktivera ett projekt för att få en levande överblick över fas, blockers, reviewflöden och leveransstatus.",
          currentProject: "Nuvarande projekt",
          noActiveProject: "Inget aktivt projekt valt",
          currentProjectDescription: props.isDemoSession
            ? "Demo visas bara eftersom det valdes uttryckligen."
            : "All information nedan gäller bara det projekt som är aktivt just nu.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "Välj eller skapa ett projekt för att tända dashboarden."
            : "Logga in och välj sedan ett projekt eller öppna Demo uttryckligen.",
          currentPhase: "Nuvarande fas",
          currentPosture: "Nuvarande läge",
          focusTitle: "Viktigast just nu",
          focusFallback: "Inga omedelbara blockerare eller väntande steg syns just nu.",
          focusFallbackDetail: "Det aktiva projektet ser ut att vara i balans för stunden.",
          openCurrent: "Öppna detta",
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
          bodyActive: "See where the project stands right now, what is actually blocking the flow, and which next step needs attention first.",
          bodyInactive: "Activate a project to get a live overview of phase, blockers, review flow, and delivery status.",
          currentProject: "Current project",
          noActiveProject: "No active project selected",
          currentProjectDescription: props.isDemoSession
            ? "Demo only appears because it was chosen explicitly."
            : "All signals below only reflect the project that is active right now.",
          noProjectDescription: props.hasAuthenticatedUser
            ? "Select or create a project to light up the dashboard."
            : "Sign in, then choose a project or enter Demo explicitly.",
          currentPhase: "Current phase",
          currentPosture: "Current posture",
          focusTitle: "Most important right now",
          focusFallback: "No immediate blockers or pending steps are visible right now.",
          focusFallbackDetail: "The active project currently looks balanced.",
          openCurrent: "Open this",
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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
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
              <div className="rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.focusTitle}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {primaryFocus ? primaryFocus.title : copy.focusFallback}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {primaryFocus ? primaryFocus.detail : copy.focusFallbackDetail}
                    </p>
                  </div>
                  {primaryFocus?.href ? (
                    <Button asChild className="gap-2" size="sm" variant="secondary">
                      <Link href={primaryFocus.href}>
                        {copy.openCurrent}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
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

              {props.dashboard.state !== "live" && props.dashboard.message ? (
                <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {props.dashboard.message}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {hasActiveProject ? (
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
