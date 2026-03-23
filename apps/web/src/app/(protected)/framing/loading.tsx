import { AppShell } from "@/components/layout/app-shell";

export default function FramingLoading() {
  return (
    <AppShell
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Framing Cockpit",
        badge: "Story M1-005"
      }}
    >
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        <div className="grid gap-4">
          <div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
          <div className="h-56 animate-pulse rounded-3xl border border-border/70 bg-muted/40" />
        </div>
      </div>
    </AppShell>
  );
}
