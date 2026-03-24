import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";

export default function NotFoundPage() {
  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Page not found",
        badge: "404"
      }}
    >
      <section className="flex min-h-[50vh] items-center justify-center">
        <Card className="max-w-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>That page does not exist</CardTitle>
            <CardDescription>
              The link may be outdated, or the page may belong to a different project context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Return to Home and reopen the active project from there.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
