import Link from "next/link";
import { CircleAlert, CircleCheckBig, GitBranch, ShieldCheck } from "lucide-react";
import type {
  ArtifactCandidateDraftRecord,
  ArtifactCandidateHumanDecision,
  ArtifactComplianceResult,
  ArtifactParseResult
} from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type ParsedSection = ArtifactParseResult["sections"][number];

type IntakeArtifactFile = {
  id: string;
  fileName: string;
  extension: string;
  content: string;
  sizeBytes: number;
  sourceTypeStatus: string;
  sourceType: string | null;
  sourceTypeConfidence: "high" | "medium" | "low" | null;
  parsedArtifacts: ArtifactParseResult | null;
  parsedSectionCount: number;
  uncertainSectionCount: number;
};

type IntakeArtifactCandidate = {
  id: string;
  fileId: string;
  type: "outcome" | "epic" | "story";
  title: string;
  summary: string;
  mappingState: "mapped" | "uncertain" | "missing";
  relationshipState: "mapped" | "uncertain" | "missing";
  relationshipNote?: string | null | undefined;
  reviewStatus: "pending" | "confirmed" | "edited" | "rejected" | "follow_up_needed" | "promoted";
  source: {
    fileId: string;
    fileName: string;
    sectionId: string;
    sectionTitle: string;
    sectionMarker: string;
    sourceType: string;
    confidence: "high" | "medium" | "low";
  };
  draftRecord: ArtifactCandidateDraftRecord | null;
  humanDecisions: ArtifactCandidateHumanDecision | null;
  complianceResult: ArtifactComplianceResult | null;
  reviewComment?: string | null;
  promotedEntityId?: string | null;
  promotedEntityType?: string | null;
  importedReadinessState?: string | null;
};

type IntakeArtifactSession = {
  id: string;
  label: string;
  mappedArtifacts: { unmappedSections: ParsedSection[] } | null;
};

type QueueItem = {
  id: string;
  title: string;
  description: string;
  context: string;
  status: "resolved" | "unresolved";
  href: string;
};

type ArtifactIntakeReviewWorkspaceProps = {
  session: IntakeArtifactSession;
  selectedFile: IntakeArtifactFile;
  fileCandidates: IntakeArtifactCandidate[];
  selectedCandidate: IntakeArtifactCandidate | null;
  submitAction: (formData: FormData) => Promise<void>;
};

