import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import Providers from "./providers";
import ViewportGuard from "@/components/ViewportGuard";

const SITE_URL = "https://resume.htetwaiyan.com";
const DESCRIPTION = "ATS-friendly, lightweight, local-only resume editor. Build and export a clean, parseable resume — no account, no server, your data stays in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ATS-Ready Resume",
    template: "%s · ATS-Ready Resume",
  },
  applicationName: "ATS-Ready Resume",
  description: DESCRIPTION,
  authors: [{ name: "Htet Wai Yan", url: SITE_URL }],
  creator: "Htet Wai Yan",
  publisher: "Htet Wai Yan",
  keywords: ["ATS", "Resume", "ATS-Ready", "ATS Friendly", "Resume Builder", "Free Resume Builder"],
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "ATS-Ready Resume",
    title: "ATS-Ready Resume",
    description: DESCRIPTION,
    images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512, alt: "ATS-Ready Resume" }],
  },
  twitter: {
    card: "summary",
    title: "ATS-Ready Resume",
    description: DESCRIPTION,
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <ViewportGuard />
      </body>
    </html>
  );
}
