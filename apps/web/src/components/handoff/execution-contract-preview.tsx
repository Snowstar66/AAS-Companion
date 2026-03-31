"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import type { ExecutionContract } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type ExecutionContractPreviewProps = {
  contract: ExecutionContract;
  markdown: string;
};

export function ExecutionContractPreview({ contract, markdown }: ExecutionContractPreviewProps) {
  const [copied, setCopied] = useState<"json" | "markdown" | null>(null);
  const json = JSON.stringify(contract, null, 2);
  const fileBaseName = contract.story_key.toLowerCase();

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="gap-2" onClick={() => handleCopy(json, "json")} type="button">
          {copied === "json" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy JSON
        </Button>
        <Button className="gap-2" onClick={() => handleCopy(markdown, "markdown")} type="button" variant="secondary">
          {copied === "markdown" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy Markdown
        </Button>
        <Button
          className="gap-2"
          onClick={() => handleDownload(json, `${fileBaseName}-execution-contract.json`, "application/json")}
          type="button"
          variant="secondary"
        >
          <Download className="h-4 w-4" />
          Download JSON
        </Button>
        <Button
          className="gap-2"
          onClick={() => handleDownload(markdown, `${fileBaseName}-execution-contract.md`, "text/markdown;charset=utf-8")}
          type="button"
          variant="secondary"
        >
          <Download className="h-4 w-4" />
          Download Markdown
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>JSON preview</CardTitle>
            <CardDescription>Machine-usable build package generated from persisted Story data.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
              <code>{json}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Markdown preview</CardTitle>
            <CardDescription>Human-readable build package for review or copy/paste into tooling.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-foreground">
              <code>{markdown}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
