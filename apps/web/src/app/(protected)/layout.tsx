import type { ReactNode } from "react";
import { requireProtectedSession } from "@/lib/auth/guards";

type ProtectedLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  await requireProtectedSession();

  return children;
}
