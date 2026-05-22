"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Database,
  FileCheck2,
  FileUp,
  FolderOpen,
  Gauge,
  GitBranch,
  LoaderCircle,
  ShieldCheck
} from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";

type AppLanguage = "en" | "sv";
type SourceMode = "files" | "folder";

type SourceConnectionWizardProps = {
  disabled?: boolean | undefined;
  language: AppLanguage;
  organizationName: string;
  sourceMode?: string | null | undefined;
  summary?: {
    files: number;
    candidateObjects: number;
    humanReviewRequired: number;
  } | null;
  uploadAction: (formData: FormData) => void | Promise<void>;
};

const controlEvidenceContract = [
  {
    icon: GitBranch,
    label: "Framing",
    svLabel: "Framing",
    detail: "Outcome, Epic, Story and constraint traceability.",
    svDetail: "Spårning mellan Outcome, Epic, Story och constraints."
  },
  {
    icon: FileCheck2,
    label: "Build",
    svLabel: "Bygg",
    detail: "Implementation artifacts mapped to approved scope.",
    svDetail: "Implementation kopplad till godkänt scope."
  },
  {
    icon: CheckCircle2,
    label: "Tests",
    svLabel: "Tester",
    detail: "Definitions, automated results and manual verification.",
    svDetail: "Testdefinitioner, automatiska resultat och manuell verifiering."
  },
  {
    icon: ShieldCheck,
    label: "AI controls",
    svLabel: "AI-kontroller",
    detail: "AI level, decision log and governance evidence.",
    svDetail: "AI-nivå, beslutslogg och governance-evidens."
  }
];

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function SourceWizardSubmitButton({ disabled, language }: { disabled?: boolean | undefined; language: AppLanguage }) {
  const { pending } = useFormStatus();

  return (
    <Button aria-busy={pending} className={`gap-2 ${pending ? "cursor-wait" : ""}`.trim()} disabled={disabled || pending} type="submit">
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
      {pending ? t(language, "Running import...", "Importerar...") : t(language, "Import", "Importera")}
    </Button>
  );
}

