"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useState } from "react";
import { AlertTriangle, ArrowRight, CircleCheckBig, Layers3, Plus, Search } from "lucide-react";
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

type FilterKey = "all" | "blocked" | string;

function getReadinessClasses(item: FramingOutcomeItem) {
  if (item.readinessTone === "blocked") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (item.readinessTone === "ready") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

function matchesFilter(item: FramingOutcomeItem, filter: FilterKey) {
  if (filter === "all") {
    return true;
  }

  if (filter === "blocked") {
    return item.isBlocked;
  }

  return item.status === filter;
}

function matchesSearch(item: FramingOutcomeItem, search: string) {
  if (!search) {
    return true;
  }

  const haystack = [item.key, item.title, item.ownerLabel, item.readinessLabel, item.readinessDetail].join(" ").toLowerCase();
  return haystack.includes(search.toLowerCase());
}

function buildFilters(items: FramingOutcomeItem[]) {
  const statusEntries = Array.from(new Set(items.map((item) => item.status))).map((status) => ({
    key: status,
    label: items.find((item) => item.status === status)?.statusLabel ?? status,
    count: items.filter((item) => item.status === status).length
  }));

  return [
    {
      key: "all",
      label: "All",
      count: items.length
    },
    {
      key: "blocked",
      label: "Blocked",
      count: items.filter((item) => item.isBlocked).length
    },
    ...statusEntries
  ];
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button className="gap-2" disabled={pending} type="submit">
      {pending ? "Creating outcome..." : "Create draft outcome"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function FramingCockpit({ items, message, state, createAction }: FramingCockpitProps) {
  const filters = buildFilters(items);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(state === "empty");
  const deferredSearch = useDeferredValue(search);
  const [actionState, formAction, pending] = useActionState<CreateOutcomeActionState, FormData>(
    createAction,
    initialCreateOutcomeActionState
  );

  const filteredItems = items.filter(
    (item) => matchesFilter(item, activeFilter) && matchesSearch(item, deferredSearch.trim())
  );

  const emptyFilterState = items.length > 0 && filteredItems.length === 0;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(57,86,122,0.16),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,248,252,0.92))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Story M1-005
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Framing Cockpit</h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{message}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="gap-2" onClick={() => setComposerOpen((value) => !value)} type="button">
              <Plus className="h-4 w-4" />
              {composerOpen ? "Hide new outcome" : "Start new outcome"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Find the right outcome</CardTitle>
            <CardDescription>Filter by posture or search by key, title, owner, or readiness signal.</CardDescription>
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
                  onClick={() => setActiveFilter(filter.key)}
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
            <CardTitle>Quick framing notes</CardTitle>
            <CardDescription>Use blocked markers first when triaging which outcome to inspect next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Blocked outcomes surface missing baseline evidence or a blocked Tollgate 1 record.</p>
            <p>Ready outcomes can move directly into the Outcome Workspace for deeper framing work.</p>
            <p>Creation here stays intentionally small: a draft record and a handoff into the workspace route.</p>
          </CardContent>
        </Card>
      </div>

      {composerOpen ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Create a draft outcome</CardTitle>
            <CardDescription>Start a new framing record without widening into the full workspace flow yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={formAction} className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-end">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Outcome key</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  defaultValue={actionState.values.key}
                  name="key"
                  placeholder="OUT-003"
                  type="text"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">Outcome title</span>
                <input
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                  defaultValue={actionState.values.title}
                  name="title"
                  placeholder="Describe the framing goal"
                  type="text"
                />
              </label>
              <SubmitButton pending={pending} />
            </form>

            {actionState.status === "error" && actionState.message ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionState.message}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {state === "empty" ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No outcomes yet</CardTitle>
            <CardDescription>The cockpit is ready. Create the first outcome to start framing work.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No seeded or manually created outcomes are currently available for this organization.
          </CardContent>
        </Card>
      ) : null}

      {emptyFilterState ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No outcomes match the current filters</CardTitle>
            <CardDescription>Try another status filter or clear the current search query.</CardDescription>
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
