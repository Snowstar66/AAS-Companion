import { NextResponse, type NextRequest } from "next/server";
import { createControlMirrorEvidencePackExportService } from "@aas-companion/api";
import { requireActiveProjectSession } from "@/lib/auth/guards";

function buildFailureRedirect(request: NextRequest, message: string) {
  const target = new URL("/control-mirror", request.url);

  target.searchParams.set("status", "error");
  target.searchParams.set("message", `Export failed. No evidence pack was created. ${message}`);

  return NextResponse.redirect(target);
}

function getExportFormat(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format")?.trim().toLowerCase();

  return format === "markdown" || format === "md" ? "markdown" : "json";
}

export async function GET(request: NextRequest) {
  const session = await requireActiveProjectSession();
  const result = await createControlMirrorEvidencePackExportService({
    organizationId: session.organization.organizationId,
    actorId: session.userId,
    format: getExportFormat(request)
  });

  if (!result.ok) {
    return buildFailureRedirect(request, result.errors[0]?.message ?? "Control Mirror export is unavailable.");
  }

  return new NextResponse(result.data.body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${result.data.fileName}"`,
      "Content-Type": result.data.contentType
    }
  });
}
