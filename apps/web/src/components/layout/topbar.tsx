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
  const locationChips = [sectionLabel, badge].filter(Boolean) as string[];
  const sectionTitle = projectName ? sectionLabel ?? title : title;
  const helperCopy = projectName
    ? "Project context and sign-in stay visible while you work."
    : sectionLabel
      ? `You are working inside ${sectionLabel}.`
      : "The header shows where you are in the control plane.";

  return (
    <header className="rounded-[30px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,250,0.94))] px-4 py-4 shadow-[0_18px_54px_rgba(15,23,42,0.05)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-3">
          <AasBrandMark compact subtitle="Augmented Application Services" />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{sectionTitle}</h2>
              {badge ? <span className="rounded-full border border-border/70 bg-muted/25 px-3 py-1 text-xs font-medium text-muted-foreground">{badge}</span> : null}
            </div>

            {projectName ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1.5 text-xs font-medium">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  {projectName}
                </span>
                {locationChips.map((chip, index) => (
                  <div className="flex items-center gap-2" key={`${chip}-${index}`}>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-medium text-muted-foreground">{chip}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{helperCopy}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end xl:pl-6">
          <UserSessionStatus />
        </div>
      </div>
    </header>
  );
}
