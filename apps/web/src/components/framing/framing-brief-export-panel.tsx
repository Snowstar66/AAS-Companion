"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import {
  buildProfiledFramingAiHandoff,
  type FramingBriefExportPayload,
  type HumanFramingBriefExport
} from "@/lib/framing/framing-brief-export";
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
  const [copied, setCopied] = useState<string | null>(null);
  const neutralArtifact = buildProfiledFramingAiHandoff({
    payload: aiPayload,
    markdown: aiMarkdown,
    profile: "neutral_governed"
  });
  const bmadArtifact = buildProfiledFramingAiHandoff({
    payload: aiPayload,
    markdown: aiMarkdown,
    profile: "bmad_prepared"
  });

  async function handleCopy(value: string, kind: string) {
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

  function handlePackageDownload(profile: typeof neutralArtifact) {
    const pkg = buildFramingBriefExportPackage({
      artifact: profile
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
        <CardTitle>Export framing handoff</CardTitle>
        <CardDescription>
          Choose one human-readable brief and one AI handoff profile. Both AI exports stay grounded in the same Outcome, approval context and value spine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          <p className="font-medium">How to use this export</p>
          <p className="mt-2">
            Use the Framing Brief when you want a compact human handoff or decision document. Use Neutral Governed for general AI
            tools that should preserve Framing structure and traceability. Use BMAD Prepared when BMAD-style refinement should start
            from the same source of truth with clearer adapter guidance. The zip packages include Story Idea images as real files
            alongside the structured handoff.
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
              <CardTitle>AI Handoff Profiles</CardTitle>
              <CardDescription>Start by downloading one package. Open previews only when you need to inspect the exact markdown or JSON.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[neutralArtifact, bmadArtifact].map((artifact) => {
                const profileJson = JSON.stringify(artifact.json, null, 2);

                return (
                  <Card className="border-border/70 bg-background shadow-none" key={artifact.profile}>
                    <CardHeader>
                      <CardTitle>{artifact.label}</CardTitle>
                      <CardDescription>{artifact.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button className="gap-2" disabled={disabled} onClick={() => handlePackageDownload(artifact)} type="button">
                          <Download className="h-4 w-4" />
                          Download {artifact.label} Package
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={disabled}
                          onClick={() => handleCopy(artifact.markdown, `${artifact.profile}_markdown`)}
                          type="button"
                        >
                          {copied === `${artifact.profile}_markdown` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Copy {artifact.label} Markdown
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={disabled}
                          onClick={() => handleCopy(profileJson, `${artifact.profile}_json`)}
                          type="button"
                          variant="secondary"
                        >
                          {copied === `${artifact.profile}_json` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Copy {artifact.label} JSON
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={disabled}
                          onClick={() => handleDownload(artifact.markdown, artifact.markdownFilename, "text/markdown;charset=utf-8")}
                          type="button"
                          variant="secondary"
                        >
                          <Download className="h-4 w-4" />
                          Download Markdown
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={disabled}
                          onClick={() => handleDownload(profileJson, artifact.jsonFilename, "application/json")}
                          type="button"
                          variant="secondary"
                        >
                          <Download className="h-4 w-4" />
                          Download JSON
                        </Button>
                      </div>
                      <details className="rounded-2xl border border-border/70 bg-muted/10">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground">Open previews</summary>
                        <div className="space-y-4 border-t border-border/70 px-4 py-4">
                          <Card className="border-border/70 bg-background shadow-none">
                            <CardHeader>
                              <CardTitle>Markdown preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-2xl border border-border/70 bg-background p-4 text-sm text-foreground">
                                <code>{artifact.markdown}</code>
                              </pre>
                            </CardContent>
                          </Card>
                          <pre className="max-h-[360px] overflow-auto rounded-2xl border border-border/70 bg-slate-950 p-4 text-sm text-slate-100">
                            <code>{profileJson}</code>
                          </pre>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                );
              })}
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
