import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PageViewAnalytics } from "@/components/analytics/page-view-analytics";
import { AppShell } from "@/components/layout/app-shell";
import { FramingCockpit } from "@/components/framing/framing-cockpit";
import { FramingRightRail } from "@/components/framing/framing-right-rail";
import { loadFramingCockpit } from "@/lib/framing/cockpit";
import { createDraftOutcomeAction } from "./actions";

type FramingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FramingPage({ searchParams }: FramingPageProps) {
  const query = searchParams ? await searchParams : {};
  const { cockpit } = await loadFramingCockpit();
  const originFilter = getParamValue(query.origin) ?? "native";
  const readinessFilter = getParamValue(query.readiness) ?? "all";

  return (
    <AppShell
      rightRail={<FramingRightRail summary={cockpit.summary} />}
      topbarProps={{
        projectName: cockpit.organizationName,
        sectionLabel: "Framing",
        badge: cockpit.state === "live" ? "Project section" : "Unavailable"
      }}
    >
      <PageViewAnalytics
        eventName="framing_cockpit_viewed"
        properties={{
          organizationName: cockpit.organizationName,
          state: cockpit.state
        }}
      />
      {cockpit.state === "unavailable" ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Framing data is unavailable</CardTitle>
            <CardDescription>The route is online, but the cockpit could not load its organization data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>{cockpit.message}</p>
            <Button asChild className="gap-2" variant="secondary">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <FramingCockpit
          createAction={createDraftOutcomeAction}
          initialOriginFilter={originFilter}
          initialReadinessFilter={readinessFilter}
          items={cockpit.items}
          message={cockpit.message}
          state={cockpit.state}
        />
      )}
    </AppShell>
  );
}
