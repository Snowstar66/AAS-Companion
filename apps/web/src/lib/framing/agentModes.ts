import type { FramingAgentMode, FramingAgentQuickAction, FramingAgentScopeKind } from "@/lib/framing/agentTypes";

export const framingAgentModeLabels: Record<"ask" | "analyze" | "refine" | "export", string> = {
  ask: "Ask",
  analyze: "Analyze",
  refine: "Refine",
  export: "Export"
};

export function getFramingAgentModeLabel(language: "en" | "sv", mode: FramingAgentMode) {
  if (language === "sv") {
    if (mode === "ask") return "Fråga";
    if (mode === "analyze") return "Analysera";
    if (mode === "refine") return "Förfina";
    return "Exportera";
  }

  return framingAgentModeLabels[mode];
}

export function getLocalizedQuickActionLabel(
  language: "en" | "sv",
  actionId: string,
  fallbackLabel: string
) {
  if (language === "en") {
    switch (actionId) {
      case "journey-help":
        return "Help me describe this journey";
      case "journey-step-wording":
        return "Improve step wording";
      case "journey-coverage":
        return "Analyze coverage";
      case "journey-missing-story-ideas":
        return "Suggest missing Story Ideas";
      case "story-overlap":
        return "Find overlap between Story Ideas";
      case "story-from-journey":
        return "Suggest Story Ideas from journeys";
      case "story-split-merge":
        return "Suggest split/merge and rewrites";
      default:
        return fallbackLabel;
    }
  }

  return fallbackLabel;
}

export const framingAgentIntroText =
  "Use AI to clarify, analyze, refine, and export the current Framing package without losing traceability or design constraints.";

export const framingAgentQuickActions: Record<FramingAgentScopeKind, FramingAgentQuickAction[]> = {
  "journey-context": [
    {
      id: "journey-help",
      label: "Hjälp mig beskriva denna journey",
      mode: "ask",
      prompt: "Hjälp mig att beskriva denna journey tydligare utifrån aktör, mål, trigger och flöde."
    },
    {
      id: "journey-step-wording",
      label: "Förbättra formulering av steg",
      mode: "refine",
      prompt: "Föreslå bättre formulering för stegen i den aktuella journeyn och ta bort för UI-specifikt språk där det behövs."
    },
    {
      id: "journey-coverage",
      label: "Analysera täckning",
      mode: "analyze",
      prompt: "Analysera journey-täckning mot aktuella Epics och Story Ideas."
    },
    {
      id: "journey-missing-story-ideas",
      label: "Föreslå saknade Story Ideas",
      mode: "analyze",
      prompt: "Föreslå saknade Story Ideas utifrån det aktuella journey-underlaget."
    }
  ],
  "story-ideas": [
    {
      id: "story-overlap",
      label: "Hitta överlapp mellan Story Ideas",
      mode: "analyze",
      prompt: "Hitta överlapp mellan de aktuella Story Ideas och peka ut sådant som riskerar att beskriva samma värde eller beteende."
    },
    {
      id: "story-from-journey",
      label: "Föreslå Story Ideas från journeys",
      mode: "analyze",
      prompt: "Föreslå Story Ideas utifrån det aktuella Journey Context-underlaget och de luckor som finns i dag."
    },
    {
      id: "story-split-merge",
      label: "Föreslå split/merge och omskrivningar",
      mode: "refine",
      prompt: "Föreslå vilka Story Ideas som bör delas, slås ihop eller skrivas om för att bli tydligare och mer riktade."
    }
  ],
  "downstream-ai-instructions": [
    { id: "instructions-explain", label: "Explain this setting", mode: "ask", prompt: "Explain the practical meaning of the current Downstream AI Instruction setting." },
    { id: "instructions-defaults", label: "Suggest defaults for this initiative", mode: "refine", prompt: "Suggest recommended defaults for this initiative type and AI level." },
    { id: "instructions-review", label: "Review my current instruction configuration", mode: "analyze", prompt: "Review my current Downstream AI Instructions configuration and warn about weak combinations." },
    { id: "instructions-custom", label: "Suggest custom instructions", mode: "refine", prompt: "Suggest clear custom instructions for downstream AI based on the current Framing package." }
  ],
  export: [
    { id: "export-design-handover", label: "Preview Design Handover", mode: "export", prompt: "Preview a downstream Design and Build handover package from the current Framing package." },
    { id: "export-bmad", label: "Preview BMAD export", mode: "export", prompt: "Preview a BMAD-prepared export profile from the current Framing package." },
    { id: "export-inheritance-review", label: "Analyze handoff completeness", mode: "analyze", prompt: "Analyze the current handoff for missing inheritance from constraints, UX principles, NFRs, Journey Context, and Downstream AI Instructions. Return clear fix guidance before export." }
  ],
  "full-framing": []
};

