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
          outcomeQuality: {
            status: "ok" | "needs_improvement";
            comment: string;
            suggestedImprovement: string;
          };
          problemAlignment: {
            status: "strong" | "weak";
            comment: string;
          };
          epicCoverage: {
            status: "complete" | "partial";
            comment: string;
            missingAreas: string[];
          };
          storyCoverage: {
            status: "good" | "partial";
            comment: string;
            gapsOrOverlaps: string[];
          };
          riskOverview: {
            topRisks: string[];
            expansionRisk: "low" | "medium" | "high";
            misalignmentRisk: "low" | "medium" | "high";
          };
          aiLevel: {
            assessment: "appropriate" | "too_high" | "too_low";
            suggestedLevel: "level_1" | "level_2" | "level_3" | null;
            comment: string;
          };
          framingReadiness: {
            score: number;
            interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready";
          };
        }
      | null;
  };
};

function getReadinessTone(interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready") {
  if (interpretation === "ready_for_tollgate") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (interpretation === "needs_refinement") {
    return "border-sky-200 bg-sky-50 text-sky-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function formatInterpretation(value: "ready_for_tollgate" | "needs_refinement" | "not_ready") {
  if (value === "ready_for_tollgate") {
    return "Ready for Tollgate";
  }

  if (value === "needs_refinement") {
    return "Needs refinement";
  }

  return "Not ready";
}

function formatAiLevel(level: "level_1" | "level_2" | "level_3" | null) {
  if (!level) {
    return "No change suggested";
  }

  return level.replaceAll("_", " ");
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatRisk(value: "low" | "medium" | "high") {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
    if (pending) {
      setOpen(true);
    }
  }, [pending]);

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
      <form
        action={formAction}
        onSubmit={() => {
          setOpen(true);
        }}
      >
        <input name="outcomeId" type="hidden" value={outcomeId} />
        <Button aria-busy={pending} className={`gap-2 ${pending ? "cursor-wait" : ""}`.trim()} disabled={pending} type="submit" variant="secondary">
          <Sparkles className="h-4 w-4" />
          {pending ? "Reviewing framing..." : "AI review framing"}
        </Button>
      </form>

      {open ? (
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 ${pending ? "cursor-wait" : ""}`.trim()}>
          <button
            aria-label="Close framing report"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div
            className="relative mx-4 my-4 flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
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

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-6">
              {pending ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                  AI framing review is running. The report will refresh when the response is ready.
                </div>
              ) : null}

              {state.status === "error" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                  AI framing review could not run: {state.message}
                </div>
              ) : null}

              {state.status === "success" && state.report ? (
                <>
                  <div className={`rounded-2xl border px-5 py-5 ${getReadinessTone(state.report.framingReadiness.interpretation)}`}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Framing Validation Summary</p>
                        <p className="mt-2 text-xl font-semibold">{formatInterpretation(state.report.framingReadiness.interpretation)}</p>
                        <p className="mt-2 text-sm leading-6">
                          Outcome Quality: {formatStatus(state.report.outcomeQuality.status)}. Problem Alignment: {formatStatus(state.report.problemAlignment.status)}.
                          {" "}
                          Epic Coverage: {formatStatus(state.report.epicCoverage.status)}. Story Coverage: {formatStatus(state.report.storyCoverage.status)}.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-current/15 bg-white/60 px-5 py-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">Framing Readiness</p>
                        <p className="mt-2 text-3xl font-semibold">{state.report.framingReadiness.score}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                      <h4 className="text-sm font-semibold text-foreground">Outcome Quality</h4>
                      <p className="mt-3 text-sm font-medium text-foreground">{formatStatus(state.report.outcomeQuality.status)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.outcomeQuality.comment}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Suggested improvement: {state.report.outcomeQuality.suggestedImprovement}
                      </p>
                    </section>

                    <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                      <h4 className="text-sm font-semibold text-foreground">Problem Alignment</h4>
                      <p className="mt-3 text-sm font-medium text-foreground">{formatStatus(state.report.problemAlignment.status)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.problemAlignment.comment}</p>
                    </section>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <section className="rounded-2xl border border-border/70 bg-background p-5">
                      <h4 className="text-sm font-semibold text-foreground">Epic Coverage</h4>
                      <p className="mt-3 text-sm font-medium text-foreground">{formatStatus(state.report.epicCoverage.status)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.epicCoverage.comment}</p>
                      {state.report.epicCoverage.missingAreas.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                          {state.report.epicCoverage.missingAreas.map((item) => (
                            <li className="flex gap-2" key={item}>
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">No missing Epic areas were identified.</p>
                      )}
                    </section>

                    <section className="rounded-2xl border border-border/70 bg-background p-5">
                      <h4 className="text-sm font-semibold text-foreground">Story Coverage</h4>
                      <p className="mt-3 text-sm font-medium text-foreground">{formatStatus(state.report.storyCoverage.status)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.storyCoverage.comment}</p>
                      {state.report.storyCoverage.gapsOrOverlaps.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                          {state.report.storyCoverage.gapsOrOverlaps.map((item) => (
                            <li className="flex gap-2" key={item}>
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">No material gaps or overlaps were identified.</p>
                      )}
                    </section>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                    <section className="rounded-2xl border border-border/70 bg-background p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-sm font-semibold text-foreground">Risk Overview</h4>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-muted-foreground">
                            Expansion Risk: {formatRisk(state.report.riskOverview.expansionRisk)}
                          </span>
                          <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-muted-foreground">
                            Misalignment Risk: {formatRisk(state.report.riskOverview.misalignmentRisk)}
                          </span>
                        </div>
                      </div>
                      {state.report.riskOverview.topRisks.length > 0 ? (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                          {state.report.riskOverview.topRisks.map((item) => (
                            <li className="flex gap-2" key={item}>
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">No top risks were returned.</p>
                      )}
                    </section>

                    <section className="rounded-2xl border border-border/70 bg-background p-5">
                      <h4 className="text-sm font-semibold text-foreground">AI Level</h4>
                      <p className="mt-3 text-sm font-medium text-foreground">{formatStatus(state.report.aiLevel.assessment)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.aiLevel.comment}</p>
                      {state.report.aiLevel.suggestedLevel ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Suggested level: {formatAiLevel(state.report.aiLevel.suggestedLevel)}
                        </p>
                      ) : null}
                    </section>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
