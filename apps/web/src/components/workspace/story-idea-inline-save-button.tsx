"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@aas-companion/ui";

type StoryIdeaInlineSaveButtonProps = {
  disabled?: boolean;
  label: string;
  pendingLabel: string;
  saveAction: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>;
};

export function StoryIdeaInlineSaveButton({
  disabled = false,
  label,
  pendingLabel,
  saveAction
}: StoryIdeaInlineSaveButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest("form");

    if (!form || disabled || isPending) {
      return;
    }

    const formData = new FormData(form);
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const result = await saveAction(formData);

        if (result.status === "error") {
          setError(result.message);
          return;
        }

        setMessage(result.message);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Story Idea could not be saved.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        aria-busy={isPending}
        className={`gap-2 ${isPending ? "cursor-wait" : ""}`.trim()}
        data-pending={isPending ? "true" : undefined}
        disabled={disabled || isPending}
        onClick={handleSave}
        type="button"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {isPending ? pendingLabel : label}
      </Button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
