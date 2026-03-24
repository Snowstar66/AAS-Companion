"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, FileSearch, Inbox, LayoutDashboard, LibraryBig, Shield, Workflow } from "lucide-react";
import { primaryNavigation } from "@aas-companion/domain";

const icons = {
  "/": LayoutDashboard,
  "/intake": Inbox,
  "/review": FileSearch,
  "/framing": Compass,
  "/outcomes": Workflow,
  "/stories": LibraryBig,
  "/workspace": Workflow,
  "/governance": Shield
} as const;

type SidebarProps = {
  activeProjectName?: string;
  activeSectionLabel?: string;
};

export function Sidebar({ activeProjectName, activeSectionLabel }: SidebarProps) {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="rounded-[28px] border border-border/70 bg-[#102033] px-4 py-5 text-slate-50 shadow-[0_18px_65px_rgba(15,23,42,0.18)] xl:max-h-[calc(100vh-2.5rem)] xl:overflow-auto">
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            Level 2 active
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AAS Companion</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Governed AI execution with traceability, tollgates, and outcome clarity.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Active project</p>
          <p className="mt-3 text-base font-semibold text-white">
            {activeProjectName ?? "No project selected"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {activeSectionLabel
              ? `Current section: ${activeSectionLabel}`
              : "Choose a project in Home, then continue through its sections here."}
          </p>
        </div>

        <nav className="space-y-2">
          {primaryNavigation.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? LayoutDashboard;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                  active ? "bg-white text-slate-950" : "bg-white/5 text-slate-100 hover:bg-white/10"
                }`}
                key={item.href}
                href={item.href}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-slate-300"}`} />
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className={`mt-1 text-sm leading-5 ${active ? "text-slate-600" : "text-slate-300"}`}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Stop rule</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            M2 work follows strict order and must stop again after M2-STORY-003 for human review.
          </p>
        </div>
      </div>
    </aside>
  );
}
