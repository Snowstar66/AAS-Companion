"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { FramingBriefExportPayload } from "@/lib/framing/framing-brief-export";

type FramingBriefExportPanelProps = {
  payload: FramingBriefExportPayload;
  markdown: string;
  disabled?: boolean | undefined;
};

export function FramingBriefExportPanel({ payload, markdown, disabled = false }: FramingBriefExportPanelProps) {
  const [copied, setCopied] = useState<"json" | "markdown" | null>(null);
  const json = JSON.stringify(payload, null, 2);
  const fileBaseName = payload.handshake.outcome_key.toLowerCase();

  async function handleCopy(value: string, kind: "json" | "markdown") {
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

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Export framing brief</CardTitle>
        <CardDescription>
          Export the current framing brief, epics and direction seeds as an AI-friendly package for further refinement in tools such as BMAD.
          Business content comes first. Internal IDs remain as metadata only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          <p className="font-medium">How to use this export</p>
          <p className="mt-2">
            Use Markdown when you want to paste the framing brief into another AI tool. Use JSON when another system or workflow
            should read the package structurally with epics and direction seeds intact.
          </p>
          {disabled ? <p className="mt-2">Restore the Outcome first if you want to update the framing before exporting again.</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button className="gap-2" disabled={disabled} onClick={() => handleCopy(markdown, "markdown")} type="button">
            {copied === "markdown" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy Framing Markdown
          </Button>
          <Button className="gap-2" disabled={disabled} onClick={() => handleCopy(json, "json")} type="button" variant="secondary">
            {copied === "json" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy Framing JSON
          </Button>
          <Button
            className="gap-2"
            disabled={disabled}
            onClick={() => handleDownload(markdown, `${fileBaseName}-framing-brief.md`, "text/markdown;charset=utf-8")}
            type="button"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Download Markdown
          </Button>
          <Button
            className="gap-2"
            disabled={disabled}
            onClick={() => handleDownload(json, `${fileBaseName}-framing-brief.json`, "application/json")}
            type="button"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/70 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle>Markdown preview</CardTitle>
              <CardDescription>Best for copy/paste into another AI tool.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-4 text-sm text-foreground">
                <code>{markdown}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/10 shadow-none">
            <CardHeader>
              <CardTitle>JSON preview</CardTitle>
              <CardDescription>Structured payload with metadata retained for traceability.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[520px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
                <code>{json}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
