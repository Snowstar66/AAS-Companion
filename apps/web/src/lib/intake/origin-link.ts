type OriginIntakeHrefInput = {
  candidateId?: string | null | undefined;
  entityId?: string | null | undefined;
  entityType?: "outcome" | "epic" | "direction_seed" | "story" | null | undefined;
};

export function buildOriginIntakeHref(input: OriginIntakeHrefInput) {
  const candidateId = input.candidateId?.trim() ?? "";
  const entityId = input.entityId?.trim() ?? "";

  if (!candidateId && !entityId) {
    return null;
  }

  const params = new URLSearchParams();

  if (candidateId) {
    params.set("candidateId", candidateId);
  }

  if (entityId) {
    params.set("entityId", entityId);
  }

  if (input.entityType?.trim()) {
    params.set("entityType", input.entityType);
  }

  return `/intake?${params.toString()}`;
}
