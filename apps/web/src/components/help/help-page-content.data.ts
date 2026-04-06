type DeliveryTypeCard = {
  short: string;
  title: string;
  body: string;
  cardClassName: string;
  shortClassName: string;
  titleClassName: string;
  bodyClassName: string;
};

type DeliveryTypeMatrixRow = {
  dimension: string;
  ad: string;
  at: string;
  am: string;
};

type WaterfallMatrixRow = {
  dimension: string;
  waterfall: string;
  aas: string;
};

type HelpFaqItem = {
  question: string;
  answer: string;
};

export type HelpLanguage = "en" | "sv";

export type HelpContent = {
  heroBadge: string;
  heroTitle: string;
  heroIntro: string;
  heroBody: string;
  backToWork: string;
  languageLabel: string;
  processHeading: string;
  processSteps: Array<{ title: string; description: string }>;
  practiceTitle: string;
  practiceDescription: string;
  quickTakeaways: string[];
  nonGoalsTitle: string;
  nonGoalsDescription: string;
  nonGoals: string[];
  roundtripTitle: string;
  roundtripDescription: string;
  roundtripStageTitles: [string, string, string];
  roundtripStageSubtitles: [string, string, string];
  roundtripFramingCards: [string, string, string, string, string, string];
  roundtripDeliveryCards: [string, string, string, string, string, string];
  roundtripFeedbackItems: string[];
  roundtripPlainLanguageTitle: string;
  roundtripPlainLanguageBody: string;
  waterfallTitle: string;
  waterfallDescription: string;
  waterfallIntro: string;
  waterfallBody: string;
  waterfallFeedbackTitle: string;
  waterfallFeedbackItems: string[];
  waterfallBacktrackingTitle: string;
  waterfallBacktrackingBody: string;
  waterfallBacktrackingItems: string[];
  waterfallEnablesTitle: string;
  waterfallEnablesItems: string[];
  waterfallSummary: string;
  waterfallMatrixTitle: string;
  waterfallMatrixHeaders: [string, string, string];
  waterfallMatrix: WaterfallMatrixRow[];
  faqTitle: string;
  faqDescription: string;
  faqItems: HelpFaqItem[];
  faqSummaryTitle: string;
  faqSummaryBody: string;
  deepDiveTitle: string;
  deepDiveDescription: string;
  deepDiveBody: string;
  deliveryTypesTitle: string;
  deliveryTypesDescription: string;
  deliveryTypeCards: DeliveryTypeCard[];
  matrixDimensionHeader: string;
  matrixHeaders: [string, string, string];
  deliveryTypeMatrix: DeliveryTypeMatrixRow[];
  principlesTitle: string;
  principlesDescription: string;
  principles: Array<{ title: string; detail: string }>;
  aiTitle: string;
  aiDescription: string;
  levelNotes: string[];
  reviewApprovalTitle: string;
  reviewApprovalBody: string;
  spineTitle: string;
  spineDescription: string;
  spineFormula: string;
  spineFormulaBody: string;
  compactDiagramTitle: string;
  compactDiagramLabels: [string, string, string, string];
  spineBullets: string[];
  platformTitle: string;
  platformDescription: string;
  platformNotes: string[];
};

const deliveryTypeCardClasses = [
  {
    cardClassName: "rounded-2xl border border-sky-200 bg-sky-50/70 p-4",
    shortClassName: "text-sky-800",
    titleClassName: "text-sky-950",
    bodyClassName: "text-sky-950"
  },
  {
    cardClassName: "rounded-2xl border border-amber-200 bg-amber-50/80 p-4",
    shortClassName: "text-amber-800",
    titleClassName: "text-amber-950",
    bodyClassName: "text-amber-950"
  },
  {
    cardClassName: "rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4",
    shortClassName: "text-emerald-800",
    titleClassName: "text-emerald-950",
    bodyClassName: "text-emerald-950"
  }
] as const;

