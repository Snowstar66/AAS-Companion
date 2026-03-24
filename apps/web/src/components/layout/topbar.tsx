import { BellDot, Search, Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";

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
  return (
    <header className="rounded-[28px] border border-border/70 bg-background/88 px-4 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.05)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {projectName ? "Active Project" : eyebrow}
          </p>
          {projectName ? (
            <div className="mt-2 space-y-2">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{projectName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {sectionLabel ? (
                  <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {sectionLabel}
                  </span>
                ) : null}
                {badge ? (
                  <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                    {badge}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
              {badge ? (
                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-2 text-sm text-muted-foreground 2xl:flex">
            <Search className="h-4 w-4" />
            Search project artifacts, stories, or sections
          </div>
          <Button className="gap-2" variant="secondary">
            <Sparkles className="h-4 w-4" />
            BMAD ready
          </Button>
          <button
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:text-foreground"
            type="button"
          >
            <BellDot className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
