import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { HomeOutcomeStatusStat } from "@aas-companion/api";

type HomeStatusGridProps = {
  items: HomeOutcomeStatusStat[];
};

export function HomeStatusGrid({ items }: HomeStatusGridProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Outcomes by status</CardTitle>
        <CardDescription>Current outcome distribution in the active organization scope.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div className="rounded-2xl border border-border/70 bg-muted/25 p-4" key={item.status}>
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{item.count}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
