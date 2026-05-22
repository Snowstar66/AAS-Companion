export type ControlMirrorSourceModeSupportStatus = "active" | "planned" | "unsupported";
export type ControlMirrorEvidenceRetentionMode = "metadata_only" | "metadata_and_excerpts" | "redacted_excerpts" | "not_retained";
export type ControlMirrorUploadedSnapshotRejectionReason =
  | "empty_path"
  | "absolute_path"
  | "path_traversal"
  | "unsupported_extension"
  | "unreadable";

export type ControlMirrorUploadedSnapshotFileInput = {
  path: string;
  content?: string | null;
  sizeBytes?: number | null;
  lastModifiedAt?: Date | string | null;
};

export type ControlMirrorValidatedUploadedSnapshotFile = {
  originalPath: string;
  normalizedPath: string;
  fileName: string;
  extension: string;
  content: string;
  sizeBytes: number;
  sourceHash: string;
  lastModifiedAt: Date | string | null;
};

export type ControlMirrorRejectedUploadedSnapshotFile = {
  originalPath: string;
  normalizedPath?: string | null;
  reason: ControlMirrorUploadedSnapshotRejectionReason;
};

export type ControlMirrorUploadedSnapshotValidationResult = {
  accepted: ControlMirrorValidatedUploadedSnapshotFile[];
  rejected: ControlMirrorRejectedUploadedSnapshotFile[];
  unreadable: ControlMirrorRejectedUploadedSnapshotFile[];
  acceptedCount: number;
  rejectedCount: number;
  unreadableCount: number;
};

export type ControlMirrorSourcePolicy = {
  summary: string;
  retentionDefault: ControlMirrorEvidenceRetentionMode;
  modes: Array<{
    id: "current_imports" | "manual_artifact_upload" | "uploaded_zip" | "folder_snapshot" | "git_repository_root";
    label: string;
    supportStatus: ControlMirrorSourceModeSupportStatus;
    refreshSupported: boolean;
    retentionMode: ControlMirrorEvidenceRetentionMode;
    actionHref?: string | null;
    constraints: string[];
  }>;
};

export type ControlMirrorEvidenceRetentionDecision = {
  retentionMode: ControlMirrorEvidenceRetentionMode;
  retainedExcerpt: string | null;
  redactionApplied: boolean;
  sensitiveFindingCount: number;
  humanReviewRecommended: boolean;
  disclosure: string;
};

export function getControlMirrorSourcePolicy(): ControlMirrorSourcePolicy {
  return {
    summary: "Control Mirror reads only user-authorized evidence. Local folders and repositories are never scanned silently.",
    retentionDefault: "metadata_and_excerpts",
    modes: [
      {
        id: "current_imports",
        label: "Current imports",
        supportStatus: "active",
        refreshSupported: true,
        retentionMode: "metadata_and_excerpts",
        actionHref: "/intake?source=control-mirror",
        constraints: [
          "Uses artifacts already imported into the active project.",
          "Refresh compares the current project evidence snapshot.",
          "Does not read local files outside user-provided imports."
        ]
      },
      {
        id: "manual_artifact_upload",
        label: "Manual artifact upload",
        supportStatus: "active",
        refreshSupported: false,
        retentionMode: "metadata_and_excerpts",
        actionHref: "/intake?source=control-mirror",
        constraints: [
          "Requires explicit user upload.",
          "Best for small evidence sets and focused control checks.",
          "Repeated uploads create new evidence to compare through Control Mirror."
        ]
      },
      {
        id: "uploaded_zip",
        label: "Uploaded snapshot",
        supportStatus: "active",
        refreshSupported: true,
        retentionMode: "redacted_excerpts",
        actionHref: "/control-mirror?source=uploaded-snapshot",
        constraints: [
          "Requires explicit user upload.",
          "Uses file allowlists, path traversal protection and retention policy.",
          "Uploaded code is never executed."
        ]
      },
      {
        id: "folder_snapshot",
        label: "Folder snapshot",
        supportStatus: "planned",
        refreshSupported: false,
        retentionMode: "metadata_only",
        actionHref: null,
        constraints: [
          "Requires explicit browser-supported file or directory selection.",
          "Cannot silently scan local folders.",
          "Refresh support depends on a user-authorized snapshot flow."
        ]
      },
      {
        id: "git_repository_root",
        label: "Git/repository root",
        supportStatus: "unsupported",
        refreshSupported: false,
        retentionMode: "not_retained",
        actionHref: null,
        constraints: [
          "Requires a real connector or explicit uploaded repository export.",
          "Repository metadata alone is not treated as scanned evidence.",
          "Secrets and broad log retention need policy before activation."
        ]
      }
    ]
  };
}

