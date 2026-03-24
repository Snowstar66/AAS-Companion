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
  return [
    {
      key: "all",
      label: "All",
      count: items.length
    },
    {
      key: "native",
      label: "Native",
      count: items.filter((item) => item.originType === "native").length
    },
    {
      key: "demo",
      label: "Demo",
      count: items.filter((item) => item.originType === "seeded").length
    }
  ];
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
  const nativeItemCount = items.filter((item) => item.originType === "native").length;

  const filteredItems = items.filter(
    (item) => matchesOriginFilter(item, activeFilter) && matchesSearch(item, deferredSearch.trim())
  );

  const emptyFilterState = items.length > 0 && filteredItems.length === 0;
  const showNativeEmptyState = activeFilter === "native" && nativeItemCount === 0 && emptyFilterState;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,420px)]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Native-first framing
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Framing Cockpit</h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{message}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Card className="border-sky-200 bg-sky-50/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-950">
                  <Sparkles className="h-4 w-4" />
                  Start a clean case
                </CardTitle>
                <CardDescription className="text-sky-900/80">
                  Create a fresh native draft Outcome and continue directly in Outcome Workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <form action={formAction}>
                  <SubmitButton pending={pending} />
                </form>
                <p className="text-sm text-sky-900/80">This is the default path for real customer work.</p>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Open demo case</CardTitle>
                <CardDescription>Explore seeded example content intentionally without changing native case behavior.</CardDescription>
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
                <p className="text-sm text-muted-foreground">Demo stays available, but it is secondary to clean case creation.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {actionState.status === "error" && actionState.message ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionState.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Find the right outcome</CardTitle>
            <CardDescription>Filter by origin or search by key, title, owner, or readiness signal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                aria-label="Search outcomes"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search outcomes"
                type="search"
                value={search}
              />
            </label>
            <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Working posture</CardTitle>
            <CardDescription>Native is the default working view so real customer cases stay in focus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use Start new case for clean customer work that begins with a draft native Outcome.</p>
            <p>Switch to Demo only when you want seeded reference material.</p>
            <p>Readiness and Tollgate behavior stay the same once a case is opened in Outcome Workspace.</p>
          </CardContent>
        </Card>
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
            {demoEntryHref ? (
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
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card
              className={`border shadow-sm ${
                item.isBlocked
                  ? "border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,255,255,0.98))]"
                  : "border-border/70"
              }`}
              key={item.id}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-4">
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
                      <h2 className="text-2xl font-semibold tracking-tight">{item.title}</h2>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{item.readinessDetail}</p>
                    </div>

                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
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

                  <div className="flex shrink-0 flex-col gap-3 xl:w-[220px]">
                    <Button asChild className="gap-2">
                      <Link href={item.detailHref}>
                        Open Outcome Workspace
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {item.lineageHref ? (
                      <Button asChild className="gap-2" variant="secondary">
                        <Link href={item.lineageHref}>Open Import Lineage</Link>
                      </Button>
                    ) : null}
                    {item.readinessTone === "ready" ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                        <div className="flex items-center gap-2 font-medium">
                          <CircleCheckBig className="h-4 w-4" />
                          Ready for deeper framing
                        </div>
                        <p className="mt-2 leading-6">This outcome can move into the workspace without baseline blockers.</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Needs review</p>
                        <p className="mt-2 leading-6">Inspect the outcome detail to continue framing and clear blockers.</p>
                      </div>
                    )}
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
