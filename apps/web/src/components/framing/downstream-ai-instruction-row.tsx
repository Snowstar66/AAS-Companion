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

function optionGuideTone(active: boolean) {
  return active
    ? "border-sky-300 bg-sky-50 text-sky-900"
    : "border-border/70 bg-muted/10 text-muted-foreground";
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
  const selectedMeaning = catalogEntry.meaning[preference.selectedValue];

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
                <span className="font-semibold">{option}</span>
                <input
                  checked={preference.selectedValue === option}
                  className="h-4 w-4"
                  name={`${preference.id}-selection`}
                  onChange={() => onChangeSelection(option)}
                  type="radio"
                />
              </span>
              <span className="leading-6">{catalogEntry.meaning[option]}</span>
            </label>
          ))}
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
          <p className="text-sm font-medium text-foreground">Vad betyder detta för downstream AI?</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ditt nuvarande val är <span className="font-medium text-foreground">{preference.selectedValue}</span>. Det innebär:
            {" "}
            {selectedMeaning}
          </p>
          <div className={`mt-3 grid gap-3 ${options.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
            {options.map((option) => (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${optionGuideTone(preference.selectedValue === option)}`}
                key={`${preference.id}-guide-${option}`}
              >
                <p className="font-semibold text-foreground">{option === "YES" ? "Ja" : option === "NO" ? "Nej" : "N/A"}</p>
                <p className="mt-2 leading-6">{catalogEntry.meaning[option]}</p>
              </div>
            ))}
          </div>
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
