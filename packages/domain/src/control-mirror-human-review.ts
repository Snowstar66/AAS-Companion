export type ControlMirrorHumanReviewItem = {
  id: string;
  persistedReviewItemId?: string | null;
  stableFindingKey?: string | null;
  reviewState?: "open" | "decided" | "deferred" | "superseded" | null;
  persistedUpdatedAt?: string | null;
  latestHumanDecision?: {
    id: string;
    decisionType: "approve" | "approve_with_controls" | "reject" | "defer" | "downgrade" | "request_exception" | "request_rework";
    rationale: string;
    actorId: string;
    createdAt: string;
  } | null;
  sourceFindingId?: string | null;
  severity: "high" | "medium" | "low";
  category: string;
  decisionNeeded: string;
  recommendedOption: "APPROVE" | "APPROVE WITH CONDITION" | "REJECT" | "DEFER" | "REQUEST CHANGE";
  affectedObject: string;
  affectedOutcomeId?: string | null;
  affectedEpicId?: string | null;
  affectedStoryId?: string | null;
  blocksRelease: boolean;
  reviewHref: string;
  valueRationale: string;
  alternatives: string[];
  riskIfApproved: string;
  riskIfNotApproved: string;
  suggestedResponse: string;
  rationale: string;
};

export type ControlMirrorHumanReviewState = NonNullable<ControlMirrorHumanReviewItem["reviewState"]>;
export type ControlMirrorHumanReviewDecisionType = NonNullable<ControlMirrorHumanReviewItem["latestHumanDecision"]>["decisionType"];

export type ControlMirrorHumanReviewStateSummary = {
  open: number;
  decided: number;
  deferred: number;
  superseded: number;
  openBlocking: number;
  items: Array<{
    id: string;
    persistedReviewItemId?: string | null | undefined;
    state: ControlMirrorHumanReviewState;
    category: string;
    affectedObject: string;
    affectedOutcomeId?: string | null | undefined;
    affectedEpicId?: string | null | undefined;
    affectedStoryId?: string | null | undefined;
    blocksRelease: boolean;
    latestDecisionType?: ControlMirrorHumanReviewDecisionType | undefined;
    latestDecisionRationale?: string | null | undefined;
  }>;
};

function slugControlMirrorHumanReviewKeyPart(value: string | null | undefined) {
  const normalized = (value ?? "none")
    .trim()
    .toLowerCase()
    .replace(/level[_\s-]*(\d)/g, "level-$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "none";
}

export function createControlMirrorHumanReviewStableKey(item: ControlMirrorHumanReviewItem) {
  return [
    slugControlMirrorHumanReviewKeyPart(item.sourceFindingId ?? item.id),
    slugControlMirrorHumanReviewKeyPart(item.category),
    item.affectedOutcomeId ? slugControlMirrorHumanReviewKeyPart(item.affectedOutcomeId) : "",
    item.affectedEpicId ? slugControlMirrorHumanReviewKeyPart(item.affectedEpicId) : "",
    item.affectedStoryId ? slugControlMirrorHumanReviewKeyPart(item.affectedStoryId) : ""
  ].join("|");
}

export function createControlMirrorReviewHref(itemId: string) {
  return `/review?source=control-mirror&reviewItem=${encodeURIComponent(itemId)}#operational-review`;
}

export function enrichControlMirrorHumanReviewItem(item: Omit<ControlMirrorHumanReviewItem, "reviewHref" | "valueRationale" | "alternatives" | "riskIfApproved" | "riskIfNotApproved" | "suggestedResponse">): ControlMirrorHumanReviewItem {
  return {
    ...item,
    reviewHref: createControlMirrorReviewHref(item.id),
    valueRationale: "Keeps proceed, pause, downgrade and release decisions traceable to approved Framing and evidence.",
    alternatives: ["Resolve the evidence gap", "Downgrade the AI-level claim", "Defer the affected scope", "Record an explicit exception decision"],
    riskIfApproved: "The team may proceed with an unsupported control claim or unverified delivery risk.",
    riskIfNotApproved: "Delivery may pause while evidence, mandate or traceability is restored.",
    suggestedResponse: item.recommendedOption
  };
}

export function getControlMirrorHumanReviewState(item: ControlMirrorHumanReviewItem): ControlMirrorHumanReviewState {
  return item.reviewState ?? "open";
}

export function summarizeControlMirrorHumanReviewState(items: ControlMirrorHumanReviewItem[]): ControlMirrorHumanReviewStateSummary {
  const summary: ControlMirrorHumanReviewStateSummary = {
    open: 0,
    decided: 0,
    deferred: 0,
    superseded: 0,
    openBlocking: 0,
    items: []
  };

  for (const item of items) {
    const state = getControlMirrorHumanReviewState(item);
    summary[state] += 1;

    if (state === "open" && item.blocksRelease) {
      summary.openBlocking += 1;
    }

    summary.items.push({
      id: item.id,
      persistedReviewItemId: item.persistedReviewItemId,
      state,
      category: item.category,
      affectedObject: item.affectedObject,
      affectedOutcomeId: item.affectedOutcomeId,
      affectedEpicId: item.affectedEpicId,
      affectedStoryId: item.affectedStoryId,
      blocksRelease: item.blocksRelease,
      latestDecisionType: item.latestHumanDecision?.decisionType,
      latestDecisionRationale: item.latestHumanDecision?.rationale ?? null
    });
  }

  return summary;
}
