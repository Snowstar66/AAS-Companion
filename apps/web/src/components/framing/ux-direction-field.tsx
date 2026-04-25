"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Palette } from "lucide-react";
import { Button } from "@aas-companion/ui";

type Language = "en" | "sv";

type Option<T extends string> = {
  key: T;
  label: string;
  summary: string;
  guidance: string;
};

type UxProfileKey =
  | "enterprise-control-plane"
  | "operational-workflow"
  | "customer-portal"
  | "creative-workspace"
  | "knowledge-hub"
  | "minimal-utility";

type TargetSurfaceKey = "responsive-web" | "desktop-web" | "mobile-app" | "omnichannel";

type ColorSchemaKey = "nordic-blue" | "forest-green" | "warm-amber" | "violet-studio" | "graphite";

type StyleAuthorityKey = "aas-suggested-style" | "customer-style-first" | "strict-customer-design-system";

const profileOptions: Array<Option<UxProfileKey>> = [
  {
    key: "enterprise-control-plane",
    label: "Enterprise control plane",
    summary: "Dense, governed, auditable work surface.",
    guidance:
      "Prioritize dashboard density, strong hierarchy, audit-ready status, table/list scanning, durable navigation, and clear ownership of decisions."
  },
  {
    key: "operational-workflow",
    label: "Operational workflow tool",
    summary: "Fast queues, handoffs, and repeated actions.",
    guidance:
      "Prioritize queues, task states, handoff clarity, exception handling, keyboard-friendly actions, and low-latency decision loops."
  },
  {
    key: "customer-portal",
    label: "Customer portal",
    summary: "External-facing progress, trust, and self-service.",
    guidance:
      "Prioritize plain-language status, next-best actions, document/message flows, trust-building summaries, and low-friction input collection."
  },
  {
    key: "creative-workspace",
    label: "Creative workspace",
    summary: "Exploratory canvas for synthesis and iteration.",
    guidance:
      "Prioritize flexible grouping, visual comparison, lightweight capture, iteration history, comments, and room for emerging structure."
  },
  {
    key: "knowledge-hub",
    label: "Knowledge hub",
    summary: "Findability, learning paths, and reusable context.",
    guidance:
      "Prioritize search, taxonomy, related content, provenance, reading comfort, progressive disclosure, and contribution quality."
  },
  {
    key: "minimal-utility",
    label: "Minimal utility",
    summary: "One focused job with minimal chrome.",
    guidance:
      "Prioritize a single primary path, short forms, explicit confirmation, compact controls, low setup cost, and fast completion."
  }
];

const profileVisualGrammar: Record<UxProfileKey, string[]> = {
  "enterprise-control-plane": [
    "Use dense control-plane layouts with compact rectangular cards, tables, right rails, and persistent navigation.",
    "Prefer squared or small-radius controls, clear borders, muted surfaces, and high information density.",
    "Place owner, status, evidence, version, and governance action together so the decision context is never hidden."
  ],
  "operational-workflow": [
    "Use queue/lane layouts, stacked task cards, checklist rows, compact state chips, and visible due-time pressure.",
    "Make primary actions short and repeated; keep escalation and handoff controls close to the work item.",
    "Favor operational rhythm over decoration: columns, lanes, progress, blockers, owner, next action."
  ],
  "customer-portal": [
    "Use spacious customer-facing panels, friendly rounded cards, plain-language status summaries, and obvious next steps.",
    "Avoid internal terms; put documents, messages, approvals, and support actions in language a customer would understand.",
    "Prefer reassurance, progress, and clarity over dense admin controls."
  ],
  "creative-workspace": [
    "Use canvas-like layouts, flexible clusters, note cards, source trays, and provisional states that invite iteration.",
    "Allow visual comparison and synthesis before structure hardens; comments and AI suggestions should feel easy to rearrange.",
    "Use more whitespace and looser grouping than an operational tool."
  ],
  "knowledge-hub": [
    "Use search-first layouts, readable article cards, topic navigation, source confidence, and related-content paths.",
    "Prioritize reading comfort, provenance, taxonomy, and skim-friendly document structure.",
    "Avoid dashboard clutter unless it directly improves findability."
  ],
  "minimal-utility": [
    "Use a centered single-purpose layout with minimal navigation, one primary input path, and one obvious result.",
    "Remove decorative chrome, secondary panels, and unrelated links unless they directly support completion.",
    "Prefer sparse surfaces, direct labels, immediate feedback, and one dominant action."
  ]
};

