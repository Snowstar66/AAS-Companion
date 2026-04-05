"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, ShieldAlert, Sparkles, X } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
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
          validationMode: "AD" | "AT" | "AM" | "generic";
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
          requiredActions: string[];
        }
      | null;
  };
};

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

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

function formatValidationMode(value: "AD" | "AT" | "AM" | "generic") {
  if (value === "generic") {
    return "Generic framing";
  }

  return value;
}

function getReadinessBand(interpretation: "ready_for_tollgate" | "needs_refinement" | "not_ready") {
  if (interpretation === "ready_for_tollgate") {
    return "80-100";
  }

  if (interpretation === "needs_refinement") {
    return "60-79";
  }

  return "<60";
}

function StatusIcon(props: { tone: "good" | "warning" | "danger" }) {
  if (props.tone === "good") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-700" />;
  }

  if (props.tone === "warning") {
    return <CircleAlert className="h-4 w-4 text-amber-600" />;
  }

  return <ShieldAlert className="h-4 w-4 text-rose-700" />;
}

export function OutcomeAiReviewDialog({
  outcomeId,
  currentAiLevel,
  action,
  initialState
}: OutcomeAiReviewDialogProps) {
  const { language } = useAppChromeLanguage();
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
          {pending ? t(language, "Reviewing framing...", "Granskar framing...") : t(language, "AI review framing", "AI-granska framing")}
        </Button>
      </form>

      {open ? (
        <div className={`fixed inset-0 z-50 p-4 ${pending ? "cursor-wait" : ""}`.trim()}>
          <div aria-hidden="true" className="absolute inset-0 bg-slate-950/55" onClick={() => setOpen(false)} />
          <div
            className="relative z-10 flex h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
            ref={panelRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-6 py-5 backdrop-blur">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t(language, "AI framing review", "AI-granskning av framing")}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t(language, "Framing review report", "Granskningsrapport for framing")}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t(language, "This report stays pinned to the viewport while you review the currently saved framing for AI level", "Den har rapporten ligger fast i vyn medan du granskar den sparade framingen for AI-niva")}{" "}
                  {currentAiLevel.replaceAll("_", " ")}.
                </p>
              </div>
              <Button onClick={() => setOpen(false)} size="sm" type="button" variant="secondary">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto overscroll-contain px-6 py-6 [scrollbar-gutter:stable]">
                <div className="space-y-6">
                  {pending ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
                      {t(language, "AI framing review is running. The report will refresh when the response is ready.", "AI-granskning av framing pagar. Rapporten uppdateras nar svaret ar klart.")}
                    </div>
                  ) : null}

                  {state.status === "error" ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                      {t(language, "AI framing review could not run:", "AI-granskning av framing kunde inte koras:")} {state.message}
                    </div>
                  ) : null}

                  {state.status === "success" && state.report ? (
                    <>
                      <div className={`rounded-2xl border px-5 py-5 ${getReadinessTone(state.report.framingReadiness.interpretation)}`}>
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em]">{t(language, "Framing Validation Summary", "Sammanfattning av framingvalidering")}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <StatusIcon
                                tone={
                                  state.report.framingReadiness.interpretation === "ready_for_tollgate"
                                    ? "good"
                                    : state.report.framingReadiness.interpretation === "needs_refinement"
                                      ? "warning"
                                      : "danger"
                                }
                              />
                              <p className="text-xl font-semibold">{formatInterpretation(state.report.framingReadiness.interpretation)}</p>
                            </div>
                            <p className="mt-2 text-sm leading-6">
                              Outcome Quality: {formatStatus(state.report.outcomeQuality.status)}. Problem Alignment: {formatStatus(state.report.problemAlignment.status)}.
                              {" "}
                              Epic Coverage: {formatStatus(state.report.epicCoverage.status)}. Story Coverage: {formatStatus(state.report.storyCoverage.status)}.
                            </p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                              {t(language, "Validation mode:", "Valideringslage:")} {formatValidationMode(state.report.validationMode)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-current/15 bg-white/60 px-5 py-4 text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{t(language, "Framing Readiness", "Framing-readiness")}</p>
                            <p className="mt-2 text-3xl font-semibold">{getReadinessBand(state.report.framingReadiness.interpretation)}</p>
                            <p className="mt-2 text-xs font-medium opacity-80">{formatInterpretation(state.report.framingReadiness.interpretation)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                          <h4 className="text-sm font-semibold text-foreground">{t(language, "Outcome Quality", "Outcome-kvalitet")}</h4>
                          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                            <StatusIcon tone={state.report.outcomeQuality.status === "ok" ? "good" : "warning"} />
                            <span>{formatStatus(state.report.outcomeQuality.status)}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.outcomeQuality.comment}</p>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {t(language, "Suggested improvement:", "Foreslagen forbattring:")} {state.report.outcomeQuality.suggestedImprovement}
                          </p>
                        </section>

                        <section className="rounded-2xl border border-border/70 bg-muted/10 p-5">
                          <h4 className="text-sm font-semibold text-foreground">{t(language, "Problem Alignment", "Problemalignment")}</h4>
                          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                            <StatusIcon tone={state.report.problemAlignment.status === "strong" ? "good" : "warning"} />
                            <span>{formatStatus(state.report.problemAlignment.status)}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.report.problemAlignment.comment}</p>
                        </section>
                      </div>

                      <section className="rounded-2xl border border-border/70 bg-amber-50/60 p-5">
                        <h4 className="text-sm font-semibold text-foreground">{t(language, "Required Actions", "Obligatoriska atgarder")}</h4>
                        {state.report.requiredActions.length > 0 ? (
                          <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                            {state.report.requiredActions.map((item) => (
                              <li className="flex gap-2" key={item}>
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {t(language, "No mandatory follow-up actions were identified for the selected validation mode.", "Inga obligatoriska uppfoljningsatgarder identifierades for valt valideringslage.")}
                          </p>
                        )}
                      </section>

                      <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-2xl border border-border/70 bg-background p-5">
                          <h4 className="text-sm font-semibold text-foreground">Epic Coverage</h4>
                          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                            <StatusIcon tone={state.report.epicCoverage.status === "complete" ? "good" : "warning"} />
                            <span>{formatStatus(state.report.epicCoverage.status)}</span>
                          </div>
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
                          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                            <StatusIcon tone={state.report.storyCoverage.status === "good" ? "good" : "warning"} />
                            <span>{formatStatus(state.report.storyCoverage.status)}</span>
                          </div>
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
                          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                            <StatusIcon tone={state.report.aiLevel.assessment === "appropriate" ? "good" : "warning"} />
                            <span>{formatStatus(state.report.aiLevel.assessment)}</span>
                          </div>
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
          </div>
        </div>
      ) : null}
    </>
  );
}
