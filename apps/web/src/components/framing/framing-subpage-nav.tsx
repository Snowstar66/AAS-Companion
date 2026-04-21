import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type FramingSubpageNavProps = {
  outcomeId: string;
  activeSubpage: "overview" | "journey-context" | "downstream-ai-instructions";
  journeyContextCount: number;
  customInstructionCount: number;
  language: "en" | "sv";
};

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

export function FramingSubpageNav({ outcomeId, activeSubpage, journeyContextCount, customInstructionCount, language }: FramingSubpageNavProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{t(language, "Framing package navigation", "Navigering i Framing-paketet")}</CardTitle>
        <CardDescription>
          {t(
            language,
            "Journey Context and Downstream AI Instructions are optional Framing subpages. The main delivery spine still stays Outcome, Epic, Story, Test.",
            "Journey Context och Downstream AI-instruktioner är frivilliga undersidor i Framing. Huvudspåret för leverans är fortfarande Outcome, Epic, Story, Test."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant={activeSubpage === "overview" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}`}>{t(language, "Framing Overview", "Framing Overview")}</Link>
        </Button>
        <Button asChild variant={activeSubpage === "journey-context" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=journey-context`}>
            {t(language, "Journey Context", "Journey Context")}{journeyContextCount > 0 ? ` (${journeyContextCount})` : ""}
          </Link>
        </Button>
        <Button asChild variant={activeSubpage === "downstream-ai-instructions" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=downstream-ai-instructions`}>
            {t(language, "Downstream AI Instructions", "Downstream AI-instruktioner")}{customInstructionCount > 0 ? ` (${customInstructionCount})` : ""}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
