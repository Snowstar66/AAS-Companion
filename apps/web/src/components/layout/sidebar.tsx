"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CircleHelp,
  Compass,
  Eye,
  EyeOff,
  FileSearch,
  Inbox,
  LayoutDashboard,
  LibraryBig,
  Settings2,
  Shield,
  Workflow
} from "lucide-react";
import { primaryNavigation } from "@aas-companion/domain/navigation";
import { getLocalizedNavigationCopy, translateSectionLabel } from "@/components/layout/app-language.data";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import { FlagIcon } from "@/components/shared/flag-icon";

const icons = {
  "/": LayoutDashboard,
  "/admin": Settings2,
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
  const { language, setLanguage, content } = useAppChromeLanguage();
  const adminItem = primaryNavigation.find((item) => item.href === "/admin") ?? null;
  const mainNavigationItems = primaryNavigation.filter((item) => item.href !== "/admin");
  const translatedSectionLabel = translateSectionLabel(activeSectionLabel, language);
  const localizedAdmin = adminItem
    ? getLocalizedNavigationCopy(
        adminItem.href,
        {
          label: adminItem.label,
          description: adminItem.description
        },
        language
      )
    : null;

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
      <div className="flex min-h-full flex-col gap-6">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AAS Companion</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">{content.sidebarIntro}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/12 to-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">{content.currentLocation}</p>
          <p className="mt-3 text-base font-semibold text-white">{activeProjectName ?? content.noProjectSelected}</p>
          <div className="mt-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{content.sectionLabel}</p>
              <p className="mt-1 text-sm font-medium text-white">{translatedSectionLabel ?? content.chooseProjectFirst}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {mainNavigationItems.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? LayoutDashboard;
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const localizedCopy = getLocalizedNavigationCopy(
              item.href,
              {
                label: item.label,
                description: item.description
              },
              language
            );
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
                  <p className="font-medium">{localizedCopy.label}</p>
                  <p className={`mt-1 text-sm leading-5 ${active ? "text-slate-600" : "text-slate-300"}`}>{localizedCopy.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          {adminItem && localizedAdmin ? (
            <Link
              className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition ${
                pathname === adminItem.href || pathname.startsWith(`${adminItem.href}/`)
                  ? "border border-white/20 bg-white text-slate-950 shadow-sm"
                  : "bg-white/5 text-slate-100 hover:bg-white/10"
              }`}
              href={adminItem.href}
            >
              <Settings2
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  pathname === adminItem.href || pathname.startsWith(`${adminItem.href}/`) ? "text-primary" : "text-slate-300"
                }`}
              />
              <div>
                <p className="font-medium">{localizedAdmin.label}</p>
                <p
                  className={`mt-1 text-sm leading-5 ${
                    pathname === adminItem.href || pathname.startsWith(`${adminItem.href}/`) ? "text-slate-600" : "text-slate-300"
                  }`}
                >
                  {localizedAdmin.description}
                </p>
              </div>
            </Link>
          ) : null}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-2">
            <div className="flex items-center gap-1">
              <button
                aria-label="Switch app language to English"
                aria-pressed={language === "en"}
                className={`inline-flex h-8 w-12 items-center justify-center rounded-xl text-sm transition ${
                  language === "en"
                    ? "border border-white/30 bg-white/10 text-white shadow-sm"
                    : "border border-transparent text-slate-200 hover:border-white/15 hover:bg-white/10"
                }`}
                onClick={() => setLanguage("en")}
                type="button"
              >
                <FlagIcon className="h-4 w-6" country="gb" />
              </button>
              <button
                aria-label="Switch app language to Swedish"
                aria-pressed={language === "sv"}
                className={`inline-flex h-8 w-12 items-center justify-center rounded-xl text-sm transition ${
                  language === "sv"
                    ? "border border-white/30 bg-white/10 text-white shadow-sm"
                    : "border border-transparent text-slate-200 hover:border-white/15 hover:bg-white/10"
                }`}
                onClick={() => setLanguage("sv")}
                type="button"
              >
                <FlagIcon className="h-4 w-6" country="se" />
              </button>
            </div>
            <button
              className="inline-flex min-h-10 max-w-[132px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-center text-xs font-medium leading-4 text-slate-300 transition hover:bg-white/8 hover:text-white"
              onClick={() => setGuidanceVisible((current) => !current)}
              type="button"
            >
              {guidanceVisible ? <EyeOff className="h-3.5 w-3.5 shrink-0" /> : <Eye className="h-3.5 w-3.5 shrink-0" />}
              <span className="whitespace-normal break-words">
                {guidanceVisible ? content.hideGuidance : content.showGuidance}
              </span>
            </button>
          </div>
        </div>
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
