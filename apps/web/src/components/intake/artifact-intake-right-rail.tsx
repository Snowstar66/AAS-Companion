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
          importSummaryDescription: "M2-STORY-002 och M2-STORY-003 gör rå markdown till granskningsbara kandidatobjekt.",
          sessionsLabel: "Sessioner",
          sessionsDescription: "Sparade importsessioner i det aktiva projektet.",
          filesLabel: "Uppladdade filer",
          filesDescription: "Markdown-filer uppladdade till projektets intake.",
          pendingClassificationLabel: "Väntar klassificering",
          pendingClassificationDescription: "Filer som fortfarande väntar på klassificering.",
          openPendingSessions: "Öppna väntande sessioner",
          parsedSectionsLabel: "Tolkade sektioner",
          parsedSectionsDescription: "Tolkade sektioner som just nu kan mappas.",
          candidateObjectsLabel: "Kandidatobjekt",
          candidateObjectsDescription: "Importerade objekt som kan godkännas in i Framing eller Design.",
          openImportApproval: "Öppna importgodkännande",
          humanReviewQueuesLabel: "Human review-köer",
          humanReviewQueuesDescription: "Importerade rader som just nu väntar på explicit mänskligt godkännande.",
          openApprovalQueue: "Öppna godkännandekö",
          governanceTitle: "Governance-räcken",
          governanceDescription: "Tolkningen är synlig, men ännu inte godkänd eller promoterad.",
          governanceBody1: "Varje kandidat behåller källspårning tillbaka till fil, sektion, markör och extraktionssäkerhet.",
          governanceBody2: "Tvetydiga mappningar förblir markerade som osäkra eller saknade i stället för att tvingas in i compliance-påståenden.",
          governanceBody3: "Omappade sektioner förblir synliga så att human review kan avgöra vad som ska behållas, slås ihop eller kasseras."
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
