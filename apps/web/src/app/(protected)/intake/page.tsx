import { Inbox, Upload } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { AppShell } from "@/components/layout/app-shell";
import { ArtifactIntakeRightRail } from "@/components/intake/artifact-intake-right-rail";
import { loadArtifactIntakeWorkspace } from "@/lib/intake/workspace";
import { uploadArtifactIntakeFilesAction } from "./actions";

type ArtifactIntakePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  return `${(value / 1024).toFixed(1)} KB`;
}

function getStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getConfidenceClasses(confidence: "high" | "medium" | "low") {
  if (confidence === "high") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (confidence === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function getMappingClasses(state: "mapped" | "uncertain" | "missing") {
  if (state === "mapped") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (state === "uncertain") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function formatKindLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ArtifactIntakePage({ searchParams }: ArtifactIntakePageProps) {
  const query = searchParams ? await searchParams : {};
  const workspace = await loadArtifactIntakeWorkspace();
  const error = getParamValue(query.error);
  const message = getParamValue(query.message);
  const latestSessionId = getParamValue(query.sessionId);

  return (
    <AppShell
      rightRail={<ArtifactIntakeRightRail summary={workspace.summary} />}
      topbarProps={{
        eyebrow: "AAS Companion",
        title: "Artifact Intake",
        badge: "Stories M2-002 / M2-003"
      }}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Inbox className="h-3.5 w-3.5 text-primary" />
            Intake before promotion
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Artifact Intake workspace</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
            Upload markdown delivery artifacts, classify their source shape, parse candidate sections, and map reviewable
            Outcome, Epic, and Story candidates without auto-approving compliance.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
        ) : null}

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Upload markdown artifacts</CardTitle>
            <CardDescription>
              Supported extensions: <strong>.md</strong>, <strong>.mdx</strong>, and <strong>.markdown</strong>. Uploads are
              grouped into a persisted intake session for {workspace.organizationName}, then classified and mapped for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadArtifactIntakeFilesAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Artifact files</span>
                <input
                  accept=".md,.mdx,.markdown,text/markdown"
                  className="block w-full rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:opacity-90"
                  multiple
                  name="files"
                  type="file"
                />
              </label>
              <Button className="gap-2" type="submit">
                <Upload className="h-4 w-4" />
                Create intake session
              </Button>
            </form>
          </CardContent>
        </Card>

        {workspace.state === "unavailable" ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Artifact Intake is unavailable</CardTitle>
              <CardDescription>The route is online, but the persisted intake data could not be loaded.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{workspace.message}</CardContent>
          </Card>
        ) : workspace.sessions.length === 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>No intake sessions yet</CardTitle>
              <CardDescription>{workspace.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {workspace.sessions.map((artifactSession) => (
              <Card
                className={`border-border/70 shadow-sm ${latestSessionId === artifactSession.id ? "ring-2 ring-primary/30" : ""}`}
                key={artifactSession.id}
              >
                <CardHeader className="gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle>{artifactSession.label}</CardTitle>
                      <CardDescription className="mt-2">
                        Created {formatDate(artifactSession.createdAt)} by{" "}
                        {artifactSession.creator?.fullName ?? artifactSession.creator?.email ?? "Unknown uploader"} for{" "}
                        {workspace.organizationName}.
                      </CardDescription>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {getStatusLabel(artifactSession.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Files</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{artifactSession.files.length}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Parsed sections</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {artifactSession.files.reduce((count, file) => count + file.parsedSectionCount, 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Candidates</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{artifactSession.candidateCount}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Unmapped sections</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{artifactSession.unmappedSectionCount}</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border/70">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/35 text-left text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-medium">File</th>
                          <th className="px-4 py-3 font-medium">Classification</th>
                          <th className="px-4 py-3 font-medium">Parsed sections</th>
                          <th className="px-4 py-3 font-medium">Uploader</th>
                          <th className="px-4 py-3 font-medium">Uploaded</th>
                          <th className="px-4 py-3 font-medium">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {artifactSession.files.map((file) => (
                          <tr key={file.id}>
                            <td className="px-4 py-3 align-top">
                              <div>
                                <p className="font-medium text-foreground">{file.fileName}</p>
                                <p className="text-xs text-muted-foreground">{file.extension}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                  {file.sourceType ? getStatusLabel(file.sourceType) : getStatusLabel(file.sourceTypeStatus)}
                                </span>
                                {file.sourceTypeConfidence ? (
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getConfidenceClasses(file.sourceTypeConfidence)}`}
                                  >
                                    {file.sourceTypeConfidence} confidence
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="space-y-1">
                                <p className="text-muted-foreground">{file.parsedSectionCount} section(s)</p>
                                {file.parsedArtifacts?.sections.slice(0, 2).map((section) => (
                                  <p className="text-xs text-muted-foreground" key={section.id}>
                                    {formatKindLabel(section.kind)}: {section.title}
                                  </p>
                                ))}
                                {file.parsedSectionCount > 2 ? (
                                  <p className="text-xs text-muted-foreground">
                                    +{file.parsedSectionCount - 2} more parsed section(s)
                                  </p>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {file.uploader?.fullName ?? file.uploader?.email ?? "Unknown uploader"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(file.uploadedAt)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatBytes(file.sizeBytes)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {artifactSession.mappedArtifacts ? (
                    <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-lg font-semibold tracking-tight">Candidate AAS objects</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            These are mapped candidates only. They remain reversible, organization-scoped, and pending human review.
                          </p>
                        </div>
                        <div className="grid gap-3">
                          {artifactSession.mappedArtifacts.candidates.map((candidate) => (
                            <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={candidate.id}>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {candidate.type}
                                  </p>
                                  <h3 className="mt-2 text-base font-semibold text-foreground">{candidate.title}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getMappingClasses(candidate.mappingState)}`}
                                  >
                                    {candidate.mappingState}
                                  </span>
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getMappingClasses(candidate.relationshipState)}`}
                                  >
                                    relationship {candidate.relationshipState}
                                  </span>
                                </div>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">{candidate.summary}</p>
                              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                                  {getStatusLabel(candidate.source.sourceType)}
                                </span>
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 ${getConfidenceClasses(candidate.source.confidence)}`}
                                >
                                  {candidate.source.confidence} confidence
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                                  {candidate.source.fileName}
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1">
                                  {candidate.source.sectionMarker}
                                </span>
                              </div>
                              {candidate.relationshipNote ? (
                                <p className="mt-3 text-sm text-muted-foreground">{candidate.relationshipNote}</p>
                              ) : null}
                              {candidate.acceptanceCriteria.length > 0 ? (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Acceptance criteria
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {candidate.acceptanceCriteria.map((criterion) => (
                                      <span
                                        className="inline-flex rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                                        key={`${candidate.id}-${criterion}`}
                                      >
                                        {criterion}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {candidate.testNotes.length > 0 ? (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Test notes
                                  </p>
                                  <div className="mt-2 space-y-2">
                                    {candidate.testNotes.map((note) => (
                                      <p className="text-sm text-muted-foreground" key={`${candidate.id}-${note}`}>
                                        {note}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Human review queue
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {artifactSession.uncertainCandidateCount} candidate(s) need a closer look, and{" "}
                            {artifactSession.unmappedSectionCount} section(s) stayed visible instead of being silently dropped.
                          </p>
                        </div>

                        <Card className="border-border/70 shadow-none">
                          <CardHeader>
                            <CardTitle>Unmapped source sections</CardTitle>
                            <CardDescription>These sections need human interpretation before any promotion step.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {artifactSession.mappedArtifacts.unmappedSections.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No unmapped sections remain in this session.</p>
                            ) : (
                              artifactSession.mappedArtifacts.unmappedSections.map((section) => (
                                <div className="rounded-2xl border border-border/70 bg-background/80 p-4" key={section.id}>
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{section.title}</p>
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {section.sourceReference.fileName} • {section.sourceReference.sectionMarker} • lines{" "}
                                        {section.sourceReference.lineStart}-{section.sourceReference.lineEnd}
                                      </p>
                                    </div>
                                    <span
                                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getConfidenceClasses(section.confidence)}`}
                                    >
                                      {section.confidence} confidence
                                    </span>
                                  </div>
                                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.text}</p>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
