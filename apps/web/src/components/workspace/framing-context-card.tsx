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
  language?: "en" | "sv";
};

function renderNodeLabel(node: FramingContextNode, label: string, openLabel: string) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{node.key}</p>
      <p className="mt-1 text-sm text-muted-foreground">{node.title}</p>
      <Button asChild className="mt-3 gap-2" size="sm" variant="secondary">
        <Link href={node.href}>
          {openLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function FramingContextCard({ outcome, epic, story, summary, language = "en" }: FramingContextCardProps) {
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Layers3 className="h-4 w-4 text-primary" />
          {t("Active Framing context", "Aktiv Framing-kontext")}
        </div>
        <CardTitle>{t("Current native working scope", "Aktuell inbyggd arbetsscope")}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {renderNodeLabel(outcome, t("Framing", "Framing"), t("Open", "Oppna"))}
        {epic
          ? renderNodeLabel(epic, t("Epic", "Epic"), t("Open", "Oppna"))
          : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Epic", "Epic")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{t("No Epic context selected yet.", "Ingen Epic-kontext ar vald annu.")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("Stay in the current Framing to create or open one.", "Stanna i aktuell Framing for att skapa eller oppna en.")}</p>
              </div>
            )}
        {story
          ? renderNodeLabel(story, t("Story", "Story"), t("Open", "Oppna"))
          : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("Story", "Story")}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{t("No Story context selected yet.", "Ingen Story-kontext ar vald annu.")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("Only Stories under this Framing branch will appear here.", "Bara Stories under den har Framing-grenen visas har.")}</p>
              </div>
            )}
      </CardContent>
    </Card>
  );
}
