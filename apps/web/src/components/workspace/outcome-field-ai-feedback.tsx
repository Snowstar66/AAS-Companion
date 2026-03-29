type OutcomeFieldAiFeedbackProps = {
  field: "outcome_statement" | "baseline_definition";
  feedback:
    | {
        field: "outcome_statement" | "baseline_definition";
        verdict: "good" | "needs_revision" | "unclear";
        confidence: "high" | "medium" | "low";
        rationale: string;
        suggestedRewrite: string | null;
      }
    | null;
  error?: string | null;
};

function getTone(verdict: "good" | "needs_revision" | "unclear") {
  if (verdict === "good") {
    return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
  }

  if (verdict === "unclear") {
    return "border-sky-200 bg-sky-50/80 text-sky-950";
  }

  return "border-amber-200 bg-amber-50/80 text-amber-950";
}

function getHeading(verdict: "good" | "needs_revision" | "unclear") {
  if (verdict === "good") {
    return "AI check: good enough";
  }

  if (verdict === "unclear") {
    return "AI check: borderline";
  }

  return "AI check: needs revision";
}

export function OutcomeFieldAiFeedback({ field, feedback, error }: OutcomeFieldAiFeedbackProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-800">
        AI check could not run: {error}
      </div>
    );
  }

  if (!feedback || feedback.field !== field) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${getTone(feedback.verdict)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{getHeading(feedback.verdict)}</p>
        <span className="text-xs uppercase tracking-[0.18em] opacity-75">{feedback.confidence} confidence</span>
      </div>
      <p className="mt-2 leading-6">{feedback.rationale}</p>
      {feedback.suggestedRewrite ? (
        <div className="mt-3 rounded-xl border border-current/15 bg-white/50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Suggested wording</p>
          <p className="mt-2 leading-6">{feedback.suggestedRewrite}</p>
        </div>
      ) : null}
    </div>
  );
}
