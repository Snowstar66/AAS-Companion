const EPIC_SCOPE_V1_PREFIX = "[aas-epic-v1]";

type EpicSummaryCarrier = {
  summary: string | null;
};

export function decodeEpicShape(summary: string | null | undefined) {
  if (!summary) {
    return {
      scopeBoundary: null,
      riskNote: null
    };
  }

  if (!summary.startsWith(EPIC_SCOPE_V1_PREFIX)) {
    return {
      scopeBoundary: summary,
      riskNote: null
    };
  }

  try {
    const payload = JSON.parse(summary.slice(EPIC_SCOPE_V1_PREFIX.length)) as {
      scopeBoundary?: unknown;
      riskNote?: unknown;
    };

    return {
      scopeBoundary: typeof payload.scopeBoundary === "string" ? payload.scopeBoundary : null,
      riskNote: typeof payload.riskNote === "string" ? payload.riskNote : null
    };
  } catch {
    return {
      scopeBoundary: summary,
      riskNote: null
    };
  }
}

export function encodeEpicShape(input: {
  scopeBoundary?: string | null;
  riskNote?: string | null;
}) {
  const scopeBoundary = input.scopeBoundary?.trim() ? input.scopeBoundary.trim() : null;
  const riskNote = input.riskNote?.trim() ? input.riskNote.trim() : null;

  if (!scopeBoundary && !riskNote) {
    return null;
  }

  if (!riskNote) {
    return scopeBoundary;
  }

  return `${EPIC_SCOPE_V1_PREFIX}${JSON.stringify({
    scopeBoundary,
    riskNote
  })}`;
}

export function withEpicShape<T extends EpicSummaryCarrier>(epic: T) {
  return {
    ...epic,
    ...decodeEpicShape(epic.summary)
  };
}
