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
          <p className="text-sm text-muted-foreground">{error.message}</p>
          {error.digest ? <p className="text-xs text-muted-foreground">Digest: {error.digest}</p> : null}
          <Button onClick={() => reset()} type="button" variant="secondary">
            Retry route
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
