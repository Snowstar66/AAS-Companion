"use client";

import { LogOut, UserCircle2 } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { useViewerSession } from "@/components/auth/viewer-session-provider";

export function UserSessionStatus() {
  const session = useViewerSession();
  const { content } = useAppChromeLanguage();

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <div className="flex min-w-[220px] items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-muted/20">
          <UserCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{session.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{session.email}</p>
          <p className="truncate text-[11px] text-muted-foreground">{content.signInMode[session.mode]}</p>
        </div>
      </div>

      <form action="/auth/logout" method="post">
        <Button className="gap-2" type="submit" variant="secondary">
          <LogOut className="h-4 w-4" />
          {content.signOut}
        </Button>
      </form>
    </div>
  );
}
