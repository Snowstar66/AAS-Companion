"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@aas-companion/ui";
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
};

export function StoryIdeaAiValidatedTextarea({
  label,
  name,
  initialValue,
  disabled = false,
  minHeightClassName = "min-h-24",
  validateAction
}: StoryIdeaAiValidatedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState<StoryIdeaExpectedBehaviorAiActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
          field: "story_expected_behavior",
          error: error instanceof Error ? error.message : "AI validation failed."
        });
      }
    });
  }

  function applySuggestion() {
    if (result?.status === "success" && result.suggestedRewrite) {
      setValue(result.suggestedRewrite);
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(result.suggestedRewrite.length, result.suggestedRewrite.length);
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
      <OutcomeFieldAiFeedback
        error={result?.status === "error" ? result.error : null}
        feedback={
          result?.status === "success"
            ? {
                field: result.field,
                verdict: result.verdict,
                confidence: result.confidence,
                rationale: result.rationale,
                suggestedRewrite: result.suggestedRewrite
              }
            : null
        }
        field="story_expected_behavior"
      />
      {result?.status === "success" && result.suggestedRewrite ? (
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2" onClick={applySuggestion} size="sm" type="button" variant="secondary">
            Use suggestion in editor
          </Button>
        </div>
      ) : null}
    </label>
  );
}
