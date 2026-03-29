"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertTriangle, PanelRightOpen, Sparkles, X } from "lucide-react";
import { Button } from "@aas-companion/ui";
import type { reviewOutcomeFramingWithAiAction } from "@/app/(protected)/outcomes/[outcomeId]/actions";

type OutcomeAiReviewDialogProps = {
  outcomeId: string;
  currentAiLevel: string;
  action: typeof reviewOutcomeFramingWithAiAction;
  initialState: {
    status: "idle" | "success" | "error";
    message: string | null;
    report:
      | {
          overallVerdict: "good" | "needs_attention" | "blocked";
          executiveSummary: string;
          missingItems: string[];
          suggestedChanges: string[];
          nextAiLevel: {
            canAdvance: boolean;
            targetLevel: "level_2" | "level_3" | null;
            rationale: string;
            requirements: string[];
          };
        }
      | null;
  };
};

function getVerdictTone(verdict: "good" | "needs_attention" | "blocked") {
  if (verdict === "good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (verdict === "needs_attention") {
    return "border-sky-200 bg-sky-50 text-sky-950";
  }

  return "border-amber-200 bg-amber-50 text-amber-950";
}

export function OutcomeAiReviewDialog({
  outcomeId,
  currentAiLevel,
  action,
  initialState
}: OutcomeAiReviewDialogProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state.status !== "idle") {
      setOpen(true);
    }
  }, [state.status]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <form action={formAction}>
        <input name="outcomeId" type="hidden" value={outcomeId} />
        <Button className="gap-2" disabled={pending} type="submit" variant="secondary">
          <Sparkles className="h-4 w-4" />
          {pending ? "Reviewing framing..." : "AI review framing"}
        </Button>
      </form>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/55">
          <button
            aria-label="Close framing report"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div
            className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col border-l border-border bg-background shadow-[-24px_0_80px_rgba(15,23,42,0.18)]"
            ref={panelRef}
            tabIndex={-1}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-6 py-5 backdrop-blur">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <PanelRightOpen className="h-3.5 w-3.5" />
                  AI framing review
                </div>
                <h3 className="text-xl font-semibold text-foreground">Framing review report</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  This report stays pinned to the viewport while you review the currently saved framing for AI level{" "}
                  {currentAiLevel.replaceAll("_", " ")}.
                </p>
              </div>
              <Button onClick={() => setOpen(false)} size="sm" type="button" variant="secondary">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {state.status === "error" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                  AI framing review could not run: {state.message}
                </div>
              ) : null}

              {state.status === "success" && state.report ? (
                <>
                  <div className={`rounded-2xl border px-4 py-4 ${getVerdictTone(state.report.overallVerdict)}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">Overall verdict</p>
                    <p className="mt-2 text-lg font-semibold">{state.report.overallVerdict.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-sm leading-6">{state.report.executiveSummary}</p>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                      <h4 className="text-sm font-semibold text-foreground">What is missing</h4>
                      {state.report.missingItems.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">No material gaps were identified.</p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                          {state.report.missingItems.map((item) => (
                            <li className="flex gap-2" key={item}>
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                      <h4 className="text-sm font-semibold text-foreground">Suggested changes</h4>
                      {state.report.suggestedChanges.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">No immediate changes were recommended.</p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                          {state.report.suggestedChanges.map((item) => (
                            <li className="flex gap-2" key={item}>
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </div>

                  <section className="rounded-2xl border border-border/70 bg-background p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-foreground">Next AI level</h4>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          state.report.nextAiLevel.canAdvance
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-border/70 bg-muted text-muted-foreground"
                        }`}
                      >
                        {state.report.nextAiLevel.targetLevel
                          ? `Toward ${state.report.nextAiLevel.targetLevel.replaceAll("_", " ")}`
                          : "No higher level defined"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{state.report.nextAiLevel.rationale}</p>
                    {state.report.nextAiLevel.requirements.length > 0 ? (
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                        {state.report.nextAiLevel.requirements.map((item) => (
                          <li className="flex gap-2" key={item}>
                            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/55" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
