import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type HomeActivityCardProps = {
  items: Array<{
    id: string;
    title: string;
    detail?: string | null;
    timestamp: string;
  }>;
  description?: string;
  emptyMessage?: string;
  defaultOpen?: boolean;
};

export function HomeActivityCard({
  items,
  description = "Latest append-only activity for the current context.",
  emptyMessage = "No activity has been recorded yet.",
  defaultOpen = false
}: HomeActivityCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <details className="group rounded-2xl border border-border/70 bg-muted/20" open={defaultOpen}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">Show activity stream</p>
                <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Expand to inspect the latest recorded events without keeping the full stream open all the time.
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
          </summary>
          <div className="space-y-3 border-t border-border/70 px-4 py-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 px-4 py-5 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              items.map((item) => (
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      {item.detail ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p> : null}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
