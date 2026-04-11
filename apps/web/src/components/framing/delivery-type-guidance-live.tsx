"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import type { AppLanguage } from "@/components/layout/app-language.data";
import { useAppChromeLanguage } from "@/components/layout/app-language";

type DeliveryTypeValue = "AD" | "AT" | "AM";

type DeliveryTypeProfile = {
  label: string;
  primaryQuestion: string;
  changeType: string;
  baselinePosition: string;
  baselineExamples: string;
  outcomeType: string;
  outcomeExample: string;
  evidenceNeed: string;
  problemDefinition: string;
  epicCharacter: string;
  epicExamples: string;
  riskType: string;
  riskLevel: string;
  scopeStability: string;
  aiLevel: string;
  aiRole: string;
  governanceNeeds: string;
  commonFailure: string;
  aasProtection: string;
  framingWeight: string;
  poorFramingImpact: string;
};

type DeliveryTypeGuidance = {
  businessCaseDescription: string;
  timeframeDescription: string;
  valueOwnerDescription: string;
  problemDescription: string;
  outcomeDescription: string;
  solutionContextDescription: string;
  solutionContextFieldDescription: string;
  constraintsDescription: string;
  uxDescription: string;
  nfrDescription: string;
  additionalRequirementsDescription: string;
  dataSensitivityDescription: string;
  baselineCardDescription: string;
  baselineSourceDescription: string;
  aiRiskDescription: string;
  structureDescription: string;
  quickEpicDescription: string;
  quickStoryIdeaDescription: string;
};

type DeliveryTypeGuidanceSlot = keyof DeliveryTypeGuidance;

const deliveryTypeProfiles: Record<DeliveryTypeValue, DeliveryTypeProfile> = {
  AD: {
    label: "Application Development",
    primaryQuestion: "What should we build to create new value?",
    changeType: "New capability or new functionality.",
    baselinePosition: "Baseline can be lighter and may start from a weaker current-state picture.",
    baselineExamples: "Current manual work, spreadsheet process, workaround, or no usable digital flow.",
    outcomeType: "Business value or user value.",
    outcomeExample: '"Increase conversion by 15%."',
    evidenceNeed: "A strong hypothesis and reasonable value logic may be enough at Framing.",
    problemDefinition: "Problem framing can start hypothesis-driven, but it must still be explicit about value.",
    epicCharacter: "Functional capabilities.",
    epicExamples: "Onboarding, self-service, reporting, mobile flow, API enablement.",
    riskType: "Building the wrong thing or ending up with low adoption.",
    riskLevel: "Usually medium.",
    scopeStability: "Can be more exploratory early on.",
    aiLevel: "Usually AI Level 1-2, sometimes 3.",
    aiRole: "Support ideation, structuring, and refinement.",
    governanceNeeds: "Outcome and Value Owner must be clear before the case leaves Framing.",
    commonFailure: "Building features without a real outcome.",
    aasProtection: "AAS protects against output without value.",
    framingWeight: "Medium.",
    poorFramingImpact: "You risk shipping the wrong product."
  },
  AT: {
    label: "Application Transformation",
    primaryQuestion: "What in the current system is blocking value?",
    changeType: "Structural change in an existing landscape.",
    baselinePosition: "Baseline should be mandatory and data-driven.",
    baselineExamples: "Lead time, tech debt, incident load, change failure rate, cost, dependency friction.",
    outcomeType: "Structural effect on speed, cost, risk, or resilience.",
    outcomeExample: '"Cut lead time in half."',
    evidenceNeed: "Measured problem verification is expected.",
    problemDefinition: "Problem framing should be factual and quantified.",
    epicCharacter: "Structural transformation moves.",
    epicExamples: "Modularization, CI/CD uplift, dependency cleanup, platform migration.",
    riskType: "Operational regression, migration risk, and system impact.",
    riskLevel: "Usually the highest.",
    scopeStability: "Needs early stabilization.",
    aiLevel: "Usually AI Level 1-2. Level 3 only with strong control.",
    aiRole: "Analyze code, dependencies, architecture debt, and migration patterns.",
    governanceNeeds: "Outcome, baseline, risk posture, and AI level need tighter discipline.",
    commonFailure: "Modernizing without a measurable effect target.",
    aasProtection: "AAS protects against technology-driven transformation without outcome logic.",
    framingWeight: "Highest.",
    poorFramingImpact: "You risk an expensive failed transformation."
  },
  AM: {
    label: "Application Management",
    primaryQuestion: "How do we improve the existing service delivery?",
    changeType: "Continuous improvement in an active service.",
    baselinePosition: "Baseline should be operational and object-specific.",
    baselineExamples: "SLA, incident data, MTTR, case cost, support load, repeat failure patterns.",
    outcomeType: "Stability, efficiency, service quality, or cost effect.",
    outcomeExample: '"Reduce MTTR from 6h to 2h."',
    evidenceNeed: "Operational data and recurring patterns should support the case.",
    problemDefinition: "Problem framing should be data-driven and repeatable.",
    epicCharacter: "Improvement and automation themes.",
    epicExamples: "Monitoring, triage automation, support flow, incident prevention, knowledge capture.",
    riskType: "Optimizing the wrong thing or automating weak operational logic.",
    riskLevel: "Usually low to medium.",
    scopeStability: "Continuous and iterative.",
    aiLevel: "Usually AI Level 1-3 with strong improvement potential.",
    aiRole: "Find patterns, summarize incidents, and support service improvement analysis.",
    governanceNeeds: "Outcome and operational baseline should stay visible, even for smaller improvements.",
    commonFailure: "Running support without an improvement target.",
    aasProtection: "AAS protects against reactive service work without development intent.",
    framingWeight: "Medium.",
    poorFramingImpact: "You risk an inefficient service model."
  }
};

