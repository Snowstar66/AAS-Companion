import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, Card, CardContent } from "@aas-companion/ui";

type ActionSummaryCardProps = {
  label: string;
  value: string | number;
  description?: string | undefined;
  className?: string | undefined;
  actionHref?: string | undefined;
  actionLabel?: string | undefined;
};

export function ActionSummaryCard({
  label,
  value,
  description,
  className,
  actionHref,
  actionLabel = "Open"
}: ActionSummaryCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        {actionHref ? (
          <div className="mt-4">
            <Button asChild className="gap-2" size="sm" variant="secondary">
              <Link href={actionHref}>
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
