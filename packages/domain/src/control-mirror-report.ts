import type {
  ControlMirrorAiLevel,
  ControlMirrorDashboard,
  ControlMirrorMetric,
  ControlMirrorNormalizedEvidenceSummary,
  ControlMirrorReportSummaryItem,
  ControlMirrorStatus
} from "./control-mirror";

export function buildControlMirrorReportSummaryItems(input: {
  metrics: ControlMirrorMetric[];
  releaseReadiness: ControlMirrorStatus;
  requestedAiLevel: ControlMirrorAiLevel;
  achievedAiLevel: ControlMirrorAiLevel;
  openHumanReviewItems: number;
  blockingHumanReviewItems: number;
  evidenceRetentionSummary: string;
  evidenceRetentionStatus: ControlMirrorStatus;
}) {
  const summaryItems: ControlMirrorReportSummaryItem[] = [
    ...input.metrics.map<ControlMirrorReportSummaryItem>((metric) => ({
      id: metric.id,
      label: metric.label,
      value: `${metric.percentage}%`,
      status: metric.status
    })),
    {
      id: "requested-ai-level",
      label: "Requested AI level",
      value: input.requestedAiLevel,
      status: "ready"
    },
    {
      id: "achieved-ai-level",
      label: "Achieved AI level",
      value: input.achievedAiLevel,
      status: input.requestedAiLevel === input.achievedAiLevel ? "ready" : "downgrade_required"
    },
    {
      id: "open-human-review-items",
      label: "Open Human Review items",
      value: input.openHumanReviewItems,
      status: input.blockingHumanReviewItems > 0 ? "blocked" : input.openHumanReviewItems > 0 ? "human_approval_required" : "ready"
    },
    {
      id: "evidence-retention",
      label: "Evidence retention",
      value: input.evidenceRetentionSummary,
      status: input.evidenceRetentionStatus
    },
    {
      id: "release-readiness",
      label: "Release readiness",
      value: input.releaseReadiness,
      status: input.releaseReadiness
    }
  ];

  return summaryItems;
}

export function summarizeControlMirrorEvidenceRetention(normalizedEvidence: ControlMirrorNormalizedEvidenceSummary[]) {
  if (normalizedEvidence.length === 0) {
    return {
      summary: "No normalized source evidence has been retained for this snapshot.",
      status: "ready" as ControlMirrorStatus,
      redactedCount: 0,
      omittedCount: 0,
      sensitiveFindingCount: 0
    };
  }

  const redactedCount = normalizedEvidence.filter((item) => item.redactionApplied).length;
  const omittedCount = normalizedEvidence.filter((item) => item.retentionMode === "metadata_only" || item.retentionMode === "not_retained").length;
  const excerptCount = normalizedEvidence.filter((item) => {
    const retentionMode = item.retentionMode ?? "metadata_and_excerpts";

    return retentionMode === "metadata_and_excerpts" || retentionMode === "redacted_excerpts";
  }).length;
  const sensitiveFindingCount = normalizedEvidence.reduce((sum, item) => sum + (item.sensitiveFindingCount ?? 0), 0);
  const parts = [
    `${excerptCount} excerpt${excerptCount === 1 ? "" : "s"} retained`,
    `${redactedCount} redacted`,
    `${omittedCount} metadata-only or omitted`
  ];

  return {
    summary: `${parts.join(", ")}. Source text policy is disclosed per normalized evidence item.`,
    status: sensitiveFindingCount > 0 ? "human_approval_required" as ControlMirrorStatus : omittedCount > 0 ? "conditional" as ControlMirrorStatus : "ready" as ControlMirrorStatus,
    redactedCount,
    omittedCount,
    sensitiveFindingCount
  };
}