function SourceModeButton({
  active,
  description,
  disabled,
  Icon,
  label,
  onClick
}: {
  active?: boolean | undefined;
  description: string;
  disabled?: boolean | undefined;
  Icon: typeof FileUp;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`min-h-[132px] rounded-2xl border p-4 text-left transition ${
        active
          ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(47,95,152,0.18)]"
          : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/20"
      } ${disabled ? "cursor-not-allowed opacity-55 hover:border-border/70 hover:bg-background" : ""}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
          active ? "border-primary/30 bg-primary text-primary-foreground" : "border-border/70 bg-muted/30 text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-4 block text-sm font-semibold text-foreground">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span>
    </button>
  );
}

function ControlMirrorEvidenceContract({ language }: { language: AppLanguage }) {
  const steps = [
    t(language, "Connect evidence", "Koppla evidens"),
    t(language, "Classify source", "Klassificera källa"),
    t(language, "Review gaps", "Granska gap"),
    t(language, "Refresh mirror", "Uppdatera mirror")
  ];

  return (
    <div className="rounded-2xl border border-sky-200/80 bg-sky-50/55 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900/70">
            {t(language, "Control Mirror evidence contract", "Control Mirror evidence contract")}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-950/80">
            {t(
              language,
              "Control Mirror reads imported material as evidence. The strongest import gives it source, design, build, test and AI-governance signals in one reviewable chain.",
              "Control Mirror läser importerat material som evidens. Den starkaste importen ger källa, design, bygg, test och AI-governance i en granskningsbar kedja."
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-background px-3 py-1 text-xs font-medium text-sky-950" key={step}>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-[11px] text-white">{index + 1}</span>
              {step}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {controlEvidenceContract.map((item) => (
          <div className="rounded-2xl border border-sky-200/80 bg-background/80 p-3" key={item.label}>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">{t(language, item.label, item.svLabel)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(language, item.detail, item.svDetail)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlMirrorFileGuide({ language, mode }: { language: AppLanguage; mode: SourceMode }) {
  const items = [
    t(language, "Framing/PRD/UX/architecture documents in Markdown, text or JSON.", "Framing-, PRD-, UX- och arkitekturdokument i Markdown, text eller JSON."),
    t(language, "Epics, stories, acceptance criteria and Value Spine exports.", "Epics, stories, acceptanskriterier och Value Spine-exporter."),
    t(language, "Test plans, test results, QA notes, release notes or sprint status.", "Testplaner, testresultat, QA-noteringar, release notes eller sprintstatus."),
    t(language, "AI level decisions, governance notes and human review logs.", "AI-nivåbeslut, governance-noteringar och human review-loggar.")
  ];

  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
      <p className="text-sm font-semibold text-emerald-950">
        {mode === "folder"
          ? t(language, "Point to the project evidence folder.", "Peka ut mappen med projektunderlag.")
          : t(language, "Choose the files that prove the project state.", "Välj filerna som bevisar projektets läge.")}
      </p>
      <p className="mt-2 text-sm leading-6 text-emerald-950/80">
        {mode === "folder"
          ? t(
              language,
              "Use this when you have one local folder containing the documents below. The browser will only upload supported text-like files from the selected folder.",
              "Använd detta när du har en lokal mapp med dokumenten nedan. Webbläsaren laddar bara upp textlika filer som stöds från den valda mappen."
            )
          : t(
              language,
              "Use this when the evidence is spread across a few known files. You can select multiple files at once.",
              "Använd detta när underlaget ligger i några kända filer. Du kan välja flera filer samtidigt."
            )}
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-emerald-950/85 md:grid-cols-2">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-emerald-900/70">
        {t(
          language,
          "Supported now: .md, .mdx, .markdown, .txt, .json and .csv. Not screenshots, images, PDFs, ZIPs or raw code folders.",
          "Stöds nu: .md, .mdx, .markdown, .txt, .json och .csv. Inte screenshots, bilder, PDF:er, ZIP:ar eller råa kodmappar."
        )}
      </p>
    </div>
  );
}

export function SourceConnectionWizard({
  disabled,
  language,
  organizationName,
  sourceMode,
  summary,
  uploadAction
}: SourceConnectionWizardProps) {
  const [mode, setMode] = useState<SourceMode>(sourceMode === "folder" ? "folder" : "files");
  const controlMirrorContext = sourceMode === "control-mirror";
  const folderInputProps = mode === "folder" ? ({ directory: "", webkitdirectory: "" } as Record<string, string>) : {};
  const accept = ".md,.mdx,.markdown,.txt,.json,.csv,text/markdown,text/plain,application/json,text/csv";

  return (
    <Card className={`border-border/70 shadow-sm ${controlMirrorContext ? "shadow-[0_18px_60px_rgba(14,116,144,0.08)]" : ""}`.trim()}>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{t(language, "Connect project evidence", "Koppla projektunderlag")}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl">
              {t(
                language,
                `Choose the explicit source material Control Mirror should inspect for ${organizationName}. The browser can upload selected files or a selected folder snapshot, but it cannot read an arbitrary local root path without your selection.`,
                `Välj vilket explicit underlag Control Mirror ska kontrollera för ${organizationName}. Webbläsaren kan ladda upp valda filer eller ett valt mapp-snapshot, men den kan inte läsa en lokal root-katalog utan ditt val.`
              )}
            </CardDescription>
          </div>
          <Button asChild className="gap-2" variant="secondary">
            <Link href="/control-mirror">
              <Gauge className="h-4 w-4" />
              {t(language, "Open Control Mirror", "Öppna Control Mirror")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {controlMirrorContext ? <ControlMirrorEvidenceContract language={language} /> : null}

        {disabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            {t(
              language,
              "Import writes persisted intake sessions and is therefore disabled in Demo. Leave Demo, then open or create a normal project before uploading import artifacts.",
              "Import skriver sparade importsessioner och är därför avstängd i Demo. Lämna Demo och öppna eller skapa ett vanligt projekt innan du laddar upp importunderlag."
            )}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Link
            className="min-h-[132px] rounded-2xl border border-border/70 bg-background p-4 text-left transition hover:border-primary/40 hover:bg-muted/20"
            href="/control-mirror"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Database className="h-4 w-4" />
            </span>
            <span className="mt-4 block text-sm font-semibold text-foreground">{t(language, "Current imports", "Nuvarande importer")}</span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {summary
                ? t(
                    language,
                    `${summary.files} files, ${summary.candidateObjects} candidates, ${summary.humanReviewRequired} review queues.`,
                    `${summary.files} filer, ${summary.candidateObjects} kandidater, ${summary.humanReviewRequired} review-köer.`
                  )
                : t(language, "Use the project records already visible to Control Mirror.", "Använd projektets records som redan syns i Control Mirror.")}
            </span>
          </Link>
          <SourceModeButton
            active={mode === "files"}
            description={t(language, "Pick individual source files for a new persisted intake session.", "Välj enskilda källfiler för en ny sparad importsession.")}
            disabled={disabled}
            Icon={FileUp}
            label={t(language, "Upload files", "Ladda upp filer")}
            onClick={() => setMode("files")}
          />
          <SourceModeButton
            active={mode === "folder"}
            description={t(language, "Select a browser-visible folder and import supported files from it.", "Välj en mapp i webbläsaren och importera filer som stöds.")}
            disabled={disabled}
            Icon={FolderOpen}
            label={t(language, "Folder snapshot", "Mapp-snapshot")}
            onClick={() => setMode("folder")}
          />
          <div className="min-h-[132px] rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-left opacity-75">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground">
              <Archive className="h-4 w-4" />
            </span>
            <span className="mt-4 block text-sm font-semibold text-foreground">{t(language, "ZIP snapshot", "ZIP-snapshot")}</span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">
              {t(language, "Planned: requires safe extraction before it can be enabled.", "Planerad: kräver säker uppackning innan den kan aktiveras.")}
            </span>
          </div>
        </div>

        <form action={uploadAction} className="space-y-4 rounded-2xl border border-border/70 bg-muted/10 p-4">
          <input name="processingMode" type="hidden" value="ai_assisted" />
          <input name="sourceContext" type="hidden" value={controlMirrorContext ? "control-mirror" : ""} />
          <input name="sourceConnectionMode" type="hidden" value={mode} />
          {controlMirrorContext ? <ControlMirrorFileGuide language={language} mode={mode} /> : null}
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                {controlMirrorContext ? t(language, "Evidence target", "Evidensmål") : t(language, "Import target", "Importmål")}
              </span>
              <select
                className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                defaultValue="framing"
                name="importIntent"
              >
                <option value="framing">{t(language, "Import to Framing", "Importera till Framing")}</option>
                <option value="design">{t(language, "Import to Design", "Importera till Design")}</option>
              </select>
              {controlMirrorContext ? (
                <span className="block text-xs leading-5 text-muted-foreground">
                  {t(
                    language,
                    "Choose Framing for strategy, requirements, epics and stories. Choose Design only for UI/UX design evidence. Control Mirror reads either as evidence after import.",
                    "Välj Framing för strategi, krav, epics och stories. Välj Design bara för UI/UX-designunderlag. Control Mirror läser båda som evidens efter import."
                  )}
                </span>
              ) : null}
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground">
                {mode === "folder" ? t(language, "Project folder", "Projektmapp") : t(language, "Artifact files", "Importfiler")}
              </span>
              <input
                {...folderInputProps}
                accept={accept}
                className="block w-full rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:opacity-90"
                disabled={disabled}
                key={mode}
                multiple
                name="files"
                type="file"
              />
            </label>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {mode === "folder"
              ? t(
                  language,
                  "Supported files from the selected folder are imported as one session. Full relative-path preservation is a later slice.",
                  "Filer som stöds i den valda mappen importeras som en session. Full bevaring av relativa sökvägar är en senare slice."
                )
              : t(
                  language,
                  "Supported extensions: .md, .mdx, .markdown, .txt, .json, and .csv.",
                  "Filtyper som stöds: .md, .mdx, .markdown, .txt, .json och .csv."
                )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <SourceWizardSubmitButton disabled={disabled} language={language} />
            {controlMirrorContext ? (
              <>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/review?reviewStatusFilter=pending">
                    <ShieldCheck className="h-4 w-4" />
                    {t(language, "Open review queue", "Öppna review-kö")}
                  </Link>
                </Button>
                <Button asChild className="gap-2" variant="secondary">
                  <Link href="/control-mirror">
                    <Gauge className="h-4 w-4" />
                    {t(language, "Return to mirror", "Tillbaka till mirror")}
                  </Link>
                </Button>
              </>
            ) : null}
            {disabled ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href="/">
                  {t(language, "Leave Demo and choose project", "Lämna Demo och välj projekt")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
