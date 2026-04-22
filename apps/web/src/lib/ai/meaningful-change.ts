function normalizeComparableLine(value: string) {
  return value
    .normalize("NFKC")
    .replace(/^[-*•]\s*/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => normalizeComparableLine(line))
    .filter(Boolean)
    .join("\n");
}

export function hasMeaningfulTextChange(currentValue: string | null | undefined, suggestedValue: string | null | undefined) {
  const current = normalizeComparableText(currentValue);
  const suggested = normalizeComparableText(suggestedValue);

  if (!suggested) {
    return false;
  }

  return current !== suggested;
}

export function hasMeaningfulListChange(currentValues: string[] | null | undefined, suggestedValues: string[] | null | undefined) {
  const current = (currentValues ?? []).map((item) => normalizeComparableText(item)).filter(Boolean).join("\n");
  const suggested = (suggestedValues ?? []).map((item) => normalizeComparableText(item)).filter(Boolean).join("\n");

  if (!suggested) {
    return false;
  }

  return current !== suggested;
}
