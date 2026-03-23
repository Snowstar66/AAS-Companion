import Link from "next/link";
import { ArrowRight, DatabaseZap } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type HomeEmptyStateProps = {
  title: string;
  description: string;
};

export function HomeEmptyState({ title, description }: HomeEmptyStateProps) {
  return (
    <Card className="border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,246,252,0.92))] shadow-sm">
      <CardHeader>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/90">
          <DatabaseZap className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="pt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          The Home dashboard is wired up, but it needs seeded M1 records in the current organization before the widgets
          can populate.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2" variant="secondary">
            <Link href="/login">
              Review login and demo access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
