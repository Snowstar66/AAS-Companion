"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { FramingBriefExportPayload, HumanFramingBriefExport } from "@/lib/framing/framing-brief-export";
import { buildFramingBriefExportPackage } from "@/lib/framing/framing-brief-export-package";

type FramingBriefExportPanelProps = {
  aiPayload: FramingBriefExportPayload;
  aiMarkdown: string;
  humanBrief: HumanFramingBriefExport;
  embedded?: boolean | undefined;
  disabled?: boolean | undefined;
};

export function FramingBriefExportPanel({
  aiPayload,
  aiMarkdown,
  humanBrief,
  embedded = false,
  disabled = false
}: FramingBriefExportPanelProps) {
  const [copied, setCopied] = useState<"human_markdown" | "ai_json" | "ai_markdown" | null>(null);
  const json = JSON.stringify(aiPayload, null, 2);
  const fileBaseName = aiPayload.handshake.outcome_key.toLowerCase();

  async function handleCopy(value: string, kind: "human_markdown" | "ai_json" | "ai_markdown") {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function handleDownload(value: string, filename: string, mimeType: string) {
    const blob = new Blob([value], { type: mimeType });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
  }

  function handlePackageDownload() {
    const pkg = buildFramingBriefExportPackage({
      payload: aiPayload,
      markdown: aiMarkdown
    });
    const href = URL.createObjectURL(pkg.blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = pkg.filename;
    link.click();
    URL.revokeObjectURL(href);
  }

  const content = (
    <>
      <CardHeader>
        <CardTitle>Export framing packages</CardTitle>
        <CardDescription>
          Export one human-readable Framing Brief and one structured AI Delivery Handoff. Both stay grounded in the same Outcome, approval context and value spine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          <p className="font-medium">How to use this export</p>
          <p className="mt-2">
            Use the Framing Brief when you want a compact human handoff or decision document. Use the AI Delivery Handoff when BMAD
            or another AI tool should keep the exact structure, UX references and approval context intact. The zip package includes
            Story Idea images as real files alongside the structured handoff.
          </p>
          {disabled ? <p className="mt-2">Restore the Outcome first if you want to update the framing before exporting again.</p> : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/70 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle>Framing Brief</CardTitle>
              <CardDescription>Compact, human-readable summary for stakeholders and manual handoffs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button className="gap-2" disabled={disabled} onClick={() => handleCopy(humanBrief.markdown, "human_markdown")} type="button">
                  {copied === "human_markdown" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy Framing Brief
                </Button>
                <Button
                  className="gap-2"
                  disabled={disabled}
                  onClick={() => handleDownload(humanBrief.markdown, humanBrief.filename, "text/markdown;charset=utf-8")}
                  type="button"
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  Download Framing Brief
                </Button>
              </div>
              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-4 text-sm text-foreground">
                <code>{humanBrief.markdown}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle>AI Delivery Handoff</CardTitle>
              <CardDescription>Structured handoff for BMAD and similar AI workflows. Use the zip package if you want the actual image files too.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button className="gap-2" disabled={disabled} onClick={() => handleCopy(aiMarkdown, "ai_markdown")} type="button">
                  {copied === "ai_markdown" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy AI Handoff Markdown
                </Button>
                <Button className="gap-2" disabled={disabled} onClick={() => handleCopy(json, "ai_json")} type="button" variant="secondary">
                  {copied === "ai_json" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy AI Handoff JSON
                </Button>
                <Button className="gap-2" disabled={disabled} onClick={handlePackageDownload} type="button">
                  <Download className="h-4 w-4" />
                  Download AI Handoff Package
                </Button>
                <Button
                  className="gap-2"
                  disabled={disabled}
                  onClick={() => handleDownload(aiMarkdown, `${fileBaseName}-ai-delivery-handoff.md`, "text/markdown;charset=utf-8")}
                  type="button"
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  Download AI Handoff Markdown
                </Button>
                <Button
                  className="gap-2"
                  disabled={disabled}
                  onClick={() => handleDownload(json, `${fileBaseName}-ai-delivery-handoff.json`, "application/json")}
                  type="button"
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  Download AI Handoff JSON
                </Button>
              </div>
              <Card className="border-border/70 bg-background shadow-none">
                <CardHeader>
                  <CardTitle>Markdown preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-4 text-sm text-foreground">
                    <code>{aiMarkdown}</code>
                  </pre>
                </CardContent>
              </Card>
              <pre className="max-h-[520px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
                <code>{json}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="space-y-5">{content}</div>;
  }

  return (
    <Card className="border-border/70 shadow-sm">
      {content}
    </Card>
  );
}
