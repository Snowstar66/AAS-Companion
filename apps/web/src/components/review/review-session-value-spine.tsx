import Link from "next/link";
import { ChevronDown } from "lucide-react";

type ReviewCandidateNode = {
  id: string;
  type: "outcome" | "epic" | "story";
  title: string;
  summary: string;
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  inferredOutcomeCandidateId?: string | null;
  inferredEpicCandidateId?: string | null;
  draftRecord?: {
    key?: string | null;
    title?: string | null;
    outcomeStatement?: string | null;
    purpose?: string | null;
    valueIntent?: string | null;
    outcomeCandidateId?: string | null;
    epicCandidateId?: string | null;
  } | null;
  intakeSession?: {
    id?: string | null;
    importIntent?: "framing" | "design" | string | null;
  } | null;
};

type ReviewOutcomeOption = {
  id: string;
  key: string;
  title: string;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isLegacyImportKey(value: string | null | undefined) {
  return /^IMP-(OUT|EPC|STR|STORY)-/i.test(value?.trim() ?? "");
}

function buildSuggestedKey(candidates: ReviewCandidateNode[], candidate: ReviewCandidateNode) {
  const typed = candidates.filter((entry) => entry.type === candidate.type);
  const index = typed.findIndex((entry) => entry.id === candidate.id);
  const sequence = index >= 0 ? index + 1 : typed.length + 1;
  const prefix =
    candidate.type === "outcome"
      ? "OUT"
      : candidate.type === "epic"
        ? "EPC"
        : candidate.intakeSession?.importIntent === "design"
          ? "STR"
          : "SC";

  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

function getDisplayedKey(candidates: ReviewCandidateNode[], candidate: ReviewCandidateNode) {
  const stored = candidate.draftRecord?.key?.trim() ?? "";
  return stored && !isLegacyImportKey(stored) ? stored : buildSuggestedKey(candidates, candidate);
}

function storyDescription(candidate: ReviewCandidateNode) {
  const valueIntent = normalizeText(candidate.draftRecord?.valueIntent);
  const summary = normalizeText(candidate.summary);
  const title = normalizeText(candidate.draftRecord?.title ?? candidate.title);
  const selected = valueIntent || summary;

  if (!selected || selected.toLowerCase() === title.toLowerCase()) {
    return null;
  }

  return selected;
}

function getStatusTone(candidate: ReviewCandidateNode) {
  if (candidate.reviewStatus === "promoted") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (candidate.reviewStatus === "rejected") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (candidate.reviewStatus === "follow_up_needed") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (candidate.reviewStatus === "confirmed") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function getStatusLabel(candidate: ReviewCandidateNode) {
  if (candidate.reviewStatus === "promoted") {
    return "Approved";
  }

  if (candidate.reviewStatus === "rejected") {
    return "Rejected";
  }

  if (candidate.reviewStatus === "follow_up_needed") {
    return "Needs action";
  }

  if (candidate.reviewStatus === "confirmed") {
    return "Confirmed";
  }

  if (candidate.reviewStatus === "edited") {
    return "Edited";
  }

  return "Pending";
}

function collapseOutcomeCandidates(candidates: ReviewCandidateNode[]) {
  const outcomes = candidates.filter((candidate) => candidate.type === "outcome");

  if (outcomes.length <= 1) {
    return {
      candidates,
      primaryOutcomeId: outcomes[0]?.id ?? null
    };
  }

  const primaryOutcome = outcomes[0]!;
  const aliases = new Map<string, string>(outcomes.slice(1).map((candidate) => [candidate.id, primaryOutcome.id] as const));
  const mergedPrimary: ReviewCandidateNode = {
    ...primaryOutcome,
    summary: [primaryOutcome.draftRecord?.outcomeStatement, primaryOutcome.summary]
      .map((value) => normalizeText(value))
      .find(Boolean) ?? primaryOutcome.summary,
    draftRecord: {
      ...primaryOutcome.draftRecord,
      outcomeStatement: [
        primaryOutcome.draftRecord?.outcomeStatement,
        ...outcomes.slice(1).map((candidate) => candidate.draftRecord?.outcomeStatement ?? candidate.summary)
      ]
        .map((value) => normalizeText(value))
        .filter(Boolean)
        .join("\n\n") || null
    }
  };

  return {
    primaryOutcomeId: primaryOutcome.id,
    candidates: candidates.flatMap<ReviewCandidateNode>((candidate) => {
      if (aliases.has(candidate.id)) {
        return [];
      }

      if (candidate.id === primaryOutcome.id) {
        return [mergedPrimary];
      }

      const outcomeCandidateId = candidate.draftRecord?.outcomeCandidateId ?? candidate.inferredOutcomeCandidateId ?? null;
      const resolvedOutcomeCandidateId = outcomeCandidateId && aliases.has(outcomeCandidateId) ? aliases.get(outcomeCandidateId) ?? outcomeCandidateId : outcomeCandidateId;

      return [
        {
          ...candidate,
          draftRecord: candidate.draftRecord
            ? {
                ...candidate.draftRecord,
                outcomeCandidateId: resolvedOutcomeCandidateId
              }
            : null
        }
      ];
    })
  };
}

export function ReviewSessionValueSpine(props: {
  candidates: ReviewCandidateNode[];
  selectedCandidateId: string;
  reviewHref: (candidateId: string) => string;
  projectOutcomes: ReviewOutcomeOption[];
}) {
  const collapsed = collapseOutcomeCandidates(props.candidates);
  const candidates = collapsed.candidates;
  const outcomes = candidates.filter((candidate) => candidate.type === "outcome");
  const epics = candidates.filter((candidate) => candidate.type === "epic");
  const stories = candidates.filter((candidate) => candidate.type === "story");
  const rootOutcome =
    outcomes[0] ??
    (props.projectOutcomes.length === 1
      ? {
          id: props.projectOutcomes[0]!.id,
          type: "outcome" as const,
          title: props.projectOutcomes[0]!.title,
          summary: props.projectOutcomes[0]!.title,
          reviewStatus: "confirmed" as const,
          draftRecord: {
            key: props.projectOutcomes[0]!.key,
            title: props.projectOutcomes[0]!.title,
            outcomeStatement: props.projectOutcomes[0]!.title
          }
        }
      : null);
  const epicOutcomeMap = new Map(
    epics.map((epic) => [epic.id, epic.draftRecord?.outcomeCandidateId ?? epic.inferredOutcomeCandidateId ?? rootOutcome?.id ?? ""] as const)
  );

  const groupedEpics = epics.filter((epic) => {
    if (!rootOutcome) {
      return true;
    }

    const linkedOutcomeId = epic.draftRecord?.outcomeCandidateId ?? epic.inferredOutcomeCandidateId ?? rootOutcome.id;
    return linkedOutcomeId === rootOutcome.id;
  });

  const rootStories = stories.filter((story) => {
    const epicId = story.draftRecord?.epicCandidateId ?? story.inferredEpicCandidateId ?? "";
    const outcomeId =
      story.draftRecord?.outcomeCandidateId ??
      story.inferredOutcomeCandidateId ??
      (epicId ? epicOutcomeMap.get(epicId) ?? "" : rootOutcome?.id ?? "");

    return !epicId && (!rootOutcome || !outcomeId || outcomeId === rootOutcome.id);
  });

  return (
    <div className="rounded-3xl border border-border/70 bg-background shadow-sm">
      <div className="border-b border-border/70 px-6 py-5">
        <h3 className="font-semibold text-foreground">Imported value spine</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Read this import as one hierarchy before you change the focused candidate. The selected node is highlighted in the spine.
        </p>
      </div>
      <div className="space-y-3 px-4 py-4">
        {rootOutcome ? (
          <details className="rounded-2xl border border-border/70 bg-background" open>
            <summary className="flex list-none items-start justify-between gap-3 px-4 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                    Outcome
                  </span>
                  {"reviewStatus" in rootOutcome ? (
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(rootOutcome)}`}>
                      {getStatusLabel(rootOutcome)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 font-medium text-foreground">
                  {rootOutcome.draftRecord?.key ?? rootOutcome.id} {rootOutcome.draftRecord?.title ?? rootOutcome.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rootOutcome.draftRecord?.outcomeStatement ?? rootOutcome.summary}
                </p>
              </div>
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </summary>
            <div className="space-y-3 border-t border-border/70 px-4 py-4">
              {groupedEpics.map((epic) => {
                const epicStories = stories.filter(
                  (story) => (story.draftRecord?.epicCandidateId ?? story.inferredEpicCandidateId ?? "") === epic.id
                );

                return (
                  <details className="ml-4 rounded-2xl border border-border/70 bg-background" key={epic.id} open>
                    <summary className="flex list-none items-start justify-between gap-3 px-4 py-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-800">
                            Epic
                          </span>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(epic)}`}>
                            {getStatusLabel(epic)}
                          </span>
                          <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            {epicStories.length} linked
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-foreground">
                          {getDisplayedKey(candidates, epic)} {epic.draftRecord?.title ?? epic.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{epic.draftRecord?.purpose ?? epic.summary}</p>
                      </div>
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </summary>
                    <div className="space-y-3 border-t border-border/70 px-4 py-4">
                      {epicStories.map((story) => {
                        const selected = story.id === props.selectedCandidateId;

                        return (
                          <Link
                            className={`ml-4 block rounded-2xl border p-4 transition ${
                              selected
                                ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                                : "border-border/70 bg-muted/10 hover:border-emerald-200"
                            }`}
                            href={props.reviewHref(story.id)}
                            key={story.id}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                                {story.intakeSession?.importIntent === "design" ? "Delivery story" : "Story idea"}
                              </span>
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(story)}`}>
                                {getStatusLabel(story)}
                              </span>
                              {selected ? (
                                <span className="inline-flex rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 font-medium text-foreground">
                              {getDisplayedKey(candidates, story)} {story.draftRecord?.title ?? story.title}
                            </p>
                            {storyDescription(story) ? (
                              <p className="mt-1 text-sm text-muted-foreground">{storyDescription(story)}</p>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                );
              })}

              {rootStories.length > 0 ? (
                <div className="ml-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">Epic linkage needed</p>
                  <div className="mt-3 space-y-3">
                    {rootStories.map((story) => (
                      <Link
                        className={`block rounded-2xl border p-4 transition ${
                          story.id === props.selectedCandidateId
                            ? "border-emerald-300 bg-white shadow-sm"
                            : "border-amber-200 bg-white/90 hover:border-emerald-200"
                        }`}
                        href={props.reviewHref(story.id)}
                        key={story.id}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                            {story.intakeSession?.importIntent === "design" ? "Delivery story" : "Story idea"}
                          </span>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(story)}`}>
                            {getStatusLabel(story)}
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-foreground">
                          {getDisplayedKey(candidates, story)} {story.draftRecord?.title ?? story.title}
                        </p>
                        {storyDescription(story) ? (
                          <p className="mt-1 text-sm text-muted-foreground">{storyDescription(story)}</p>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
            This session does not yet expose a readable Outcome {"->"} Epic {"->"} Story hierarchy.
          </div>
        )}
      </div>
    </div>
  );
}
