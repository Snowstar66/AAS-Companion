import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-[28px] border border-border/70 bg-background/95 p-8 shadow-[0_18px_65px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Error 404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">That page does not exist</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The link may be outdated, or the page may belong to a different project context.
        </p>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Return to Home and reopen the active project from there.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          href="/"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
