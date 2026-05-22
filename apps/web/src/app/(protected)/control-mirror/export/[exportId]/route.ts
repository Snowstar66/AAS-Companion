import { NextResponse, type NextRequest } from "next/server";
import {
  getPersistedControlMirrorEvidencePackExportService,
  recordControlMirrorEvidencePackExportDownloadEventService
} from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildFailureRedirect(request: NextRequest, message: string) {
  const target = new URL("/control-mirror", request.url);

  target.searchParams.set("status", "error");
  target.searchParams.set("message", `Export download failed. ${message}`);

  return NextResponse.redirect(target);
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      exportId?: string;
    }>;
  }
) {
  const session = await requireActiveProjectSession();
  const params = await context.params;
  const exportId = params.exportId?.trim();

  if (!exportId) {
    return buildFailureRedirect(request, "Persisted Control Mirror export was not found for this project.");
  }

  const result = await getPersistedControlMirrorEvidencePackExportService({
    organizationId: session.organization.organizationId,
    exportId
  });

  if (!result.ok) {
    return buildFailureRedirect(request, result.errors[0]?.message ?? "Persisted Control Mirror export is unavailable.");
  }

  const auditResult = await recordControlMirrorEvidencePackExportDownloadEventService({
    organizationId: session.organization.organizationId,
    exportId: result.data.id,
    actorId: session.userId
  });

  if (!auditResult.ok) {
    return buildFailureRedirect(request, auditResult.errors[0]?.message ?? "Persisted Control Mirror export download could not be audited.");
  }

  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Content-Disposition": `attachment; filename="${result.data.fileName}"`,
    "Content-Type": result.data.contentType,
    "X-Control-Mirror-Retention-State": result.data.retention?.state ?? "active",
    "X-Control-Mirror-Retention-Policy": result.data.retention?.policyLabel ?? "governance_audit_artifact"
  };

  if (result.data.retention?.state === "archived") {
    headers["X-Control-Mirror-Archive-Disclosure"] = result.data.retention.archiveReason
      ? `Archived: ${result.data.retention.archiveReason}`
      : "Archived Control Mirror evidence pack export.";
  }

  return new NextResponse(result.data.body, {
    headers: {
      ...headers
    }
  });
}
