import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { CustomCursor, LoadingVeil, ScrollProgress, ToastRail } from "@/components/chrome";
import { AppProviders } from "@/components/providers";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "POLARIS · Polar Science Outreach & Knowledge Repository",
    template: "%s · POLARIS",
  },
  description:
    "Integrated polar science outreach, knowledge repository and media dissemination portal for the Ministry of Earth Sciences, Government of India. Search 24 expedition reports semantically, generate citation-locked outreach content, and publish through a governed editorial workflow.",
  keywords: [
    "polar science",
    "Antarctic",
    "Arctic",
    "Ministry of Earth Sciences",
    "NCPOR",
    "knowledge repository",
    "outreach",
  ],
  applicationName: "POLARIS",
  authors: [{ name: "Ministry of Earth Sciences, Government of India" }],
  openGraph: {
    title: "POLARIS · Polar Science Outreach & Knowledge Repository",
    description:
      "Citation-locked outreach from India's polar expedition archive. SIH26063 prototype.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#04080f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Inter:opsz,wght@14..32,300..700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-bg text-ink antialiased">
        <AppProviders>
          <LoadingVeil />
          <ScrollProgress />
          <CustomCursor />
          <ToastRail />
          <div className="grain-overlay" aria-hidden="true" />
          <div
            className="ultra-glow left-0 bg-[radial-gradient(ellipse_at_left,transparent,var(--accent))] hidden 2xl:block"
            aria-hidden="true"
          />
          <div
            className="ultra-glow right-0 bg-[radial-gradient(ellipse_at_right,transparent,var(--aurora-fill))] hidden 2xl:block"
            aria-hidden="true"
          />
          <SiteShell>{children}</SiteShell>
        </AppProviders>
      </body>
    </html>
  );
}
