"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { promoteArtifactCandidateService, reviewArtifactCandidateService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildRedirect(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    search.set(key, value);
  }

  const query = search.toString();
  return `/review${query ? `?${query}` : ""}`;
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

function getPromotionLabel(candidateType: string, promotedEntityType: string) {
  if (candidateType === "story" || promotedEntityType === "story") {
    return "Story Idea";
  }

  return promotedEntityType.replaceAll("_", " ");
}

export async function submitArtifactCandidateReviewAction(formData: FormData) {
  const session = await requireActiveProjectSession();
  const candidateId = String(formData.get("candidateId") ?? "");
  const candidateType = String(formData.get("candidateType") ?? "story");
  const intent = String(formData.get("intent") ?? "edit");
  const reviewComment = String(formData.get("reviewComment") ?? "") || null;
  const issueId = String(formData.get("issueId") ?? "") || null;
  const issueAction = String(formData.get("issueAction") ?? "") || null;

  if (intent === "reject" && !reviewComment) {
    redirect(
      buildRedirect({
        status: "error",
        candidateId,
        message: "Add a short discard reason before rejecting the imported candidate."
      })
    );
  }

  const reviewPayload = {
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
      scopeBoundary: String(formData.get("scopeBoundary") ?? "") || null,
      riskNote: String(formData.get("riskNote") ?? "") || null,
      storyType:
        candidateType === "story"
          ? ((String(formData.get("storyType") ?? "") || null) as "outcome_delivery" | "governance" | "enablement" | null)
          : null,
      valueIntent: String(formData.get("valueIntent") ?? "") || null,
      expectedBehavior: String(formData.get("expectedBehavior") ?? "") || null,
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
  } as const;

  const reviewResult = await reviewArtifactCandidateService(reviewPayload);

  if (!reviewResult.ok) {
    redirect(
      buildRedirect({
        status: "error",
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

    revalidatePath("/review");
    revalidatePath("/intake");
    revalidatePath("/framing");
    revalidatePath("/stories");
    revalidatePath("/workspace");
    revalidatePath("/");

    if (!promoteResult.ok) {
      redirect(
        buildRedirect({
          status: "blocked",
          candidateId,
          message: promoteResult.errors[0]?.message ?? "Promotion is blocked."
        })
      );
    }

    redirect(
      buildRedirect({
        status: "promoted",
        candidateId,
        message: `${reviewResult.data.title ?? "Candidate"} was promoted into governed ${getPromotionLabel(candidateType, promoteResult.data.promotedEntityType)} work.`
      })
    );
  }

  revalidatePath("/review");
  revalidatePath("/intake");
  revalidatePath("/workspace");
  revalidatePath("/");

  redirect(
    buildRedirect({
      status: intent,
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
