"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { DownstreamAiInstructionRow } from "@/components/framing/downstream-ai-instruction-row";
import type { RefinementPreferenceCatalogEntry, RefinementPreferenceSelection } from "@/lib/framing/downstreamInstructionTypes";

type DownstreamAiInstructionSectionProps = {
  initiativeType: "AD" | "AT" | "AM";
  title: string;
  description: string;
  rows: Array<{
    preference: RefinementPreferenceSelection;
    catalogEntry: RefinementPreferenceCatalogEntry;
  }>;
  onChangeSelection: (preferenceId: string, value: "YES" | "NO" | "N/A") => void;
  onChangeRationale: (preferenceId: string, value: string) => void;
};

export function DownstreamAiInstructionSection({
  initiativeType,
  title,
  description,
  rows,
  onChangeSelection,
  onChangeRationale
}: DownstreamAiInstructionSectionProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(({ preference, catalogEntry }) => (
          <DownstreamAiInstructionRow
            catalogEntry={catalogEntry}
            key={preference.id}
            onChangeRationale={(value) => onChangeRationale(preference.id, value)}
            onChangeSelection={(value) => onChangeSelection(preference.id, value)}
            preference={preference}
            recommendedValue={catalogEntry.defaultByMode[initiativeType]}
          />
        ))}
      </CardContent>
    </Card>
  );
}
