import { AppShell } from "@/components/layout/app-shell";
import { getLoadingProjectName } from "@/lib/loading-project";

export default async function FramingLoading() {
  let projectName: string | undefined;

  try {
    projectName = (await getLoadingProjectName()) ?? undefined;
  } catch {
    projectName = undefined;
  }

  return (
    <AppShell
      {...(projectName ? { activeProjectName: projectName } : {})}
      topbarProps={{
        ...(projectName ? { projectName } : {}),
        sectionLabel: "Framing",
        title: "Framing",
        badge: "Loading"
      }}
    >
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        <div className="grid gap-4">
          <div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
          <div className="h-56 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        </div>
      </div>
    </AppShell>
  );
}
