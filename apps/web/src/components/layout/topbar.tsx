import { ArrowRight, FolderKanban } from "lucide-react";
import { UserSessionStatus } from "@/components/layout/user-session-status";
import { AasBrandMark } from "@/components/shared/aas-brand-mark";

export type TopbarProps = {
  eyebrow?: string;
  title?: string;
  projectName?: string;
  sectionLabel?: string;
  badge?: string;
};

export function Topbar({
  title = "Control Plane Foundation",
  projectName,
  sectionLabel,
  badge
}: TopbarProps) {
  const locationChips = [projectName ? sectionLabel : sectionLabel && sectionLabel !== title ? sectionLabel : undefined, badge].filter(Boolean) as string[];
  const sectionTitle = projectName ? sectionLabel ?? title : title;

  return (
    <header className="rounded-[30px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.94))] px-4 py-4 shadow-[0_18px_54px_rgba(15,23,42,0.05)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex items-center gap-4">
            <AasBrandMark compact subtitle="Augmented Application Services" />
            {projectName ? (
              <div className="hidden h-10 w-px bg-border/70 sm:block" />
            ) : null}
            {projectName ? (
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Active project</p>
                <p className="truncate text-sm font-medium text-foreground">{projectName}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            {locationChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                {projectName ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1.5">
                    <FolderKanban className="h-3.5 w-3.5 text-primary" />
                    {projectName}
                  </span>
                ) : null}
                {locationChips.map((chip, index) => (
                  <div className="flex items-center gap-2" key={`${chip}-${index}`}>
                    {projectName || index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" /> : null}
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            ) : projectName ? (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:hidden">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                <span>{projectName}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{sectionTitle}</h2>
              {badge ? (
                <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {badge}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end xl:pl-6">
          <UserSessionStatus />
        </div>
      </div>
    </header>
  );
}