export type ControlMirrorEvidencePack = {
  schemaVersion: "control-mirror-evidence-pack/v1";
  generatedAt: string;
  activeProject: string;
  snapshot: {
    id: string;
    label: string;
    sourceType: string;
    scanTime: string | null;
    fileCount: number;
    acceptedCount: number;
    rejectedCount: number;
    unreadableCount: number;
    unchangedCount: number;
    newCount: number;
    modifiedCount: number;
    deletedCount: number;
  };
  aiLevel: {
    requested: ControlMirrorAiLevel;
    achieved: ControlMirrorAiLevel;
    releaseReadiness: ControlMirrorStatus;
  };
  source: {
    summary: string;
    retentionDefault: string;
    activeModeLabel: string | null;
    activeModeRetention: string | null;
  };
  report: {
    approvedFramingVersion: string;
    summaryItems: ControlMirrorReportSummaryItem[];
    requiredApprovals: string[];
    blockingGaps: string[];
    residualRisks: string[];
    recommendedNextStep: string;
    executionStatement: string;
    evidenceRetentionSummary: string;
  };
  evidence: {
    artifacts: Array<{
      id: string;
      fileName: string;
      artifactType: string;
      lineageStatus: string;
      parsingConfidence: string;
      changeStatus?: string | undefined;
      storyId: string | null;
    }>;
    normalizedEvidence: Array<{
      id: string;
      artifactId: string;
      fileName: string;
      evidenceType: string;
      label: string;
      sourceSection: string;
      storyClassification: string;
      readinessState: string;
      missingReadinessFields: string[];
      storyId: string | null;
      retentionMode?: string | undefined;
      retentionDisclosure?: string | undefined;
      redactionApplied?: boolean | undefined;
      sensitiveFindingCount?: number | undefined;
    }>;
  };
  findings: {
    conformance: ControlMirrorDashboard["conformance"]["findings"];
    guardrails: ControlMirrorDashboard["guardrails"]["findings"];
  };
  humanReview: {
    summary: ControlMirrorDashboard["reviewStateSummary"];
    items: Array<{
      id: string;
      stableFindingKey?: string | null | undefined;
      reviewState?: string | null | undefined;
      category: string;
      severity: string;
      decisionNeeded: string;
      recommendedOption: string;
      affectedObject: string;
      blocksRelease: boolean;
      latestHumanDecision?: ControlMirrorDashboard["humanReviewItems"][number]["latestHumanDecision"];
    }>;
  };
  safety: {
    rawSourceTextIncluded: false;
    disclosure: string;
  };
  acceptance: ControlMirrorEvidencePackAcceptancePolicy;
};

export type ControlMirrorEvidencePackAcceptancePolicy = {
  status: "requires_product_security_acceptance";
  shareReadiness: "acceptance_required";
  requiredReviewers: string[];
  checklist: Array<{
    id: string;
    label: string;
    status: "requires_review" | "verified";
    detail: string;
  }>;
  disclosure: string;
};

export function buildControlMirrorEvidencePackAcceptancePolicy(input: {
  rawSourceTextIncluded: false;
  sensitiveFindingCount: number;
}): ControlMirrorEvidencePackAcceptancePolicy {
  return {
    status: "requires_product_security_acceptance",
    shareReadiness: "acceptance_required",
    requiredReviewers: ["Product owner", "Security/privacy reviewer", "AQA reviewer"],
    checklist: [
      {
        id: "raw-source-exclusion",
        label: "Raw source text exclusion",
        status: "verified",
        detail: input.rawSourceTextIncluded
          ? "Raw source text is marked as included and must not be shared."
          : "Raw source text is not included in the evidence pack."
      },
      {
        id: "payload-field-review",
        label: "Export payload field review",
        status: "requires_review",
        detail: "Product and Security must confirm that exported metadata, findings and review state are appropriate for the intended audience."
      },
      {
        id: "retention-disclosure-review",
        label: "Retention and redaction disclosure review",
        status: "requires_review",
        detail: `${input.sensitiveFindingCount} sensitive finding${input.sensitiveFindingCount === 1 ? "" : "s"} ${input.sensitiveFindingCount === 1 ? "requires" : "require"} retention disclosure review before broad sharing.`
      },
      {
        id: "external-sharing-rules",
        label: "External sharing rules",
        status: "requires_review",
        detail: "Governance sharing rules must be accepted before treating the export as externally approved."
      }
    ],
    disclosure: "Evidence packs are generated audit artifacts. Product/Security acceptance is required before broad governance or external sharing."
  };
}

export function ensureControlMirrorEvidencePackAcceptancePolicy(evidencePack: ControlMirrorEvidencePack & {
  acceptance?: ControlMirrorEvidencePackAcceptancePolicy;
}): ControlMirrorEvidencePack {
  if (evidencePack.acceptance) {
    return evidencePack;
  }

  const sensitiveFindingCount = evidencePack.evidence.normalizedEvidence.reduce((sum, item) => sum + (item.sensitiveFindingCount ?? 0), 0);

  return {
    ...evidencePack,
    acceptance: buildControlMirrorEvidencePackAcceptancePolicy({
      rawSourceTextIncluded: false,
      sensitiveFindingCount
    })
  };
}

export function buildControlMirrorEvidencePackFileName(input: {
  activeProject: string;
  snapshotId: string;
  extension: "json" | "md";
}) {
  const safeProjectName = input.activeProject
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "control-mirror";
  const safeSnapshotId = input.snapshotId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "snapshot";

  return `${safeProjectName}-${safeSnapshotId}-evidence-pack.${input.extension}`;
}

