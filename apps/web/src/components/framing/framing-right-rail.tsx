"use client";

import { AlertTriangle, Compass, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { FramingSummary } from "@aas-companion/api";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { ActionSummaryCard } from "@/components/shared/action-summary-card";
import { ContextHelp } from "@/components/shared/context-help";
import { getHelpPattern } from "@/lib/help/aas-help";

type FramingRightRailProps = {
  summary: FramingSummary;
};

export function FramingRightRail({ summary }: FramingRightRailProps) {
  const { language } = useAppChromeLanguage();
  const framingHelp = getHelpPattern("framing.handshake", null, language);
  const content =
    language === "sv"
      ? {
          activePostureTitle: "Aktiv framingstatus",
          activePostureDescription: "Kompakt avläsning av cockpitläget i det aktuella projektet.",
          openAllOutcomes: "Öppna alla outcomes",
          allVisibleOutcomes: "Alla synliga outcomes i det aktiva projektet.",
          totalLabel: "Totalt",
          openBlockedOutcomes: "Öppna blockerade outcomes",
          blockedDescription: "Outcomes som fortfarande behöver framing-städning.",
          blockedLabel: "Blockerade",
          openReadyOutcomes: "Öppna redo outcomes",
          readyDescription: "Outcomes som redan är redo för TG1.",
          readyLabel: "Redo",
          handshakeTitle: "Handshake-läge",
          handshakeDescription: "Använd Framing för att rikta in kundcaset innan detaljerat designarbete börjar.",
          helpSummaryLabel: "Öppna AAS-anpassad hjälp för framing",
          notes: [
            {
              title: "Hitta rätt outcome",
              detail: "Sökning och statusfilter håller Demo och nya outcomes hanterbara.",
              icon: Compass
            },
            {
              title: "Se blockeringar snabbt",
              detail: "Blockerade outcomes markeras visuellt så att TG1-problem förblir tydliga.",
              icon: AlertTriangle
            },
            {
              title: "Starta ny framing",
              detail: "Skapa ett draft outcome direkt från cockpit utan att glida in i senare projektdetaljer.",
              icon: Plus
            }
          ]
        }
      : {
          activePostureTitle: "Active framing posture",
          activePostureDescription: "Compact readout for the current project's cockpit state.",
          openAllOutcomes: "Open all outcomes",
          allVisibleOutcomes: "All visible outcomes in the active project.",
          totalLabel: "Total",
          openBlockedOutcomes: "Open blocked outcomes",
          blockedDescription: "Outcomes that still need framing cleanup.",
          blockedLabel: "Blocked",
          openReadyOutcomes: "Open ready outcomes",
          readyDescription: "Outcomes already ready for TG1.",
          readyLabel: "Ready",
          handshakeTitle: "Handshake posture",
          handshakeDescription: "Use Framing to align the customer case before detailed design work begins.",
          helpSummaryLabel: "Open AAS-aligned framing help",
          notes: [
            {
              title: "Find the right outcome",
              detail: "Search and status filters keep Demo and newly created outcomes manageable.",
              icon: Compass
            },
            {
              title: "Spot blocked work fast",
              detail: "Blocked outcomes are visually marked so Tollgate 1 readiness issues stay obvious.",
              icon: AlertTriangle
            },
            {
              title: "Start new framing",
              detail: "Create a draft outcome from the cockpit without widening into later project detail work.",
              icon: Plus
            }
          ]
        };

  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>{content.activePostureTitle}</CardTitle>
          <CardDescription>{content.activePostureDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <ActionSummaryCard
            actionHref={summary.total > 0 ? "/framing?origin=all&readiness=all" : undefined}
            actionLabel={content.openAllOutcomes}
            className="border-border/70 bg-muted/30"
            description={content.allVisibleOutcomes}
            label={content.totalLabel}
            value={summary.total}
          />
          <ActionSummaryCard
            actionHref={summary.blocked > 0 ? "/framing?origin=all&readiness=blocked" : undefined}
            actionLabel={content.openBlockedOutcomes}
            className="border-amber-200 bg-amber-50"
            description={content.blockedDescription}
            label={content.blockedLabel}
            value={summary.blocked}
          />
          <ActionSummaryCard
            actionHref={summary.ready > 0 ? "/framing?origin=all&readiness=ready" : undefined}
            actionLabel={content.openReadyOutcomes}
            className="border-emerald-200 bg-emerald-50"
            description={content.readyDescription}
            label={content.readyLabel}
            value={summary.ready}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.9))] shadow-sm">
        <CardHeader>
          <CardTitle>{content.handshakeTitle}</CardTitle>
          <CardDescription>{content.handshakeDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.notes.map((note) => {
            const Icon = note.icon;

            return (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4" key={note.title}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="font-medium">{note.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.detail}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ContextHelp pattern={framingHelp} summaryLabel={content.helpSummaryLabel} />
    </aside>
  );
}
