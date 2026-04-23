"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { hasMeaningfulTextChange } from "@/lib/ai/meaningful-change";
import { OutcomeFieldAiFeedback } from "@/components/workspace/outcome-field-ai-feedback";

type StoryIdeaExpectedBehaviorAiActionState =
  | {
      status: "success";
      field: "story_expected_behavior";
      verdict: "good" | "needs_revision" | "unclear";
      confidence: "high" | "medium" | "low";
      rationale: string;
      suggestedRewrite: string | null;
    }
  | {
      status: "error";
      field: "story_expected_behavior";
      error: string;
    };

type StoryIdeaAiValidatedTextareaProps = {
  label: string;
  name: string;
  initialValue: string;
  disabled?: boolean;
  minHeightClassName?: string;
  validateAction: (formData: FormData) => Promise<StoryIdeaExpectedBehaviorAiActionState>;
  saveAction?: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>;
};

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

export function StoryIdeaAiValidatedTextarea({
  label,
  name,
  initialValue,
  disabled = false,
  minHeightClassName = "min-h-24",
  validateAction,
  saveAction
}: StoryIdeaAiValidatedTextareaProps) {
  const { language } = useAppChromeLanguage();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [validatedValueSnapshot, setValidatedValueSnapshot] = useState(initialValue);
  const [result, setResult] = useState<StoryIdeaExpectedBehaviorAiActionState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();
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

  useEffect(() => {
    setValue(initialValue);
    setValidatedValueSnapshot(initialValue);
  }, [initialValue]);

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
          field: "story_expected_behavior",
          error: error instanceof Error ? error.message : t(language, "AI validation failed.", "AI-validering misslyckades.")
        });
      }
    });
  }

  function applySuggestion() {
    if (result?.status === "success" && result.suggestedRewrite) {
      setValue(result.suggestedRewrite);
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(result.suggestedRewrite.length, result.suggestedRewrite.length);
      setSaveMessage(null);
      setSaveError(null);
    }
  }

  function applySuggestionAndSave() {
    if (result?.status !== "success" || !result.suggestedRewrite || !saveAction) {
      applySuggestion();
      return;
    }

    const form = textareaRef.current?.closest("form");

    setValue(result.suggestedRewrite);
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(result.suggestedRewrite.length, result.suggestedRewrite.length);
    setSaveMessage(null);
    setSaveError(null);

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    formData.set(name, result.suggestedRewrite);

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
        setSaveError(error instanceof Error ? error.message : t(language, "Suggestion could not be saved.", "Förslaget kunde inte sparas."));
        setSaveMessage(null);
      }
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
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
      <OutcomeFieldAiFeedback error={result?.status === "error" ? result.error : null} feedback={feedbackForDisplay} field="story_expected_behavior" />
      {noMeaningfulSuggestion ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
          {noMeaningfulSuggestion}
        </div>
      ) : null}
      {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}
      {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}
      {result?.status === "success" && result.suggestedRewrite && hasMeaningfulSuggestion ? (
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
