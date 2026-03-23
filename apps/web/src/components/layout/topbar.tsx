import { BellDot, Search, Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";

export type TopbarProps = {
  eyebrow?: string;
  title?: string;
  badge?: string;
};

export function Topbar({
  eyebrow = "AAS Companion",
  title = "Control Plane Foundation",
  badge = "Story M1-001"
}: TopbarProps) {
  return (
    <header className="rounded-[28px] border border-border/70 bg-background/85 px-5 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {badge}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Search outcomes, stories, or artifacts
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
