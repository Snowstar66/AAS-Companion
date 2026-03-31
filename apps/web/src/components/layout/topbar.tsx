import { BrainCircuit } from "lucide-react";
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
  const sectionTitle = projectName ? sectionLabel ?? title : title;
  const normalizedBadge =
    badge && !["Project section", "Project selector", "Method guide"].includes(badge) && badge !== sectionTitle
      ? badge
      : null;
  const locationParts = [projectName, projectName ? sectionTitle : sectionLabel !== title ? sectionLabel : undefined, normalizedBadge].filter(
    Boolean
  ) as string[];

  return (
    <header className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,248,250,0.96))] px-4 py-4 shadow-[0_16px_42px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <AasBrandMark compact subtitle="Augmented Application Services" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <BrainCircuit className="h-3.5 w-3.5 text-primary/80" />
              <span>Engineered for controlled and secure AI acceleration.</span>
            </div>
          </div>

          <div className="space-y-1">
            {locationParts.length > 0 ? (
              <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {locationParts.join(" / ")}
              </p>
            ) : null}

            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">{sectionTitle}</h2>
          </div>
        </div>

        <div className="flex items-center lg:pl-6">
          <UserSessionStatus />
        </div>
      </div>
    </header>
  );
}
