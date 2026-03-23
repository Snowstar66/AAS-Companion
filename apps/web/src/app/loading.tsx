import { AppShell } from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Home Dashboard",
        badge: "Story M1-004"
      }}
    >
      <section className="space-y-6">
        <div className="h-36 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-32 animate-pulse rounded-3xl border border-border/70 bg-muted/30" key={index} />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
          <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        </div>
      </section>
    </AppShell>
  );
}
