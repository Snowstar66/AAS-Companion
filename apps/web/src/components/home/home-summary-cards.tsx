import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { HomeSummaryMetric } from "@aas-companion/api";

type HomeSummaryCardsProps = {
  items: HomeSummaryMetric[];
};

const toneClasses: Record<HomeSummaryMetric["tone"], string> = {
  default: "border-border/70 bg-background/90",
  warning: "border-amber-200 bg-amber-50/90",
  success: "border-emerald-200 bg-emerald-50/90"
};

export function HomeSummaryCards({ items }: HomeSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card className={toneClasses[item.tone]} key={item.label}>
          <CardHeader className="pb-3">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl">{item.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