export function buildDefaultFramingAgentPrompt(scopeKind: FramingAgentScopeKind, mode: FramingAgentMode) {
  if (scopeKind === "journey-context") {
    if (mode === "ask") {
      return "Help me understand what is still unclear in the current journey and what I should clarify next.";
    }

    if (mode === "analyze") {
      return "Analyze the current journey against the linked Epics and Story Ideas. Show gaps, overlaps and what should be corrected next.";
    }

    if (mode === "refine") {
      return "Refine the wording of the current journey so the actor, goal, trigger and flow are clearer without becoming too UI-specific.";
    }

    return "Preview how this journey context would appear in a downstream handoff and highlight anything important that would be lost.";
  }

  if (scopeKind === "story-ideas") {
    if (mode === "ask") {
      return "Help me understand whether the current Story Ideas are clear enough and what kind of story guidance is still missing.";
    }

    if (mode === "analyze") {
      return "Analyze the current Story Ideas for overlap, missing coverage and unclear intent. Return a practical fix list.";
    }

    if (mode === "refine") {
      return "Refine the current Story Ideas so their value intent and expected behavior are clearer without turning them into Delivery Stories.";
    }

    return "Preview how the current Story Ideas would appear in a downstream handoff and point out anything that may be lost.";
  }

  if (scopeKind === "downstream-ai-instructions") {
    if (mode === "ask") {
      return "Explain what the current Downstream AI Instructions mean in practice for later design and build work.";
    }

    if (mode === "analyze") {
      return "Analyze the current Downstream AI Instructions and warn about weak combinations, over-constraint or missing guidance.";
    }

    if (mode === "refine") {
      return "Suggest a clearer downstream AI profile for this initiative type and AI level while preserving the current governance envelope.";
    }

    return "Preview how the current Downstream AI Instructions will be carried into a downstream handoff package.";
  }

  if (scopeKind === "export") {
    if (mode === "ask") {
      return "Explain which export path I should use, what will be included, and what I should check before the final handoff.";
    }

    if (mode === "analyze") {
      return "Analyze the current handoff for missing inheritance from constraints, UX principles, NFRs, Journey Context and Downstream AI Instructions. Return a clear fix list before export.";
    }

    if (mode === "refine") {
      return "Suggest what should be improved in the current Framing package so the eventual export becomes clearer, safer and more traceable.";
    }

    return "Preview a downstream handoff package from the current Framing and highlight anything important that would be lost before the real export.";
  }

  if (mode === "ask") {
    return "Help me understand what is strongest, weakest or still unclear in the current Framing package.";
  }

  if (mode === "analyze") {
    return "Analyze the current Framing package for gaps, weak inheritance, missing scope clarity and traceability risks. Return a practical fix list.";
  }

  if (mode === "refine") {
    return "Suggest how to improve the current Framing package so it becomes clearer, more coherent and easier to hand off to later AI steps.";
  }

  return "Preview how the current Framing package would be handed off downstream and point out anything critical that may be lost.";
}