const profileSignatureComponents: Record<UxProfileKey, string[]> = {
  "enterprise-control-plane": [
    "Approval matrix for comparing owners, evidence, risk, and approval state.",
    "Audit trail rail beside forms and review screens.",
    "Readiness scorecard for tollgate, release, or portfolio decisions."
  ],
  "operational-workflow": [
    "Queue lane board for repeated work across New, In progress, Blocked, and Done.",
    "SLA task card with due time, owner, blocker, and next action.",
    "Handoff checklist before moving work between roles, teams, or lifecycle states."
  ],
  "customer-portal": [
    "Status timeline that explains progress in customer-facing language.",
    "Input request card for uploads, approvals, and questions with one clear next step.",
    "Message thread with context, response expectations, and plain-language support."
  ],
  "creative-workspace": [
    "Canvas note cluster for ideas, user quotes, risks, and AI suggestions.",
    "Source tray for interviews, research, uploaded material, and AI synthesis.",
    "Decision frame for turning exploration into a clear direction or next experiment."
  ],
  "knowledge-hub": [
    "Search command bar as the main entry point.",
    "Verified source card showing confidence, owner, freshness, and match reason.",
    "Article reading pane with anchors, related content, provenance, and next reading paths."
  ],
  "minimal-utility": [
    "Single input panel for the one task that drives the experience.",
    "Immediate result panel with result, reason, and one next action.",
    "Inline history strip only when previous runs help repeat the task faster."
  ]
};

const surfaceOptions: Array<Option<TargetSurfaceKey>> = [
  {
    key: "responsive-web",
    label: "Responsive web app",
    summary: "Works across desktop and mobile browsers.",
    guidance:
      "Design from responsive web constraints with clear desktop density and a readable mobile layout for core review and input tasks."
  },
  {
    key: "desktop-web",
    label: "Desktop web app",
    summary: "Optimized for broad screens and heavy workflows.",
    guidance:
      "Optimize for desktop productivity with multi-column layouts, visible context, shortcuts where useful, and high scan density."
  },
  {
    key: "mobile-app",
    label: "Mobile app",
    summary: "Small-screen, touch-first, field-friendly experience.",
    guidance:
      "Optimize for touch targets, one-handed flows, offline/poor-network tolerance where relevant, and concise step-by-step interaction."
  },
  {
    key: "omnichannel",
    label: "Omnichannel",
    summary: "Consistent journeys across web, mobile, and service touchpoints.",
    guidance:
      "Define a shared journey model across channels with consistent terminology, state, notifications, permissions, and handoff behavior."
  }
];

const colorOptions: Array<Option<ColorSchemaKey>> = [
  {
    key: "nordic-blue",
    label: "Nordic blue",
    summary: "Calm, precise, professional.",
    guidance:
      "Use cool blues with clean neutrals, restrained accents, high contrast, and a calm professional tone."
  },
  {
    key: "forest-green",
    label: "Forest green",
    summary: "Grounded, sustainable, reassuring.",
    guidance:
      "Use grounded greens with neutral surfaces, visible success states, and a trustworthy operations-oriented tone."
  },
  {
    key: "warm-amber",
    label: "Warm amber",
    summary: "Human, clear, approachable.",
    guidance:
      "Use warm amber accents sparingly with light neutral surfaces, friendly calls to action, and accessible warning/status contrast."
  },
  {
    key: "violet-studio",
    label: "Violet studio",
    summary: "Inventive, premium, expressive.",
    guidance:
      "Use violet accents for creativity and selection states while keeping functional surfaces readable and not overly decorative."
  },
  {
    key: "graphite",
    label: "Graphite",
    summary: "Serious, focused, low-noise.",
    guidance:
      "Use graphite neutrals with crisp borders, limited accent color, strong focus states, and a quiet expert-tool feel."
  }
];

