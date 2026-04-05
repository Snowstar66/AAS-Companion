export type WorkspaceHelpKey =
  | "framing.handshake"
  | "framing.problem"
  | "framing.outcome"
  | "framing.baseline_definition"
  | "framing.baseline_source"
  | "framing.solution_context"
  | "framing.solution_constraints"
  | "framing.non_functional_requirements"
  | "framing.data_sensitivity"
  | "framing.delivery_type"
  | "framing.value_owner"
  | "framing.timeframe"
  | "framing.ai_level"
  | "framing.design_direction"
  | "outcome.authoring"
  | "import.workspace"
  | "review.workspace";

export type AiLevelKey = "level_1" | "level_2" | "level_3";

export type HelpPattern = {
  title: string;
  summary: string;
  purpose: string;
  belongs: string;
  avoid: string;
  nextStep?: string | undefined;
  aiLevelNotes?: Partial<Record<AiLevelKey, string>> | undefined;
};

const aiLevelNotes: Record<AiLevelKey, string> = {
  level_1: "Level 1 fits assisted delivery where AI supports a human interactively and humans make all decisions.",
  level_2: "Level 2 fits structured acceleration where AI produces one artifact step at a time with human review between steps.",
  level_3: "Level 3 fits orchestrated agentic delivery where multi-step flows are chained and must stay fully traceable."
};

const aiLevelNotesSv: Record<AiLevelKey, string> = {
  level_1: "Level 1 passar assisterad leverans dar AI stottar en manniska interaktivt och manniskor fattar alla beslut.",
  level_2: "Level 2 passar strukturerad acceleration dar AI producerar ett artefaktsteg i taget med mansklig review mellan stegen.",
  level_3: "Level 3 passar orkestrerad agentisk leverans dar flertrinsfloden kedjas ihop och maste vara helt spårbara."
};

