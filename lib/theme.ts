import type { ResumeTheme } from "@/types/theme";

// Curated Google fonts that all ship weights 400/500/600/700 (needed so the
// weight control renders distinctly in the PDF). slug = @fontsource package.
export const FONTS: { name: string; slug: string }[] = [
  { name: "Inter", slug: "inter" },
  { name: "Poppins", slug: "poppins" },
  { name: "Montserrat", slug: "montserrat" },
  { name: "Open Sans", slug: "open-sans" },
  { name: "Source Sans 3", slug: "source-sans-3" },
  { name: "Work Sans", slug: "work-sans" },
  { name: "Nunito Sans", slug: "nunito-sans" },
  { name: "Raleway", slug: "raleway" },
];

export const FONT_WEIGHTS = [400, 500, 600, 700] as const;

const slugFor = (family: string) =>
  FONTS.find((f) => f.name === family)?.slug ?? "inter";

// ponytail: fontsource .woff (not woff2) — react-pdf/fontkit inflates woff
// reliably; woff2 needs brotli wasm and is flakier.
export const woffUrl = (family: string, weight: number) =>
  `https://cdn.jsdelivr.net/npm/@fontsource/${slugFor(family)}/files/${slugFor(family)}-latin-${weight}-normal.woff`;

/** Google Fonts stylesheet href for the web preview. */
export const googleCssHref = (family: string) =>
  `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@${FONT_WEIGHTS.join(";")}&display=swap`;

export const DEFAULT_THEME: ResumeTheme = {
  fontFamily: "Inter",
  colors: {
    name: "#111827",
    headline: "#2563eb",
    sectionTitle: "#111827",
    rule: "#111827",
    entryTitle: "#111827",
    entrySubtitle: "#2563eb",
    meta: "#6b7280",
    body: "#374151",
    link: "#2563eb",
    accent: "#2563eb",
  },
  text: {
    name: { fontSize: 30, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.5 },
    headline: { fontSize: 15, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    sectionTitle: { fontSize: 15, fontWeight: 700, lineHeight: 1.1, letterSpacing: 0.3 },
    entryTitle: { fontSize: 14, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    entrySubtitle: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
    meta: { fontSize: 11, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0 },
    body: { fontSize: 11.5, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
  },
  sectionGap: 20,
  titleContentGap: 10,
  entryGap: 12,
};