const styleAuthorityOptions: Array<Option<StyleAuthorityKey>> = [
  {
    key: "aas-suggested-style",
    label: "AAS suggested style",
    summary: "Use the selected UX profile, surface, and color schema as the primary design direction.",
    guidance:
      "The selected AAS UX direction is the primary source unless explicit customer UX rules are added in the additional instructions."
  },
  {
    key: "customer-style-first",
    label: "Customer style first",
    summary: "Customer UX rules override the AAS style; AAS fills gaps.",
    guidance:
      "Customer UX rules, brand, design system, Figma references, accessibility standards, and component conventions take priority. Use the selected AAS profile only to fill gaps."
  },
  {
    key: "strict-customer-design-system",
    label: "Strict customer design system",
    summary: "Follow the customer design system; AAS only guides structure where compatible.",
    guidance:
      "Treat the customer design system as mandatory. Ignore any selected AAS profile, color, component, radius, spacing, or tone rule that conflicts with customer UX rules."
  }
];

const defaultProfile = "enterprise-control-plane";
const defaultSurface = "responsive-web";
const defaultColor = "nordic-blue";
const defaultStyleAuthority = "aas-suggested-style";

function translate(language: Language, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function findOption<T extends string>(options: Array<Option<T>>, value: string | null, fallback: T): Option<T> {
  const fallbackOption = options.find((option) => option.key === fallback) ?? options[0]!;
  if (!value) return fallbackOption;

  const normalized = value.toLowerCase();
  return (
    options.find(
      (option) =>
        normalized.includes(option.key.toLowerCase()) || normalized.includes(option.label.toLowerCase())
    ) ?? fallbackOption
  );
}

function readLabeledValue(value: string, label: string) {
  const match = value.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() ?? null;
}

function readAdditionalInstructions(value: string) {
  const match = value.match(/Additional UX instructions:\s*([\s\S]*)$/i);
  return match?.[1]?.trim() ?? "";
}

function parseInitialValue(value: string) {
  const hasStructuredDirection = /UX profile:/i.test(value);
  const profile = findOption(profileOptions, readLabeledValue(value, "UX profile"), defaultProfile);
  const surface = findOption(surfaceOptions, readLabeledValue(value, "Target surface"), defaultSurface);
  const color = findOption(colorOptions, readLabeledValue(value, "Color schema"), defaultColor);
  const styleAuthority = findOption(
    styleAuthorityOptions,
    readLabeledValue(value, "Style authority"),
    defaultStyleAuthority
  );

  return {
    profile: profile.key,
    surface: surface.key,
    color: color.key,
    styleAuthority: styleAuthority.key,
    customInstructions: hasStructuredDirection ? readAdditionalInstructions(value) : value.trim()
  };
}

function buildExportedUxPrinciples(
  profile: Option<UxProfileKey>,
  surface: Option<TargetSurfaceKey>,
  color: Option<ColorSchemaKey>,
  styleAuthority: Option<StyleAuthorityKey>,
  customInstructions: string
) {
  const visualGrammar = profileVisualGrammar[profile.key] ?? [];
  const signatureComponents = profileSignatureComponents[profile.key] ?? [];
  const sections = [
    "UX direction",
    `UX profile: ${profile.label} (${profile.key})`,
    `Target surface: ${surface.label} (${surface.key})`,
    `Color schema: ${color.label} (${color.key})`,
    `Style authority: ${styleAuthority.label} (${styleAuthority.key})`,
    "",
    "Style priority:",
    styleAuthority.guidance,
    "If customer UX rules are supplied, downstream AI must explicitly resolve conflicts using this style authority before applying AAS profile, color, or signature component guidance.",
    "",
    "Core UX guidance:",
    profile.guidance,
    "",
    "Downstream AI visual grammar:",
    "The selected UX profile must materially change layout, components, density, navigation, and status treatment. Do not collapse this into a generic SaaS card UI.",
    ...visualGrammar.map((rule) => `- ${rule}`),
    "",
    "Signature components to prefer when relevant:",
    "Use these as primary building blocks before generic button/select/input examples. Generic controls should support the signature component, not define the experience.",
    ...signatureComponents.map((component) => `- ${component}`),
    "",
    "Surface guidance:",
    surface.guidance,
    "",
    "Color guidance:",
    color.guidance
  ];

  const trimmedInstructions = customInstructions.trim();
  if (trimmedInstructions.length > 0) {
    sections.push("", "Additional UX instructions:", trimmedInstructions);
  }

  return sections.join("\n");
}

function SelectField<T extends string>({
  disabled,
  label,
  options,
  value,
  onChange
}: {
  disabled?: boolean | undefined;
  label: string;
  options: Array<Option<T>>;
  value: T;
  onChange: (value: T) => void;
}) {
  const selected = options.find((option) => option.key === value) ?? options[0]!;

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs leading-5 text-muted-foreground">{selected.summary}</p>
    </label>
  );
}