const helpPatterns: Record<WorkspaceHelpKey, HelpPattern> = {
  "framing.handshake": {
    title: "Customer handshake",
    summary:
      "Use Framing to agree the business problem, target effect, baseline, owner, design direction and intended AI level before deeper design starts.",
    purpose: "Create a shared customer-delivery handshake for the current project and current business case.",
    belongs:
      "Problem statement, desired outcome, baseline, owner, rough functional direction and the intended AI acceleration level.",
    avoid: "Detailed user stories, detailed tests, implementation breakdown or approval mechanics.",
    nextStep: "When the handshake is stable, continue into Design / Value Spine to break the case down further.",
    aiLevelNotes
  },
  "framing.problem": {
    title: "Problem statement",
    summary: "Name the real current-state problem before you talk about the answer.",
    purpose: "Anchor the case in the customer's current reality.",
    belongs: "Current pain, friction, delay, cost, risk, missed value, or evidence that the present situation is not good enough.",
    avoid: "Desired future state, feature lists, architecture, or wording that already assumes the solution."
  },
  "framing.outcome": {
    title: "Desired outcome",
    summary: "Describe the effect you want to become true if this case succeeds.",
    purpose: "Make the intended business effect explicit.",
    belongs: "Target effect, improved state, measurable change, operational shift, or business result worth paying for.",
    avoid: "Features, component names, implementation tasks, or architecture choices."
  },
  "framing.baseline_definition": {
    title: "Baseline definition",
    summary: "State the starting point that later improvement should be compared against.",
    purpose: "Create the reference point for improvement.",
    belongs: "Current throughput, quality, cost, lead time, error rate, incident load, MTTR, or other starting-state measure.",
    avoid: "The target state, vague optimism, or a baseline with no operational meaning."
  },
  "framing.baseline_source": {
    title: "Baseline source",
    summary: "Show where the baseline evidence comes from so people can trust it.",
    purpose: "Keep the baseline trustworthy and reviewable.",
    belongs: "Named dashboard, report, stakeholder source, service data, workshop note, or observed operational evidence.",
    avoid: "Unsupported guesses, hidden assumptions, or 'everyone knows this' statements."
  },
  "framing.solution_context": {
    title: "Solution context",
    summary: "Capture the surrounding context that Design must inherit before solution detail begins.",
    purpose: "Make the framing conditions explicit without locking the solution design too early.",
    belongs:
      "Business context, usage context, existing landscape, high-level integration expectations, operational realities, rollout dependencies and compliance context.",
    avoid: "Architecture structure, technology selection, API contracts, data models, or implementation detail."
  },
  "framing.solution_constraints": {
    title: "Constraints",
    summary: "List the non-negotiables Design must respect.",
    purpose: "Hold onto the important boundaries while keeping design options open.",
    belongs: "Operational constraints, business conditions, compliance limits, must-keep integrations, sequencing limits, continuity demands and review obligations.",
    avoid: "Prescriptive build steps, framework choices, implementation patterns, or pseudo-architecture."
  },
  "framing.non_functional_requirements": {
    title: "Non-functional requirements",
    summary: "Capture the quality attributes that must stay true when the solution is designed and delivered.",
    purpose: "Make cross-cutting quality demands explicit before Design and delivery detail take over.",
    belongs:
      "Performance targets, availability expectations, security requirements, privacy expectations, compliance obligations, accessibility expectations, resilience needs and observability needs.",
    avoid: "Feature ideas, UI wishes, implementation recipes, or requirements that only restate the desired business outcome."
  },
  "framing.data_sensitivity": {
    title: "Data sensitivity",
    summary: "State what kind of data is involved and why it changes risk or control needs.",
    purpose: "Surface risk and governance needs early in framing.",
    belongs: "Personal data, commercial data, regulated data, internal data, support data, and why that matters.",
    avoid: "Schema design, storage mechanics, field-by-field implementation, or security architecture detail."
  },
  "framing.delivery_type": {
    title: "Delivery type",
    summary: "Choose the project posture that should shape Framing expectations from the start.",
    purpose: "Make the expected delivery mode explicit without slipping into solution design.",
    belongs: "Whether this is primarily Application Development, Application Transformation or Application Management, and therefore what kind of baseline and evidence matter most.",
    avoid: "Sprint planning, staffing detail, execution choreography, or a tool decision."
  },
  "framing.value_owner": {
    title: "Value owner",
    summary: "Pick the real human who can stand behind value, baseline and approval.",
    purpose: "Place business accountability on a real person.",
    belongs: "Customer-side person who can validate value, baseline, priority and whether the case is worth doing now.",
    avoid: "Steering groups, team names, aliases, or placeholders with no accountable human."
  },
  "framing.timeframe": {
    title: "Timeframe",
    summary: "Capture why the timing matters at business level.",
    purpose: "Set a realistic business window for the change.",
    belongs: "Pilot window, season, quarter, contract horizon, launch window, compliance deadline or decision point.",
    avoid: "Sprint-by-sprint sequencing, backlog planning, or task-level dates."
  },
  "framing.ai_level": {
    title: "AI acceleration level",
    summary: "Determine the execution pattern first, let that map to the AI Acceleration Level, then describe the expected AI use across later phases.",
    purpose: "Classify AI use according to the AAS operating model before Tollgate 1.",
    belongs: "Execution pattern, derived AI level, expected BMAD lifecycle support, explicit risk and retained human decision authority.",
    avoid: "Tool-name classification, competing AI role taxonomies or treating risk as the thing that directly decides AI level.",
    aiLevelNotes
  },
  "framing.design_direction": {
    title: "High-level functional direction",
    summary: "Capture the rough functional direction as Epic seeds before detailed Story authoring begins.",
    purpose: "Bridge the handshake into Design without forcing full decomposition too early.",
    belongs: "A few Epic seeds, value areas or scope boundaries that describe where the solution likely goes.",
    avoid: "Full story decomposition, detailed acceptance criteria or implementation plans."
  },
  "outcome.authoring": {
    title: "Outcome authoring help",
    summary: "This Outcome page is still part of Framing. Keep it centered on handshake-level business clarity and baseline readiness.",
    purpose: "Help the team author the current Outcome without slipping into delivery detail too early.",
    belongs:
      "Business effect, current baseline, accountable owner, intended AI level and early design direction via Epics.",
    avoid: "Detailed Story/Test authoring or hidden governance assumptions.",
    nextStep: "Use Epic creation to seed direction. Use Value Spine once the handshake is stable."
  },
  "import.workspace": {
    title: "Import help",
    summary: "Import is for source interpretation and correction before anything is promoted into project records.",
    purpose: "Keep imported material traceable while humans correct uncertain or incomplete interpretation.",
    belongs: "Source context, interpretation quality, uncertainty, lineage and correction decisions.",
    avoid: "Treating imported text as approved project truth without review."
  },
  "review.workspace": {
    title: "Human review help",
    summary: "Human Review is where uncertain, missing and human-only decisions are resolved before promotion and approval readiness.",
    purpose: "Make explicit what a human must confirm, correct or reject.",
    belongs: "Corrections, confirmations, human-only decisions, follow-up calls and promotion decisions.",
    avoid: "Silent promotion of unresolved candidate content."
  }
};

