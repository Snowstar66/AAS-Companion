"use client";

import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@aas-companion/ui";

type PendingFormButtonProps = Omit<ComponentProps<typeof Button>, "children" | "type"> & {
  label: string;
  pendingLabel: string;
  icon?: ReactNode;
};

export function PendingFormButton({
  label,
  pendingLabel,
  className,
  icon,
  disabled,
  ...buttonProps
}: PendingFormButtonProps) {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!pending) {
      return;
    }

    const previousBodyCursor = document.body.style.cursor;
    const previousHtmlCursor = document.documentElement.style.cursor;
    document.body.style.cursor = "wait";
    document.documentElement.style.cursor = "wait";

    return () => {
      document.body.style.cursor = previousBodyCursor;
      document.documentElement.style.cursor = previousHtmlCursor;
    };
  }, [pending]);

  return (
    <Button
      {...buttonProps}
      className={`${className ?? ""} ${pending ? "cursor-wait" : ""}`.trim()}
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {pending ? pendingLabel : label}
    </Button>
  );
}
