"use client";

import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@aas-companion/ui";

type SessionSummary = {
  authenticated: boolean;
  user: {
    displayName: string;
    email: string;
    mode: "demo" | "local" | "supabase";
  } | null;
};

function getModeLabel(mode: NonNullable<SessionSummary["user"]>["mode"]) {
  if (mode === "local") {
    return "Direct sign-in";
  }

  if (mode === "supabase") {
    return "Verified email";
  }

  return "Demo access";
}

export function UserSessionStatus() {
  const [session, setSession] = useState<SessionSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/auth/session", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SessionSummary;

        if (!cancelled) {
          setSession(data);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!session?.authenticated || !session.user) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      <div className="flex min-w-[220px] items-center gap-3 rounded-2xl border border-border/70 bg-background/90 px-3 py-2 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-muted/30">
          <UserCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{session.user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        {getModeLabel(session.user.mode)}
      </div>

      <form action="/auth/logout" method="post">
        <Button className="gap-2 shadow-sm" type="submit" variant="secondary">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
