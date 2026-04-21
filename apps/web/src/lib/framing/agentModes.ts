import type { FramingAgentQuickAction, FramingAgentScopeKind } from "@/lib/framing/agentTypes";

export const framingAgentModeLabels: Record<"ask" | "analyze" | "refine" | "export", string> = {
  ask: "Fråga",
  analyze: "Analysera",
  refine: "Förfina",
  export: "Exportera"
};

export const framingAgentIntroText =
  "Use AI to clarify, analyze, refine, and export the current Framing package without losing traceability or design constraints.";

export const framingAgentQuickActions: Record<FramingAgentScopeKind, FramingAgentQuickAction[]> = {
  "journey-context": [
    { id: "journey-help", label: "Hjälp mig beskriva denna journey", mode: "ask", prompt: "Hjälp mig att beskriva denna journey tydligare utifrån aktör, mål, trigger och flöde." },
    { id: "journey-step-wording", label: "Förbättra formulering av steg", mode: "refine", prompt: "Föreslå bättre formulering för stegen i den aktuella journeyn och ta bort för UI-specifikt språk där det behövs." },
    { id: "journey-coverage", label: "Analysera täckning", mode: "analyze", prompt: "Analysera journey-täckning mot aktuella Epics och Story Ideas." },
    { id: "journey-missing-story-ideas", label: "Föreslå saknade Story Ideas", mode: "analyze", prompt: "Föreslå saknade Story Ideas utifrån det aktuella journey-underlaget." }
  ],
  "story-ideas": [
    { id: "story-overlap", label: "Hitta överlapp mellan Story Ideas", mode: "analyze", prompt: "Hitta överlapp mellan de aktuella Story Ideas och peka ut sådant som riskerar att beskriva samma värde eller beteende." },
    { id: "story-from-journey", label: "Föreslå Story Ideas från journeys", mode: "analyze", prompt: "Föreslå Story Ideas utifrån det aktuella Journey Context-underlaget och de luckor som finns i dag." },
    { id: "story-split-merge", label: "Föreslå split/merge och omskrivningar", mode: "refine", prompt: "Föreslå vilka Story Ideas som bör delas, slås ihop eller skrivas om för att bli tydligare och mer riktade." }
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
