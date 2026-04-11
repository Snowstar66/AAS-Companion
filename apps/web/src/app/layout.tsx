import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { NavigationPendingState } from "@/components/layout/navigation-pending-state";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "AAS Control Plane",
  description: "AAS-governed control plane for framing, tollgates, and build handoff."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={manrope.variable} lang="en">
      <body>
        <Suspense fallback={null}>
          <NavigationPendingState />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
