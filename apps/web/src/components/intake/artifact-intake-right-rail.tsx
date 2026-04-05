"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
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
  const { language } = useAppChromeLanguage();
  const content =
    language === "sv"
      ? {
          importSummaryTitle: "Importsammanfattning",
          importSummaryDescription: "M2-STORY-002 och M2-STORY-003 gor ra markdown till granskningsbara kandidatobjekt.",
          sessionsLabel: "Sessioner",
          sessionsDescription: "Sparade importsessioner i det aktiva projektet.",
          filesLabel: "Uppladdade filer",
          filesDescription: "Markdown-filer uppladdade till projektets intake.",
          pendingClassificationLabel: "Vantar klassificering",
          pendingClassificationDescription: "Filer som fortfarande vantar pa klassificering.",
          openPendingSessions: "Oppna vantande sessioner",
          parsedSectionsLabel: "Tolkade sektioner",
          parsedSectionsDescription: "Tolkade sektioner som just nu kan mappas.",
          candidateObjectsLabel: "Kandidatobjekt",
          candidateObjectsDescription: "Importerade objekt som kan godkannas in i Framing eller Design.",
          openImportApproval: "Oppna importgodkannande",
          humanReviewQueuesLabel: "Human review-koer",
          humanReviewQueuesDescription: "Importerade rader som just nu vantar pa explicit manskligt godkannande.",
          openApprovalQueue: "Oppna godkannandeko",
          governanceTitle: "Governance-racken",
          governanceDescription: "Tolkningen ar synlig, men annu inte godkand eller promoterad.",
          governanceBody1: "Varje kandidat behaller kallsparning tillbaka till fil, sektion, markor och extraktionssakerhet.",
          governanceBody2: "Tvetydiga mappningar forblir markerade som osakra eller saknade i stallet for att tvingas in i compliance-pastaenden.",
          governanceBody3: "Omappade sektioner forblir synliga sa att human review kan avgora vad som ska behallas, slas ihop eller kasseras."
        }
      : {
          importSummaryTitle: "Import summary",
          importSummaryDescription: "M2-STORY-002 and M2-STORY-003 turn raw markdown into reviewable candidate objects.",
          sessionsLabel: "Sessions",
          sessionsDescription: "Persisted import sessions in the active project.",
          filesLabel: "Uploaded files",
          filesDescription: "Markdown files uploaded into project-scoped intake.",
          pendingClassificationLabel: "Pending classification",
          pendingClassificationDescription: "Files still waiting for classification.",
          openPendingSessions: "Open pending sessions",
          parsedSectionsLabel: "Parsed sections",
          parsedSectionsDescription: "Parsed sections currently available for mapping.",
          candidateObjectsLabel: "Candidate objects",
          candidateObjectsDescription: "Imported objects that can be approved into Framing or Design.",
          openImportApproval: "Open import approval",
          humanReviewQueuesLabel: "Human review queues",
          humanReviewQueuesDescription: "Imported rows currently waiting for explicit human approval.",
          openApprovalQueue: "Open approval queue",
          governanceTitle: "Governance guardrails",
          governanceDescription: "Interpretation is visible, but still not approved or promoted.",
          governanceBody1: "Each candidate keeps source lineage back to file, section, marker, and extraction confidence.",
          governanceBody2: "Ambiguous mappings stay marked as uncertain or missing instead of being forced into compliance claims.",
          governanceBody3: "Unmapped sections remain visible so human review can decide what to keep, merge, or discard."
        };

  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>{content.importSummaryTitle}</CardTitle>
          <CardDescription>{content.importSummaryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description={content.sessionsDescription}
            label={content.sessionsLabel}
            value={summary.sessions}
          />
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description={content.filesDescription}
            label={content.filesLabel}
            value={summary.files}
          />
          <ActionSummaryCard
            actionHref={summary.pendingClassification > 0 ? "/intake?queue=pending_classification" : undefined}
            actionLabel={content.openPendingSessions}
            className="border-border/70 bg-muted/30"
            description={content.pendingClassificationDescription}
            label={content.pendingClassificationLabel}
            value={summary.pendingClassification}
          />
          <ActionSummaryCard
            className="border-border/70 bg-muted/30"
            description={content.parsedSectionsDescription}
            label={content.parsedSectionsLabel}
            value={summary.parsedSections}
          />
          <ActionSummaryCard
            actionHref={summary.candidateObjects > 0 ? "/review" : undefined}
            actionLabel={content.openImportApproval}
            className="border-border/70 bg-muted/30"
            description={content.candidateObjectsDescription}
            label={content.candidateObjectsLabel}
            value={summary.candidateObjects}
          />
          <ActionSummaryCard
            actionHref={summary.humanReviewRequired > 0 ? "/review?reviewStatusFilter=pending" : undefined}
            actionLabel={content.openApprovalQueue}
            className="border-border/70 bg-muted/30"
            description={content.humanReviewQueuesDescription}
            label={content.humanReviewQueuesLabel}
            value={summary.humanReviewRequired}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>{content.governanceTitle}</CardTitle>
          <CardDescription>{content.governanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{content.governanceBody1}</p>
          <p>{content.governanceBody2}</p>
          <p>{content.governanceBody3}</p>
        </CardContent>
      </Card>
    </aside>
  );
}
