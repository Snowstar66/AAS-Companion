"use client";

import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@aas-companion/ui";

type PendingFormButtonProps = Omit<ComponentProps<typeof Button>, "children" | "type"> & {
  label: string;
  pendingLabel: string;
  icon?: ReactNode;
  showPendingCursor?: boolean;
};

export function PendingFormButton({
  label,
  pendingLabel,
  className,
  icon,
  disabled,
  showPendingCursor = false,
  ...buttonProps
}: PendingFormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...buttonProps}
      className={`${className ?? ""} ${pending && showPendingCursor ? "cursor-wait" : ""}`.trim()}
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {pending ? pendingLabel : label}
    </Button>
  );
}
