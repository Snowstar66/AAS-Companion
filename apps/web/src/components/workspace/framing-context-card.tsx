import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type FramingContextNode = {
  id: string;
  key: string;
  title: string;
  href: string;
};

type FramingContextCardProps = {
  outcome: FramingContextNode;
  epic?: FramingContextNode | null;
  story?: FramingContextNode | null;
  summary: string;
};

function renderNodeLabel(node: FramingContextNode, label: string) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{node.key}</p>
      <p className="mt-1 text-sm text-muted-foreground">{node.title}</p>
      <Button asChild className="mt-3 gap-2" size="sm" variant="secondary">
        <Link href={node.href}>
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function FramingContextCard({ outcome, epic, story, summary }: FramingContextCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Layers3 className="h-4 w-4 text-primary" />
          Active Framing context
        </div>
        <CardTitle>Current native working scope</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {renderNodeLabel(outcome, "Framing")}
        {epic
          ? renderNodeLabel(epic, "Epic")
          : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Epic</p>
                <p className="mt-2 text-sm font-medium text-foreground">No Epic context selected yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">Stay in the current Framing to create or open one.</p>
              </div>
            )}
        {story
          ? renderNodeLabel(story, "Story")
          : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Story</p>
                <p className="mt-2 text-sm font-medium text-foreground">No Story context selected yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">Only Stories under this Framing branch will appear here.</p>
              </div>
            )}
      </CardContent>
    </Card>
  );
}
