import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type FramingPackagePageHeroProps = {
  badge: ReactNode;
  title: ReactNode;
  description: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function FramingPackagePageHero({
  badge,
  title,
  description,
  chips = null,
  actions = null,
  children = null
}: FramingPackagePageHeroProps) {
  return (
    <Card className="overflow-hidden border-sky-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900 shadow-sm">
              {badge}
            </div>
            {chips ? <div className="flex flex-wrap gap-2">{chips}</div> : null}
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
              <CardDescription className="max-w-4xl text-sm leading-7 sm:text-base">
                {description}
              </CardDescription>
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </CardHeader>
      {children ? <CardContent className="grid gap-5 bg-white/80">{children}</CardContent> : null}
    </Card>
  );
}
