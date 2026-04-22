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
            "Use Framing Overview as the main source of truth. Journey Context and Downstream AI Tuning are optional layers that strengthen handoff quality when they are actually needed.",
            "Använd Framing Overview som huvudsaklig source of truth. Journey Context och Downstream AI-tuning är frivilliga lager som stärker handoff-kvaliteten när de faktiskt behövs."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant={activeSubpage === "overview" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}`}>{t(language, "Framing Overview", "Framing Overview")}</Link>
        </Button>
        <Button asChild variant={activeSubpage === "journey-context" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=journey-context`}>
            {t(language, "Journey Context", "Journey Context")}
            {journeyContextCount > 0 ? ` (${journeyContextCount})` : ""}
          </Link>
        </Button>
        <Button asChild variant={activeSubpage === "downstream-ai-instructions" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=downstream-ai-instructions`}>
            {t(language, "Downstream AI Tuning", "Downstream AI-tuning")}
            {customInstructionCount > 0 ? ` (${customInstructionCount})` : ""}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
