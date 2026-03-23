import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
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
      <body>{children}</body>
    </html>
  );
}