function intakeHref(sessionId: string, fileId: string, candidateId?: string | null, hash?: string) {
  const params = new URLSearchParams({ sessionId, fileId });
  if (candidateId) {
    params.set("candidateId", candidateId);
  }
  return `/intake?${params.toString()}${hash ? `#${hash}` : ""}`;
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function bytes(value: number) {
  return value < 1024 ? `${value} B` : `${(value / 1024).toFixed(1)} KB`;
}

function confidenceTone(confidence: "high" | "medium" | "low") {
  if (confidence === "high") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (confidence === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function fieldTone(kind: "neutral" | "resolved" | "missing" | "uncertain") {
  if (kind === "resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (kind === "missing") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }
  if (kind === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-border/70 bg-muted/20 text-muted-foreground";
}

function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function hasItems(value: string[] | null | undefined) {
  return Boolean(value && value.length > 0);
}

function reviewed(status: IntakeArtifactCandidate["reviewStatus"]) {
  return status === "confirmed" || status === "edited" || status === "promoted";
}

function statusTone(status: "resolved" | "unresolved") {
  return status === "resolved"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-800";
}

function value(value: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.length ? value.join("\n") : "Not set";
  }
  return value && value.trim() ? value : "Not set";
}

function candidateFields(candidate: IntakeArtifactCandidate) {
  const draft = candidate.draftRecord;
  const decisions = candidate.humanDecisions;
  const uncertain =
    candidate.mappingState !== "mapped" ||
    candidate.relationshipState !== "mapped" ||
    candidate.source.confidence !== "high";

  if (candidate.type === "outcome") {
    return [
      ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
      ["Title", draft?.title ?? candidate.title, "neutral"],
      ["Outcome statement", draft?.outcomeStatement ?? null, !hasText(draft?.outcomeStatement) ? "missing" : uncertain ? "uncertain" : "resolved"],
      ["Baseline definition", draft?.baselineDefinition ?? null, !hasText(draft?.baselineDefinition) ? "missing" : "resolved"],
      ["Baseline source", draft?.baselineSource ?? null, !hasText(draft?.baselineSource) ? "missing" : "resolved"],
      ["Value Owner", decisions?.valueOwnerId ?? null, !hasText(decisions?.valueOwnerId) ? "missing" : "resolved"]
    ] as const;
  }

  if (candidate.type === "epic") {
    return [
      ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
      ["Title", draft?.title ?? candidate.title, "neutral"],
      ["Purpose", draft?.purpose ?? candidate.summary, uncertain ? "uncertain" : "neutral"],
      ["Scope boundary", draft?.scopeBoundary ?? null, !hasText(draft?.scopeBoundary) ? "missing" : "resolved"],
      ["Risk note", draft?.riskNote ?? null, "neutral"],
      ["Linked Outcome candidate", draft?.outcomeCandidateId ?? null, !hasText(draft?.outcomeCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"]
    ] as const;
  }

  return [
    ["Key", draft?.key ?? null, !hasText(draft?.key) ? "missing" : "resolved"],
    ["Title", draft?.title ?? candidate.title, "neutral"],
    ["Story type", draft?.storyType ?? null, "neutral"],
    ["Value intent", draft?.valueIntent ?? candidate.summary, uncertain ? "uncertain" : "neutral"],
    ["Acceptance criteria", draft?.acceptanceCriteria ?? [], !hasItems(draft?.acceptanceCriteria) ? "missing" : "resolved"],
    ["AI usage scope", draft?.aiUsageScope ?? [], "neutral"],
    ["Test Definition", draft?.testDefinition ?? null, !hasText(draft?.testDefinition) ? "missing" : "resolved"],
    ["Definition of Done", draft?.definitionOfDone ?? [], !hasItems(draft?.definitionOfDone) ? "missing" : "resolved"],
    ["Linked Outcome candidate", draft?.outcomeCandidateId ?? null, !hasText(draft?.outcomeCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"],
    ["Linked Epic candidate", draft?.epicCandidateId ?? null, !hasText(draft?.epicCandidateId) ? "missing" : candidate.relationshipState !== "mapped" ? "uncertain" : "resolved"]
  ] as const;
}

function queueItems(session: IntakeArtifactSession, file: IntakeArtifactFile, candidates: IntakeArtifactCandidate[]) {
  const items: Array<{ key: string; title: string; description: string; items: QueueItem[] }> = [];
  const baseCandidateId = candidates[0]?.id ?? null;

  items.push({
    key: "unmapped",
    title: "Unmapped source sections",
    description: "These sections still need explicit human interpretation.",
    items: (session.mappedArtifacts?.unmappedSections ?? [])
      .filter((section) => section.sourceReference.fileId === file.id)
      .map((section) => ({
        id: section.id,
        title: section.title,
        description: section.text,
        context: `${section.sourceReference.sectionMarker} lines ${section.sourceReference.lineStart}-${section.sourceReference.lineEnd}`,
        status: "unresolved" as const,
        href: intakeHref(session.id, file.id, baseCandidateId, `source-section-${section.id}`)
      }))
  });

  items.push({
    key: "confidence",
    title: "Low-confidence interpretation checks",
    description: "These items show where parser certainty is still low.",
    items: candidates.flatMap((candidate) => [
      {
        id: `${candidate.id}-source`,
        title: "Source confidence",
        description: `Current source confidence is ${candidate.source.confidence}.`,
        context: `${candidate.title} from ${candidate.source.sectionMarker}`,
        status: candidate.source.confidence === "high" || reviewed(candidate.reviewStatus) ? "resolved" : "unresolved",
        href: intakeHref(session.id, file.id, candidate.id, "candidate-panel")
      },
      {
        id: `${candidate.id}-mapping`,
        title: "Candidate interpretation",
        description: `Mapping is currently ${candidate.mappingState}.`,
        context: candidate.title,
        status: candidate.mappingState === "mapped" || reviewed(candidate.reviewStatus) ? "resolved" : "unresolved",
        href: intakeHref(session.id, file.id, candidate.id, "candidate-panel")
      },
      {
        id: `${candidate.id}-relationship`,
        title: "Value Spine relationship",
        description: `Relationship is currently ${candidate.relationshipState}.`,
        context: candidate.relationshipNote ?? candidate.title,
        status: candidate.relationshipState === "mapped" || reviewed(candidate.reviewStatus) ? "resolved" : "unresolved",
        href: intakeHref(session.id, file.id, candidate.id, "candidate-panel")
      }
    ])
  });

  items.push({
    key: "required",
    title: "Required fields",
    description: "These fields still need to be completed before promotion.",
    items: candidates.flatMap((candidate) =>
      candidateFields(candidate)
        .filter(([, , tone]) => tone === "missing")
        .map(([title]) => ({
          id: `${candidate.id}-${title}`,
          title,
          description: `${title} is not complete yet.`,
          context: candidate.title,
          status: "unresolved" as const,
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
        }))
    )
  });

  items.push({
    key: "human-only",
    title: "Human-only decisions",
    description: "These decisions must remain explicit before promotion.",
    items: candidates.flatMap((candidate) => {
      const decisions = candidate.humanDecisions;
      const human: QueueItem[] = [];
      if (candidate.type === "outcome") {
        human.push(
          {
            id: `${candidate.id}-value-owner`,
            title: "Value Owner",
            description: "A human must confirm ownership.",
            context: candidate.title,
            status: hasText(decisions?.valueOwnerId) ? "resolved" : "unresolved",
            href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
          },
          {
            id: `${candidate.id}-baseline-validity`,
            title: "Baseline validity",
            description: "A human must confirm baseline validity.",
            context: candidate.title,
            status: hasText(decisions?.baselineValidity) ? "resolved" : "unresolved",
            href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
          }
        );
      }
      if (candidate.type !== "epic") {
        human.push({
          id: `${candidate.id}-ai-level`,
          title: "AI level",
          description: "A human must confirm the AI level.",
          context: candidate.title,
          status: hasText(decisions?.aiAccelerationLevel) ? "resolved" : "unresolved",
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
        });
      }
      if (candidate.type === "outcome") {
        human.push({
          id: `${candidate.id}-risk-profile`,
          title: "Risk profile",
          description: "A human must confirm the risk profile.",
          context: candidate.title,
          status: hasText(decisions?.riskProfile) ? "resolved" : "unresolved",
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
        });
      }
      if (candidate.type === "story") {
        human.push({
          id: `${candidate.id}-risk-acceptance`,
          title: "Risk acceptance status",
          description: "A human must confirm the risk acceptance status.",
          context: candidate.title,
          status: hasText(decisions?.riskAcceptanceStatus) ? "resolved" : "unresolved",
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
        });
      }
      return human;
    })
  });

  items.push({
    key: "blocked",
    title: "Blocked issues",
    description: "These issues still block promotion.",
    items: candidates.flatMap((candidate) =>
      (candidate.complianceResult?.findings ?? [])
        .filter((finding) => finding.category === "blocked")
        .map((finding) => ({
          id: `${candidate.id}-${finding.code}`,
          title: finding.fieldLabel ?? "Blocked issue",
          description: finding.message,
          context: candidate.title,
          status: "unresolved" as const,
          href: intakeHref(session.id, file.id, candidate.id, "candidate-editor")
        }))
    )
  });

  return items;
}

function readiness(candidate: IntakeArtifactCandidate) {
  const compliance = candidate.complianceResult;
  if (!compliance) {
    return ["border-amber-200 bg-amber-50 text-amber-900", "Correction state unavailable", "Persisted compliance analysis is missing for this candidate."] as const;
  }
  if (candidate.reviewStatus === "promoted") {
    return ["border-emerald-200 bg-emerald-50 text-emerald-900", "Already promoted", `This candidate has already been promoted into governed ${candidate.promotedEntityType ?? candidate.type} work.`] as const;
  }
  if (candidate.reviewStatus === "rejected") {
    return ["border-rose-200 bg-rose-50 text-rose-900", "Candidate rejected", "This candidate cannot be promoted while rejected."] as const;
  }
  if (compliance.summary.blocked > 0 || compliance.summary.humanOnly > 0) {
    return ["border-rose-200 bg-rose-50 text-rose-900", "Promotion is still blocked", "Blocked findings or unresolved human-only decisions still need review."] as const;
  }
  if (compliance.summary.missing > 0 || compliance.summary.uncertain > 0) {
    return ["border-amber-200 bg-amber-50 text-amber-900", "Correction work still remains", "Missing or uncertain fields should be reconciled before promotion."] as const;
  }
  if (candidate.reviewStatus === "confirmed" || candidate.reviewStatus === "edited") {
    return ["border-emerald-200 bg-emerald-50 text-emerald-900", "Ready for promotion", "Required correction work looks complete and the candidate is ready for explicit promotion."] as const;
  }
  return ["border-sky-200 bg-sky-50 text-sky-900", "Awaiting explicit human confirmation", "The candidate can now be reviewed directly against the source artifact."] as const;
}

export function ArtifactIntakeReviewWorkspace({
  session,
  selectedFile,
  fileCandidates,
  selectedCandidate,
  submitAction
}: ArtifactIntakeReviewWorkspaceProps) {
  const groups = queueItems(session, selectedFile, fileCandidates);
  const ready = selectedCandidate ? readiness(selectedCandidate) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-muted/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Artifact-scoped project review
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Current artifact context</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review stays scoped to one imported artifact at a time so full source, interpreted candidates, and the
              correction queue stay aligned.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {selectedFile.fileName}
            </span>
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {bytes(selectedFile.sizeBytes)}
            </span>
            <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {selectedFile.parsedSectionCount} parsed sections
            </span>
            {selectedFile.sourceTypeConfidence ? (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${confidenceTone(selectedFile.sourceTypeConfidence)}`}
              >
                {selectedFile.sourceTypeConfidence} confidence
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <Card className="order-2 border-border/70 shadow-sm 2xl:order-1">
          <CardHeader>
            <CardTitle>Full imported source artifact</CardTitle>
            <CardDescription>Read the original markdown top to bottom without leaving intake review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.sourceType ? label(selectedFile.sourceType) : label(selectedFile.sourceTypeStatus)}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.extension}
              </span>
              <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                {selectedFile.uncertainSectionCount} uncertain section(s)
              </span>
            </div>

            {selectedFile.parsedArtifacts?.sections.length ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Source structure
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFile.parsedArtifacts.sections.map((section) => (
                    <Link
                      className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                      href={intakeHref(session.id, selectedFile.id, selectedCandidate?.id ?? null, `source-section-${section.id}`)}
                      key={section.id}
                    >
                      {section.sourceReference.sectionMarker}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 bg-slate-950 px-5 py-5 text-sm text-slate-100 shadow-inner">
              <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap break-words font-mono leading-6">{selectedFile.content}</pre>
            </div>

            {selectedFile.parsedArtifacts?.sections.length ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Parsed source sections
                </p>
                {selectedFile.parsedArtifacts.sections.map((section) => (
                  <div
                    className="rounded-2xl border border-border/70 bg-background/80 p-4"
                    id={`source-section-${section.id}`}
                    key={section.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{section.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {section.sourceReference.sectionMarker} - lines {section.sourceReference.lineStart}-
                          {section.sourceReference.lineEnd}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          {label(section.kind)}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${confidenceTone(section.confidence)}`}
                        >
                          {section.confidence}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{section.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="order-1 space-y-6 2xl:order-2">
          <Card className="border-border/70 shadow-sm" id="candidate-panel">
            <CardHeader>
              <CardTitle>Structured candidate view</CardTitle>
              <CardDescription>
                Compare the imported artifact with the interpreted governed candidate fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fileCandidates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {fileCandidates.map((candidate) => (
                    <Button
                      asChild
                      className="gap-2"
                      key={candidate.id}
                      size="sm"
                      variant={candidate.id === selectedCandidate?.id ? "default" : "secondary"}
                    >
                      <Link href={intakeHref(session.id, selectedFile.id, candidate.id, "candidate-panel")}>
                        {candidate.type}: {candidate.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : null}
              {selectedCandidate ? (
                <>
                  <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {selectedCandidate.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{selectedCandidate.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedCandidate.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${confidenceTone(selectedCandidate.source.confidence)}`}
                        >
                          {selectedCandidate.source.confidence} confidence
                        </span>
                        <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {selectedCandidate.reviewStatus}
                        </span>
                        {selectedCandidate.importedReadinessState ? (
                          <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {label(selectedCandidate.importedReadinessState)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {candidateFields(selectedCandidate).map(([fieldLabel, fieldValue, tone]) => (
                      <div className={`rounded-2xl border p-4 ${fieldTone(tone)}`} key={fieldLabel}>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{fieldLabel}</p>
                        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 font-sans">{value(fieldValue)}</pre>
                      </div>
                    ))}
                  </div>

                  {selectedCandidate.relationshipNote ? (
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                      <strong className="text-foreground">Relationship note:</strong> {selectedCandidate.relationshipNote}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                  No mapped candidate is currently attached to this artifact file. The source view remains available while
                  unmapped sections are reviewed.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Correction queue</CardTitle>
              <CardDescription>
                Work through unmapped, uncertain, missing, human-only, and blocked issues one by one for the current
                artifact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {groups.map((group) => {
                const unresolved = group.items.filter((item) => item.status === "unresolved").length;
                const resolved = group.items.filter((item) => item.status === "resolved").length;

                return (
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={group.key}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{group.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {unresolved} unresolved
                        </span>
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                          {resolved} resolved
                        </span>
                      </div>
                    </div>

                    {group.items.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                        No items currently belong to this queue section for the selected artifact.
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-3 xl:grid-cols-2">
                        {group.items.map((item) => (
                          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4" key={item.id}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                <p className="mt-2 text-xs text-muted-foreground">{item.context}</p>
                              </div>
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(item.status)}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <Button asChild className="mt-3 gap-2" size="sm" variant="secondary">
                              <Link href={item.href}>
                                Open in context
                                <GitBranch className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {selectedCandidate ? (
            <form action={submitAction} className="space-y-4" id="candidate-editor">
              <input name="sessionId" type="hidden" value={session.id} />
              <input name="fileId" type="hidden" value={selectedFile.id} />
              <input name="candidateId" type="hidden" value={selectedCandidate.id} />
              <input name="candidateType" type="hidden" value={selectedCandidate.type} />

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Correction and confirmation</CardTitle>
                  <CardDescription>
                    Human corrections are persisted here before promotion. The original imported source remains visible on
                    the left.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ready ? (
                    <div className={`rounded-2xl border px-4 py-4 text-sm ${ready[0]}`}>
                      <p className="font-medium">{ready[1]}</p>
                      <p className="mt-2">{ready[2]}</p>
                    </div>
                  ) : null}

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Key</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.draftRecord?.key ?? ""}
                      name="key"
                      type="text"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Title</span>
                    <input
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.draftRecord?.title ?? selectedCandidate.title}
                      name="title"
                      type="text"
                    />
                  </label>

                  {selectedCandidate.type === "outcome" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Outcome statement</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.outcomeStatement ?? ""}
                          name="outcomeStatement"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline definition</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.baselineDefinition ?? ""}
                          name="baselineDefinition"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline source</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.baselineSource ?? ""}
                          name="baselineSource"
                        />
                      </label>
                    </>
                  ) : null}

                  {selectedCandidate.type === "epic" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Purpose</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.purpose ?? ""}
                          name="purpose"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Scope boundary</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.scopeBoundary ?? ""}
                          name="scopeBoundary"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk note</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.riskNote ?? ""}
                          name="riskNote"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.outcomeCandidateId ?? ""}
                          name="outcomeCandidateId"
                          type="text"
                        />
                      </label>
                    </>
                  ) : null}

                  {selectedCandidate.type === "story" ? (
                    <>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Story type</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.storyType ?? "outcome_delivery"}
                          name="storyType"
                        >
                          <option value="outcome_delivery">Outcome delivery</option>
                          <option value="governance">Governance</option>
                          <option value="enablement">Enablement</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Value intent</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.valueIntent ?? ""}
                          name="valueIntent"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Acceptance criteria</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.acceptanceCriteria ?? []).join("\n")}
                          name="acceptanceCriteria"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">AI usage scope</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.aiUsageScope ?? []).join(", ")}
                          name="aiUsageScope"
                          type="text"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Test Definition</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.draftRecord?.testDefinition ?? ""}
                          name="testDefinition"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Definition of Done</span>
                        <textarea
                          className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                          defaultValue={(selectedCandidate.draftRecord?.definitionOfDone ?? []).join("\n")}
                          name="definitionOfDone"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Linked Outcome candidate ID</span>
                          <input
                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                            defaultValue={selectedCandidate.draftRecord?.outcomeCandidateId ?? ""}
                            name="outcomeCandidateId"
                            type="text"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-foreground">Linked Epic candidate ID</span>
                          <input
                            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                            defaultValue={selectedCandidate.draftRecord?.epicCandidateId ?? ""}
                            name="epicCandidateId"
                            type="text"
                          />
                        </label>
                      </div>
                    </>
                  ) : null}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">Human-only decisions</p>
                    </div>
                    <div className="grid gap-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Value Owner</span>
                        <input
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.valueOwnerId ?? ""}
                          name="valueOwnerId"
                          type="text"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Baseline validity</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.baselineValidity ?? ""}
                          name="baselineValidity"
                        >
                          <option value="">Unresolved</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="needs_follow_up">Needs follow-up</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">AI level</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.aiAccelerationLevel ?? ""}
                          name="aiAccelerationLevel"
                        >
                          <option value="">Unresolved</option>
                          <option value="level_2">Level 2</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk profile</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.riskProfile ?? ""}
                          name="riskProfile"
                        >
                          <option value="">Unresolved</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Risk acceptance status</span>
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                          defaultValue={selectedCandidate.humanDecisions?.riskAcceptanceStatus ?? ""}
                          name="riskAcceptanceStatus"
                        >
                          <option value="">Unresolved</option>
                          <option value="accepted">Accepted</option>
                          <option value="needs_review">Needs review</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Review comment</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      defaultValue={selectedCandidate.reviewComment ?? ""}
                      name="reviewComment"
                    />
                  </label>

                  <div className="grid gap-3">
                    <Button className="gap-2" name="intent" type="submit" value="edit" variant="secondary">
                      <GitBranch className="h-4 w-4" />
                      Save corrections
                    </Button>
                    <Button className="gap-2" name="intent" type="submit" value="confirm">
                      <CircleCheckBig className="h-4 w-4" />
                      Confirm readiness for promotion
                    </Button>
                    <Button className="gap-2" name="intent" type="submit" value="follow_up" variant="secondary">
                      <CircleAlert className="h-4 w-4" />
                      Keep follow-up open
                    </Button>
                    <Button className="gap-2" name="intent" type="submit" value="reject" variant="secondary">
                      Reject candidate
                    </Button>
                    <Button className="gap-2" name="intent" type="submit" value="promote">
                      Promote into project records
                    </Button>
                  </div>

                  {selectedCandidate.promotedEntityId ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                      Promoted into project {selectedCandidate.promotedEntityType} with ID {selectedCandidate.promotedEntityId}.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </form>
          ) : (
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>No mapped candidate selected</CardTitle>
                <CardDescription>
                  Full source and the correction queue stay available even when the selected artifact currently has no
                  candidate to edit.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
