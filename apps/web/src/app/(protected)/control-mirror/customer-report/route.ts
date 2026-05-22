import { NextResponse, type NextRequest } from "next/server";
import { getControlMirrorDashboardService } from "@aas-companion/api";
import type { ControlMirrorDashboard } from "@aas-companion/domain";
import { requireActiveProjectSession } from "@/lib/auth/guards";

type PdfPage = {
  content: string[];
};

const pageWidth = 595;
const pageHeight = 842;
const margin = 44;

function pdfSafe(value: string | number | null | undefined) {
  return String(value ?? "n/a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatLabel(value: string | number | null | undefined) {
  return String(value ?? "n/a").replaceAll("_", " ");
}

function wrapText(value: string, maxChars: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : ["n/a"];
}

function text(page: PdfPage, value: string, x: number, y: number, options: {
  size?: number;
  font?: "F1" | "F2";
  color?: [number, number, number];
} = {}) {
  const [r, g, b] = options.color ?? [15, 23, 42];
  page.content.push(
    "BT",
    `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`,
    `/${options.font ?? "F1"} ${options.size ?? 10} Tf`,
    `${x} ${y} Td`,
    `(${pdfSafe(value)}) Tj`,
    "ET"
  );
}

function multiline(page: PdfPage, value: string, x: number, y: number, maxChars: number, options: {
  lineHeight?: number;
  maxLines?: number;
  size?: number;
  color?: [number, number, number];
} = {}) {
  const lines = wrapText(value, maxChars).slice(0, options.maxLines ?? 5);

  lines.forEach((line, index) => {
    text(page, line, x, y - index * (options.lineHeight ?? 14), {
      size: options.size ?? 10,
      ...(options.color ? { color: options.color } : {})
    });
  });

  return y - lines.length * (options.lineHeight ?? 14);
}

function rect(page: PdfPage, x: number, y: number, width: number, height: number, options: {
  fill?: [number, number, number];
  stroke?: [number, number, number];
  strokeWidth?: number;
} = {}) {
  const fill = options.fill ?? [248, 250, 252];
  const stroke = options.stroke ?? [203, 213, 225];
  page.content.push(
    "q",
    `${(fill[0] / 255).toFixed(3)} ${(fill[1] / 255).toFixed(3)} ${(fill[2] / 255).toFixed(3)} rg`,
    `${(stroke[0] / 255).toFixed(3)} ${(stroke[1] / 255).toFixed(3)} ${(stroke[2] / 255).toFixed(3)} RG`,
    `${options.strokeWidth ?? 1} w`,
    `${x} ${y} ${width} ${height} re B`,
    "Q"
  );
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [71, 85, 105], width = 1.5) {
  page.content.push(
    "q",
    `${(color[0] / 255).toFixed(3)} ${(color[1] / 255).toFixed(3)} ${(color[2] / 255).toFixed(3)} RG`,
    `${width} w`,
    `${x1} ${y1} m ${x2} ${y2} l S`,
    "Q"
  );
}

function circle(page: PdfPage, cx: number, cy: number, r: number, options: {
  fill?: [number, number, number];
  stroke?: [number, number, number];
} = {}) {
  const c = r * 0.5522847498;
  const fill = options.fill ?? [255, 255, 255];
  const stroke = options.stroke ?? [203, 213, 225];
  page.content.push(
    "q",
    `${(fill[0] / 255).toFixed(3)} ${(fill[1] / 255).toFixed(3)} ${(fill[2] / 255).toFixed(3)} rg`,
    `${(stroke[0] / 255).toFixed(3)} ${(stroke[1] / 255).toFixed(3)} ${(stroke[2] / 255).toFixed(3)} RG`,
    "1.4 w",
    `${cx + r} ${cy} m`,
    `${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c`,
    `${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c`,
    `${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c`,
    `${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c`,
    "B",
    "Q"
  );
}

function metricPercent(dashboard: ControlMirrorDashboard, id: string) {
  return dashboard.metrics.find((metric) => metric.id === id)?.percentage ?? 0;
}

function addHeader(page: PdfPage, title: string, project: string) {
  text(page, "AAS Companion | Control Mirror", margin, 800, { size: 9, color: [71, 85, 105] });
  text(page, title, margin, 772, { size: 22, font: "F2" });
  text(page, project, margin, 750, { size: 11, color: [71, 85, 105] });
  line(page, margin, 734, pageWidth - margin, 734, [226, 232, 240], 1);
}

function addFooter(page: PdfPage, pageNumber: number) {
  line(page, margin, 42, pageWidth - margin, 42, [226, 232, 240], 1);
  text(page, "Confidential customer report - raw source text is not included", margin, 25, { size: 8, color: [100, 116, 139] });
  text(page, `Page ${pageNumber}`, pageWidth - 78, 25, { size: 8, color: [100, 116, 139] });
}

function statusFill(readiness: string): [number, number, number] {
  if (readiness === "ready") return [220, 252, 231];
  if (readiness === "conditional") return [224, 242, 254];
  if (readiness === "downgrade_required") return [254, 243, 199];
  return [255, 228, 230];
}

function addSummaryCard(page: PdfPage, label: string, value: string, detail: string, x: number, y: number, width: number) {
  rect(page, x, y, width, 86, { fill: [248, 250, 252], stroke: [203, 213, 225] });
  text(page, label.toUpperCase(), x + 14, y + 60, { size: 8, font: "F2", color: [71, 85, 105] });
  text(page, value, x + 14, y + 38, { size: 15, font: "F2" });
  multiline(page, detail, x + 14, y + 22, 34, { size: 8, lineHeight: 10, maxLines: 2, color: [71, 85, 105] });
}

function drawControlFlow(page: PdfPage, x: number, y: number) {
  const nodes = [
    { label: "Source", x, y },
    { label: "Snapshot", x: x + 78, y: y - 34 },
    { label: "Evidence", x: x + 156, y },
    { label: "Conformance", x: x + 234, y: y - 34 },
    { label: "Human Review", x: x + 326, y },
    { label: "Report", x: x + 420, y: y - 34 }
  ];

  nodes.forEach((node, index) => {
    const nextNode = nodes[index + 1];
    const width = index === 4 ? 82 : 70;

    rect(page, node.x, node.y, width, 42, { fill: [239, 246, 255], stroke: [191, 219, 254] });
    text(page, String(index + 1).padStart(2, "0"), node.x + 26, node.y + 26, { size: 7, font: "F2", color: [3, 105, 161] });
    text(page, node.label, node.x + 10, node.y + 12, { size: 8, font: "F2", color: [8, 47, 73] });
    if (nextNode) {
      line(page, node.x + width, node.y + 22, nextNode.x, nextNode.y + 22, [100, 116, 139], 1);
    }
  });
}

function drawValueSpine(page: PdfPage, dashboard: ControlMirrorDashboard, x: number, y: number) {
  const steps = [
    ["Outcome", metricPercent(dashboard, "framing-alignment")],
    ["Epic", metricPercent(dashboard, "value-spine-coverage")],
    ["Story", metricPercent(dashboard, "build-conformance")],
    ["Test", metricPercent(dashboard, "test-evidence")]
  ] as const;

  steps.forEach(([label, value], index) => {
    const cx = x + index * 88;
    if (index > 0) {
      line(page, cx - 60, y, cx - 30, y, [71, 85, 105], 1.5);
    }
    circle(page, cx, y, 30, {
      fill: value >= 90 ? [220, 252, 231] : value >= 50 ? [254, 243, 199] : [255, 228, 230],
      stroke: value >= 90 ? [134, 239, 172] : value >= 50 ? [252, 211, 77] : [253, 164, 175]
    });
    text(page, label, cx - 22, y + 7, { size: 8, font: "F2", color: [15, 23, 42] });
    text(page, `${value}%`, cx - 18, y - 10, { size: 13, font: "F2", color: [15, 23, 42] });
  });
}

function addPageOne(dashboard: ControlMirrorDashboard) {
  const page: PdfPage = { content: [] };
  addHeader(page, "Customer Control Report", dashboard.report.activeProject);

  rect(page, margin, 610, pageWidth - margin * 2, 96, {
    fill: statusFill(dashboard.releaseReadiness),
    stroke: [203, 213, 225]
  });
  text(page, "Executive recommendation", margin + 18, 678, { size: 10, font: "F2", color: [71, 85, 105] });
  text(page, formatLabel(dashboard.releaseReadiness), margin + 18, 650, { size: 24, font: "F2" });
  multiline(page, dashboard.report.recommendedNextStep, margin + 250, 672, 46, { size: 10, lineHeight: 13, maxLines: 4 });

  addSummaryCard(page, "Source judged", dashboard.snapshot.label, `${dashboard.snapshot.fileCount} files scanned`, margin, 490, 116);
  addSummaryCard(page, "AI level", `${formatLabel(dashboard.achievedAiLevel)} achieved`, `${formatLabel(dashboard.requestedAiLevel)} requested`, margin + 130, 490, 116);
  addSummaryCard(page, "Human review", `${dashboard.reviewStateSummary.openBlocking} blocking`, `${dashboard.reviewStateSummary.open} open items`, margin + 260, 490, 116);
  addSummaryCard(page, "Evidence safety", "No raw source", "Metadata, summaries and review state only", margin + 390, 490, 116);

  text(page, "Control flow", margin, 430, { size: 14, font: "F2" });
  drawControlFlow(page, margin, 374);

  text(page, "Report summary", margin, 260, { size: 14, font: "F2" });
  let y = 236;
  dashboard.report.evidenceSummaries.slice(0, 6).forEach((item) => {
    text(page, `${item.label}: ${item.value} (${formatLabel(item.status)})`, margin + 12, y, { size: 10 });
    y -= 18;
  });

  addFooter(page, 1);
  return page;
}

function addPageTwo(dashboard: ControlMirrorDashboard) {
  const page: PdfPage = { content: [] };
  addHeader(page, "Traceability And Decision View", dashboard.report.activeProject);

  text(page, "Value Spine coverage", margin, 690, { size: 14, font: "F2" });
  drawValueSpine(page, dashboard, margin + 48, 632);

  text(page, "AI level evidence", margin, 548, { size: 14, font: "F2" });
  addSummaryCard(page, "Requested", formatLabel(dashboard.requestedAiLevel), "Target level in current project evidence", margin, 430, 150);
  addSummaryCard(page, "Achieved", formatLabel(dashboard.achievedAiLevel), "Evidence-backed level Control Mirror can defend", margin + 170, 430, 150);
  addSummaryCard(page, "Missing evidence", String(dashboard.aiEvidence.filter((item) => !item.present).length), "Items required before a higher AI claim", margin + 340, 430, 150);

  text(page, "Blocking gaps", margin, 360, { size: 14, font: "F2" });
  let y = 334;
  const gaps = dashboard.report.blockingGaps.length > 0 ? dashboard.report.blockingGaps : ["No blocking gaps are visible in the current evidence."];
  gaps.slice(0, 7).forEach((gap) => {
    y = multiline(page, `- ${gap}`, margin + 8, y, 88, { size: 10, lineHeight: 13, maxLines: 3 }) - 5;
  });

  text(page, "Residual risks", margin, y - 12, { size: 14, font: "F2" });
  y -= 38;
  const risks = dashboard.report.residualRisks.length > 0 ? dashboard.report.residualRisks : ["No residual risks are listed for the current evidence pack."];
  risks.slice(0, 5).forEach((risk) => {
    y = multiline(page, `- ${risk}`, margin + 8, y, 88, { size: 10, lineHeight: 13, maxLines: 2 }) - 5;
  });

  addFooter(page, 2);
  return page;
}

function addPageThree(dashboard: ControlMirrorDashboard) {
  const page: PdfPage = { content: [] };
  addHeader(page, "Evidence Appendix", dashboard.report.activeProject);

  text(page, "Included evidence categories", margin, 690, { size: 14, font: "F2" });
  let y = 664;
  dashboard.normalizedEvidence.slice(0, 12).forEach((item) => {
    y = multiline(page, `- ${item.label} (${item.evidenceType}, ${item.fileName})`, margin + 8, y, 88, {
      size: 9,
      lineHeight: 12,
      maxLines: 2
    }) - 3;
  });

  text(page, "Human Review state", margin, y - 18, { size: 14, font: "F2" });
  y -= 44;
  [
    `Open: ${dashboard.reviewStateSummary.open}`,
    `Open blocking: ${dashboard.reviewStateSummary.openBlocking}`,
    `Decided: ${dashboard.reviewStateSummary.decided}`,
    `Deferred: ${dashboard.reviewStateSummary.deferred}`
  ].forEach((item) => {
    text(page, `- ${item}`, margin + 8, y, { size: 10 });
    y -= 16;
  });

  text(page, "Retention and safety", margin, y - 18, { size: 14, font: "F2" });
  y -= 44;
  y = multiline(page, dashboard.report.evidenceRetentionSummary, margin + 8, y, 88, { size: 10, lineHeight: 13, maxLines: 4 }) - 8;
  multiline(page, "Raw source text is not included. This customer PDF summarizes evidence, decisions, risks and review state for presentation and governance follow-up.", margin + 8, y, 88, {
    size: 10,
    lineHeight: 13,
    maxLines: 4
  });

  addFooter(page, 3);
  return page;
}

function buildPdfDocument(pages: PdfPage[]) {
  const objects: string[] = [];
  const fontRegularId = 3 + pages.length * 2;
  const fontBoldId = fontRegularId + 1;
  const pageObjectIds = pages.map((_, index) => 3 + index * 2);

  objects[0] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  pages.forEach((page, index) => {
    const pageId = 3 + index * 2;
    const contentId = 4 + index * 2;
    const content = page.content.join("\n");

    objects[pageId - 1] = [
      "<< /Type /Page",
      "/Parent 2 0 R",
      `/MediaBox [0 0 ${pageWidth} ${pageHeight}]`,
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >>`,
      `/Contents ${contentId} 0 R`,
      ">>"
    ].join(" ");
    objects[contentId - 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[fontRegularId - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  objects[fontBoldId - 1] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;

  let output = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = output.length;
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(output, "ascii");
}

function buildCustomerReportPdf(dashboard: ControlMirrorDashboard) {
  return buildPdfDocument([
    addPageOne(dashboard),
    addPageTwo(dashboard),
    addPageThree(dashboard)
  ]);
}

function buildFileName(dashboard: ControlMirrorDashboard) {
  const project = dashboard.report.activeProject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "control-mirror";
  return `${project}-control-mirror-customer-report.pdf`;
}

function buildFailureRedirect(request: NextRequest, message: string) {
  const target = new URL("/control-mirror", request.url);

  target.searchParams.set("status", "error");
  target.searchParams.set("message", `Customer PDF export failed. ${message}`);

  return NextResponse.redirect(target);
}

export async function GET(request: NextRequest) {
  const session = await requireActiveProjectSession();
  const result = await getControlMirrorDashboardService(session.organization.organizationId);

  if (!result.ok) {
    return buildFailureRedirect(request, result.errors[0]?.message ?? "Control Mirror report is unavailable.");
  }

  const body = buildCustomerReportPdf(result.data);

  return new NextResponse(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${buildFileName(result.data)}"`,
      "Content-Type": "application/pdf"
    }
  });
}
