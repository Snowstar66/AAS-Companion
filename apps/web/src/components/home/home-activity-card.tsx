import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { HomeActivityItem } from "@aas-companion/api";

type HomeActivityCardProps = {
  items: HomeActivityItem[];
};

export function HomeActivityCard({ items }: HomeActivityCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest append-only events that a reviewer can inspect.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
            No activity has been recorded for this organization yet.
          </div>
        ) : null}
        {items.map((item) => (
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
