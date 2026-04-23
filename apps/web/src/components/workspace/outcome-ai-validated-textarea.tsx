"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import type { OutcomeFieldAiActionState } from "@/app/(protected)/outcomes/[outcomeId]/actions";
import { hasMeaningfulTextChange } from "@/lib/ai/meaningful-change";
import { OutcomeFieldAiFeedback } from "@/components/workspace/outcome-field-ai-feedback";

type OutcomeAiValidatedTextareaProps = {
  field: "outcome_statement" | "baseline_definition";
  label: string;
  name: string;
  initialValue: string;
  disabled?: boolean;
  guidance?: ReactNode;
  promptHint?: ReactNode;
  minHeightClassName?: string;
  validateAction: (formData: FormData) => Promise<OutcomeFieldAiActionState>;
  saveAction?: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>;
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

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function formatValidationError(language: "en" | "sv", error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("Server Action") && message.includes("was not found on the server")) {
    return t(
      language,
      "The page is using an older AI action reference after a recent update. Reload the page and try AI validate again.",
      "Sidan använder en äldre AI-actionreferens efter en nylig uppdatering. Ladda om sidan och försök AI-validera igen."
    );
  }

  return error instanceof Error ? error.message : t(language, "AI validation failed.", "AI-validering misslyckades.");
}

export function OutcomeAiValidatedTextarea({
  field,
  label,
  name,
  initialValue,
  disabled = false,
  guidance,
  promptHint,
  minHeightClassName = "min-h-28",
  validateAction,
  saveAction,
  initialFeedback = null,
  initialError = null
}: OutcomeAiValidatedTextareaProps) {
  const { language } = useAppChromeLanguage();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [validatedValueSnapshot, setValidatedValueSnapshot] = useState(initialValue);
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
    setValidatedValueSnapshot(initialValue);
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
  const hasMeaningfulSuggestion = Boolean(
    feedback?.suggestedRewrite && hasMeaningfulTextChange(validatedValueSnapshot, feedback.suggestedRewrite)
  );
  const feedbackForDisplay =
    feedback && !hasMeaningfulSuggestion
      ? {
          ...feedback,
          suggestedRewrite: null
        }
      : feedback;
  const noMeaningfulSuggestion =
    feedback?.suggestedRewrite && !hasMeaningfulSuggestion
      ? t(
          language,
          "AI reviewed the field but did not find a meaningfully better rewrite from the current Framing context. Review the rationale and revise manually if needed.",
          "AI granskade fältet men hittade ingen tydligt bättre omskrivning utifrån nuvarande Framing-kontext. Läs motiveringen och justera manuellt vid behov."
        )
      : null;

  function handleValidate() {
    const form = textareaRef.current?.closest("form");
    if (!form || disabled) {
      return;
    }

    const formData = new FormData(form);
    setValidatedValueSnapshot(value);

    startTransition(async () => {
      try {
        const nextResult = await validateAction(formData);
        setResult(nextResult);
      } catch (error) {
        setResult({
          status: "error",
          field,
          error: formatValidationError(language, error)
        });
      }
    });
  }

  function applySuggestion() {
    if (feedback?.suggestedRewrite) {
      setValue(feedback.suggestedRewrite);
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(feedback.suggestedRewrite.length, feedback.suggestedRewrite.length);
      setSaveMessage(null);
      setSaveError(null);
    }
  }

  function applySuggestionAndSave() {
    if (!feedback?.suggestedRewrite || !saveAction) {
      applySuggestion();
      return;
    }

    const form = textareaRef.current?.closest("form");

    setValue(feedback.suggestedRewrite);
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(feedback.suggestedRewrite.length, feedback.suggestedRewrite.length);
    setSaveMessage(null);
    setSaveError(null);

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    formData.set(name, feedback.suggestedRewrite);

    startSavingTransition(async () => {
      try {
        const saveResult = await saveAction(formData);

        if (saveResult.status === "error") {
          setSaveError(saveResult.message);
          setSaveMessage(null);
          return;
        }

        setSaveMessage(saveResult.message);
        setSaveError(null);
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : t(language, "Suggestion could not be saved.", "Förslaget kunde inte sparas.")
        );
        setSaveMessage(null);
      }
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {guidance}
      {promptHint}
      <textarea
        className={`${minHeightClassName} w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30`}
        disabled={disabled}
        name={name}
        onChange={(event) => setValue(event.target.value)}
        ref={textareaRef}
        value={value}
      />
      {!disabled ? (
        <div className="flex justify-end">
          <Button className="gap-2" disabled={isPending} onClick={handleValidate} size="sm" type="button" variant="secondary">
            <Sparkles className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? t(language, "Validating...", "Validerar...") : t(language, "AI validate", "AI-validera")}
          </Button>
        </div>
      ) : null}
      <OutcomeFieldAiFeedback error={error} feedback={feedbackForDisplay} field={field} />
      {noMeaningfulSuggestion ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
          {noMeaningfulSuggestion}
        </div>
      ) : null}
      {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}
      {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}
      {feedback?.suggestedRewrite && hasMeaningfulSuggestion ? (
        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-2"
            disabled={isSaving}
            onClick={applySuggestionAndSave}
            size="sm"
            type="button"
            variant="default"
          >
            {isSaving ? t(language, "Applying and saving...", "Tillämpar och sparar...") : t(language, "Use suggestion and save", "Använd förslag och spara")}
          </Button>
          <Button className="gap-2" disabled={isSaving} onClick={applySuggestion} size="sm" type="button" variant="secondary">
            {t(language, "Use suggestion in editor", "Använd förslag i editorn")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
