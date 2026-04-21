"use client";

import { Card, CardContent } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import type { RefinementPreferenceCatalogEntry, RefinementPreferenceSelection } from "@/lib/framing/downstreamInstructionTypes";

type DownstreamAiInstructionRowProps = {
  preference: RefinementPreferenceSelection;
  catalogEntry: RefinementPreferenceCatalogEntry;
  recommendedValue: "YES" | "NO" | "N/A";
  onChangeSelection: (value: "YES" | "NO" | "N/A") => void;
  onChangeRationale: (value: string) => void;
};

function optionTone(active: boolean) {
  return active
    ? "border-sky-300 bg-sky-50 text-sky-900"
    : "border-border/70 bg-background text-muted-foreground";
}

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function downstreamEffectLabel(language: "en" | "sv", group: RefinementPreferenceCatalogEntry["group"]) {
  switch (group) {
    case "epic":
      return t(language, "later Epic refinement", "senare Epic-förfining");
    case "story":
      return t(language, "later Story Idea refinement", "senare Story Idea-förfining");
    case "journey":
      return t(language, "how Journey Context is used downstream", "hur Journey Context används längre nedströms");
    case "design":
      return t(language, "later design decisions", "senare designbeslut");
    case "build":
      return t(language, "later build and delivery work", "senare build- och leveransarbete");
    default:
      return t(language, "later downstream AI work", "senare downstream AI-arbete");
  }
}

function whyThisMatters(
  language: "en" | "sv",
  group: RefinementPreferenceCatalogEntry["group"],
  option: "YES" | "NO" | "N/A"
) {
  const effectArea = downstreamEffectLabel(language, group);

  switch (option) {
    case "YES":
      return t(
        language,
        `This makes downstream AI treat this as an explicit steering signal in ${effectArea}. That gives more consistent decisions, but less freedom to deviate.`,
        `Leder till att downstream AI behandlar detta som en tydlig styrsignal i ${effectArea}. Det ger mer konsekventa beslut, men mindre frihet att avvika.`
      );
    case "NO":
      return t(
        language,
        `This means downstream AI does not need to prioritize this in ${effectArea}. That gives more freedom, but also a greater risk of less consistent structure.`,
        `Leder till att downstream AI inte behöver prioritera detta i ${effectArea}. Det ger större frihet, men också större risk för mindre konsekvent struktur.`
      );
    case "N/A":
      return t(
        language,
        `This lets downstream AI decide case by case in ${effectArea}. That gives flexibility, but makes the outcome less predictable.`,
        `Leder till att downstream AI avgör detta från fall till fall i ${effectArea}. Det ger flexibilitet, men gör utfallet mindre förutsägbart.`
      );
    default:
      return "";
  }
}

function recommendedWhy(
  language: "en" | "sv",
  group: RefinementPreferenceCatalogEntry["group"],
  option: "YES" | "NO" | "N/A"
) {
  switch (option) {
    case "YES":
      return t(
        language,
        `Recommended because this usually gives more consistent ${downstreamEffectLabel(language, group)}.`,
        `Rekommenderat eftersom det normalt ger mer konsekvent ${downstreamEffectLabel(language, group)}.`
      );
    case "NO":
      return t(
        language,
        `Recommended because this usually leaves more freedom in ${downstreamEffectLabel(language, group)}.`,
        `Rekommenderat eftersom det normalt lämnar mer frihet i ${downstreamEffectLabel(language, group)}.`
      );
    case "N/A":
      return t(
        language,
        `Recommended because it is usually best to let downstream AI decide this in ${downstreamEffectLabel(language, group)}.`,
        `Rekommenderat eftersom det normalt är bäst att låta downstream AI avgöra detta i ${downstreamEffectLabel(language, group)}.`
      );
    default:
      return "";
  }
}

export function DownstreamAiInstructionRow({
  preference,
  catalogEntry,
  recommendedValue,
  onChangeSelection,
  onChangeRationale
}: DownstreamAiInstructionRowProps) {
  const { language } = useAppChromeLanguage();
  const showRationale = preference.selectedValue !== recommendedValue || preference.selectedValue === "N/A";
  const options = catalogEntry.allowNa ? (["YES", "NO", "N/A"] as const) : (["YES", "NO"] as const);

  return (
    <Card className="border-border/70 shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{catalogEntry.id} · {preference.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{preference.description ?? catalogEntry.description}</p>
          </div>
          <div className="space-y-2 xl:max-w-xs xl:text-right">
            <span className="inline-flex rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
              {t(language, "Recommended", "Rekommenderat")}: {recommendedValue}
            </span>
            <p className="text-xs leading-5 text-muted-foreground">
              {recommendedWhy(language, catalogEntry.group, recommendedValue)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {options.map((option) => (
            <label
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 text-sm transition ${optionTone(
                preference.selectedValue === option
              )}`}
              key={option}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  <span>{option}</span>
                  {preference.selectedValue === option ? (
                    <span className="rounded-full border border-sky-200 bg-white/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-sky-900">
                      {t(language, "Active", "Aktivt val")}
                    </span>
                  ) : null}
                </span>
                <input
                  checked={preference.selectedValue === option}
                  className="h-4 w-4"
                  name={`${preference.id}-selection`}
                  onChange={() => onChangeSelection(option)}
                  type="radio"
                />
              </span>
              <span className="leading-6">{catalogEntry.meaning[option]}</span>
              <span className="text-xs leading-5 text-muted-foreground">
                {t(language, "Why this matters", "Varför det spelar roll")}: {whyThisMatters(language, catalogEntry.group, option)}
              </span>
            </label>
          ))}
        </div>

        {showRationale ? (
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{t(language, "Rationale", "Motivering")}</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChangeRationale(event.target.value)}
              placeholder={t(
                language,
                "Explain why this differs from the recommended default or why you intentionally left it open.",
                "Beskriv varför detta avviker från standardrekommendationen eller varför du medvetet lämnar det öppet."
              )}
              value={preference.rationale ?? ""}
            />
          </label>
        ) : null}
      </CardContent>
    </Card>
  );
}