function tr(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function getDefaultGuidance(language: AppLanguage): DeliveryTypeGuidance {
  return {
    businessCaseDescription: tr(language, "Frame the case at decision level: why it matters, what should improve, and what kind of change this is.", "Rama in caset på beslutsnivå: varför det spelar roll, vad som ska bli bättre och vilken typ av förändring detta är."),
    timeframeDescription: tr(language, "Use this field to explain why the timing matters now. Keep it at business window level, not sprint planning.", "Använd fältet för att förklara varför tidpunkten spelar roll nu. Håll det på affärsfönsternivå, inte sprintplanering."),
    valueOwnerDescription: tr(language, "The value owner should be able to say yes, this outcome matters, this baseline is credible, and this case is worth approving.", "Value owner ska kunna säga ja, detta outcome spelar roll, denna baseline är trovärdig och caset är värt att godkänna."),
    problemDescription: tr(language, "Describe the current pain, not the target state. If the problem disappeared tomorrow, what would be better?", "Beskriv nuvarande problem, inte målbilden. Om problemet försvann i morgon, vad skulle bli bättre?"),
    outcomeDescription: tr(language, "Write one effect worth achieving. A strong outcome tells you what should be measurably different after the work lands.", "Skriv en effekt som är värd att uppnå. Ett starkt outcome visar vad som ska vara mätbart annorlunda efter att arbetet landat."),
    solutionContextDescription: tr(language, "Pass forward only the context Design needs in order to make good choices later.", "För vidare bara den kontext som Design behöver för att kunna fatta bra beslut senare."),
    solutionContextFieldDescription: tr(language, "Start from usage, landscape and dependencies. Do not start designing the solution here.", "Börja med användning, landskap och beroenden. Börja inte designa lösningen här."),
    constraintsDescription: tr(language, "Write only the non-negotiables. If Design ignored this, what would break, violate policy, or create delivery risk?", "Skriv bara det som inte är förhandlingsbart. Om Design ignorerade detta, vad skulle gå sönder, bryta mot policy eller skapa leveransrisk?"),
    uxDescription: tr(language, "Use UX guidance to preserve intent and continuity, not to lock screens or flows too early.", "Använd UX-guidance för att bevara intention och kontinuitet, inte för att låsa skärmar eller flöden för tidigt."),
    nfrDescription: tr(language, "Capture quality demands that should shape design and risk posture across the whole case.", "Fånga kvalitetskrav som ska forma design och risknivå genom hela caset."),
    additionalRequirementsDescription: tr(language, "Use this for important carry-forward material that matters, but should not pretend to be an Outcome, Epic or Story Idea.", "Använd detta för viktigt material att föra vidare som spelar roll, men som inte ska låta som ett Outcome, Epic eller Story Idea."),
    dataSensitivityDescription: tr(language, "Call out the data that changes governance expectations. If sensitivity goes up, control usually must go up too.", "Markera den data som ändrar governance-förväntningar. Om känsligheten stiger bör kontrollnivån vanligtvis också göra det."),
    baselineCardDescription: tr(language, "These fields help ground the Framing before approval is recorded.", "Dessa fält hjälper till att förankra Framing innan godkännande registreras."),
    baselineSourceDescription: tr(language, "Make the starting point defendable. The stronger the case, the easier later approvals and follow-up become.", "Gör startpunkten försvarbar. Ju starkare case, desto enklare blir senare godkännanden och uppföljning."),
    aiRiskDescription: tr(
      language,
      "In AAS, AI is a formally chosen acceleration level, not an ad hoc tool choice. Use this area to state how AI will be used, classify the risk posture, and make the control model explicit before Tollgate 1. Human mandate for review, approval, and risk acceptance always remains with people.",
      "I AAS \u00e4r AI en formellt vald accelerationsniv\u00e5, inte ett ad hoc-verktygsval. Anv\u00e4nd denna yta f\u00f6r att beskriva hur AI ska anv\u00e4ndas, klassificera riskbilden och g\u00f6ra kontrollmodellen explicit f\u00f6re Tollgate 1. M\u00e4nskligt mandat f\u00f6r granskning, godk\u00e4nnande och riskacceptans ligger alltid kvar hos m\u00e4nniskor."
    ),
    structureDescription: tr(language, "Use Epics and Story Ideas to shape direction and scope, not to create a delivery backlog too early.", "Använd Epics och Story Ideas för att forma riktning och scope, inte för att skapa en leveransbacklog för tidigt."),
    quickEpicDescription: tr(language, "An Epic should name a meaningful scope boundary, not a to-do bucket.", "En Epic ska namnge en meningsfull scope-gräns, inte en att-göra-hink."),
    quickStoryIdeaDescription: tr(language, "A Story Idea should express intent and expected effect. Save delivery detail for later.", "En Story Idea ska uttrycka intent och förväntad effekt. Spara leveransdetaljer till senare.")
  };
}

function getDeliveryTypeProfile(value: DeliveryTypeValue | null | undefined, language: AppLanguage = "en") {
  if (!value) {
    return null;
  }

  if (language === "en") {
    return deliveryTypeProfiles[value];
  }

  switch (value) {
    case "AD":
      return {
        label: "Applikationsutveckling",
        primaryQuestion: "Vad ska vi bygga för att skapa nytt värde?",
        changeType: "Ny kapacitet eller ny funktionalitet.",
        baselinePosition: "Baseline kan vara lättare och får börja från en svagare nulägesbild.",
        baselineExamples: "Nuvarande manuellt arbete, kalkylblad, workaround eller avsaknad av användbart digitalt flöde.",
        outcomeType: "Affärsvärde eller användarvärde.",
        outcomeExample: '"Öka konverteringen med 15%."',
        evidenceNeed: "En stark hypotes och rimlig värdelogik kan räcka i Framing.",
        problemDefinition: "Problemformuleringen kan börja hypotesdrivet, men måste fortfarande vara tydlig om värdet.",
        epicCharacter: "Funktionella capabilities.",
        epicExamples: "Onboarding, self-service, rapportering, mobilt flöde, API-stöd.",
        riskType: "Att bygga fel sak eller få låg adoption.",
        riskLevel: "Vanligen medel.",
        scopeStability: "Kan vara mer explorativ tidigt.",
        aiLevel: "Vanligen AI Level 1-2, ibland 3.",
        aiRole: "Stöd för idéarbete, strukturering och förfining.",
        governanceNeeds: "Outcome och Value Owner måste vara tydliga innan caset lämnar Framing.",
        commonFailure: "Att bygga features utan ett verkligt outcome.",
        aasProtection: "AAS skyddar mot output utan värde.",
        framingWeight: "Medel.",
        poorFramingImpact: "Du riskerar att leverera fel produkt."
      };
    case "AT":
      return {
        label: "Applikationstransformation",
        primaryQuestion: "Vad i nuvarande system blockerar värde?",
        changeType: "Strukturell förändring i ett befintligt landskap.",
        baselinePosition: "Baseline bör vara obligatorisk och datadriven.",
        baselineExamples: "Lead time, tech debt, incidentlast, change failure rate, kostnad och beroendefriktion.",
        outcomeType: "Strukturell effekt på hastighet, kostnad, risk eller resiliens.",
        outcomeExample: '"Halvera lead time."',
        evidenceNeed: "Mätbar problemverifiering förväntas.",
        problemDefinition: "Problemformuleringen bör vara faktabaserad och kvantifierad.",
        epicCharacter: "Strukturella transformationsgrepp.",
        epicExamples: "Modularisering, CI/CD-lyft, dependency cleanup, plattformsmigrering.",
        riskType: "Driftregression, migreringsrisk och systempåverkan.",
        riskLevel: "Vanligen högst.",
        scopeStability: "Behöver stabiliseras tidigt.",
        aiLevel: "Vanligen AI Level 1-2. Level 3 bara med stark kontroll.",
        aiRole: "Analysera kod, beroenden, arkitekturskuld och migrationsmönster.",
        governanceNeeds: "Outcome, baseline, riskhållning och AI-nivå kräver stramare disciplin.",
        commonFailure: "Att modernisera utan ett mätbart effektmål.",
        aasProtection: "AAS skyddar mot teknikdriven transformation utan outcome-logik.",
        framingWeight: "Högst.",
        poorFramingImpact: "Du riskerar en dyr misslyckad transformation."
      };
    case "AM":
      return {
        label: "Applikationsförvaltning",
        primaryQuestion: "Hur förbättrar vi den befintliga tjänsteleveransen?",
        changeType: "Kontinuerlig förbättring i en aktiv tjänst.",
        baselinePosition: "Baseline bör vara operativ och objektspecifik.",
        baselineExamples: "SLA, incidentdata, MTTR, ärendekostnad, supportbelastning och återkommande felmönster.",
        outcomeType: "Stabilitet, effektivitet, tjänstekvalitet eller kostnadseffekt.",
        outcomeExample: '"Minska MTTR från 6h till 2h."',
        evidenceNeed: "Operativ data och återkommande mönster bör stödja caset.",
        problemDefinition: "Problemformuleringen bör vara datadriven och återkommande.",
        epicCharacter: "Förbättrings- och automationsteman.",
        epicExamples: "Monitoring, triage-automation, supportflöde, incidentprevention, kunskapsfångst.",
        riskType: "Att optimera fel sak eller automatisera svag operativ logik.",
        riskLevel: "Vanligen låg till medel.",
        scopeStability: "Kontinuerlig och iterativ.",
        aiLevel: "Vanligen AI Level 1-3 med hög förbättringspotential.",
        aiRole: "Hitta mönster, sammanfatta incidenter och stödja serviceförbättring.",
        governanceNeeds: "Outcome och operativ baseline bör hållas synliga även för mindre förbättringar.",
        commonFailure: "Att driva support utan förbättringsmål.",
        aasProtection: "AAS skyddar mot reaktiv service utan utvecklingsintention.",
        framingWeight: "Medel.",
        poorFramingImpact: "Du riskerar en ineffektiv tjänstemodell."
      };
  }
}

function getDeliveryTypeHelper(value: DeliveryTypeValue | null | undefined, language: AppLanguage) {
  const profile = getDeliveryTypeProfile(value, language);

  if (!profile) {
    return tr(
      language,
      "Choose the delivery posture that best describes this case so Framing can guide the business case, baseline, risks, and hierarchy the right way from the start.",
      "Välj den leveranshållning som bäst beskriver caset så att Framing kan styra business case, baseline, risker och hierarki på rätt sätt redan från start."
    );
  }

  return tr(
    language,
    `${profile.label}: ${profile.primaryQuestion} In this mode, Framing should emphasize ${profile.governanceNeeds.toLowerCase()}`,
    `${profile.label}: ${profile.primaryQuestion} I detta läge bör Framing särskilt betona ${profile.governanceNeeds.toLowerCase()}.`
  );
}

function getDeliveryTypeContextualGuidance(value: DeliveryTypeValue | null | undefined, language: AppLanguage): DeliveryTypeGuidance {
  const profile = getDeliveryTypeProfile(value, language);

  if (!profile) {
    return getDefaultGuidance(language);
  }

  return {
    businessCaseDescription: `${profile.primaryQuestion} ${profile.changeType} ${profile.outcomeType}`,
    timeframeDescription:
      value === "AM"
        ? tr(language, "Explain the service or improvement window this belongs to, for example an operational period, support cycle, or cost-reduction horizon.", "Förklara vilket tjänste- eller förbättringsfönster detta hör till, till exempel en operativ period, supportcykel eller kostnadssänkningshorisont.")
        : value === "AT"
          ? tr(language, "Explain the transformation window this must fit into, such as migration phase, dependency cutover, or stabilization horizon.", "Förklara vilket transformationsfönster detta måste passa in i, till exempel migreringsfas, beroendeskifte eller stabiliseringshorisont.")
          : tr(language, "Explain the value window for the new capability, such as pilot, launch horizon, funding window, or adoption milestone.", "Förklara värdefönstret för den nya förmågan, till exempel pilot, lanseringshorisont, finansieringsfönster eller adoptionsmilstolpe."),
    valueOwnerDescription: tr(
      language,
      `${profile.governanceNeeds} This person should be able to defend the case if challenged by both business and delivery.`,
      `${profile.governanceNeeds} Den personen ska kunna försvara caset om både verksamhet och leverans utmanar det.`
    ),
    problemDescription: `${profile.problemDefinition} ${profile.commonFailure}`,
    outcomeDescription: tr(
      language,
      `${profile.outcomeType} A good statement makes the effect visible without naming the build. Example: ${profile.outcomeExample}`,
      `${profile.outcomeType} En bra formulering gör effekten synlig utan att namnge bygget. Exempel: ${profile.outcomeExample}`
    ),
    solutionContextDescription: tr(
      language,
      `Let the surrounding context reflect ${profile.label.toLowerCase()} work. ${profile.aasProtection}`,
      `Låt omgivande kontext spegla ${profile.label.toLowerCase()}-arbete. ${profile.aasProtection}`
    ),
    solutionContextFieldDescription: tr(
      language,
      `${profile.changeType} Useful context examples: ${profile.epicExamples}`,
      `${profile.changeType} Nyttiga kontextexempel: ${profile.epicExamples}`
    ),
    constraintsDescription: tr(
      language,
      `${profile.riskType} If a boundary changes governance, continuity, or approval confidence, capture it here.`,
      `${profile.riskType} Om en gräns påverkar governance, kontinuitet eller godkännandetrygghet ska den fångas här.`
    ),
    uxDescription:
      value === "AD"
        ? tr(language, "Use UX principles to steer the new experience toward adoption and clarity without prescribing screens.", "Använd UX-principer för att styra den nya upplevelsen mot adoption och tydlighet utan att låsa skärmar.")
        : value === "AT"
          ? tr(language, "Use UX principles to protect continuity when users move between current and transformed experiences.", "Använd UX-principer för att skydda kontinuitet när användare rör sig mellan nuvarande och transformerade upplevelser.")
          : tr(language, "Use UX principles to protect continuity, clarity, and low-friction service behavior in daily operations.", "Använd UX-principer för att skydda kontinuitet, tydlighet och lågfriktionsbeteende i den dagliga driften."),
    nfrDescription:
      value === "AT"
        ? tr(language, "Use this field for cross-cutting quality requirements that protect the transformation: performance, resilience, security, compliance, observability, migration safety and continuity expectations. Strong evidence is expected.", "Använd fältet för tvärgående kvalitetskrav som skyddar transformationen: prestanda, resiliens, säkerhet, compliance, observerbarhet, migreringssäkerhet och kontinuitetskrav. Stark evidens förväntas.")
        : value === "AM"
          ? tr(language, "Use this field for service quality expectations that must stay true in operations: availability, supportability, monitoring, recoverability, security, privacy and cost-efficiency guardrails.", "Använd fältet för tjänstekvalitetskrav som måste hålla i drift: tillgänglighet, supportbarhet, övervakning, återställbarhet, säkerhet, integritet och kostnadseffektiva guardrails.")
          : tr(language, "Use this field for the quality requirements the new capability must meet from the start, such as performance, accessibility, security, privacy, reliability and compliance expectations.", "Använd fältet för de kvalitetskrav den nya förmågan måste uppfylla från start, till exempel prestanda, tillgänglighet, säkerhet, integritet, tillförlitlighet och compliance."),
    additionalRequirementsDescription:
      value === "AT"
        ? tr(language, "Use this for migration dependencies, platform assumptions, or transformation conditions Design must inherit.", "Använd detta för migreringsberoenden, plattformsantaganden eller transformationsvillkor som Design måste bära vidare.")
        : value === "AM"
          ? tr(language, "Use this for operational assumptions, support boundaries, or service rules that must not disappear between Framing and Design.", "Använd detta för operativa antaganden, supportgränser eller serviceregler som inte får försvinna mellan Framing och Design.")
          : tr(language, "Use this for business rules, assumptions, or external dependencies that still matter in Design.", "Använd detta för affärsregler, antaganden eller externa beroenden som fortfarande spelar roll i Design."),
    dataSensitivityDescription:
      value === "AT"
        ? tr(language, "Call out data that increases migration, regression, or compliance risk across the current landscape.", "Peka ut data som ökar migreringsrisk, regressionsrisk eller compliancerisk i det nuvarande landskapet.")
        : value === "AM"
          ? tr(language, "Call out operational data, support data, and incident-related data that shape the service model.", "Peka ut operativ data, supportdata och incidentrelaterad data som formar tjänstemodellen.")
          : tr(language, "Call out the data involved in the new value flow and the sensitivity implications early.", "Peka ut den data som ingår i det nya värdeflödet och dess känslighetskonsekvenser tidigt."),
    baselineCardDescription: tr(
      language,
      `${profile.baselinePosition} In this project type, baseline quality strongly affects how convincing the Framing is.`,
      `${profile.baselinePosition} I den här projekttypen påverkar baselinekvaliteten starkt hur övertygande Framingen blir.`
    ),
    baselineSourceDescription: tr(
      language,
      `${profile.evidenceNeed} Typical evidence: ${profile.baselineExamples}`,
      `${profile.evidenceNeed} Typisk evidens: ${profile.baselineExamples}`
    ),
    aiRiskDescription: tr(
      language,
      `In AAS, AI is a formally chosen acceleration level, not an ad hoc tool choice. Use this section to state how AI will support ${profile.changeType.toLowerCase()} in this case, classify the risk posture, and make the control model explicit before Tollgate 1. Human mandate for review, approval, and risk acceptance always remains with people.`,
      `I AAS \u00e4r AI en formellt vald accelerationsniv\u00e5, inte ett ad hoc-verktygsval. Anv\u00e4nd sektionen f\u00f6r att beskriva hur AI ska st\u00f6dja ${profile.changeType.toLowerCase()} i just det h\u00e4r caset, klassificera riskbilden och g\u00f6ra kontrollmodellen explicit f\u00f6re Tollgate 1. M\u00e4nskligt mandat f\u00f6r granskning, godk\u00e4nnande och riskacceptans ligger alltid kvar hos m\u00e4nniskor.`
    ),
    structureDescription: tr(
      language,
      `${profile.epicCharacter} Use structure to express direction. Examples: ${profile.epicExamples}`,
      `${profile.epicCharacter} Använd strukturen för att uttrycka riktning. Exempel: ${profile.epicExamples}`
    ),
    quickEpicDescription: tr(
      language,
      `${profile.epicCharacter} Start by naming one scope boundary that moves the case toward the intended outcome.`,
      `${profile.epicCharacter} Börja med att namnge en scopegräns som flyttar caset mot det avsedda outcomet.`
    ),
    quickStoryIdeaDescription:
      value === "AT"
        ? tr(language, "Create a directional Story Idea that clarifies one transformation effect or one risk-reducing move under the chosen Epic.", "Skapa en riktad Story Idea som tydliggör en transformationseffekt eller ett riskreducerande drag under vald Epic.")
        : value === "AM"
          ? tr(language, "Create a directional Story Idea that improves service behavior, support flow, or operational automation under the chosen Epic.", "Skapa en riktad Story Idea som förbättrar tjänstebeteende, supportflöde eller operativ automation under vald Epic.")
          : tr(language, "Create a directional Story Idea that expresses one concrete user-value move under the chosen Epic.", "Skapa en riktad Story Idea som uttrycker ett konkret användarvärdessteg under vald Epic.")
  };
}

type DeliveryTypeGuidanceContextValue = {
  value: DeliveryTypeValue | null;
  guidance: DeliveryTypeGuidance;
  helperText: string;
  setValue: (value: DeliveryTypeValue | null) => void;
};

const DeliveryTypeGuidanceContext = createContext<DeliveryTypeGuidanceContextValue | null>(null);

function useDeliveryTypeGuidance() {
  const context = useContext(DeliveryTypeGuidanceContext);

  if (!context) {
    throw new Error("DeliveryTypeGuidance components must be used inside DeliveryTypeGuidanceProvider.");
  }

  return context;
}

export function DeliveryTypeGuidanceProvider(props: {
  children: ReactNode;
  initialValue: DeliveryTypeValue | null;
}) {
  const { language } = useAppChromeLanguage();
  const [value, setValue] = useState<DeliveryTypeValue | null>(props.initialValue);
  const contextValue = useMemo<DeliveryTypeGuidanceContextValue>(
    () => ({
      value,
      guidance: getDeliveryTypeContextualGuidance(value, language),
      helperText: getDeliveryTypeHelper(value, language),
      setValue
    }),
    [language, value]
  );

  return <DeliveryTypeGuidanceContext.Provider value={contextValue}>{props.children}</DeliveryTypeGuidanceContext.Provider>;
}

export function DeliveryTypeGuidanceText(props: { slot: DeliveryTypeGuidanceSlot }) {
  const { guidance } = useDeliveryTypeGuidance();
  return <>{guidance[props.slot]}</>;
}

export function DeliveryTypeHelperText() {
  const { helperText } = useDeliveryTypeGuidance();
  return <>{helperText}</>;
}

export function DeliveryTypeSelect(props: {
  defaultValue: string;
  disabled?: boolean | undefined;
  id?: string | undefined;
  name: string;
}) {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const { setValue } = useDeliveryTypeGuidance();

  return (
    <select
      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      id={props.id}
      name={props.name}
      onChange={(event) => {
        const nextValue = event.currentTarget.value;
        setValue(nextValue === "AD" || nextValue === "AT" || nextValue === "AM" ? nextValue : null);
      }}
    >
      <option value="">{t("Select delivery type", "Valj leveranstyp")}</option>
      <option value="AD">{t("Application Development (AD)", "Applikationsutveckling (AD)")}</option>
      <option value="AT">{t("Application Transformation (AT)", "Applikationstransformation (AT)")}</option>
      <option value="AM">{t("Application Management (AM)", "Applikationsförvaltning (AM)")}</option>
    </select>
  );
}

export function DeliveryTypeHelpCard() {
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);
  const { value } = useDeliveryTypeGuidance();
  const selectedProfile = getDeliveryTypeProfile(value, language);

  return (
    <details className="group rounded-2xl border border-border/70 bg-background/85 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/30">
        <span className="inline-flex rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground">
          <CircleHelp className="h-3.5 w-3.5" />
        </span>
        <span>{t("What project type means in Framing", "Vad projekttyp betyder i Framing")}</span>
        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-border/70 px-4 py-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {t(
            "The selected project type changes how Framing should approach baseline, outcomes, evidence, risk, and the shape of Epics.",
            "Den valda projekttypen andrar hur Framing bor hantera baseline, outcomes, bevis, risk och formen pa Epics."
          )}
          {selectedProfile ? ` ${t("Current selection", "Nuvarande val")}: ${selectedProfile.label}.` : ""}
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.entries(deliveryTypeProfiles) as Array<[DeliveryTypeValue, DeliveryTypeProfile]>).map(([key, profile]) => {
            const localizedProfile = getDeliveryTypeProfile(key, language) ?? profile;
            return (
            <div
              className={`rounded-2xl border p-4 ${
                key === value ? "border-sky-300 bg-sky-50/80 text-sky-950 shadow-sm" : "border-border/70 bg-muted/15 text-foreground"
              }`}
              key={key}
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{key}</p>
                  <h4 className="font-semibold">{localizedProfile.label}</h4>
                  <p className="text-sm leading-6">{localizedProfile.primaryQuestion}</p>
                </div>
                <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">{t("Baseline:", "Baseline:")}</strong> {localizedProfile.baselinePosition}
                  </p>
                  <p>
                    <strong className="text-foreground">{t("Outcome:", "Outcome:")}</strong> {localizedProfile.outcomeType}
                  </p>
                  <p>
                    <strong className="text-foreground">{t("Evidence:", "Bevis:")}</strong> {localizedProfile.evidenceNeed}
                  </p>
                  <p>
                    <strong className="text-foreground">{t("Epics:", "Epics:")}</strong> {localizedProfile.epicExamples}
                  </p>
                  <p>
                    <strong className="text-foreground">{t("Risk:", "Risk:")}</strong> {localizedProfile.riskType}
                  </p>
                  <p>
                    <strong className="text-foreground">{t("Governance:", "Governance:")}</strong> {localizedProfile.governanceNeeds}
                  </p>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </details>
  );
}