const helpPatternsSv: Partial<Record<WorkspaceHelpKey, HelpPattern>> = {
  "framing.handshake": {
    title: "Kundhandshake",
    summary: "Anvand Framing for att enas om affarsproblem, mal-effekt, baseline, agare, designriktning och avsedd AI-niva innan djupare design startar.",
    purpose: "Skapa en gemensam handshake mellan kund och leverans for aktuellt projekt och aktuellt business case.",
    belongs: "Problemformulering, onskat outcome, baseline, agare, grov funktionell riktning och avsedd AI-accelerationsniva.",
    avoid: "Detaljerade user stories, detaljerade tester, implementationsnedbrytning eller approval-mekanik.",
    nextStep: "Nar handshaken ar stabil, fortsatt till Design / Value Spine for att bryta ned caset vidare.",
    aiLevelNotes: aiLevelNotesSv
  },
  "framing.problem": {
    title: "Problemformulering",
    summary: "Namnge det verkliga nulagesproblemet innan du pratar om svaret.",
    purpose: "Forankra caset i kundens nuvarande verklighet.",
    belongs: "Nuvarande smarta, friktion, forsening, kostnad, risk, missat varde eller bevis for att dagens lage inte ar tillrackligt bra.",
    avoid: "Onskat framtida lage, featurelistor, arkitektur eller formuleringar som redan forutsatter losningen."
  },
  "framing.outcome": {
    title: "Onskat outcome",
    summary: "Beskriv effekten som ska bli sann om caset lyckas.",
    purpose: "Gor den avsedda affarseffekten explicit.",
    belongs: "Maleffekt, forbattrat lage, matbar forandring, operativ forskjutning eller affarsresultat vart att betala for.",
    avoid: "Features, komponentnamn, implementationstasks eller arkitekturval."
  },
  "framing.baseline_definition": {
    title: "Baseline-definition",
    summary: "Beskriv startlaget som senare forbattring ska jamforas mot.",
    purpose: "Skapa referenspunkten for forbattring.",
    belongs: "Nuvarande throughput, kvalitet, kostnad, lead time, felgrad, incidentlast, MTTR eller annat matt pa startlaget.",
    avoid: "Mallaget, vag optimism eller en baseline utan operativ betydelse."
  },
  "framing.baseline_source": {
    title: "Baseline-kalla",
    summary: "Visa var baseline-beviset kommer fran sa att andra kan lita pa det.",
    purpose: "Halla baselinen tillforlitlig och granskningsbar.",
    belongs: "Namngiven dashboard, rapport, intressentkalla, servicedata, workshopanteckning eller observerat operativt underlag.",
    avoid: "Obekraftade gissningar, dolda antaganden eller 'alla vet att det ar sa'."
  },
  "framing.solution_context": {
    title: "Losningskontext",
    summary: "Fa med den omgivande kontext som Design maste arva innan losningsdetaljer borjar.",
    purpose: "Gor framingens forutsattningar tydliga utan att lasa designen for tidigt.",
    belongs: "Affarskontext, anvandningskontext, befintligt landskap, overgripande integrationsforvantningar, operativa realiteter, utrullningsberoenden och compliance-kontext.",
    avoid: "Arkitekturstruktur, teknikval, API-kontrakt, datamodeller eller implementationsdetalj."
  },
  "framing.solution_constraints": {
    title: "Constraints",
    summary: "Lista det icke-forhandlingsbara som Design maste respektera.",
    purpose: "Behall viktiga granser samtidigt som designalternativen halls oppna.",
    belongs: "Operativa constraints, affarsvillkor, compliance-granser, integrationer som maste behallas, sekvenseringsgranser, kontinuitetskrav och review-skyldigheter.",
    avoid: "Preskriptiva byggsteg, ramverksval, implementationsmonster eller pseudoarkitektur."
  },
  "framing.non_functional_requirements": {
    title: "Non-functional requirements",
    summary: "Fanga kvalitetsattributen som maste vara sanna nar losningen designas och levereras.",
    purpose: "Gor tvargaende kvalitetskrav tydliga innan Design och leveransdetaljer tar over.",
    belongs: "Prestandamal, tillganglighetsforvantningar, sakerhetskrav, privacy-forvantningar, compliance-krav, tillganglighetskrav, resiliensbehov och observability-behov.",
    avoid: "Feature-ideer, UI-onskemal, implementationsrecept eller krav som bara upprepar det onskade affarsoutcomet."
  },
  "framing.data_sensitivity": {
    title: "Datakanslighet",
    summary: "Beskriv vilken typ av data som ar inblandad och varfor det andrar risk- eller kontrollbehov.",
    purpose: "Synliggor risk- och governancebehov tidigt i Framing.",
    belongs: "Persondata, kommersiell data, reglerad data, intern data, supportdata och varfor det spelar roll.",
    avoid: "Schemadesign, lagringsmekanik, falt-for-falt-implementation eller detaljerad sakerhetsarkitektur."
  },
  "framing.delivery_type": {
    title: "Leveranstyp",
    summary: "Valj den projektlogik som ska styra forvantningarna i Framing redan fran start.",
    purpose: "Gor den forvantade leveransformen tydlig utan att glida in i losningsdesign.",
    belongs: "Om detta framst ar Application Development, Application Transformation eller Application Management, och darfor vilken baseline och vilket bevis som betyder mest.",
    avoid: "Sprintplanering, staffingdetaljer, exekveringskoreografi eller verktygsbeslut."
  },
  "framing.value_owner": {
    title: "Value owner",
    summary: "Valj den verkliga manniska som kan sta bakom varde, baseline och godkannande.",
    purpose: "Placera affarsansvaret pa en verklig person.",
    belongs: "Person pa kundsidan som kan validera varde, baseline, prioritet och om caset ar vart att gora nu.",
    avoid: "Styrgrupper, teamnamn, alias eller platshallare utan ansvarig manniska."
  },
  "framing.timeframe": {
    title: "Tidsram",
    summary: "Fanga varfor tajmingen spelar roll pa affarsniva.",
    purpose: "Satt ett realistiskt affarsfonster for forandringen.",
    belongs: "Pilotfonster, sasong, kvartal, kontraktshorisont, lanseringsfonster, compliance-deadline eller beslutspunkt.",
    avoid: "Sprint-for-sprint-sekvensering, backlogplanering eller datum pa taskniva."
  },
  "framing.ai_level": {
    title: "AI-accelerationsniva",
    summary: "Bestam exekveringsmonster forst, lat det mappas till AI-accelerationsniva och beskriv sedan forvantad AI-anvandning i senare faser.",
    purpose: "Klassificera AI-anvandning enligt AAS-operativ modell innan Tollgate 1.",
    belongs: "Exekveringsmonster, harledd AI-niva, forvantat BMAD-stod genom livscykeln, explicit risk och kvarhållen mansklig beslutsratt.",
    avoid: "Verktygsnamnsbaserad klassificering, konkurrerande AI-taxonomier eller att behandla risk som det som direkt bestammer AI-nivan.",
    aiLevelNotes: aiLevelNotesSv
  },
  "framing.design_direction": {
    title: "Overgripande funktionell riktning",
    summary: "Fanga den grova funktionella riktningen som Epic-fron innan detaljerad story-authoring borjar.",
    purpose: "Bygg bro mellan handshaken och Design utan att tvinga fram full nedbrytning for tidigt.",
    belongs: "Nagra Epic-fron, vardeytor eller scope-granser som beskriver vart losningen sannolikt gar.",
    avoid: "Full story-nedbrytning, detaljerade acceptanskriterier eller implementationsplaner."
  }
};

