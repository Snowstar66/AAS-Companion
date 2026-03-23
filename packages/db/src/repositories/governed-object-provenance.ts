import {
  createImportedPromotionProvenance,
  createNativeProvenance,
  createSeededProvenance,
  governedObjectProvenanceInputSchema,
  governedObjectProvenanceSchema,
  type LineageSourceType,
  type GovernedObjectProvenance,
  type GovernedObjectProvenanceInput
} from "@aas-companion/domain";

type ProvenanceResolverInput = GovernedObjectProvenanceInput & {
  organizationId: string;
};

type ProvenanceDbFields = {
  originType: GovernedObjectProvenance["originType"];
  createdMode: GovernedObjectProvenance["createdMode"];
  lineageSourceType: LineageSourceType | null;
  lineageSourceId: string | null;
  lineageNote: string | null;
};

export function resolveGovernedObjectProvenance(input: ProvenanceResolverInput): GovernedObjectProvenance {
  const parsed = governedObjectProvenanceInputSchema.parse({
    originType: input.originType,
    createdMode: input.createdMode,
    lineageReference: input.lineageReference ?? null
  });

  if (!parsed.originType && !parsed.createdMode) {
    return createNativeProvenance({
      organizationId: input.organizationId,
      lineageReference: parsed.lineageReference ?? null
    });
  }

  const provenance = governedObjectProvenanceSchema.parse({
    originType: parsed.originType,
    createdMode: parsed.createdMode,
    lineageReference: parsed.lineageReference ?? null
  });

  if (provenance.originType === "seeded") {
    return createSeededProvenance(provenance.lineageReference ?? null);
  }

  if (provenance.originType === "imported") {
    if (!provenance.lineageReference) {
      throw new Error("Imported governed objects require lineage metadata.");
    }

    return createImportedPromotionProvenance(provenance.lineageReference);
  }

  return provenance;
}

export function toGovernedObjectProvenanceFields(provenance: GovernedObjectProvenance): ProvenanceDbFields {
  return {
    originType: provenance.originType,
    createdMode: provenance.createdMode,
    lineageSourceType: provenance.lineageReference?.sourceType ?? null,
    lineageSourceId: provenance.lineageReference?.sourceId ?? null,
    lineageNote: provenance.lineageReference?.note ?? null
  };
}

export function toGovernedObjectProvenanceMetadata(provenance: GovernedObjectProvenance) {
  return {
    provenance: {
      originType: provenance.originType,
      createdMode: provenance.createdMode,
      lineageReference: provenance.lineageReference
        ? {
            sourceType: provenance.lineageReference.sourceType,
            sourceId: provenance.lineageReference.sourceId,
            note: provenance.lineageReference.note ?? null
          }
        : null
    }
  };
}
