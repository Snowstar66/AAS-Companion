"use client";

import { Printer } from "lucide-react";
import { Button } from "@aas-companion/ui";

export function ApprovalDocumentPrintButton() {
  return (
    <Button className="gap-2" onClick={() => window.print()} type="button">
      <Printer className="h-4 w-4" />
      Print or save as PDF
    </Button>
  );
}
