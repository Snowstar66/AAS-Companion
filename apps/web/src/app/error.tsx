"use client";

import { useEffect } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Home",
        badge: "Project selector"
      }}
    >
      <section className="flex min-h-[50vh] items-center justify-center">
        <Card className="max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Home error state</CardTitle>
            <CardDescription>
              Home hit an unexpected error. This route exposes the failure instead of failing silently.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message || "Unexpected Home failure."}
            </p>
            <Button onClick={reset} type="button">
              Try again
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