export function getHelpPattern(key: WorkspaceHelpKey, aiLevel?: string | null, language: "en" | "sv" = "en") {
  const pattern = language === "sv" ? helpPatternsSv[key] ?? helpPatterns[key] : helpPatterns[key];
  const normalizedLevel = aiLevel === "level_1" || aiLevel === "level_2" || aiLevel === "level_3" ? aiLevel : null;

  return {
    ...pattern,
    aiLevelNote: normalizedLevel ? pattern.aiLevelNotes?.[normalizedLevel] ?? null : null
  };
}

export function getInlineGuidance(key: Extract<WorkspaceHelpKey, `framing.${string}`>, language: "en" | "sv" = "en") {
  const pattern = language === "sv" ? helpPatternsSv[key] ?? helpPatterns[key] : helpPatterns[key];

  if (language === "sv") {
    return `Anvand faltet for: ${pattern.belongs} Undvik: ${pattern.avoid}`;
  }

  return `Use this field for: ${pattern.belongs} Avoid: ${pattern.avoid}`;
}

export function formatAiLevelLabel(value: string | null | undefined) {
  if (!value) {
    return "AI level";
  }

  return value.replaceAll("_", " ").replace("level", "Level");
}

export function getAiLevelSummary(value: string | null | undefined) {
  if (value === "level_1" || value === "level_2" || value === "level_3") {
    return aiLevelNotes[value];
  }

  return null;
}
