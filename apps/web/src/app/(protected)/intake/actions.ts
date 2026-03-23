"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createArtifactIntakeSessionService } from "@aas-companion/api";
import { requireProtectedSession } from "@/lib/auth/guards";

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

export async function uploadArtifactIntakeFilesAction(formData: FormData) {
  const session = await requireProtectedSession();
  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    redirect(
      buildRedirect("/intake", {
        error: "Select one or more markdown files before creating an intake session."
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
        error: result.errors[0]?.message ?? "Artifact Intake upload failed."
      })
    );
  }

  revalidatePath("/intake");
  revalidatePath("/");

  const message =
    result.data.rejectedCount > 0
      ? `Uploaded ${result.data.uploadedCount} markdown file(s). ${result.data.rejectedCount} file(s) were rejected with clear feedback while the accepted files were classified and mapped for review.`
      : `Uploaded ${result.data.uploadedCount} markdown file(s) into a new intake session and mapped them into reviewable candidates.`;

  redirect(
    buildRedirect("/intake", {
      status: "uploaded",
      message,
      sessionId: result.data.sessionId
    })
  );
}
