import { ArrowRight, FolderKanban, Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { UserSessionStatus } from "@/components/layout/user-session-status";

export type TopbarProps = {
  eyebrow?: string;
  title?: string;
  projectName?: string;
  sectionLabel?: string;
  badge?: string;
};

export function Topbar({
  eyebrow = "AAS Companion",
  title = "Control Plane Foundation",
  projectName,
  sectionLabel,
  badge = "Story M1-001"
}: TopbarProps) {
  const locationChips = [projectName, sectionLabel, badge].filter(Boolean) as string[];

  return (
    <header className="rounded-[28px] border border-border/70 bg-background/88 px-4 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.05)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
          {projectName ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                Current workspace
              </div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{projectName}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {locationChips.map((chip, index) => (
                  <div className="flex items-center gap-2" key={`${chip}-${index}`}>
                    {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/70" /> : null}
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        index === locationChips.length - 1
                          ? "border-primary/25 bg-primary/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground"
                      }`}
                    >
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
                {badge ? (
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                    {badge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {sectionLabel ? `You are working inside ${sectionLabel}.` : "The header shows where you are in the control plane."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <Button className="gap-2" variant="secondary">
              <Sparkles className="h-4 w-4" />
              AI-assisted
            </Button>
          </div>
          <UserSessionStatus />
        </div>
      </div>
    </header>
  );
}
