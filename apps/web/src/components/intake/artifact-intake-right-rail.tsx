import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";

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
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description="Persisted import sessions in the active project."
            label="Sessions"
            value={summary.sessions}
          />
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description="Markdown files uploaded into project-scoped intake."
            label="Uploaded files"
            value={summary.files}
          />
          <ActionSummaryCard
            actionHref={summary.pendingClassification > 0 ? "/intake?queue=pending_classification" : undefined}
            actionLabel="Open pending sessions"
            className="border-border/70 bg-muted/30"
            description="Files still waiting for classification."
            label="Pending classification"
            value={summary.pendingClassification}
          />
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description="Parsed sections currently available for mapping."
            label="Parsed sections"
            value={summary.parsedSections}
          />
          <ActionSummaryCard
            actionHref={summary.candidateObjects > 0 ? "/review" : undefined}
            actionLabel="Open import approval"
            className="border-border/70 bg-muted/30"
            description="Imported objects that can be approved into Framing or Design."
            label="Candidate objects"
            value={summary.candidateObjects}
          />
          <ActionSummaryCard
            actionHref={summary.humanReviewRequired > 0 ? "/review?reviewStatusFilter=pending" : undefined}
            actionLabel="Open approval queue"
            className="border-border/70 bg-muted/30"
            description="Imported rows currently waiting for explicit human approval."
            label="Human review queues"
            value={summary.humanReviewRequired}
          />
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
