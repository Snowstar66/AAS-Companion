"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { AiAssistantPanel as AiAssistantPanelComponent } from "@/components/framing/ai-assistant-panel";
import type { FramingBriefExportPanel as FramingBriefExportPanelComponent } from "@/components/framing/framing-brief-export-panel";
import type { OutcomeAiReviewDialog as OutcomeAiReviewDialogComponent } from "@/components/workspace/outcome-ai-review-dialog";
import type { OutcomeAiRiskPostureCard as OutcomeAiRiskPostureCardComponent } from "@/components/workspace/outcome-ai-risk-posture-card";

function LazyPanelFallback() {
  return <div className="min-h-24 rounded-2xl border border-border/70 bg-muted/20" />;
}

export const AiAssistantPanel = dynamic<ComponentProps<typeof AiAssistantPanelComponent>>(
  () => import("@/components/framing/ai-assistant-panel").then((mod) => mod.AiAssistantPanel),
  {
    loading: LazyPanelFallback
  }
);

export const FramingBriefExportPanel = dynamic<ComponentProps<typeof FramingBriefExportPanelComponent>>(
  () => import("@/components/framing/framing-brief-export-panel").then((mod) => mod.FramingBriefExportPanel),
  {
    loading: LazyPanelFallback
  }
);

export const OutcomeAiReviewDialog = dynamic<ComponentProps<typeof OutcomeAiReviewDialogComponent>>(
  () => import("@/components/workspace/outcome-ai-review-dialog").then((mod) => mod.OutcomeAiReviewDialog),
  {
    loading: LazyPanelFallback
  }
);

export const OutcomeAiRiskPostureCard = dynamic<ComponentProps<typeof OutcomeAiRiskPostureCardComponent>>(
  () => import("@/components/workspace/outcome-ai-risk-posture-card").then((mod) => mod.OutcomeAiRiskPostureCard),
  {
    loading: LazyPanelFallback
  }
);
