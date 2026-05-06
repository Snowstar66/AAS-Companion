"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";

export function FramingImportAutoContinue() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const form = markerRef.current?.closest("form");
      form?.requestSubmit();
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
      <input name="autoContinueFramingApproval" type="hidden" value="1" />
      <input name="decision" type="hidden" value="approve" />
      <LoaderCircle className="h-3.5 w-3.5 animate-spin text-sky-700" />
      <span ref={markerRef}>Continuing the large framing approval in the next safe batch.</span>
    </div>
  );
}
