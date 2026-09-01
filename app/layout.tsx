import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "ATS-Ready Resume",
  applicationName: "ATS-Ready Resume",
  authors: [{name: "Htet Wai Yan", url:"https://www.htetwaiyan.com"}],
  description: "ATS friendly lightweight local-only resume editor",
  keywords:["ATS", "Resume", "ATS-Ready", "ATS Friendly", "Resume Builder", "Free Resume Builder"],
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <Analytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
