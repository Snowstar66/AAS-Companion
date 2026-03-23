import type { ReactNode } from "react";
import { RightRail } from "@/components/layout/right-rail";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type TopbarProps } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  rightRail?: ReactNode;
  topbarProps?: TopbarProps;
};

export function AppShell({ children, rightRail, topbarProps }: AppShellProps) {
  return (
    <div className="min-h-screen p-4 text-foreground sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1680px] grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <Sidebar />
        <div className="flex min-h-full flex-col gap-4">
          <Topbar {...topbarProps} />
          <main className="flex-1 rounded-[28px] border border-border/70 bg-background/85 p-6 shadow-[0_18px_65px_rgba(15,23,42,0.06)] backdrop-blur">
            {children}
          </main>
        </div>
        {rightRail ?? <RightRail />}
      </div>
    </div>
  );
}