export function buildControlMirrorEvidencePack(dashboard: ControlMirrorDashboard, options: {
  generatedAt?: Date | string;
} = {}): ControlMirrorEvidencePack {
  const generatedAt = options.generatedAt instanceof Date
    ? options.generatedAt.toISOString()
    : options.generatedAt ?? new Date().toISOString();
  const activeMode = dashboard.sourcePolicy.modes.find((mode) => mode.id === dashboard.snapshot.sourceType);
  const sensitiveFindingCount = dashboard.normalizedEvidence.reduce((sum, item) => sum + (item.sensitiveFindingCount ?? 0), 0);

  return {
    schemaVersion: "control-mirror-evidence-pack/v1",
    generatedAt,
    activeProject: dashboard.report.activeProject,
    snapshot: {
      id: dashboard.snapshot.id,
      label: dashboard.snapshot.label,
      sourceType: dashboard.snapshot.sourceType,
      scanTime: dashboard.snapshot.scanTime,
      fileCount: dashboard.snapshot.fileCount,
      acceptedCount: dashboard.snapshot.acceptedCount,
      rejectedCount: dashboard.snapshot.rejectedCount,
      unreadableCount: dashboard.snapshot.unreadableCount,
      unchangedCount: dashboard.snapshot.unchangedCount,
      newCount: dashboard.snapshot.newCount,
      modifiedCount: dashboard.snapshot.modifiedCount,
      deletedCount: dashboard.snapshot.deletedCount
    },
    aiLevel: {
      requested: dashboard.requestedAiLevel,
      achieved: dashboard.achievedAiLevel,
      releaseReadiness: dashboard.releaseReadiness
    },
    source: {
      summary: dashboard.sourcePolicy.summary,
      retentionDefault: dashboard.sourcePolicy.retentionDefault,
      activeModeLabel: activeMode?.label ?? null,
      activeModeRetention: activeMode?.retentionMode ?? null
    },
    report: {
      approvedFramingVersion: dashboard.report.approvedFramingVersion,
      summaryItems: dashboard.report.evidenceSummaries,
      requiredApprovals: dashboard.report.requiredApprovals,
      blockingGaps: dashboard.report.blockingGaps,
      residualRisks: dashboard.report.residualRisks,
      recommendedNextStep: dashboard.report.recommendedNextStep,
      executionStatement: dashboard.report.executionStatement,
      evidenceRetentionSummary: dashboard.report.evidenceRetentionSummary
    },
    evidence: {
      artifacts: dashboard.artifacts.map((artifact) => ({
        id: artifact.id,
        fileName: artifact.fileName,
        artifactType: artifact.artifactType,
        lineageStatus: artifact.lineageStatus,
        parsingConfidence: artifact.parsingConfidence,
        changeStatus: artifact.changeStatus,
        storyId: artifact.storyId
      })),
      normalizedEvidence: dashboard.normalizedEvidence.map((item) => ({
        id: item.id,
        artifactId: item.artifactId,
        fileName: item.fileName,
        evidenceType: item.evidenceType,
        label: item.label,
        sourceSection: item.sourceSection,
        storyClassification: item.storyClassification,
        readinessState: item.readinessState,
        missingReadinessFields: item.missingReadinessFields,
        storyId: item.storyId,
        retentionMode: item.retentionMode,
        retentionDisclosure: item.retentionDisclosure,
        redactionApplied: item.redactionApplied,
        sensitiveFindingCount: item.sensitiveFindingCount
      }))
    },
    findings: {
      conformance: dashboard.conformance.findings,
      guardrails: dashboard.guardrails.findings
    },
    humanReview: {
      summary: dashboard.reviewStateSummary,
      items: dashboard.humanReviewItems.map((item) => ({
        id: item.id,
        stableFindingKey: item.stableFindingKey,
        reviewState: item.reviewState,
        category: item.category,
        severity: item.severity,
        decisionNeeded: item.decisionNeeded,
        recommendedOption: item.recommendedOption,
        affectedObject: item.affectedObject,
        blocksRelease: item.blocksRelease,
        latestHumanDecision: item.latestHumanDecision
      }))
    },
    safety: {
      rawSourceTextIncluded: false,
      disclosure: "Evidence packs include metadata, summaries, retention disclosure and review state. Raw source text is not included."
    },
    acceptance: buildControlMirrorEvidencePackAcceptancePolicy({
      rawSourceTextIncluded: false,
      sensitiveFindingCount
    })
  };
}

function renderMarkdownList(items: string[]) {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function renderMarkdownValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "n/a";
  }

  return String(value);
}

