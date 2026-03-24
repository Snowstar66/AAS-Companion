"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createArtifactIntakeSessionService,
  promoteArtifactCandidateService,
  reviewArtifactCandidateService
} from "@aas-companion/api";
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

export async function uploadArtifactIntakeFilesAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    redirect(
      buildRedirect("/intake", {
        error: "Select one or more markdown files before creating an import session."
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

  const message =
    result.data.rejectedCount > 0
      ? `Uploaded ${result.data.uploadedCount} markdown file(s). ${result.data.rejectedCount} file(s) were rejected with clear feedback while the accepted files were classified and mapped for review.`
      : `Uploaded ${result.data.uploadedCount} markdown file(s) into a new import session and mapped them into reviewable candidates.`;

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
  const sessionId = String(formData.get("sessionId") ?? "");
  const fileId = String(formData.get("fileId") ?? "");
  const candidateId = String(formData.get("candidateId") ?? "");
  const candidateType = String(formData.get("candidateType") ?? "story");
  const intent = String(formData.get("intent") ?? "edit");
  const reviewComment = String(formData.get("reviewComment") ?? "") || null;

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
      aiAccelerationLevel: ((String(formData.get("aiAccelerationLevel") ?? "") || null) as "level_2" | null),
      riskProfile: ((String(formData.get("riskProfile") ?? "") || null) as "low" | "medium" | "high" | null),
      riskAcceptanceStatus:
        ((String(formData.get("riskAcceptanceStatus") ?? "") || null) as "accepted" | "needs_review" | null)
    }
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
            : intent === "follow_up"
              ? "Candidate marked for follow-up."
              : "Candidate edits saved."
    })
  );
}
