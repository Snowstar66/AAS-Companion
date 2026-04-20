import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type FramingSubpageNavProps = {
  outcomeId: string;
  activeSubpage: "overview" | "journey-context";
  journeyContextCount: number;
};

export function FramingSubpageNav({ outcomeId, activeSubpage, journeyContextCount }: FramingSubpageNavProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Framing package navigation</CardTitle>
        <CardDescription>
          Journey Context is an optional Framing subpage. The main delivery spine still stays Outcome, Epic, Story, Test.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild variant={activeSubpage === "overview" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}`}>Framing Overview</Link>
        </Button>
        <Button asChild variant={activeSubpage === "journey-context" ? "default" : "secondary"}>
          <Link href={`/framing?outcomeId=${outcomeId}&subpage=journey-context`}>
            Journey Context{journeyContextCount > 0 ? ` (${journeyContextCount})` : ""}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