const controlMirrorUploadedSnapshotAllowedExtensions = new Set([
  ".csv",
  ".json",
  ".js",
  ".jsx",
  ".log",
  ".md",
  ".markdown",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

function hashControlMirrorContent(content: string) {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function normalizeControlMirrorUploadedSnapshotPath(path: string): {
  ok: true;
  normalizedPath: string;
  fileName: string;
  extension: string;
} | {
  ok: false;
  reason: Exclude<ControlMirrorUploadedSnapshotRejectionReason, "unsupported_extension" | "unreadable">;
} {
  const normalizedPath = path.trim().replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+/g, "/");

  if (!normalizedPath) {
    return {
      ok: false,
      reason: "empty_path"
    };
  }

  if (normalizedPath.startsWith("/") || /^[a-z]:\//i.test(normalizedPath)) {
    return {
      ok: false,
      reason: "absolute_path"
    };
  }

  const parts = normalizedPath.split("/");

  if (parts.some((part) => part === ".." || part === "" || part.includes("\0"))) {
    return {
      ok: false,
      reason: "path_traversal"
    };
  }

  const fileName = parts[parts.length - 1] ?? normalizedPath;
  const extensionMatch = /\.[^.]+$/.exec(fileName);
  const extension = extensionMatch?.[0]?.toLowerCase() ?? "";

  return {
    ok: true,
    normalizedPath,
    fileName,
    extension
  };
}

export function validateControlMirrorUploadedSnapshotFiles(files: ControlMirrorUploadedSnapshotFileInput[]): ControlMirrorUploadedSnapshotValidationResult {
  const accepted: ControlMirrorValidatedUploadedSnapshotFile[] = [];
  const rejected: ControlMirrorRejectedUploadedSnapshotFile[] = [];
  const unreadable: ControlMirrorRejectedUploadedSnapshotFile[] = [];

  for (const file of files) {
    const pathResult = normalizeControlMirrorUploadedSnapshotPath(file.path);

    if (!pathResult.ok) {
      rejected.push({
        originalPath: file.path,
        reason: pathResult.reason
      });
      continue;
    }

    if (!controlMirrorUploadedSnapshotAllowedExtensions.has(pathResult.extension)) {
      rejected.push({
        originalPath: file.path,
        normalizedPath: pathResult.normalizedPath,
        reason: "unsupported_extension"
      });
      continue;
    }

    if (typeof file.content !== "string") {
      unreadable.push({
        originalPath: file.path,
        normalizedPath: pathResult.normalizedPath,
        reason: "unreadable"
      });
      continue;
    }

    accepted.push({
      originalPath: file.path,
      normalizedPath: pathResult.normalizedPath,
      fileName: pathResult.fileName,
      extension: pathResult.extension.slice(1),
      content: file.content,
      sizeBytes: file.sizeBytes ?? file.content.length,
      sourceHash: hashControlMirrorContent(file.content),
      lastModifiedAt: file.lastModifiedAt ?? null
    });
  }

  return {
    accepted,
    rejected,
    unreadable,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    unreadableCount: unreadable.length
  };
}

const controlMirrorSensitiveValuePatterns = [
  /\b((?:api[_-]?key|token|secret|password|client[_-]?secret|private[_-]?key)\s*[:=]\s*)(["']?)[^\s"']+/gi,
  /\b(Authorization\s*[:=]\s*Bearer\s+)[A-Za-z0-9._-]+/gi,
  /\bBearer\s+[A-Za-z0-9._-]+/gi,
  /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]+/gi,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(postgres(?:ql)?:\/\/)[^\s@]+@[^\s]+/gi
];

function excerptControlMirrorContent(content: string) {
  return content.trim().slice(0, 800);
}

function redactControlMirrorSensitiveValues(content: string) {
  let redactedContent = content;
  let sensitiveFindingCount = 0;

  for (const pattern of controlMirrorSensitiveValuePatterns) {
    const matches = redactedContent.match(pattern);

    if (matches) {
      sensitiveFindingCount += matches.length;
    }

    redactedContent = redactedContent.replace(pattern, (match, prefix, quote) => {
      if (typeof prefix === "string" && prefix.length > 0) {
        return `${prefix}${typeof quote === "string" ? quote : ""}[REDACTED]`;
      }

      if (/^Bearer\s+/i.test(match)) {
        return "Bearer [REDACTED]";
      }

      if (/^postgres/i.test(match)) {
        return "postgresql://[REDACTED]";
      }

      return "[REDACTED]";
    });
  }

  return {
    content: redactedContent,
    sensitiveFindingCount
  };
}

export function getControlMirrorRetentionModeForSourceType(sourceType: string | null | undefined): ControlMirrorEvidenceRetentionMode {
  const normalizedSourceType = (sourceType ?? "").replaceAll(" ", "_").toLowerCase();

  if (normalizedSourceType === "uploaded_zip") {
    return "redacted_excerpts";
  }

  if (normalizedSourceType === "folder_snapshot") {
    return "metadata_only";
  }

  if (normalizedSourceType === "git_repository_root") {
    return "not_retained";
  }

  return "metadata_and_excerpts";
}

export function applyControlMirrorEvidenceRetentionPolicy(input: {
  content: string;
  retentionMode: ControlMirrorEvidenceRetentionMode;
}): ControlMirrorEvidenceRetentionDecision {
  const redaction = redactControlMirrorSensitiveValues(input.content);
  const redactionApplied = redaction.content !== input.content;
  const sensitiveFindingCount = redaction.sensitiveFindingCount;

  if (input.retentionMode === "not_retained") {
    return {
      retentionMode: input.retentionMode,
      retainedExcerpt: null,
      redactionApplied: false,
      sensitiveFindingCount,
      humanReviewRecommended: sensitiveFindingCount > 0,
      disclosure: "Source text was not retained; only artifact metadata is available."
    };
  }

  if (input.retentionMode === "metadata_only") {
    return {
      retentionMode: input.retentionMode,
      retainedExcerpt: null,
      redactionApplied: false,
      sensitiveFindingCount,
      humanReviewRecommended: sensitiveFindingCount > 0,
      disclosure: "Source text was omitted by metadata-only retention policy."
    };
  }

  if (input.retentionMode === "redacted_excerpts" || redactionApplied) {
    return {
      retentionMode: input.retentionMode,
      retainedExcerpt: excerptControlMirrorContent(redaction.content),
      redactionApplied,
      sensitiveFindingCount,
      humanReviewRecommended: sensitiveFindingCount > 0,
      disclosure: redactionApplied ? "A redacted source excerpt was retained." : "A policy-redacted source excerpt was retained."
    };
  }

  return {
    retentionMode: input.retentionMode,
    retainedExcerpt: excerptControlMirrorContent(input.content),
    redactionApplied: false,
    sensitiveFindingCount: 0,
    humanReviewRecommended: false,
    disclosure: "A source excerpt was retained."
  };
}
