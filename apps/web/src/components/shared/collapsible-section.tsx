import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
  accentClassName?: string;
};

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = false,
  accentClassName = "border-border/70 bg-background"
}: CollapsibleSectionProps) {
  return (
    <details className={`group rounded-[28px] border shadow-sm ${accentClassName}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-1 rounded-full border border-border/70 bg-background/85 p-2 transition-transform duration-200 group-open:rotate-180">
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </summary>
      <div className="border-t border-border/70 px-5 py-5">{children}</div>
    </details>
  );
}
