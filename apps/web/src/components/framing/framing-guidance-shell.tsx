"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@aas-companion/ui";

const STORAGE_KEY = "aas-framing-guidance-visible";

export function FramingGuidanceShell({ children }: { children: ReactNode }) {
  const [guidanceVisible, setGuidanceVisible] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "false") {
      setGuidanceVisible(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, guidanceVisible ? "true" : "false");
  }, [guidanceVisible]);

  return (
    <div className="space-y-4" data-framing-guidance-visible={guidanceVisible ? "true" : "false"}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">Framing guidance</p>
          <p className="text-sm text-muted-foreground">Switch between a lighter working view and the fuller guided view.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setGuidanceVisible((current) => !current)}
          type="button"
          variant="secondary"
        >
          {guidanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {guidanceVisible ? "Hide guidance" : "Show guidance"}
        </Button>
      </div>

      {children}

      <style jsx global>{`
        [data-framing-guidance-visible="false"] .framing-inline-guidance,
        [data-framing-guidance-visible="false"] .framing-guidance-copy {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