export function buildControlMirrorEvidencePackMarkdown(evidencePack: ControlMirrorEvidencePack) {
  const lines = [
    "# Control Mirror Evidence Pack",
    "",
    `Generated: ${evidencePack.generatedAt}`,
    `Schema version: ${evidencePack.schemaVersion}`,
    "",
    "## Project",
    "",
    `- Active project: ${evidencePack.activeProject}`,
    `- Snapshot: ${evidencePack.snapshot.label} (${evidencePack.snapshot.id})`,
    `- Source type: ${evidencePack.snapshot.sourceType}`,
    `- Scan time: ${renderMarkdownValue(evidencePack.snapshot.scanTime)}`,
    `- Files: ${evidencePack.snapshot.acceptedCount} accepted, ${evidencePack.snapshot.rejectedCount} rejected, ${evidencePack.snapshot.unreadableCount} unreadable`,
    "",
    "## AI Level",
    "",
    `- Requested: ${evidencePack.aiLevel.requested}`,
    `- Achieved: ${evidencePack.aiLevel.achieved}`,
    `- Release readiness: ${evidencePack.aiLevel.releaseReadiness}`,
    "",
    "## Report Summary",
    "",
    renderMarkdownList(evidencePack.report.summaryItems.map((item) => `${item.label}: ${item.value} (${item.status})`)),
    "",
    "## Evidence Retention",
    "",
    `- Summary: ${evidencePack.report.evidenceRetentionSummary}`,
    `- Source policy: ${evidencePack.source.summary}`,
    `- Active mode: ${renderMarkdownValue(evidencePack.source.activeModeLabel)} (${renderMarkdownValue(evidencePack.source.activeModeRetention)})`,
    `- Safety: ${evidencePack.safety.disclosure}`,
    "",
    "## Evidence",
    "",
    "### Artifacts",
    "",
    renderMarkdownList(evidencePack.evidence.artifacts.map((artifact) => `${artifact.fileName} - ${artifact.artifactType}, ${artifact.lineageStatus}, ${artifact.parsingConfidence}`)),
    "",
    "### Normalized Evidence",
    "",
    renderMarkdownList(evidencePack.evidence.normalizedEvidence.map((item) => [
      `${item.label} (${item.fileName})`,
      `type: ${item.evidenceType}`,
      `readiness: ${item.readinessState}`,
      `retention: ${renderMarkdownValue(item.retentionMode)}`,
      `disclosure: ${renderMarkdownValue(item.retentionDisclosure)}`,
      `redacted: ${renderMarkdownValue(item.redactionApplied)}`,
      `sensitive findings: ${renderMarkdownValue(item.sensitiveFindingCount)}`
    ].join("; "))),
    "",
    "## Conformance Findings",
    "",
    renderMarkdownList(evidencePack.findings.conformance.map((finding) => `${finding.label} - ${finding.severity}: ${finding.recommendedAction}`)),
    "",
    "## Guardrail Findings",
    "",
    renderMarkdownList(evidencePack.findings.guardrails.map((finding) => `${finding.label} - ${finding.severity}: ${finding.recommendedAction}`)),
    "",
    "## Human Review",
    "",
    `- Open items: ${evidencePack.humanReview.summary.open}`,
    `- Open blocking items: ${evidencePack.humanReview.summary.openBlocking}`,
    `- Decided items: ${evidencePack.humanReview.summary.decided}`,
    "",
    renderMarkdownList(evidencePack.humanReview.items.map((item) => `${item.category} - ${item.severity}: ${item.decisionNeeded} (${item.reviewState ?? "unknown"})`)),
    "",
    "## Product/Security Acceptance",
    "",
    `- Status: ${evidencePack.acceptance.status}`,
    `- Share readiness: ${evidencePack.acceptance.shareReadiness}`,
    `- Required reviewers: ${evidencePack.acceptance.requiredReviewers.join(", ")}`,
    `- Disclosure: ${evidencePack.acceptance.disclosure}`,
    "",
    renderMarkdownList(evidencePack.acceptance.checklist.map((item) => `${item.label} - ${item.status}: ${item.detail}`)),
    "",
    "## Decisions And Risks",
    "",
    "### Required Approvals",
    "",
    renderMarkdownList(evidencePack.report.requiredApprovals),
    "",
    "### Blocking Gaps",
    "",
    renderMarkdownList(evidencePack.report.blockingGaps),
    "",
    "### Residual Risks",
    "",
    renderMarkdownList(evidencePack.report.residualRisks),
    "",
    "## Recommended Next Step",
    "",
    evidencePack.report.recommendedNextStep,
    "",
    "## Safety",
    "",
    `Raw source text included: ${evidencePack.safety.rawSourceTextIncluded ? "yes" : "no"}`,
    evidencePack.safety.disclosure
  ];

  return `${lines.join("\n").trim()}\n`;
}
