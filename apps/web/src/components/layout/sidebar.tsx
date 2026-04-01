"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CircleHelp, Compass, Eye, EyeOff, FileSearch, Inbox, LayoutDashboard, LibraryBig, Shield, Workflow } from "lucide-react";
import { primaryNavigation } from "@aas-companion/domain/navigation";

const icons = {
  "/": LayoutDashboard,
  "/intake": Inbox,
  "/review": FileSearch,
  "/framing": Compass,
  "/pricing": BriefcaseBusiness,
  "/outcomes": Workflow,
  "/stories": LibraryBig,
  "/workspace": Workflow,
  "/governance": Shield,
  "/help": CircleHelp
} as const;

type SidebarProps = {
  activeProjectName?: string;
  activeSectionLabel?: string;
};

const GUIDANCE_STORAGE_KEY = "aas-guidance-visible";

export function Sidebar({ activeProjectName, activeSectionLabel }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const returnTo = pathname === "/help" ? "/" : pathname;
  const [guidanceVisible, setGuidanceVisible] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(GUIDANCE_STORAGE_KEY);
    const visible = stored !== "false";
    setGuidanceVisible(visible);
    document.documentElement.dataset.guidanceVisible = visible ? "true" : "false";
  }, []);

  useEffect(() => {
    window.localStorage.setItem(GUIDANCE_STORAGE_KEY, guidanceVisible ? "true" : "false");
    document.documentElement.dataset.guidanceVisible = guidanceVisible ? "true" : "false";
  }, [guidanceVisible]);

  return (
    <aside className="rounded-[28px] border border-border/70 bg-[#102033] px-4 py-5 text-slate-50 shadow-[0_18px_65px_rgba(15,23,42,0.18)] xl:max-h-[calc(100vh-2.5rem)] xl:overflow-auto">
      <div className="space-y-6">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AAS Companion</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Project-scoped framing, import, governance and delivery work.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Current location</p>
          <p className="mt-3 text-base font-semibold text-white">
            {activeProjectName ?? "No project selected"}
          </p>
          <div className="mt-3 space-y-2">
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Section</p>
              <p className="mt-1 text-sm font-medium text-white">
                {activeSectionLabel ?? "Choose a project in Home first"}
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              {activeSectionLabel
                ? "The highlighted navigation item below matches the workspace you are in now."
                : "Choose a project in Home, then continue through its sections here."}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Guidance</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Toggle method guidance on or off across the work views.
          </p>
          <button
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/14"
            onClick={() => setGuidanceVisible((current) => !current)}
            type="button"
          >
            {guidanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {guidanceVisible ? "Hide guidance" : "Show guidance"}
          </button>
        </div>

        <nav className="space-y-2">
          {primaryNavigation.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? LayoutDashboard;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const href =
              item.href === "/help"
                ? {
                    pathname: item.href,
                    query: { returnTo }
                  }
                : item.href;

            return (
              <Link
                className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                  active ? "border border-white/20 bg-white text-slate-950 shadow-sm" : "bg-white/5 text-slate-100 hover:bg-white/10"
                }`}
                key={item.href}
                href={href}
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
      </div>
      <style jsx global>{`
        :root[data-guidance-visible="false"] .guidance-block,
        :root[data-guidance-visible="false"] .framing-inline-guidance,
        :root[data-guidance-visible="false"] .framing-guidance-copy {
          display: none !important;
        }
      `}</style>
    </aside>
  );
}
