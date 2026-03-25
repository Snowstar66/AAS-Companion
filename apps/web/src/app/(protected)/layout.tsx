import type { ReactNode } from "react";
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { requireProtectedSession } from "@/lib/auth/guards";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await requireProtectedSession();

  return <ViewerSessionProvider session={session}>{children}</ViewerSessionProvider>;
}
