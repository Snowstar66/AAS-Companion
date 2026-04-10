import type { TraceabilityEvidenceRow } from "@/lib/outcomes/traceability-evidence";

type AppLanguage = "en" | "sv";

function t(language: AppLanguage, en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function classifyTraceabilityRow(row: TraceabilityEvidenceRow) {
  if (row.sourceOriginIds.includes("ADDED")) {
    return {
      labelEn: "Outside handshake",
      labelSv: "Utanför handslag",
      classes: "border-amber-200 bg-amber-50 text-amber-900"
    };
  }

  if (row.sourceOriginIds.some((originId) => originId.startsWith("NFR-"))) {
    return {
      labelEn: "NFR-backed",
      labelSv: "NFR-stödd",
      classes: "border-violet-200 bg-violet-50 text-violet-900"
    };
  }

  return {
    labelEn: "Handshake-backed",
    labelSv: "Handslagsstödd",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900"
  };
}

function toReadableList(entries: string[]) {
  return entries.map((entry) => entry.split("/").pop() ?? entry);
}

function formatImplementationStoryLabel(row: TraceabilityEvidenceRow) {
  const storyIds = row.epicStoryIds.join(" | ");

  if (row.epicId && storyIds) {
    return `${row.epicId} / ${storyIds}`;
  }

  return storyIds || row.epicId || null;
}

export function TraceabilityEvidenceLibrary({
  language,
  rows
}: {
  language: AppLanguage;
  rows: TraceabilityEvidenceRow[];
}) {
  const sortedRows = [...rows].sort((left, right) => {
    const refinedCompare = left.refinedStoryId.localeCompare(right.refinedStoryId, "en");

    if (refinedCompare !== 0) {
      return refinedCompare;
    }

    return left.matchKey.localeCompare(right.matchKey, "en");
  });
  const outsideHandshakeCount = rows.filter((row) => row.sourceOriginIds.includes("ADDED")).length;
  const nfrBackedCount = rows.filter((row) => row.sourceOriginIds.some((originId) => originId.startsWith("NFR-"))).length;
  const handshakeBackedCount = rows.length - outsideHandshakeCount - nfrBackedCount;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t(language, "Imported traceability stories", "Importerade traceability-stories")}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {t(
              language,
              "Expand any refined story below to read the imported intent, expected behavior, acceptance summary, definition of done and the linked code or test evidence.",
              "Expandera valfri förfinad story nedan för att läsa importerad intention, förväntat beteende, accepteranskriteriesammanfattning, definition of done och länkad kod- eller testevidens."
            )}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700">
            {t(language, "Handshake-backed:", "Handslagsstödda:")} {handshakeBackedCount}
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white/90 px-3 py-2 text-sm text-slate-700">
            {t(language, "NFR-backed:", "NFR-stödda:")} {nfrBackedCount}
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/90 px-3 py-2 text-sm text-slate-700">
            {t(language, "Outside handshake:", "Utanför handslag:")} {outsideHandshakeCount}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {sortedRows.map((row, index) => {
          const classification = classifyTraceabilityRow(row);
          const implementationStoryLabel = formatImplementationStoryLabel(row);

          return (
            <details
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm open:border-sky-200 open:bg-sky-50/20"
              key={row.matchKey}
              open={index === 0}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">
                        {row.refinedStoryId} {row.refinedStoryTitle}
                      </p>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classification.classes}`}>
                        {language === "sv" ? classification.labelSv : classification.labelEn}
                      </span>
                      {row.implementationStatus ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                          {t(language, "Status:", "Status:")} {row.implementationStatus}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium">{t(language, "Origins:", "Ursprung:")}</span>{" "}
                      {row.sourceOriginIds.join(" | ") || t(language, "Not captured", "Ej fångat")}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-medium">{t(language, "Implementation story:", "Implementationsstory:")}</span>{" "}
                      {implementationStoryLabel ?? t(language, "Not captured", "Ej fångat")}
                      {row.epicStoryTitle ? ` - ${row.epicStoryTitle}` : ""}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                    {t(language, "Artifacts:", "Artefakter:")} {row.implementationArtifacts.length}
                    {" · "}
                    {t(language, "Tests:", "Tester:")} {row.testEvidence.length}
                    {" · "}
                    {t(language, "Code refs:", "Kodreferenser:")} {row.codeEvidence.length}
                  </div>
                </div>
              </summary>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Source mapping", "Källmappning")}
                    </p>
                    {row.sourceOriginNote ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">{row.sourceOriginNote}</p>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t(language, "No additional mapping note was captured.", "Ingen extra mappningsnotering fångades.")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Refined story intent", "Förfinad story-intention")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-medium">{t(language, "Value intent:", "Value intent:")}</span>{" "}
                      {row.sourceValueIntent ?? t(language, "Not captured", "Ej fångat")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-medium">{t(language, "Expected behavior:", "Förväntat beteende:")}</span>{" "}
                      {row.sourceExpectedBehavior ?? t(language, "Not captured", "Ej fångat")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Acceptance and done", "Acceptans och done")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-medium">{t(language, "Acceptance summary:", "Acceptanssammanfattning:")}</span>{" "}
                      {row.acceptanceCriteriaSummary ?? t(language, "Not captured", "Ej fångat")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      <span className="font-medium">{t(language, "Definition of done:", "Definition of done:")}</span>{" "}
                      {row.definitionOfDone ?? t(language, "Not captured", "Ej fångat")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Implementation artifacts", "Implementationsartefakter")}
                    </p>
                    {row.implementationArtifacts.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {toReadableList(row.implementationArtifacts).map((artifact) => (
                          <li key={artifact}>{artifact}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t(language, "No implementation artifact was captured.", "Ingen implementationsartefakt fångades.")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Test evidence", "Testevidens")}
                    </p>
                    {row.testEvidence.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {toReadableList(row.testEvidence).map((testEvidence) => (
                          <li key={testEvidence}>{testEvidence}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t(language, "No test evidence was captured.", "Ingen testevidens fångades.")}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t(language, "Code evidence", "Kodevidens")}
                    </p>
                    {row.codeEvidence.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                        {toReadableList(row.codeEvidence).map((codeEvidence) => (
                          <li key={codeEvidence}>{codeEvidence}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {t(language, "No code evidence was captured.", "Ingen kodevidens fångades.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
