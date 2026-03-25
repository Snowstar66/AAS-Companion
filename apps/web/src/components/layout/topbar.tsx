import { ArrowRight, FolderKanban, ShieldCheck, Sparkles } from "lucide-react";
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
  eyebrow = "AAS Companion",
  title = "Control Plane Foundation",
  projectName,
  sectionLabel,
  badge
}: TopbarProps) {
  const locationChips = [projectName, sectionLabel, badge].filter(Boolean) as string[];
  const sectionTitle = projectName ? sectionLabel ?? title : title;
  const helperCopy = projectName
    ? "Project context, active section and sign-in state stay visible here while you work."
    : sectionLabel
      ? `You are working inside ${sectionLabel}.`
      : "The header shows where you are in the control plane.";

  return (
    <header className="rounded-[30px] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,248,250,0.94))] px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <AasBrandMark compact subtitle="AAS operating layer" />
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {eyebrow}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{sectionTitle}</h2>
              {badge ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
                  {badge}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                Current workspace
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/85 px-3 py-1.5 text-xs font-medium text-emerald-950">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Structured AAS flow active
              </div>
            </div>

            {locationChips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {locationChips.map((chip, index) => (
                  <div className="flex items-center gap-2" key={`${chip}-${index}`}>
                    {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" /> : null}
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        index === locationChips.length - 1
                          ? "border-primary/25 bg-primary/10 text-foreground"
                          : "border-border/70 bg-background/90 text-muted-foreground"
                      }`}
                    >
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{helperCopy}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <UserSessionStatus />
        </div>
      </div>
    </header>
  );
}
