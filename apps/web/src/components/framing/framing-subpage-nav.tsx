import Link from "next/link";
import { Button } from "@aas-companion/ui";
import { FramingPackagePageHero } from "@/components/framing/framing-package-page-hero";

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

export function FramingSubpageNav({
  outcomeId,
  activeSubpage,
  journeyContextCount,
  customInstructionCount,
  language
}: FramingSubpageNavProps) {
  return (
    <FramingPackagePageHero
      badge={t(language, "Framing package navigation", "Navigering i Framing-paketet")}
      tone="compact"
      chips={
        <>
          <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {t(language, "Linked package", "Kopplat paket")}
          </span>
          <span className="rounded-full border border-sky-200/70 bg-sky-50/70 px-2.5 py-1 text-[11px] font-medium text-sky-800">
            {t(language, "Main source of truth", "Huvudsaklig source of truth")}
          </span>
          <span className="rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
            {t(language, "Optional layers available", "Frivilliga lager tillgängliga")}
          </span>
        </>
      }
      description={t(
        language,
        "Use Framing Overview as the main source of truth. Journey Context and Downstream AI Tuning are optional layers that strengthen handoff quality when they are actually needed.",
        "Använd Framing Overview som huvudsaklig source of truth. Journey Context och Downstream AI-tuning är frivilliga lager som stärker handoff-kvaliteten när de faktiskt behövs."
      )}
      title={t(language, "Framing package navigation", "Navigering i Framing-paketet")}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild size="sm" variant={activeSubpage === "overview" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}`}>{t(language, "Framing Overview", "Framing Overview")}</Link>
        </Button>
        <Button asChild size="sm" variant={activeSubpage === "journey-context" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=journey-context`}>
            {t(language, "Journey Context", "Journey Context")}
            {journeyContextCount > 0 ? ` (${journeyContextCount})` : ""}
          </Link>
        </Button>
        <Button asChild size="sm" variant={activeSubpage === "downstream-ai-instructions" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=downstream-ai-instructions`}>
            {t(language, "Downstream AI Tuning", "Downstream AI-tuning")}
            {customInstructionCount > 0 ? ` (${customInstructionCount})` : ""}
          </Link>
        </Button>
      </div>
    </FramingPackagePageHero>
  );
}
