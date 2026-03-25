"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ViewerSession } from "@/lib/auth/session";

const ViewerSessionContext = createContext<ViewerSession | null>(null);

export function ViewerSessionProvider({
  children,
  session
}: {
  children: ReactNode;
  session: ViewerSession | null;
}) {
  return <ViewerSessionContext.Provider value={session}>{children}</ViewerSessionContext.Provider>;
}

export function useViewerSession() {
  return useContext(ViewerSessionContext);
}
