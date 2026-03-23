import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type HomeListItem = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  severity?: "high" | "medium";
};

type HomeListCardProps = {
  title: string;
  description: string;
  emptyMessage: string;
  items: HomeListItem[];
};

export function HomeListCard({ title, description, emptyMessage, items }: HomeListCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : null}
        {items.map((item) => (
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.severity ? (
                    <CircleAlert
                      className={`h-4 w-4 ${item.severity === "high" ? "text-amber-600" : "text-slate-500"}`}
                    />
                  ) : null}
                  <p className="font-medium">{item.title}</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
              {item.href ? (
                <Link
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:opacity-80"
                  href={item.href}
                >
                  Open
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
