"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createArtifactIntakeSessionService,
  promoteArtifactCandidateService,
  reviewArtifactFileSectionDispositionService,
  reviewArtifactCandidateService
} from "@aas-companion/api";
import { DEMO_ORGANIZATION } from "@aas-companion/domain/demo";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildRedirect(pathname: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function readLines(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readCsv(formData: FormData, name: string) {
  return String(formData.get(name) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function redirectDemoIntakeBlocked() {
  redirect(
    buildRedirect("/intake", {
      status: "blocked",
      message: "Import is read-only in Demo. Leave Demo and open a normal project before uploading, reviewing, or promoting artifacts."
    })
  );
}

export async function uploadArtifactIntakeFilesAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const requestedProcessingMode = String(formData.get("processingMode") ?? "deterministic");
  const processingMode = requestedProcessingMode === "ai_assisted" ? "ai_assisted" : "deterministic";
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    redirect(
      buildRedirect("/intake", {
        error: "Select one or more text or markdown files before creating an import session."
      })
    );
  }

  const preparedFiles = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      mimeType: file.type || null,
      sizeBytes: file.size,
      content: await file.text()
    }))
  );

  const result = await createArtifactIntakeSessionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    processingMode,
    files: preparedFiles
  });

  if (!result.ok) {
    redirect(
      buildRedirect("/intake", {
        error: result.errors[0]?.message ?? "Import upload failed."
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/");

  const baseMessage =
    requestedProcessingMode === "ai_assisted" && result.data.processingModeUsed === "ai_assisted"
      ? `Uploaded ${result.data.uploadedCount} file(s) into a new AI-assisted import session. Likely Value Spine candidates were extracted, and anything that could not be placed confidently remains visible under Review leftovers.`
      : requestedProcessingMode === "ai_assisted"
        ? `Uploaded ${result.data.uploadedCount} file(s) into a new import session. The built-in parser completed the import successfully, and anything that could not be placed confidently remains visible under Review leftovers.`
      : result.data.rejectedCount > 0
        ? `Uploaded ${result.data.uploadedCount} file(s). ${result.data.rejectedCount} file(s) were rejected with clear feedback while the accepted files were classified and mapped for review.`
        : `Uploaded ${result.data.uploadedCount} file(s) into a new import session and mapped them into reviewable candidates.`;
  const message = result.data.processingNote ? `${baseMessage} ${result.data.processingNote}` : baseMessage;

  redirect(
    buildRedirect("/intake", {
      status: "uploaded",
      message,
      sessionId: result.data.sessionId
    })
  );
}

export async function submitArtifactCandidateFromIntakeAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const candidateId = String(formData.get("candidateId") ?? "");
  const candidateType = String(formData.get("candidateType") ?? "story");
  const intent = String(formData.get("intent") ?? "edit");
  const reviewComment = String(formData.get("reviewComment") ?? "") || null;
  const issueId = String(formData.get("issueId") ?? "") || null;
  const issueAction = String(formData.get("issueAction") ?? "") || null;

  if (intent === "reject" && !reviewComment) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: "Add a short discard reason before rejecting the imported candidate."
      })
    );
  }

  const reviewResult = await reviewArtifactCandidateService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    candidateId,
    reviewStatus:
      intent === "confirm"
        ? "confirmed"
        : intent === "reject"
          ? "rejected"
          : intent === "follow_up"
            ? "follow_up_needed"
            : "edited",
    reviewComment,
    draftRecord: {
      key: String(formData.get("key") ?? "") || null,
      title: String(formData.get("title") ?? "") || null,
      problemStatement: String(formData.get("problemStatement") ?? "") || null,
      outcomeStatement: String(formData.get("outcomeStatement") ?? "") || null,
      baselineDefinition: String(formData.get("baselineDefinition") ?? "") || null,
      baselineSource: String(formData.get("baselineSource") ?? "") || null,
      timeframe: String(formData.get("timeframe") ?? "") || null,
      purpose: String(formData.get("purpose") ?? "") || null,
      storyType:
        candidateType === "story"
          ? ((String(formData.get("storyType") ?? "") || null) as "outcome_delivery" | "governance" | "enablement" | null)
          : null,
      valueIntent: String(formData.get("valueIntent") ?? "") || null,
      acceptanceCriteria: readLines(formData, "acceptanceCriteria"),
      aiUsageScope: readCsv(formData, "aiUsageScope"),
      testDefinition: String(formData.get("testDefinition") ?? "") || null,
      definitionOfDone: readLines(formData, "definitionOfDone"),
      outcomeCandidateId: String(formData.get("outcomeCandidateId") ?? "") || null,
      epicCandidateId: String(formData.get("epicCandidateId") ?? "") || null
    },
    humanDecisions: {
      valueOwnerId: String(formData.get("valueOwnerId") ?? "") || null,
      baselineValidity:
        ((String(formData.get("baselineValidity") ?? "") || null) as "confirmed" | "needs_follow_up" | null),
      aiAccelerationLevel:
        ((String(formData.get("aiAccelerationLevel") ?? "") || null) as "level_1" | "level_2" | "level_3" | null),
      riskProfile: ((String(formData.get("riskProfile") ?? "") || null) as "low" | "medium" | "high" | null),
      riskAcceptanceStatus:
        ((String(formData.get("riskAcceptanceStatus") ?? "") || null) as "accepted" | "needs_review" | null)
    },
    issueDisposition:
      issueId && issueAction
        ? {
            issueId,
            action: issueAction as "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked",
            note: reviewComment
          }
        : undefined
  });

  if (!reviewResult.ok) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: reviewResult.errors[0]?.message ?? "Review action could not be saved."
      })
    );
  }

  if (intent === "promote") {
    const promoteResult = await promoteArtifactCandidateService({
      organizationId: session.organization.organizationId,
      candidateId,
      actorId: session.userId
    });

    revalidatePath("/intake");
    revalidatePath("/review");
    revalidatePath("/framing");
    revalidatePath("/stories");
    revalidatePath("/workspace");
    revalidatePath("/");

    if (!promoteResult.ok) {
      redirect(
        buildRedirect("/intake", {
          status: "blocked",
          sessionId,
          fileId,
          candidateId,
          message: promoteResult.errors[0]?.message ?? "Promotion is blocked."
        })
      );
    }

    redirect(
      buildRedirect("/intake", {
        status: "promoted",
        sessionId,
        fileId,
        candidateId,
        message: `${reviewResult.data.title ?? "Candidate"} was promoted into governed ${promoteResult.data.promotedEntityType} work.`
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/workspace");
  revalidatePath("/");

  redirect(
    buildRedirect("/intake", {
      status: intent,
      sessionId,
      fileId,
      candidateId,
      message:
        intent === "confirm"
          ? "Candidate confirmed."
          : intent === "reject"
            ? "Candidate rejected."
            : issueId && issueAction
              ? "Issue disposition saved."
            : intent === "follow_up"
              ? "Candidate marked for follow-up."
              : "Candidate edits saved."
    })
  );
}

export async function submitArtifactSectionDispositionAction(formData: FormData) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    redirectDemoIntakeBlocked();
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const candidateId = String(formData.get("candidateId") ?? "") || undefined;
  const sectionId = String(formData.get("sectionId") ?? "");
  const action = String(formData.get("action") ?? "pending");
  const note = String(formData.get("note") ?? "") || null;

  const result = await reviewArtifactFileSectionDispositionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    fileId,
    sectionId,
    action,
    note
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  if (!result.ok) {
    redirect(
      buildRedirect("/intake", {
        status: "error",
        sessionId,
        fileId,
        candidateId,
        message: result.errors[0]?.message ?? "Section disposition could not be saved."
      })
    );
  }

  redirect(
    buildRedirect("/intake", {
      status: "edited",
      sessionId,
      fileId,
      candidateId,
      message: "Section disposition saved."
    })
  );
}

export async function submitArtifactCandidateIssueDispositionInlineAction(input: {
  candidateId: string;
  candidateType: "outcome" | "epic" | "story";
  issueId: string;
  issueAction: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
}) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    return {
      ok: false as const,
      message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
    };
  }

  const reviewResult = await reviewArtifactCandidateService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    candidateId: input.candidateId,
    reviewStatus: "edited",
    issueDisposition: {
      issueId: input.issueId,
      action: input.issueAction,
      note: null
    }
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/workspace");
  revalidatePath("/");

  if (!reviewResult.ok) {
    return {
      ok: false as const,
      message: reviewResult.errors[0]?.message ?? "Issue disposition could not be saved."
    };
  }

  return {
    ok: true as const,
    selectedAction: input.issueAction
  };
}

export async function submitArtifactSectionDispositionInlineAction(input: {
  fileId: string;
  sectionId: string;
  action: "corrected" | "confirmed" | "not_relevant" | "pending" | "blocked";
}) {
  const session = await requireActiveProjectSession();

  if (session.mode === "demo" || session.organization.organizationId === DEMO_ORGANIZATION.organizationId) {
    return {
      ok: false as const,
      message: "Import is read-only in Demo. Leave Demo and open a normal project before changing review state."
    };
  }

  const result = await reviewArtifactFileSectionDispositionService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    fileId: input.fileId,
    sectionId: input.sectionId,
    action: input.action,
    note: null
  });

  revalidatePath("/intake");
  revalidatePath("/review");
  revalidatePath("/");

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.errors[0]?.message ?? "Section disposition could not be saved."
    };
  }

  return {
    ok: true as const,
    selectedAction: input.action
  };
}
