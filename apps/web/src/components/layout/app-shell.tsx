import type { ReactNode } from "react";
import { RightRail } from "@/components/layout/right-rail";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type TopbarProps } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  rightRail?: ReactNode;
  topbarProps?: TopbarProps;
  activeProjectName?: string;
};

export function AppShell({ children, rightRail, topbarProps, activeProjectName }: AppShellProps) {
  const sidebarProps = {
    ...(activeProjectName || topbarProps?.projectName
      ? { activeProjectName: activeProjectName ?? topbarProps?.projectName ?? "" }
      : {}),
    ...(topbarProps?.sectionLabel ?? topbarProps?.title
      ? { activeSectionLabel: topbarProps?.sectionLabel ?? topbarProps?.title }
      : {})
  };

  return (
    <div className="min-h-screen p-3 text-foreground sm:p-5">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1920px] grid-cols-1 gap-5 xl:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[248px_minmax(0,1fr)_292px]">
        <div className="xl:sticky xl:top-5 xl:self-start">
          <Sidebar {...sidebarProps} />
        </div>
        <div className="flex min-h-full min-w-0 flex-col gap-5">
          <Topbar {...topbarProps} />
          <main className="flex-1 rounded-[28px] border border-border/70 bg-background/85 p-5 shadow-[0_18px_65px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 xl:p-7">
            {children}
          </main>
        </div>
        <div className="order-3 xl:col-start-2 2xl:col-start-3 2xl:sticky 2xl:top-5 2xl:self-start">
          {rightRail ?? <RightRail />}
        </div>
      </div>
    </div>
  );
}
