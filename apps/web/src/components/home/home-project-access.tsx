"use client";

import Link from "next/link";
import { ArrowRight, FolderOpen, LogOut, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type {
  clearActiveProjectAction,
  createProjectAction,
  deleteCurrentProjectAction,
  openDemoProjectAction,
  openProjectAction
} from "@/app/project-actions";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { PendingFormButton } from "@/components/shared/pending-form-button";

type HomeProjectAccessProps = {
  projects: Array<{
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    isActive?: boolean;
    counts: {
      outcomes: number;
      epics: number;
      storyIdeas: number;
      deliveryStories: number;
      stories: number;
      activityEvents: number;
    };
  }>;
  hasActiveProject: boolean;
  currentProjectName: string;
  hasAuthenticatedUser: boolean;
  canManageProjects: boolean;
  isDemoSession: boolean;
  createProjectAction: typeof createProjectAction;
  openProjectAction: typeof openProjectAction;
  openDemoProjectAction: typeof openDemoProjectAction;
  clearActiveProjectAction: typeof clearActiveProjectAction;
  deleteCurrentProjectAction: typeof deleteCurrentProjectAction;
};

function CompactProjectCount(props: { label: string; value: number | string }) {
  return (
    <div className="rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <span className="uppercase tracking-[0.18em]">{props.label}</span>
      <span className="ml-2 font-semibold text-foreground">{props.value}</span>
    </div>
  );
}

function ProjectToneCard(props: {
  active?: boolean | undefined;
  title: string;
  counts: {
    outcomes: number;
    epics: number;
    storyIdeas: number;
    deliveryStories: number;
    stories: number;
    activityEvents: number;
  };
  organizationId: string;
  openProjectAction: typeof openProjectAction;
  copy: {
    currentProjectPill: string;
    activeProjectCardDescription: string;
    inactiveProjectCardDescription: string;
    epics: string;
    storyIdeas: string;
    deliveryStories: string;
    continueInProject: string;
    openProject: string;
    openingProject: string;
  };
}) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm transition ${
        props.active
          ? "border-sky-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98))]"
          : "border-border/70 bg-background/95"
      }`}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">{props.title}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {props.active ? props.copy.activeProjectCardDescription : props.copy.inactiveProjectCardDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            <CompactProjectCount label={props.copy.epics} value={props.counts.epics} />
            <CompactProjectCount label={props.copy.storyIdeas} value={props.counts.storyIdeas} />
            <CompactProjectCount label={props.copy.deliveryStories} value={props.counts.deliveryStories} />
          </div>
        </div>
        <form action={props.openProjectAction} className="lg:min-w-[170px]">
          <input name="organizationId" type="hidden" value={props.organizationId} />
          <PendingFormButton
            className="w-full gap-2"
            label={props.active ? props.copy.continueInProject : props.copy.openProject}
            pendingLabel={props.copy.openingProject}
            showPendingCursor
            size="sm"
            variant={props.active ? "default" : "secondary"}
          />
        </form>
      </div>
    </div>
  );
}

export function HomeProjectAccess(props: HomeProjectAccessProps) {
  const { language } = useAppChromeLanguage();
  const managedProjectCount = props.projects.length;
  const copy =
    language === "sv"
      ? {
          projectAccessTitle: "Projektatkomst",
          projectAccessDescription: "Öppna, skapa, byt, lämna eller ta bort projekt från en kompakt kontrollpanel.",
          availableProjects: "Tillgängliga projekt",
          projects: "Projekt",
          active: "Aktiv",
          none: "Ingen",
          mode: "Läge",
          demo: "Demo",
          normal: "Normal",
          signInManageProjects: "Logga in med ditt konto för att hantera vanliga projekt, eller lämna Demo för att återgå till en ren startsida.",
          signInFirst:
            "Logga in först för att välja ett vanligt projekt eller skapa ett nytt. Inloggningssidan låter dig välja direktinloggning, e-postinloggning eller Demo när det finns.",
          noNormalProjectsTitle: "Det finns inga vanliga projekt ännu.",
          noNormalProjectsBody: "Skapa det första projektet här, eller öppna Demo uttryckligen om du behöver referensmaterial.",
          currentProjectPill: "Nuvarande projekt",
          activeProjectCardDescription: "Det här projektet är redan aktivt. Gå direkt tillbaka till dess nuvarande Framing och operativa arbete.",
          inactiveProjectCardDescription: "Öppna projektet för att avgränsa dashboard, Framing, Value Spine, Import och Review till just den här arbetsgrenen.",
          epics: "Epics",
          storyIdeas: "Story Ideas",
          deliveryStories: "Delivery Stories",
          continueInProject: "Fortsätt i projekt",
          openProject: "Öppna projekt",
          openingProject: "Öppnar projekt...",
          quickActions: "Snabbåtgärder",
          createProjectTitle: "Skapa projekt",
          newProjectName: "Nytt projektnamn",
          createAndOpenProject: "Skapa och öppna projekt",
          creatingProject: "Skapar projekt...",
          openSignInOptions: "Öppna inloggningsval",
          demoAccess: "Demoatkomst",
          demoAccessDescription: "Demo är separerat från vanliga projekt och öppnas bara när det väljs uttryckligen.",
          reopenDemoProject: "Öppna demo-projekt igen",
          openDemoProject: "Öppna demo-projekt",
          openingDemo: "Öppnar demo...",
          chooseDemoAccess: "Välj demoatkomst",
          currentProjectControls: "Kontroller för nuvarande projekt",
          leaveDemoDescription: "Lämna Demo för att återgå till en ren startsida utan ett aktivt projekt.",
          leaveProjectDescription: "Lämna eller ta bort det aktuella projektet när du medvetet vill nollställa aktiv kontext.",
          leaveDemoProject: "Lämna demo-projekt",
          leaveCurrentProject: "Lämna nuvarande projekt",
          leavingDemo: "Lämnar demo...",
          leavingProject: "Lämnar projekt...",
          deleteProject: "Ta bort projekt",
          deletingProject: "Tar bort projekt...",
          noActiveProjectControls: "Inga kontroller för aktivt projekt behövs förrän ett projekt är öppet."
        }
      : {
          projectAccessTitle: "Project access",
          projectAccessDescription: "Open, create, switch, leave or remove projects from one compact control surface.",
          availableProjects: "Available projects",
          projects: "Projects",
          active: "Active",
          none: "None",
          mode: "Mode",
          demo: "Demo",
          normal: "Normal",
          signInManageProjects: "Sign in with your account to manage normal projects, or leave Demo to return to a clean Home.",
          signInFirst:
            "Sign in first to choose a normal project or create a new one. The sign-in page lets you pick direct sign-in, email login, or Demo when available.",
          noNormalProjectsTitle: "No normal projects exist yet.",
          noNormalProjectsBody: "Create the first project here, or open Demo explicitly if you need reference material.",
          currentProjectPill: "Current project",
          activeProjectCardDescription: "This project is already active. Continue straight back into its current Framing and operational work.",
          inactiveProjectCardDescription: "Open this project to scope the dashboard, Framing, Value Spine, Import and Review to this branch of work.",
          epics: "Epics",
          storyIdeas: "Story Ideas",
          deliveryStories: "Delivery Stories",
          continueInProject: "Continue in project",
          openProject: "Open project",
          openingProject: "Opening project...",
          quickActions: "Quick actions",
          createProjectTitle: "Create project",
          newProjectName: "New project name",
          createAndOpenProject: "Create and open project",
          creatingProject: "Creating project...",
          openSignInOptions: "Open sign-in options",
          demoAccess: "Demo access",
          demoAccessDescription: "Demo remains separate from normal projects and opens only when chosen explicitly.",
          reopenDemoProject: "Re-open demo project",
          openDemoProject: "Open demo project",
          openingDemo: "Opening demo...",
          chooseDemoAccess: "Choose demo access",
          currentProjectControls: "Current project controls",
          leaveDemoDescription: "Leave Demo to return to a clean Home without an active project.",
          leaveProjectDescription: "Leave or delete the current project when you intentionally want to reset active context.",
          leaveDemoProject: "Leave demo project",
          leaveCurrentProject: "Leave current project",
          leavingDemo: "Leaving demo...",
          leavingProject: "Leaving project...",
          deleteProject: "Delete project",
          deletingProject: "Deleting project...",
          noActiveProjectControls: "No active project controls are needed until a project is open."
        };

  return (
    <Card className="border-border/70 shadow-sm" id="project-list">
      <CardHeader>
        <CardTitle>{copy.projectAccessTitle}</CardTitle>
        <CardDescription>{copy.projectAccessDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.availableProjects}</p>
            <CompactProjectCount label={copy.projects} value={managedProjectCount} />
            <CompactProjectCount label={copy.active} value={props.hasActiveProject ? props.currentProjectName : copy.none} />
            <CompactProjectCount label={copy.mode} value={props.isDemoSession ? copy.demo : copy.normal} />
          </div>
          {!props.canManageProjects ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
              {props.isDemoSession ? copy.signInManageProjects : copy.signInFirst}
            </div>
          ) : props.projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{copy.noNormalProjectsTitle}</p>
              <p className="mt-2">{copy.noNormalProjectsBody}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {props.projects.map((project) => (
                <ProjectToneCard
                  active={project.isActive}
                  counts={project.counts}
                  copy={copy}
                  key={project.organizationId}
                  openProjectAction={props.openProjectAction}
                  organizationId={project.organizationId}
                  title={project.organizationName}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/92 shadow-sm">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{copy.quickActions}</p>
            </div>

            <div className="space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-sky-900" />
                  <p className="font-semibold text-sky-950">{copy.createProjectTitle}</p>
                </div>
                {props.canManageProjects ? (
                  <form action={props.createProjectAction} className="flex flex-col gap-3">
                    <input
                      className="h-12 min-w-0 w-full rounded-2xl border border-sky-200/80 bg-white px-5 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                      name="projectName"
                      placeholder={copy.newProjectName}
                      required
                      type="text"
                    />
                    <PendingFormButton
                      className="w-full gap-2"
                      icon={<ArrowRight className="h-4 w-4" />}
                      label={copy.createAndOpenProject}
                      pendingLabel={copy.creatingProject}
                      showPendingCursor
                    />
                  </form>
                ) : (
                  <Button asChild className="gap-2">
                    <Link href="/login?redirectTo=%2F">
                      {copy.openSignInOptions}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">{copy.demoAccess}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.demoAccessDescription}</p>
                  {props.hasAuthenticatedUser ? (
                    <form action={props.openDemoProjectAction} className="mt-4">
                      <PendingFormButton
                        className="w-full gap-2"
                        icon={<ArrowRight className="h-4 w-4" />}
                        label={props.isDemoSession ? copy.reopenDemoProject : copy.openDemoProject}
                        pendingLabel={copy.openingDemo}
                        showPendingCursor
                        variant="secondary"
                      />
                    </form>
                  ) : (
                    <Button asChild className="mt-4 w-full gap-2" variant="secondary">
                      <Link href="/login">
                        {copy.chooseDemoAccess}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">{copy.currentProjectControls}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {props.isDemoSession ? copy.leaveDemoDescription : copy.leaveProjectDescription}
                  </p>
                  {props.hasActiveProject || props.isDemoSession ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form action={props.clearActiveProjectAction}>
                        <PendingFormButton
                          className="gap-2"
                          icon={<LogOut className="h-4 w-4" />}
                          label={props.isDemoSession ? copy.leaveDemoProject : copy.leaveCurrentProject}
                          pendingLabel={props.isDemoSession ? copy.leavingDemo : copy.leavingProject}
                          showPendingCursor
                          variant="secondary"
                        />
                      </form>
                      {props.hasActiveProject && !props.isDemoSession ? (
                        <form action={props.deleteCurrentProjectAction}>
                          <PendingFormButton
                            className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                            icon={<Trash2 className="h-4 w-4" />}
                            label={copy.deleteProject}
                            pendingLabel={copy.deletingProject}
                            showPendingCursor
                          />
                        </form>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">{copy.noActiveProjectControls}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
