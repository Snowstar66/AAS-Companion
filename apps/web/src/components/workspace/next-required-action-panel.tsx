import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { StoryUxAction } from "@/lib/workspace/story-ux";

type NextRequiredActionPanelProps = {
  actions: StoryUxAction[];
};

export function NextRequiredActionPanel({ actions }: NextRequiredActionPanelProps) {
  return (
    <Card className="border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.14),_transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,246,252,0.92))] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Next required action
        </CardTitle>
        <CardDescription>The page highlights the shortest path forward so you do not need to interpret raw status first.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        {actions.map((action) => (
          <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm" key={`${action.label}:${action.href}`}>
            <p className="font-medium text-foreground">{action.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
            <Button asChild className="mt-4 gap-2" size="sm" variant="secondary">
              <Link href={action.href}>
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
