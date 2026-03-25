"use client";

import { useEffect, useState } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
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
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex min-w-[220px] items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-muted/20">
          <UserCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{session.user.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
          <p className="truncate text-[11px] text-muted-foreground">{getModeLabel(session.user.mode)}</p>
        </div>
      </div>

      <form action="/auth/logout" method="post">
        <Button className="gap-2" type="submit" variant="secondary">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
