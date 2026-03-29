"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import type { OutcomeFieldAiActionState } from "@/app/(protected)/outcomes/[outcomeId]/actions";
import { OutcomeFieldAiFeedback } from "@/components/workspace/outcome-field-ai-feedback";

type OutcomeAiValidatedTextareaProps = {
  field: "outcome_statement" | "baseline_definition";
  label: string;
  name: string;
  initialValue: string;
  disabled?: boolean;
  guidance?: ReactNode;
  minHeightClassName?: string;
  validateAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  initialFeedback?:
    | {
        field: "outcome_statement" | "baseline_definition";
        verdict: "good" | "needs_revision" | "unclear";
        confidence: "high" | "medium" | "low";
        rationale: string;
        suggestedRewrite: string | null;
      }
    | null;
  initialError?: string | null;
};

export function OutcomeAiValidatedTextarea({
  field,
  label,
  name,
  initialValue,
  disabled = false,
  guidance,
  minHeightClassName = "min-h-28",
  validateAction,
  initialFeedback = null,
  initialError = null
}: OutcomeAiValidatedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState<OutcomeFieldAiActionState | null>(
    initialError
      ? {
          status: "error",
          field,
          error: initialError
        }
      : initialFeedback
        ? {
            status: "success",
            field: initialFeedback.field,
            verdict: initialFeedback.verdict,
            confidence: initialFeedback.confidence,
            rationale: initialFeedback.rationale,
            suggestedRewrite: initialFeedback.suggestedRewrite
          }
        : null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setResult(
      initialError
        ? {
            status: "error",
            field,
            error: initialError
          }
        : initialFeedback
          ? {
              status: "success",
              field: initialFeedback.field,
              verdict: initialFeedback.verdict,
              confidence: initialFeedback.confidence,
              rationale: initialFeedback.rationale,
              suggestedRewrite: initialFeedback.suggestedRewrite
            }
          : null
    );
  }, [field, initialError, initialFeedback]);

  const feedback =
    result?.status === "success"
      ? {
          field: result.field,
          verdict: result.verdict,
          confidence: result.confidence,
          rationale: result.rationale,
          suggestedRewrite: result.suggestedRewrite
        }
      : null;
  const error = result?.status === "error" ? result.error : null;

  function handleValidate() {
    const form = textareaRef.current?.closest("form");
    if (!form || disabled) {
      return;
    }

    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const nextResult = await validateAction(formData);
        setResult(nextResult);
      } catch (error) {
        setResult({
          status: "error",
          field,
          error: error instanceof Error ? error.message : "AI validation failed."
        });
      }
    });
  }

  function applySuggestion() {
    if (feedback?.suggestedRewrite) {
      setValue(feedback.suggestedRewrite);
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(feedback.suggestedRewrite.length, feedback.suggestedRewrite.length);
    }
  }

  return (
    <label className="space-y-2">
      <span className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {!disabled ? (
          <Button className="gap-2" disabled={isPending} onClick={handleValidate} size="sm" type="button" variant="secondary">
            <Sparkles className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Validating..." : "AI validate"}
          </Button>
        ) : null}
      </span>
      <textarea
        className={`${minHeightClassName} w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30`}
        disabled={disabled}
        name={name}
        onChange={(event) => setValue(event.target.value)}
        ref={textareaRef}
        value={value}
      />
      {guidance}
      <OutcomeFieldAiFeedback error={error} feedback={feedback} field={field} />
      {feedback?.suggestedRewrite ? (
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={applySuggestion} size="sm" type="button" variant="secondary">
            Use suggestion in editor
          </Button>
        </div>
      ) : null}
    </label>
  );
}
