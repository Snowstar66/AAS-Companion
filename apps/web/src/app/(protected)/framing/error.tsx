"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";

type FramingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FramingError({ error, reset }: FramingErrorProps) {
  const isMissingServerAction =
    error.message.includes("Server Action") && error.message.includes("was not found on the server");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Framing Cockpit",
        badge: "Story M1-005"
      }}
    >
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Framing route error
          </CardTitle>
          <CardDescription>The cockpit encountered an error before the route could finish rendering.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMissingServerAction ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>The page is using an older server action reference after a recent update.</p>
              <p>Reload the page to pick up the latest Framing build, then run the AI validation again.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          )}
          {error.digest ? <p className="text-xs text-muted-foreground">Digest: {error.digest}</p> : null}
          <div className="flex flex-wrap gap-3">
            {isMissingServerAction ? (
              <Button onClick={() => window.location.reload()} type="button">
                Reload page
              </Button>
            ) : null}
            <Button onClick={() => reset()} type="button" variant="secondary">
              Retry route
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
