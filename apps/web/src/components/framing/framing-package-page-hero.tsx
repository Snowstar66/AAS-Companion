import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type FramingPackagePageHeroProps = {
  badge: ReactNode;
  title: ReactNode;
  description: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "compact";
};

export function FramingPackagePageHero({
  badge,
  title,
  description,
  chips = null,
  actions = null,
  children = null,
  tone = "default"
}: FramingPackagePageHeroProps) {
  const isCompact = tone === "compact";

  return (
    <Card
      className={
        isCompact
          ? "overflow-hidden border-border/70 bg-white shadow-sm"
          : "overflow-hidden border-sky-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]"
      }
    >
      <CardHeader className={isCompact ? "gap-3 p-5" : "gap-4"}>
        <div className={`flex flex-col ${isCompact ? "gap-3" : "gap-4"} lg:flex-row lg:items-start lg:justify-between`}>
          <div className={isCompact ? "space-y-3" : "space-y-4"}>
            <div
              className={
                isCompact
                  ? "inline-flex items-center rounded-full border border-border/70 bg-muted/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                  : "inline-flex items-center rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900 shadow-sm"
              }
            >
              {badge}
            </div>
            {chips ? <div className={`flex flex-wrap ${isCompact ? "gap-1.5" : "gap-2"}`}>{chips}</div> : null}
            <div className={isCompact ? "space-y-1.5" : "space-y-2"}>
              <CardTitle className={isCompact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}>{title}</CardTitle>
              <CardDescription className={isCompact ? "max-w-4xl text-sm leading-6" : "max-w-4xl text-sm leading-7 sm:text-base"}>
                {description}
              </CardDescription>
            </div>
          </div>
          {actions ? <div className={`flex shrink-0 flex-wrap items-center ${isCompact ? "gap-2" : "gap-3"}`}>{actions}</div> : null}
        </div>
      </CardHeader>
      {children ? <CardContent className={isCompact ? "grid gap-4 bg-transparent p-5 pt-0" : "grid gap-5 bg-white/80"}>{children}</CardContent> : null}
    </Card>
  );
}