export const helpContent: Record<HelpLanguage, HelpContent> = {
  en: {
    heroBadge: "Help",
    heroTitle: "What is this tool?",
    heroIntro:
      "This tool helps you define, structure and validate what to build before using AI. Instead of starting with prompts, you agree the outcome, structure the work, define how it will be tested and decide how much AI to use.",
    heroBody:
      "In AAS terms, the tool acts as an operating layer for Application Services. It makes AI acceleration more structured, reviewable and safe by keeping business intent, delivery structure and human responsibility visible all the way through.",
    backToWork: "Back to work",
    languageLabel: "Language",
    processHeading: "Framing -> Delivery -> Feedback loop",
    processSteps: [
      {
        title: "Framing",
        description: "Define the outcome, baseline, AI level, risk, epics and story ideas before delivery structure becomes detailed."
      },
      {
        title: "Delivery",
        description: "Refine story ideas into delivery stories, then add acceptance criteria, tests and build-level structure."
      },
      {
        title: "Feedback loop",
        description: "Learn from real delivery, extra stories and misalignment without turning feedback into a new gate."
      }
    ],
    practiceTitle: "AAS in practice",
    practiceDescription: "What the operating model adds on top of ordinary delivery work.",
    quickTakeaways: [
      "AAS is an operating layer on top of agile, DevOps and ITIL. It adds control rather than replacing existing delivery models.",
      "Value Spine creates traceability from business effect to implementation: Outcome -> Epic -> Story -> Test.",
      "Story Ideas live in Framing. Delivery Stories live later in Design/Build, even when they trace back to the same Epic and Outcome.",
      "No design should begin without a defined Outcome, and no implementation should begin without testable Delivery Stories.",
      "No AI-generated code should reach production without human review and formal approval."
    ],
    nonGoalsTitle: "What this tool does NOT do",
    nonGoalsDescription: "It improves readiness and governance. It is not automation by default.",
    nonGoals: [
      "It does not generate code.",
      "It does not replace developers.",
      "It does not auto-approve decisions.",
      "It does not replace agile methods."
    ],
    roundtripTitle: "Framing roundtrip",
    roundtripDescription:
      "A compact visual sketch of how Framing, Story Ideas, Delivery Stories and feedback are meant to work together.",
    roundtripStageTitles: ["1. Framing", "2. Delivery", "3. Feedback loop"],
    roundtripStageSubtitles: ["Define direction and intent", "Refine, build and verify", "Learn without blocking delivery"],
    roundtripFramingCards: [
      "What belongs here",
      "Outcome, problem, baseline, value owner, AI level, risk profile, epics and story ideas.",
      "Story Idea content",
      "Title, linked epic, value intent and expected behavior. Not acceptance criteria, tests or DoD.",
      "Ready for review",
      "A Story Idea is framing ready when value intent, epic link and expected behavior exist."
    ],
    roundtripDeliveryCards: [
      "AI refinement",
      "A Story Idea can be split, merged or clarified by AI before becoming one or more Delivery Stories.",
      "Delivery Stories",
      "These are verifiable execution units with Value Spine validation, acceptance criteria and test definition.",
      "Minimal lifecycle",
      "Needs action -> Ready for review -> Approved is the user-facing status flow, with build progress tracked separately."
    ],
    roundtripFeedbackItems: [
      "Stable: delivery followed the idea as planned.",
      "Expanded: additional delivery stories were needed.",
      "Misaligned: delivery moved away from the original value intent."
    ],
    roundtripPlainLanguageTitle: "Roundtrip in plain language",
    roundtripPlainLanguageBody:
      "Start with a framing brief. Add Epics and Story Ideas. Use AI to refine structure, then turn one Story Idea into one or more Delivery Stories when the work becomes concrete enough to test and verify. After delivery, use the feedback counters in Value Spine to see whether the original Story Idea was stable, expanded or misaligned.",
    waterfallTitle: "AAS is NOT Waterfall",
    waterfallDescription:
      "AAS can look phase-heavy at first glance, but the model is state-based governance rather than sequential delivery.",
    waterfallIntro:
      "AAS is sometimes mistaken for waterfall because the model contains phases and explicit control points. That is a misunderstanding.",
    waterfallBody:
      "AAS is not a sequential delivery model. It is a governance layer on top of existing ways of working such as Scrum, SAFe, or DevOps. Framing, Design, Build, and Transfer are control states that define what must be true, not a rigid order for how work must happen.",
    waterfallFeedbackTitle: "Continuous feedback and return paths",
    waterfallFeedbackItems: [
      "Build -> Design: technical insight, test results, or constraints can require redesign.",
      "Build -> Framing: new knowledge can change the Outcome, scope, or risk posture.",
      "Transfer -> Framing: measured effect against baseline can drive reprioritization or adjusted targets.",
      "Transfer -> Design or Build: operations data, incidents, and user behavior drive continuous improvement."
    ],
    waterfallBacktrackingTitle: "Going back in the model",
    waterfallBacktrackingBody:
      "Going back in AAS is not a failure. It is a controlled mechanism. Decisions are revisited explicitly, traceability is preserved through Value Spine updates, and new or adjusted Stories are created instead of silently mutating unclear work.",
    waterfallBacktrackingItems: [
      "Outcome, risk, and AI level are re-evaluated explicitly.",
      "Traceability is preserved because the Value Spine is updated rather than bypassed.",
      "New or adjusted Stories are created instead of changing delivery work implicitly."
    ],
    waterfallEnablesTitle: "What AAS still enables",
    waterfallEnablesItems: [
      "Iterative development as usual.",
      "Continuous delivery.",
      "Agile ways of working without replacement.",
      "But no work starts without a defined Outcome, no AI runs without a decided AI Acceleration Level, and no delivery is treated as complete without testability and traceability."
    ],
    waterfallSummary:
      "AAS does not slow delivery down for its own sake. It removes uncontrolled delivery by structuring value, risk, accountability, and evidence.",
    waterfallMatrixTitle: "Waterfall vs AAS",
    waterfallMatrixHeaders: ["Dimension", "Waterfall", "AAS"],
    waterfallMatrix: [
      { dimension: "Structure", waterfall: "Sequential", aas: "State-based" },
      { dimension: "Feedback", waterfall: "Late", aas: "Continuous" },
      { dimension: "Test", waterfall: "Late-stage", aas: "Integrated from the start" },
      { dimension: "Scope", waterfall: "Fixed", aas: "Outcome-driven" },
      { dimension: "AI", waterfall: "Not addressed", aas: "Formally governed" },
      { dimension: "Traceability", waterfall: "Weak", aas: "Value Spine" }
    ],
    faqTitle: "AAS - Frequently Asked Questions",
    faqDescription:
      "Short answers to the most common concerns about control, delivery speed, agility, documentation, and AI governance.",
    faqItems: [
      {
        question: "1. Is AAS waterfall?",
        answer:
          "No. AAS is a control structure, not a sequential model. Waterfall controls order. AAS controls responsibility, risk, and value."
      },
      {
        question: "2. Does AAS reduce delivery speed?",
        answer:
          "AAS prioritizes correct delivery over fast activity. That usually reduces rework, technical debt, and misdirected investment."
      },
      {
        question: "3. How does AAS relate to agile ways of working?",
        answer:
          "AAS does not replace agile methods. It ensures iterative delivery stays connected to measurable value instead of only producing output."
      },
      {
        question: "4. Does AAS require teams to work differently day to day?",
        answer:
          "It changes less how work is performed and more what counts as acceptable and complete. Delivery must be linked to Outcome, tested, and traceable."
      },
      {
        question: "5. How is feedback handled in AAS?",
        answer:
          "Feedback is built into the model. Insights from build and operations can lead to controlled design changes or explicit Outcome reconsideration."
      },
      {
        question: "6. What does it mean to go back in the model?",
        answer:
          "Return is a governed mechanism, not an exception. Outcome, risk, or design is revisited explicitly and documented instead of drifting implicitly."
      },
      {
        question: "7. Does AAS create more documentation?",
        answer:
          "AAS asks for evidence, not documentation for its own sake. The goal is that evidence should mostly come automatically from delivery tools and artifacts."
      },
      {
        question: "8. Why must Outcome be defined early?",
        answer:
          "Outcome is the basis for deciding whether delivery creates value. Without it, teams measure activity instead of effect."
      },
      {
        question: "9. Why is AI Acceleration Level mandatory?",
        answer:
          "AI changes risk, quality expectations, and accountability. Without a defined level, AI usage becomes uncontrolled and hard to review."
      },
      {
        question: "10. What happens if you do not work according to AAS?",
        answer:
          "Delivery can still happen, but without reliable traceability, controlled risk, clear accountability, or verifiable linkage to business value."
      }
    ],
    faqSummaryTitle: "Summary",
    faqSummaryBody:
      "AAS establishes a structure where every delivery is tied to a defined Outcome, governed through an explicit risk posture, verified through test and evidence, and traceable from business value to implementation.",
    deepDiveTitle: "AAS method deep dive",
    deepDiveDescription: "A tighter explanation of the four AAS phases and why the sequence matters.",
    deepDiveBody:
      "AAS describes connected phases, but the product flow here is intentionally simplified to Framing, Delivery and Feedback Loop. The central idea is that teams should not jump straight from a vague need into AI-assisted implementation. First the effect is defined, then the work is structured, then implementation is accelerated and finally the result is learned from and fed back into the framing model.",
    deliveryTypesTitle: "Choosing AD, AT or AM in Framing",
    deliveryTypesDescription:
      "Use this matrix when you choose Delivery type in Framing. It explains what should become heavier, stricter or more data-driven depending on project posture.",
    deliveryTypeCards: [
      {
        short: "AD",
        title: "Application Development",
        body: "Best when the main challenge is to create new value or a new capability, and the baseline is still lighter or partly hypothesis-led.",
        ...deliveryTypeCardClasses[0]
      },
      {
        short: "AT",
        title: "Application Transformation",
        body: "Best when the main challenge is structural change in an existing landscape and Framing must prove the current problem with stronger evidence.",
        ...deliveryTypeCardClasses[1]
      },
      {
        short: "AM",
        title: "Application Management",
        body: "Best when the main challenge is to improve an active service with operational data, recurring patterns and continuous delivery reality.",
        ...deliveryTypeCardClasses[2]
      }
    ],
    matrixDimensionHeader: "Dimension",
    matrixHeaders: ["AD - Application Development", "AT - Application Transformation", "AM - Application Management"],
    deliveryTypeMatrix: [
      { dimension: "Primary question in Framing", ad: "What should we build to create new value?", at: "What in the current system is blocking value?", am: "How do we optimize existing delivery?" },
      { dimension: "Change type", ad: "New functionality or new capability", at: "Structural change in an existing system", am: "Continuous improvement" },
      { dimension: "Baseline starting point", ad: "Often light or missing", at: "Mandatory and data-driven", am: "Object-specific and operational" },
      { dimension: "Baseline examples", ad: "Current manual work or workaround process", at: "Lead time, tech debt, cost, incidents", am: "SLA, incident data, cost per case" },
      { dimension: "Outcome type", ad: "Business value or user value", at: "Structural effect on speed, cost, or risk", am: "Stability, efficiency, or cost effect" },
      { dimension: "Outcome examples", ad: "\"Increase conversion by 15%.\"", at: "\"Cut lead time in half.\"", am: "\"Reduce MTTR from 6h to 2h.\"" },
      { dimension: "Evidence expected in Framing", ad: "Hypothesis plus reasonable value logic", at: "Measured problem verification is expected", am: "Operational data analysis and recurring patterns" },
      { dimension: "Problem definition style", ad: "Hypothesis-led", at: "Fact-based and quantified", am: "Data-driven and repetitive" },
      { dimension: "Epic character", ad: "Functional capabilities", at: "Structural transformation moves", am: "Improvement and automation themes" },
      { dimension: "Epic examples", ad: "UI, API, onboarding", at: "Modularization, CI/CD, dependency cleanup", am: "Incident automation, triage, monitoring" },
      { dimension: "Dominant risk type", ad: "Wrong functionality or low adoption", at: "Operational regression or system impact", am: "Optimizing or automating the wrong thing" },
      { dimension: "Typical risk level", ad: "Medium", at: "Highest", am: "Low to medium" },
      { dimension: "Scope stability", ad: "Can stay exploratory early on", at: "Needs early stabilization", am: "Continuous and iterative" },
      { dimension: "Typical AI Acceleration Level", ad: "Level 1-2 (3 can be possible)", at: "Level 1-2 (3 only with strict control)", am: "Level 1-3 (high potential)" },
      { dimension: "AI role in Framing", ad: "Support ideation and structure", at: "Analyze code, dependencies, and tech debt", am: "Identify patterns and analyze incidents" },
      { dimension: "Governance emphasis in Framing", ad: "Outcome + Value Owner", at: "Outcome + baseline + risk + AI level with tighter discipline", am: "Outcome + operational baseline" },
      { dimension: "Common failure mode", ad: "Building features without a real Outcome", at: "Modernizing without a measurable effect target", am: "Running service work without an improvement target" },
      { dimension: "What AAS protects against", ad: "Output without value", at: "Technology-driven transformation without effect logic", am: "Reactive support work without development intent" },
      { dimension: "Framing weight", ad: "Medium", at: "Highest (critical phase)", am: "Medium" },
      { dimension: "Consequence of poor Framing", ad: "Wrong product", at: "Failed transformation (expensive)", am: "Inefficient service" }
    ],
    principlesTitle: "Five core principles",
    principlesDescription: "The operating model principles that shape the interface and the workflow.",
    principles: [
      { title: "Outcome before output", detail: "Start from the effect the business wants to achieve. That keeps teams from producing more code without producing more value." },
      { title: "Value Spine is mandatory", detail: "Outcome, Epic, Story and Test stay connected so delivery remains traceable, reviewable and tied to business intent." },
      { title: "AI is a level, not a tool choice", detail: "AI usage is chosen as an explicit acceleration level. Review depth, evidence and role clarity then scale with that choice." },
      { title: "Test and quality are integrated from the start", detail: "Stories should be testable before build work begins. Quality is built into the structure, not added afterwards." },
      { title: "Human mandate remains", detail: "AI can assist with analysis, content, tests and code, but review, approval and risk acceptance stay with named people." }
    ],
    aiTitle: "AI levels and human mandate",
    aiDescription: "How AAS thinks about acceleration levels, human review and formal approval.",
    levelNotes: [
      "Level 1 means assisted delivery with close human review.",
      "Level 2 means structured acceleration with stronger AI review and reproducibility expectations.",
      "Level 3 means orchestrated agentic delivery, which only makes sense when governance, roles and oversight are mature."
    ],
    reviewApprovalTitle: "Review and approval are not the same",
    reviewApprovalBody:
      "Review verifies artifact quality against requirements, architecture and tests. Approval is the formal human decision to accept remaining risk and allow release or transition. AAS keeps both visible because human mandate remains.",
    spineTitle: "Why the Value Spine matters",
    spineDescription: "The compact structural explanation behind Outcome, Epic, Story and Test.",
    spineFormula: "Outcome -> Epic -> Story -> Test",
    spineFormulaBody:
      "In the operating model, Value Spine is not just a documentation pattern. It is the control mechanism that makes AI usage compatible with transparency, reviewability and responsibility.",
    compactDiagramTitle: "Compact diagram",
    compactDiagramLabels: ["Outcome", "Epic", "Delivery Story", "Test"],
    spineBullets: [
      "Outcome defines the business effect, owner and baseline.",
      "Epic groups a meaningful value slice so scope and direction stay understandable.",
      "Story Idea captures intent in Framing. Delivery Story becomes the smallest governed execution unit later.",
      "Test provides evidence that the intended change actually happened."
    ],
    platformTitle: "How this app is built",
    platformDescription: "A compact explanation of the product assumptions that used to sit in the right rail.",
    platformNotes: [
      "One project stays active at a time, so Framing, Value Spine, Import and Review remain project-scoped instead of blending unrelated work.",
      "Readiness, tollgates, sign-off and lineage are shown close to the work instead of being hidden in a separate governance tool.",
      "Native and imported work can coexist, but imported material keeps its review trail until humans decide to promote it.",
      "The current product defaults are Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Supabase, Prisma, PostHog and OpenTelemetry."
    ]
  },
  sv: {
    heroBadge: "Hjälp",
    heroTitle: "Vad är det här verktyget?",
    heroIntro:
      "Det här verktyget hjälper dig att definiera, strukturera och kvalitetssäkra vad som ska byggas innan AI används. I stället för att börja med promptar kommer ni överens om outcome, strukturerar arbetet, bestämmer hur det ska verifieras och avgör hur mycket AI som ska användas.",
    heroBody:
      "I AAS-termer fungerar verktyget som ett operativt lager för Application Services. Det gör AI-acceleration mer strukturerad, granskningsbar och säker genom att hålla affärsintention, leveransstruktur och mänskligt ansvar synligt hela vägen.",
    backToWork: "Tillbaka till arbetet",
    languageLabel: "Språk",
    processHeading: "Framing -> Delivery -> Feedback loop",
    processSteps: [
      {
        title: "Framing",
        description: "Definiera outcome, baseline, AI-nivå, risk, epics och story ideas innan leveransstrukturen blir detaljerad."
      },
      {
        title: "Delivery",
        description: "Förfina story ideas till leveransstories och lägg sedan till acceptanskriterier, tester och byggbar struktur."
      },
      {
        title: "Feedback loop",
        description: "Lär av faktisk leverans, extra stories och avvikelser utan att göra återkopplingen till ännu en grind."
      }
    ],
    practiceTitle: "AAS i praktiken",
    practiceDescription: "Vad det operativa arbetssättet lägger ovanpå vanlig leverans.",
    quickTakeaways: [
      "AAS är ett operativt lager ovanpå agil utveckling, DevOps och ITIL. Det ersätter inte befintliga arbetssätt utan lägger till styrning.",
      "Value Spine skapar spårbarhet från affärseffekt till implementation: Outcome -> Epic -> Story -> Test.",
      "Story Ideas hör hemma i Framing. Delivery Stories hör hemma senare i Design/Build, även när de spårar tillbaka till samma Epic och Outcome.",
      "Ingen design bör börja utan ett definierat Outcome, och ingen implementation bör börja utan testbara Delivery Stories.",
      "Ingen AI-genererad kod bör nå produktion utan mänsklig granskning och formellt godkännande."
    ],
    nonGoalsTitle: "Vad verktyget INTE gör",
    nonGoalsDescription: "Det förbättrar readiness och governance. Det är inte automation som standard.",
    nonGoals: [
      "Det genererar inte kod.",
      "Det ersätter inte utvecklare.",
      "Det auto-godkänner inte beslut.",
      "Det ersätter inte agila metoder."
    ],
    roundtripTitle: "Framing-rundtur",
    roundtripDescription:
      "En kompakt översikt över hur Framing, Story Ideas, Delivery Stories och feedback är tänkta att fungera tillsammans.",
    roundtripStageTitles: ["1. Framing", "2. Delivery", "3. Feedback loop"],
    roundtripStageSubtitles: ["Definiera riktning och intention", "Förfina, bygg och verifiera", "Lär utan att blockera leverans"],
    roundtripFramingCards: [
      "Det här hör hemma här",
      "Outcome, problem, baseline, value owner, AI-nivå, riskprofil, epics och story ideas.",
      "Innehåll i Story Idea",
      "Titel, kopplad epic, value intent och expected behavior. Inte acceptanskriterier, tester eller DoD.",
      "Redo för review",
      "En Story Idea är framing-redo när value intent, epic-koppling och expected behavior finns."
    ],
    roundtripDeliveryCards: [
      "AI-förfining",
      "En Story Idea kan delas, slås ihop eller förtydligas av AI innan den blir en eller flera Delivery Stories.",
      "Delivery Stories",
      "Det här är verifierbara exekveringsenheter med Value Spine-validering, acceptanskriterier och testdefinition.",
      "Minimal livscykel",
      "Needs action -> Ready for review -> Approved är det användarsynliga statusflödet, medan byggprogress spåras separat."
    ],
    roundtripFeedbackItems: [
      "Stable: leveransen följde idén som planerat.",
      "Expanded: fler delivery stories behövdes.",
      "Misaligned: leveransen rörde sig bort från ursprungligt value intent."
    ],
    roundtripPlainLanguageTitle: "Rundtur i klarspråk",
    roundtripPlainLanguageBody:
      "Börja med en framing brief. Lägg till Epics och Story Ideas. Använd AI för att förfina strukturen, och gör sedan en Story Idea till en eller flera Delivery Stories när arbetet blivit tillräckligt konkret för att testas och verifieras. Efter leverans använder du feedback-räknarna i Value Spine för att se om den ursprungliga Story Idea var stabil, expanderad eller felriktad.",
    waterfallTitle: "AAS är INTE vattenfall",
    waterfallDescription:
      "AAS kan se fasindelat ut vid första anblick, men modellen är tillståndsbaserad governance snarare än sekventiell leverans.",
    waterfallIntro:
      "AAS uppfattas ibland som vattenfall eftersom modellen innehåller faser och tydliga kontrollpunkter. Det är en missuppfattning.",
    waterfallBody:
      "AAS är inte en sekventiell leveransmodell. Det är ett governance-lager ovanpå befintliga arbetssätt som Scrum, SAFe eller DevOps. Framing, Design, Build och Transfer är kontrolltillstånd som definierar vad som måste vara sant, inte en låst ordning för hur arbete måste ske.",
    waterfallFeedbackTitle: "Kontinuerlig feedback och återkoppling",
    waterfallFeedbackItems: [
      "Build -> Design: tekniska insikter, testresultat eller begränsningar kan kräva omdesign.",
      "Build -> Framing: ny kunskap kan påverka Outcome, scope eller risknivå.",
      "Transfer -> Framing: mätning av faktisk effekt mot baseline kan leda till nya prioriteringar eller justerade mål.",
      "Transfer -> Design eller Build: driftdata, incidenter och användarbeteende driver kontinuerliga förbättringar."
    ],
    waterfallBacktrackingTitle: "Att gå tillbaka i modellen",
    waterfallBacktrackingBody:
      "Att gå tillbaka i AAS är inte ett fel. Det är en kontrollerad mekanism. Beslut omprövas explicit, spårbarheten bevaras genom uppdaterad Value Spine och nya eller justerade Stories skapas i stället för att arbete förändras otydligt.",
    waterfallBacktrackingItems: [
      "Outcome, risk och AI-nivå omprövas explicit.",
      "Spårbarheten bibehålls eftersom Value Spine uppdateras i stället för att kringgås.",
      "Nya eller justerade Stories skapas i stället för att leveransarbetet förändras implicit."
    ],
    waterfallEnablesTitle: "Vad AAS fortfarande möjliggör",
    waterfallEnablesItems: [
      "Iterativ utveckling som vanligt.",
      "Kontinuerlig leverans.",
      "Agila arbetssätt utan att ersättas.",
      "Men inget arbete startar utan definierat Outcome, ingen AI används utan beslutad AI Acceleration Level och ingen leverans räknas som klar utan testbarhet och spårbarhet."
    ],
    waterfallSummary:
      "AAS begränsar inte hastighet för sakens skull. Det eliminerar okontrollerad leverans genom att strukturera värde, risk, ansvar och evidens.",
    waterfallMatrixTitle: "Vattenfall vs AAS",
    waterfallMatrixHeaders: ["Dimension", "Vattenfall", "AAS"],
    waterfallMatrix: [
      { dimension: "Struktur", waterfall: "Sekventiell", aas: "Tillståndsbaserad" },
      { dimension: "Feedback", waterfall: "Sen", aas: "Kontinuerlig" },
      { dimension: "Test", waterfall: "Sent", aas: "Integrerat från start" },
      { dimension: "Scope", waterfall: "Fast", aas: "Outcome-styrd" },
      { dimension: "AI", waterfall: "Ej hanterad", aas: "Formellt styrd" },
      { dimension: "Spårbarhet", waterfall: "Svag", aas: "Value Spine" }
    ],
    faqTitle: "AAS – Vanliga frågor",
    faqDescription:
      "Korta svar på de vanligaste frågorna om styrning, leveranshastighet, agilitet, dokumentation och AI-governance.",
    faqItems: [
      {
        question: "1. Är AAS vattenfall?",
        answer:
          "Nej. AAS är en kontrollstruktur, inte en sekventiell modell. Vattenfall styr ordning. AAS styr ansvar, risk och värde."
      },
      {
        question: "2. Påverkar AAS leveranshastigheten?",
        answer:
          "AAS prioriterar korrekt leverans framför snabb aktivitet. Det minskar ofta omarbete, teknisk skuld och felriktade investeringar."
      },
      {
        question: "3. Hur relaterar AAS till agila arbetssätt?",
        answer:
          "AAS ersätter inte agila metoder. Det säkerställer att iterativ leverans förblir kopplad till mätbart värde i stället för att bara producera output."
      },
      {
        question: "4. Kräver AAS att team jobbar annorlunda i vardagen?",
        answer:
          "Det förändrar mindre hur arbetet utförs och mer vad som räknas som acceptabelt och färdigt. Leverans måste vara kopplad till Outcome, testad och spårbar."
      },
      {
        question: "5. Hur hanteras feedback i AAS?",
        answer:
          "Feedback är inbyggd i modellen. Insikter från build och drift kan leda till kontrollerade designjusteringar eller uttrycklig omprövning av Outcome."
      },
      {
        question: "6. Vad innebär det att gå tillbaka i modellen?",
        answer:
          "Återgång är en styrd mekanism, inte ett undantag. Outcome, risk eller design omprövas explicit och dokumenterat i stället för att glida iväg implicit."
      },
      {
        question: "7. Leder AAS till mer dokumentation?",
        answer:
          "AAS kräver evidens, inte dokumentation för dokumentationens skull. Målet är att evidens till stor del ska komma automatiskt från leveransens verktyg och artefakter."
      },
      {
        question: "8. Varför måste Outcome definieras tidigt?",
        answer:
          "Outcome är grunden för att avgöra om leverans skapar värde. Utan det mäter team aktivitet i stället för effekt."
      },
      {
        question: "9. Varför är AI Acceleration Level obligatorisk?",
        answer:
          "AI påverkar risk, kvalitetskrav och ansvarsfördelning. Utan en definierad nivå blir AI-användning okontrollerad och svår att granska."
      },
      {
        question: "10. Vad är konsekvensen av att inte arbeta enligt AAS?",
        answer:
          "Leverans kan fortfarande ske, men utan pålitlig spårbarhet, kontrollerad risk, tydligt ansvar eller verifierbar koppling till affärsvärde."
      }
    ],
    faqSummaryTitle: "Sammanfattning",
    faqSummaryBody:
      "AAS etablerar en struktur där varje leverans är kopplad till ett definierat Outcome, styrd av en tydlig riskprofil, verifierad genom test och evidens samt spårbar från affärsvärde till implementation.",
    deepDiveTitle: "Fördjupning i AAS-metoden",
    deepDiveDescription: "En tydligare förklaring av AAS-faserna och varför ordningen spelar roll.",
    deepDiveBody:
      "AAS beskriver sammanhängande faser, men produktflödet här är medvetet förenklat till Framing, Delivery och Feedback Loop. Grundidén är att team inte ska hoppa direkt från ett vagt behov till AI-assisterad implementation. Först definieras effekten, sedan struktureras arbetet, därefter accelereras implementationen och till sist används resultatet för lärande tillbaka in i framing-modellen.",
    deliveryTypesTitle: "Välja AD, AT eller AM i Framing",
    deliveryTypesDescription:
      "Använd den här matrisen när du väljer Delivery type i Framing. Den visar vad som behöver bli tyngre, striktare eller mer datadrivet beroende på projektets karaktär.",
    deliveryTypeCards: [
      {
        short: "AD",
        title: "Application Development",
        body: "Passar bäst när huvudutmaningen är att skapa nytt värde eller ny förmåga, och baselinen fortfarande är lättare eller delvis hypotesdriven.",
        ...deliveryTypeCardClasses[0]
      },
      {
        short: "AT",
        title: "Application Transformation",
        body: "Passar bäst när huvudutmaningen är strukturell förändring i ett befintligt landskap och Framing måste bevisa nulägesproblemet med starkare evidens.",
        ...deliveryTypeCardClasses[1]
      },
      {
        short: "AM",
        title: "Application Management",
        body: "Passar bäst när huvudutmaningen är att förbättra en aktiv tjänst med operativ data, återkommande mönster och kontinuerlig leveransverklighet.",
        ...deliveryTypeCardClasses[2]
      }
    ],
    matrixDimensionHeader: "Dimension",
    matrixHeaders: ["AD - Application Development", "AT - Application Transformation", "AM - Application Management"],
    deliveryTypeMatrix: [
      { dimension: "Primär fråga i Framing", ad: "Vad ska vi bygga för att skapa nytt värde?", at: "Vad i nuvarande system hindrar värde?", am: "Hur optimerar vi befintlig leverans?" },
      { dimension: "Typ av förändring", ad: "Ny funktionalitet eller ny kapacitet", at: "Strukturell förändring i befintligt system", am: "Kontinuerlig förbättring" },
      { dimension: "Utgångsläge (baseline)", ad: "Ofta svag eller saknas", at: "Obligatorisk och datadriven", am: "Objektspecifik och operativ" },
      { dimension: "Baseline-exempel", ad: "Nuvarande manuellt arbetssätt eller workaround", at: "Lead time, tech debt, kostnad, incidenter", am: "SLA, incidentdata, kostnad per ärende" },
      { dimension: "Outcome-typ", ad: "Affärsvärde eller användarvärde", at: "Strukturell effekt på hastighet, kostnad eller risk", am: "Stabilitet, effektivitet eller kostnadseffekt" },
      { dimension: "Outcome-exempel", ad: "\"Öka konvertering med 15%.\"", at: "\"Halvera lead time.\"", am: "\"Minska MTTR från 6h till 2h.\"" },
      { dimension: "Beviskrav i Framing", ad: "Hypotes plus rimlig värdelogik", at: "Mätbar problemverifiering förväntas", am: "Operativ dataanalys och återkommande mönster" },
      { dimension: "Problemdefinition", ad: "Hypotesdriven", at: "Faktabaserad och kvantifierad", am: "Datadriven och repetitiv" },
      { dimension: "Epics karaktär", ad: "Funktionella capabilities", at: "Strukturella transformationssteg", am: "Förbättrings- och automationsteman" },
      { dimension: "Exempel på epics", ad: "UI, API, onboarding", at: "Modularisering, CI/CD, dependency cleanup", am: "Incident automation, triage, monitoring" },
      { dimension: "Dominerande risktyp", ad: "Fel funktionalitet eller låg användning", at: "Driftsregression eller systempåverkan", am: "Att optimera eller automatisera fel sak" },
      { dimension: "Typisk risknivå", ad: "Medel", at: "Högst", am: "Låg till medel" },
      { dimension: "Scope-stabilitet", ad: "Kan vara explorativ tidigt", at: "Behöver stabiliseras tidigt", am: "Kontinuerlig och iterativ" },
      { dimension: "Typisk AI Acceleration Level", ad: "Level 1-2 (3 kan vara möjligt)", at: "Level 1-2 (3 endast med strikt kontroll)", am: "Level 1-3 (hög potential)" },
      { dimension: "AI-roll i Framing", ad: "Stöd för idéer och struktur", at: "Analys av kod, beroenden och tech debt", am: "Identifiera mönster och analysera incidenter" },
      { dimension: "Governance-tyngd i Framing", ad: "Outcome + Value Owner", at: "Outcome + baseline + risk + AI-nivå med tydligare disciplin", am: "Outcome + operativ baseline" },
      { dimension: "Vanligt fel", ad: "Bygga features utan verkligt Outcome", at: "Modernisera utan mätbart effektmål", am: "Driva servicearbete utan förbättringsmål" },
      { dimension: "Vad AAS skyddar mot", ad: "Output utan värde", at: "Teknikdriven transformation utan effektlogik", am: "Reaktiv support utan utvecklingsintention" },
      { dimension: "Framing-tyngd", ad: "Medel", at: "Högst (kritisk fas)", am: "Medel" },
      { dimension: "Konsekvens av dålig Framing", ad: "Fel produkt", at: "Misslyckad transformation (dyr)", am: "Ineffektiv tjänst" }
    ],
    principlesTitle: "Fem kärnprinciper",
    principlesDescription: "De principer i arbetssättet som formar gränssnittet och flödet.",
    principles: [
      { title: "Outcome före output", detail: "Börja med den effekt verksamheten vill uppnå. Det hindrar team från att producera mer kod utan att skapa mer värde." },
      { title: "Value Spine är obligatorisk", detail: "Outcome, Epic, Story och Test hålls ihop så att leveransen förblir spårbar, granskningsbar och kopplad till affärsintention." },
      { title: "AI är en nivå, inte ett verktygsval", detail: "AI-användning väljs som en explicit accelerationsnivå. Granskningsdjup, evidens och rolltydlighet skalas sedan utifrån det." },
      { title: "Test och kvalitet integreras från start", detail: "Stories ska vara testbara innan byggarbete börjar. Kvalitet byggs in i strukturen, inte efteråt." },
      { title: "Mänskligt mandat kvarstår", detail: "AI kan hjälpa till med analys, innehåll, tester och kod, men review, godkännande och riskacceptans ligger kvar hos namngivna personer." }
    ],
    aiTitle: "AI-nivåer och mänskligt mandat",
    aiDescription: "Hur AAS ser på accelerationsnivåer, mänsklig review och formellt godkännande.",
    levelNotes: [
      "Level 1 betyder assisterad leverans med nära mänsklig review.",
      "Level 2 betyder strukturerad acceleration med starkare AI-review och högre krav på reproducerbarhet.",
      "Level 3 betyder orkestrerad agentisk leverans, vilket bara är rimligt när governance, roller och tillsyn är mogna."
    ],
    reviewApprovalTitle: "Review och approval är inte samma sak",
    reviewApprovalBody:
      "Review verifierar artefaktkvalitet mot krav, arkitektur och tester. Approval är det formella mänskliga beslutet att acceptera kvarvarande risk och tillåta release eller övergång. AAS håller båda synliga eftersom mänskligt mandat kvarstår.",
    spineTitle: "Varför Value Spine spelar roll",
    spineDescription: "Den kompakta strukturella förklaringen bakom Outcome, Epic, Story och Test.",
    spineFormula: "Outcome -> Epic -> Story -> Test",
    spineFormulaBody:
      "I arbetssättet är Value Spine inte bara ett dokumentationsmönster. Det är styrmekanismen som gör AI-användning förenlig med transparens, granskningsbarhet och ansvar.",
    compactDiagramTitle: "Kompakt diagram",
    compactDiagramLabels: ["Outcome", "Epic", "Delivery Story", "Test"],
    spineBullets: [
      "Outcome definierar affärseffekt, ägare och baseline.",
      "Epic samlar en meningsfull värdeslice så att scope och riktning förblir begriplig.",
      "Story Idea fångar intention i Framing. Delivery Story blir senare den minsta styrda exekveringsenheten.",
      "Test ger evidens för att den avsedda förändringen faktiskt skedde."
    ],
    platformTitle: "Hur appen är uppbyggd",
    platformDescription: "En kompakt förklaring av produktantaganden som tidigare låg i högerspalten.",
    platformNotes: [
      "Ett projekt är aktivt åt gången, så Framing, Value Spine, Import och Review förblir projektspecifika i stället för att blanda ihop orelaterat arbete.",
      "Readiness, tollgates, sign-off och lineage visas nära arbetet i stället för att gömmas i ett separat governance-verktyg.",
      "Nativt och importerat arbete kan samexistera, men importerat material behåller sin review-spårning tills människor väljer att promota det.",
      "Nuvarande produktstandarder är Next.js App Router, React, TypeScript, Tailwind, shadcn/ui, Supabase, Prisma, PostHog och OpenTelemetry."
    ]
  }
};

