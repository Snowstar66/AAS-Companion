export type FramingConstraintBundle = {
  generalConstraints: string;
  uxPrinciples: string;
  nonFunctionalRequirements: string;
  additionalRequirements: string;
};

const SECTION_LABELS = {
  generalConstraints: "General constraints",
  uxPrinciples: "UX principles",
  nonFunctionalRequirements: "Non-functional requirements",
  additionalRequirements: "Additional requirements"
} as const satisfies Record<keyof FramingConstraintBundle, string>;

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

function extractSectionBlock(source: string, heading: string) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|\\n)## ${escapedHeading}\\n([\\s\\S]*?)(?=\\n## [^\\n]+\\n|$)`, "i");
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? "";
}

export function parseFramingConstraintBundle(value: string | null | undefined): FramingConstraintBundle {
  const normalized = normalizeText(value);

  if (!normalized) {
    return {
      generalConstraints: "",
      uxPrinciples: "",
      nonFunctionalRequirements: "",
      additionalRequirements: ""
    };
  }

  const hasStructuredSections = Object.values(SECTION_LABELS).some((heading) =>
    normalized.toLowerCase().includes(`## ${heading.toLowerCase()}`)
  );

  if (!hasStructuredSections) {
    return {
      generalConstraints: normalized,
      uxPrinciples: "",
      nonFunctionalRequirements: "",
      additionalRequirements: ""
    };
  }

  return {
    generalConstraints: extractSectionBlock(normalized, SECTION_LABELS.generalConstraints),
    uxPrinciples: extractSectionBlock(normalized, SECTION_LABELS.uxPrinciples),
    nonFunctionalRequirements: extractSectionBlock(normalized, SECTION_LABELS.nonFunctionalRequirements),
    additionalRequirements: extractSectionBlock(normalized, SECTION_LABELS.additionalRequirements)
  };
}

export function serializeFramingConstraintBundle(bundle: Partial<FramingConstraintBundle>): string | null {
  const normalized: FramingConstraintBundle = {
    generalConstraints: normalizeText(bundle.generalConstraints),
    uxPrinciples: normalizeText(bundle.uxPrinciples),
    nonFunctionalRequirements: normalizeText(bundle.nonFunctionalRequirements),
    additionalRequirements: normalizeText(bundle.additionalRequirements)
  };

  const sections = (Object.keys(SECTION_LABELS) as Array<keyof FramingConstraintBundle>)
    .map((key) => {
      const value = normalized[key];
      if (!value) {
        return null;
      }

      return `## ${SECTION_LABELS[key]}\n${value}`;
    })
    .filter((value): value is string => Boolean(value));

  return sections.length > 0 ? sections.join("\n\n") : null;
}