export function UxDirectionField({
  disabled,
  initialValue,
  language
}: {
  disabled?: boolean | undefined;
  initialValue: string;
  language: Language;
}) {
  const initial = useMemo(() => parseInitialValue(initialValue), [initialValue]);
  const [profileKey, setProfileKey] = useState<UxProfileKey>(initial.profile);
  const [surfaceKey, setSurfaceKey] = useState<TargetSurfaceKey>(initial.surface);
  const [colorKey, setColorKey] = useState<ColorSchemaKey>(initial.color);
  const [styleAuthorityKey, setStyleAuthorityKey] = useState<StyleAuthorityKey>(initial.styleAuthority);
  const [customInstructions, setCustomInstructions] = useState(initial.customInstructions);

  const selectedProfile = profileOptions.find((option) => option.key === profileKey) ?? profileOptions[0]!;
  const selectedSurface = surfaceOptions.find((option) => option.key === surfaceKey) ?? surfaceOptions[0]!;
  const selectedColor = colorOptions.find((option) => option.key === colorKey) ?? colorOptions[0]!;
  const selectedStyleAuthority =
    styleAuthorityOptions.find((option) => option.key === styleAuthorityKey) ?? styleAuthorityOptions[0]!;

  const exportedUxPrinciples = buildExportedUxPrinciples(
    selectedProfile,
    selectedSurface,
    selectedColor,
    selectedStyleAuthority,
    customInstructions
  );
  const previewHref = `/framing/ux-preview?profile=${profileKey}&surface=${surfaceKey}&color=${colorKey}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
              <Palette className="h-4 w-4 shrink-0 text-violet-700" />
              {translate(language, "UX direction", "UX-riktning")}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-violet-950/75">
              {translate(
                language,
                "Choose profile, target surface, color schema, and whether customer UX rules override the AAS style. The generated UX principles are saved with the framing export.",
                "Valj profil, malyta, fargschema och om kundens UX-regler ska overrida AAS-stilen. Den genererade UX-riktningen sparas i framing-exporten."
              )}
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 border-violet-300 bg-white text-violet-950 hover:border-violet-400 hover:bg-violet-100"
            size="sm"
            variant="secondary"
          >
            <Link href={previewHref}>
              <ExternalLink className="mr-2 h-4 w-4" />
              {translate(language, "Preview selected direction", "Forhandsgranska valet")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          disabled={disabled}
          label={translate(language, "UX profile", "UX-profil")}
          options={profileOptions}
          value={profileKey}
          onChange={setProfileKey}
        />
        <SelectField
          disabled={disabled}
          label={translate(language, "Target surface", "Malyta")}
          options={surfaceOptions}
          value={surfaceKey}
          onChange={setSurfaceKey}
        />
        <SelectField
          disabled={disabled}
          label={translate(language, "Color schema", "Fargschema")}
          options={colorOptions}
          value={colorKey}
          onChange={setColorKey}
        />
        <SelectField
          disabled={disabled}
          label={translate(language, "Style authority", "Stilstyrning")}
          options={styleAuthorityOptions}
          value={styleAuthorityKey}
          onChange={setStyleAuthorityKey}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {translate(language, "Additional UX instructions", "Ytterligare UX-instruktioner")}
        </span>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/30"
          disabled={disabled}
          placeholder={translate(
            language,
            "Add customer UX rules, design system/Figma references, brand constraints, accessibility needs, component preferences, tone, or things the downstream designer must avoid.",
            "Lagg till kundens UX-regler, design system-/Figma-referenser, varumarkeskrav, tillganglighetsbehov, komponentpreferenser, ton eller sadant downstream-designern ska undvika."
          )}
          value={customInstructions}
          onChange={(event) => setCustomInstructions(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {translate(language, "Exported UX principles", "Exporterade UX-principer")}
        </span>
        <textarea
          className="min-h-44 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-xs leading-5 text-slate-700 outline-none disabled:cursor-not-allowed disabled:bg-muted/30"
          disabled={disabled}
          name="uxPrinciples"
          readOnly
          value={exportedUxPrinciples}
        />
      </label>
    </div>
  );
}
