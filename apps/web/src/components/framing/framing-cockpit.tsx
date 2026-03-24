"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useState } from "react";
import { AlertTriangle, ArrowRight, CircleCheckBig, Layers3, Search, Sparkles } from "lucide-react";
import type { FramingOutcomeItem } from "@aas-companion/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { createDraftOutcomeAction } from "@/app/(protected)/framing/actions";
import {
  initialCreateOutcomeActionState,
  type CreateOutcomeActionState
} from "@/lib/framing/create-outcome";

type FramingCockpitProps = {
  items: FramingOutcomeItem[];
  message: string;
  state: "live" | "empty";
  createAction: typeof createDraftOutcomeAction;
};

type OriginFilterKey = "all" | "native" | "demo";

function getReadinessClasses(item: FramingOutcomeItem) {
  if (item.readinessTone === "blocked") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (item.readinessTone === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

function getOriginLabel(originType: string) {
  if (originType === "seeded") {
    return "Demo";
  }

  if (originType === "native") {
    return "Native";
  }

  return "Imported";
}

function getOriginClasses(originType: string) {
  if (originType === "seeded") {
    return "border-violet-200 bg-violet-50 text-violet-800";
  }

  if (originType === "native") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-800";
}

function matchesOriginFilter(item: FramingOutcomeItem, filter: OriginFilterKey) {
  if (filter === "all") {
    return true;
  }

  if (filter === "native") {
    return item.originType === "native";
  }

  return item.originType === "seeded";
}

function matchesSearch(item: FramingOutcomeItem, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [item.key, item.title, item.ownerLabel, item.readinessLabel, item.readinessDetail].join(" ").toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function buildOriginFilters(items: FramingOutcomeItem[]) {
  const baseFilters = [
    {
      key: "all",
      label: "All",
      count: items.length
    },
    {
      key: "native",
      label: "Native",
      count: items.filter((item) => item.originType === "native").length
    }
  ];
  const demoCount = items.filter((item) => item.originType === "seeded").length;

  if (demoCount > 0) {
    baseFilters.push({
      key: "demo",
      label: "Demo",
      count: demoCount
    });
  }

  return baseFilters;
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button className="gap-2" disabled={pending} type="submit">
      {pending ? "Creating case..." : "Start new case"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function FramingCockpit({ items, message, state, createAction }: FramingCockpitProps) {
  const filters = buildOriginFilters(items);
  const [activeFilter, setActiveFilter] = useState<OriginFilterKey>("native");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [actionState, formAction, pending] = useActionState<CreateOutcomeActionState, FormData>(
    createAction,
    initialCreateOutcomeActionState
  );
  const demoEntryHref = items.find((item) => item.originType === "seeded")?.detailHref ?? null;
  const hasDemoItems = items.some((item) => item.originType === "seeded");
  const nativeItemCount = items.filter((item) => item.originType === "native").length;
  const blockedCount = items.filter((item) => item.isBlocked).length;
  const readyCount = items.filter((item) => item.readinessTone === "ready").length;

  const filteredItems = items.filter(
    (item) => matchesOriginFilter(item, activeFilter) && matchesSearch(item, deferredSearch.trim())
  );

  const emptyFilterState = items.length > 0 && filteredItems.length === 0;
  const showNativeEmptyState = activeFilter === "native" && nativeItemCount === 0 && emptyFilterState;
  const activeFilterLabel = filters.find((filter) => filter.key === activeFilter)?.label ?? "All";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.2),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(242,247,252,0.94))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Native-first framing
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Framing Cockpit</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{message}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-border/70 bg-background/92 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total outcomes</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{items.length}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Every active outcome visible inside this project context.</p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Blocked outcomes</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">{blockedCount}</p>
                <p className="mt-2 text-sm leading-6 text-amber-900/80">These still need baseline or framing cleanup.</p>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/85 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Ready outcomes</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-emerald-950">{readyCount}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-900/80">Can move forward without framing blockers.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-1">
              <Card className="border-sky-200 bg-sky-50/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-950">
                    <Sparkles className="h-4 w-4" />
                    Start a clean case
                  </CardTitle>
                  <CardDescription className="text-sky-900/80">
                    Create a fresh native draft Outcome and continue directly inside the project.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form action={formAction}>
                    <SubmitButton pending={pending} />
                  </form>
                  <p className="text-sm leading-6 text-sky-900/80">
                    Use this for real customer work. It opens a new native branch without pulling in demo state.
                  </p>
                </CardContent>
              </Card>

              {hasDemoItems ? (
                <Card className="border-border/70 bg-background/92 shadow-sm">
                  <CardHeader>
                    <CardTitle>Open demo case</CardTitle>
                    <CardDescription>
                      Explore Demo reference content intentionally without changing native case behavior.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {demoEntryHref ? (
                      <Button asChild className="gap-2" variant="secondary">
                        <Link href={demoEntryHref}>
                          Open demo case
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button className="gap-2" onClick={() => setActiveFilter("demo")} type="button" variant="secondary">
                        Open demo case
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <p className="text-sm leading-6 text-muted-foreground">
                      Demo stays available, but it is intentionally secondary to clean case creation.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <Card className="border-border/70 bg-background/92 shadow-sm">
              <CardHeader>
                <CardTitle>Control view</CardTitle>
                <CardDescription>
                  Keep the cockpit focused on the right outcomes before you dive into detail pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current view</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{activeFilterLabel}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Visible now</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{filteredItems.length}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Native focus</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{nativeItemCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {actionState.status === "error" && actionState.message ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionState.message}
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-border/70 bg-background/75 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Search outcomes</p>
              <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  aria-label="Search outcomes"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by key, title, owner, or readiness"
                  type="search"
                  value={search}
                />
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Origin filters</p>
              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max flex-wrap gap-2 px-1">
                  {filters.map((filter) => (
                    <button
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                        activeFilter === filter.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:text-foreground"
                      }`}
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key as OriginFilterKey)}
                      type="button"
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {state === "empty" ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No cases yet</CardTitle>
            <CardDescription>The cockpit is ready. Start a clean native case to begin framing work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>No native or demo outcomes are currently available for this organization.</p>
            <form action={formAction}>
              <SubmitButton pending={pending} />
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showNativeEmptyState ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No native cases yet</CardTitle>
            <CardDescription>Start a clean case now, or intentionally open demo content when you need an example.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <form action={formAction}>
              <SubmitButton pending={pending} />
            </form>
            {hasDemoItems && demoEntryHref ? (
              <Button asChild className="gap-2" variant="secondary">
                <Link href={demoEntryHref}>Open demo case</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : emptyFilterState ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No cases match the current filters</CardTitle>
            <CardDescription>Try another origin filter or clear the current search query.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {filteredItems.length > 0 ? (
        <div className="space-y-5">
          {filteredItems.map((item) => (
            <Card
              className={`h-full border shadow-sm ${
                item.isBlocked
                  ? "border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,255,255,0.98))]"
                  : "border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.92))]"
              }`}
              key={item.id}
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="space-y-5">
                  <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.key}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getReadinessClasses(item)}`}>
                          {item.readinessLabel}
                        </span>
                        <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          {item.statusLabel}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getOriginClasses(item.originType)}`}>
                          {getOriginLabel(item.originType)}
                        </span>
                        {item.importedReadinessState ? (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                            {item.importedReadinessState.replaceAll("_", " ")}
                          </span>
                        ) : null}
                        {item.isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Blocked
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{item.title}</h2>
                        <p className="max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{item.readinessDetail}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 2xl:w-auto 2xl:shrink-0">
                      <Button asChild className="gap-2">
                        <Link href={item.detailHref}>
                          Open Outcome
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      {item.lineageHref ? (
                        <Button asChild className="gap-2" variant="secondary">
                          <Link href={item.lineageHref}>Open Import Lineage</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Owner</p>
                          <p className="mt-2 text-foreground">{item.ownerLabel}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Baseline</p>
                          <p className="mt-2 text-foreground">{item.baselineComplete ? "Complete" : "Missing required fields"}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Linked work</p>
                          <p className="mt-2 text-foreground">
                            {item.epicCount} epic{item.epicCount === 1 ? "" : "s"} / {item.storyCount} story
                            {item.storyCount === 1 ? "" : "ies"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em]">Updated</p>
                          <p className="mt-2 text-foreground">{item.updatedAtLabel}</p>
                        </div>
                      </div>

                      {item.blockers.length > 0 ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
                          <p className="font-medium">Current blockers</p>
                          <ul className="mt-2 space-y-2">
                            {item.blockers.map((blocker) => (
                              <li className="flex items-start gap-2" key={`${item.id}-${blocker}`}>
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{blocker}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      {item.readinessTone === "ready" ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4 text-sm text-emerald-900">
                          <div className="flex items-center gap-2 font-medium">
                            <CircleCheckBig className="h-4 w-4" />
                            Ready for deeper framing
                          </div>
                          <p className="mt-2 leading-6">
                            This outcome can move further into the project without baseline blockers.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">Needs review</p>
                          <p className="mt-2 leading-6">
                            Inspect the outcome detail to continue framing and clear blockers.
                          </p>
                        </div>
                      )}

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Case posture</p>
                        <p className="mt-2 leading-6">
                          {item.originType === "native"
                            ? "This is a native project outcome and should remain the main working path."
                            : item.originType === "seeded"
                              ? "This is demo reference content. Use it intentionally, not as default project work."
                              : "This outcome came from imported source material and keeps its lineage into review."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
