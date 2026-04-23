"use client";

import { useAppChromeLanguage } from "@/components/layout/app-language";

type OutcomeFieldAiFeedbackProps = {
  field: "outcome_statement" | "baseline_definition" | "story_expected_behavior";
  feedback:
    | {
        field: "outcome_statement" | "baseline_definition" | "story_expected_behavior";
        verdict: "good" | "needs_revision" | "unclear";
        confidence: "high" | "medium" | "low";
        rationale: string;
        suggestedRewrite: string | null;
      }
    | null;
  error?: string | null;
};

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function getTone(verdict: "good" | "needs_revision" | "unclear") {
  if (verdict === "good") {
    return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
  }

  if (verdict === "unclear") {
    return "border-sky-200 bg-sky-50/80 text-sky-950";
  }

  return "border-amber-200 bg-amber-50/80 text-amber-950";
}

function getHeading(language: "en" | "sv", verdict: "good" | "needs_revision" | "unclear") {
  if (verdict === "good") {
    return t(language, "AI check: good enough", "AI-bedömning: tillräckligt bra");
  }

  if (verdict === "unclear") {
    return t(language, "AI check: borderline", "AI-bedömning: otydligt läge");
  }

  return t(language, "AI check: needs revision", "AI-bedömning: behöver omarbetas");
}

export function OutcomeFieldAiFeedback({ field, feedback, error }: OutcomeFieldAiFeedbackProps) {
  const { language } = useAppChromeLanguage();

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800">
        {t(language, "AI check could not run:", "AI-bedömningen kunde inte köras:")} {error}
      </div>
    );
  }

  if (!feedback || feedback.field !== field) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${getTone(feedback.verdict)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{getHeading(language, feedback.verdict)}</p>
        <span className="text-xs uppercase tracking-[0.18em] opacity-75">
          {feedback.confidence} {t(language, "confidence", "säkerhet")}
        </span>
      </div>
      <p className="mt-2 leading-6">{feedback.rationale}</p>
      {feedback.suggestedRewrite ? (
        <div className="mt-3 rounded-xl border border-current/15 bg-white/50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
            {t(language, "Suggested wording", "Föreslagen formulering")}
          </p>
          <p className="mt-2 leading-6">{feedback.suggestedRewrite}</p>
        </div>
      ) : null}
    </div>
  );
}
