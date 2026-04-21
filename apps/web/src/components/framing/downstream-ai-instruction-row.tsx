"use client";

import { Card, CardContent } from "@aas-companion/ui";
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

function downstreamEffectLabel(group: RefinementPreferenceCatalogEntry["group"]) {
  switch (group) {
    case "epic":
      return "senare Epic-förfining";
    case "story":
      return "senare Story Idea-förfining";
    case "journey":
      return "hur Journey Context används längre nedströms";
    case "design":
      return "senare designbeslut";
    case "build":
      return "senare build- och leveransarbete";
    default:
      return "senare downstream AI-arbete";
  }
}

function whyThisMatters(
  group: RefinementPreferenceCatalogEntry["group"],
  option: "YES" | "NO" | "N/A"
) {
  const effectArea = downstreamEffectLabel(group);

  switch (option) {
    case "YES":
      return `Leder till att downstream AI behandlar detta som en tydlig styrsignal i ${effectArea}. Det ger mer konsekventa beslut, men mindre frihet att avvika.`;
    case "NO":
      return `Leder till att downstream AI inte behöver prioritera detta i ${effectArea}. Det ger större frihet, men också större risk för mindre konsekvent struktur.`;
    case "N/A":
      return `Leder till att downstream AI avgör detta från fall till fall i ${effectArea}. Det ger flexibilitet, men gör utfallet mindre förutsägbart.`;
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
          <span className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground">
            Recommended: {recommendedValue}
          </span>
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
                      Aktivt val
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
                Varför det spelar roll: {whyThisMatters(catalogEntry.group, option)}
              </span>
            </label>
          ))}
        </div>

        {showRationale ? (
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Rationale</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              onChange={(event) => onChangeRationale(event.target.value)}
              placeholder="Explain why this differs from the recommended default or why you intentionally left it open."
              value={preference.rationale ?? ""}
            />
          </label>
        ) : null}
      </CardContent>
    </Card>
  );
}
