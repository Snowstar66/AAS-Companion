import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type ArtifactIntakeRightRailProps = {
  summary: {
    sessions: number;
    files: number;
    pendingClassification: number;
    parsedSections: number;
    candidateObjects: number;
    humanReviewRequired: number;
  };
};

export function ArtifactIntakeRightRail({ summary }: ArtifactIntakeRightRailProps) {
  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Import summary</CardTitle>
          <CardDescription>M2-STORY-002 and M2-STORY-003 turn raw markdown into reviewable candidate objects.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Sessions</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.sessions}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Uploaded files</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.files}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pending classification</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.pendingClassification}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Parsed sections</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.parsedSections}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Candidate objects</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.candidateObjects}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Human review queues</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.humanReviewRequired}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>Governance guardrails</CardTitle>
          <CardDescription>Interpretation is visible, but still not approved or promoted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Each candidate keeps source lineage back to file, section, marker, and extraction confidence.</p>
          <p>Ambiguous mappings stay marked as uncertain or missing instead of being forced into compliance claims.</p>
          <p>Unmapped sections remain visible so human review can decide what to keep, merge, or discard.</p>
        </CardContent>
      </Card>
    </aside>
  );
}
