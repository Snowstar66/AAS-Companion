import type { FramingAgentQuickAction, FramingAgentScopeKind } from "@/lib/framing/agentTypes";

export const framingAgentModeLabels: Record<"ask" | "analyze" | "refine" | "export", string> = {
  ask: "Ask",
  analyze: "Analyze",
  refine: "Refine",
  export: "Export"
};

export const framingAgentIntroText =
  "Use AI to clarify, analyze, refine, and export the current Framing package without losing traceability or design constraints.";

export const framingAgentQuickActions: Record<FramingAgentScopeKind, FramingAgentQuickAction[]> = {
  "journey-context": [
    { id: "journey-help", label: "Help me describe this Journey", mode: "ask", prompt: "Help me describe this Journey in stronger actor, goal, trigger, and flow language." },
    { id: "journey-step-wording", label: "Suggest better step wording", mode: "refine", prompt: "Suggest better wording for the current Journey steps and remove UI-specific language where needed." },
    { id: "journey-coverage", label: "Analyze Journey Coverage", mode: "analyze", prompt: "Analyze Journey Coverage against the current Epics and Story Ideas." },
    { id: "journey-missing-story-ideas", label: "Suggest missing Story Ideas", mode: "analyze", prompt: "Suggest missing Story Ideas from the current Journey Context." }
  ],
  "story-ideas": [
    { id: "story-overlap", label: "Find overlap between Story Ideas", mode: "analyze", prompt: "Find overlap between the current Story Ideas." },
    { id: "story-from-journey", label: "Suggest Story Ideas from Journey Context", mode: "analyze", prompt: "Suggest Story Ideas from the current Journey Context." },
    { id: "story-split-merge", label: "Suggest split/merge candidates", mode: "refine", prompt: "Suggest Story Idea split, merge, or rewrite candidates." }
  ],
  "downstream-ai-instructions": [
    { id: "instructions-explain", label: "Explain this setting", mode: "ask", prompt: "Explain the practical meaning of the current Downstream AI Instruction setting." },
    { id: "instructions-defaults", label: "Suggest defaults for this initiative", mode: "refine", prompt: "Suggest recommended defaults for this initiative type and AI level." },
    { id: "instructions-review", label: "Review my current instruction configuration", mode: "analyze", prompt: "Review my current Downstream AI Instructions configuration and warn about weak combinations." },
    { id: "instructions-custom", label: "Suggest custom instructions", mode: "refine", prompt: "Suggest clear custom instructions for downstream AI based on the current Framing package." }
  ],
  export: [
    { id: "export-design-handover", label: "Generate Design Handover", mode: "export", prompt: "Generate a downstream Design and Build handover package from the current Framing package." },
    { id: "export-bmad", label: "Generate BMAD-friendly export", mode: "export", prompt: "Generate a BMAD-friendly export profile from the current Framing package." },
    { id: "export-inheritance-review", label: "Review export for missing inheritance", mode: "analyze", prompt: "Review the export for missing inheritance from constraints, UX principles, NFRs, Journey Context, and Downstream AI Instructions." }
  ],
  "full-framing": []
};
