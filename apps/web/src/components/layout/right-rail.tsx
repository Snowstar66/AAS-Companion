"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";

export function RightRail() {
  const { language } = useAppChromeLanguage();
  const content =
    language === "sv"
      ? {
          workspaceGuidanceTitle: "Vägledning i arbetsytan",
          workspaceGuidanceDescription: "Snabba påminnelser för arbete inom det aktuella projektets scope.",
          oneProjectTitle: "Ett projekt åt gången",
          oneProjectBody: "Home, Framing, Value Spine, Import och Review är alltid avgränsade till det aktiva projektet.",
          governanceTitle: "Governance syns nära arbetet",
          governanceBody: "Readiness, tollgates, sign-off och lineage visas nära arbetet i stället för att gömmas i formulär.",
          coexistTitle: "Nativt och importerat kan samexistera",
          coexistBody: "Nativt arbete förblir förstaklassigt, medan importerade artefakter behåller sin review- och lineage-spårning.",
          platformTitle: "Plattformsstandarder",
          platformDescription: "Stabila stackantaganden som gäller i produkten just nu.",
          platformBody1: "Next.js App Router, React, TypeScript, Tailwind och shadcn/ui.",
          platformBody2: "Supabase, Prisma, PostHog och OpenTelemetry är fortsatt standardintegrationer.",
          platformBody3: "Produktspråket kan växlas, medan projektupplägg och leveransflöde förblir projektstyrda."
        }
      : {
          workspaceGuidanceTitle: "Workspace guidance",
          workspaceGuidanceDescription: "Quick reminders for working inside the current project scope.",
          oneProjectTitle: "One project at a time",
          oneProjectBody: "Home, Framing, Value Spine, Import and Review stay scoped to the active project only.",
          governanceTitle: "Governance stays visible",
          governanceBody: "Readiness, tollgates, sign-off and lineage are shown near the work instead of being buried in forms.",
          coexistTitle: "Native and imported can coexist",
          coexistBody: "Native work remains first-class, while imported artifacts keep their review and lineage trail.",
          platformTitle: "Platform defaults",
          platformDescription: "Stable stack assumptions that are active in the product right now.",
          platformBody1: "Next.js App Router, React, TypeScript, Tailwind, and shadcn/ui.",
          platformBody2: "Supabase, Prisma, PostHog, and OpenTelemetry remain the integration defaults.",
          platformBody3: "Product language can switch, while project setup and delivery flow stay project-scoped."
        };

  return (
    <aside className="space-y-4">
      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>{content.workspaceGuidanceTitle}</CardTitle>
          <CardDescription>{content.workspaceGuidanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">{content.oneProjectTitle}</p>
            <p className="mt-2 leading-6">{content.oneProjectBody}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">{content.governanceTitle}</p>
            <p className="mt-2 leading-6">{content.governanceBody}</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="font-medium text-foreground">{content.coexistTitle}</p>
            <p className="mt-2 leading-6">{content.coexistBody}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-background/90 shadow-sm">
        <CardHeader>
          <CardTitle>{content.platformTitle}</CardTitle>
          <CardDescription>{content.platformDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{content.platformBody1}</p>
          <p>{content.platformBody2}</p>
          <p>{content.platformBody3}</p>
        </CardContent>
      </Card>
    </aside>
  );
}
