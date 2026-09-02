import type { ResumeTheme, TextRole, TextStyle } from "@/types/theme";

// Curated Google fonts that all ship weights 400/500/600/700 (needed so the
// weight control renders distinctly in the PDF). slug = @fontsource package.
export const FONTS: { name: string; slug: string; serif?: boolean }[] = [
  { name: "Inter", slug: "inter" },
  { name: "Poppins", slug: "poppins" },
  { name: "Montserrat", slug: "montserrat" },
  { name: "Open Sans", slug: "open-sans" },
  { name: "Source Sans 3", slug: "source-sans-3" },
  { name: "Work Sans", slug: "work-sans" },
  { name: "Nunito Sans", slug: "nunito-sans" },
  { name: "Raleway", slug: "raleway" },
  { name: "Lora", slug: "lora", serif: true },
];

/** CSS font stack with the right generic fallback (web preview only). */
export const fontStack = (family: string) =>
  `'${family}', ${FONTS.find((f) => f.name === family)?.serif ? "serif" : "sans-serif"}`;

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

const BASE_COLORS: ResumeTheme["colors"] = {
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
};

const BASE_TEXT: Record<TextRole, TextStyle> = {
  name: { fontSize: 30, fontWeight: 700, lineHeight: 1.05, letterSpacing: -0.5 },
  headline: { fontSize: 15, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
  sectionTitle: { fontSize: 15, fontWeight: 700, lineHeight: 1.1, letterSpacing: 0.3 },
  entryTitle: { fontSize: 14, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
  entrySubtitle: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
  meta: { fontSize: 11, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0 },
  body: { fontSize: 11.5, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
};

// Shallow-merge text-role overrides onto the base scale.
type TextOver = Partial<Record<TextRole, Partial<TextStyle>>>;
const mkText = (over: TextOver): Record<TextRole, TextStyle> => {
  const out = {} as Record<TextRole, TextStyle>;
  for (const k of Object.keys(BASE_TEXT) as TextRole[]) out[k] = { ...BASE_TEXT[k], ...over[k] };
  return out;
};

// Layout knobs whose defaults reproduce the original fixed template, so every
// preset can spread these and override only what makes it distinctive.
const LAYOUT_DEFAULTS = {
  sidebarSide: "right",
  sidebarRatio: 37,
  sidebarTint: "",
  columnGap: 28,
  headerAlign: "left",
  contactIcons: true,
  contactLayout: "inline",
  headerRule: false,
  nameCase: "upper",
  headingStyle: "underline",
  headingAlign: "left",
  headingCase: "upper",
  entryDateAlign: "below",
  entryDivider: "dashed",
  bulletStyle: "disc",
  linkUnderline: false,
  pagePadX: 44,
  pagePadY: 48,
} satisfies Partial<ResumeTheme>;

// --- Modern: the default. Two-column, blue accent, ruled headings. ---
const MODERN: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "modern",
  layout: "two",
  fontFamily: "Inter",
  colors: BASE_COLORS,
  text: BASE_TEXT,
  sectionGap: 20,
  titleContentGap: 10,
  entryGap: 12,
};

// --- Minimal: single column, monochrome, plain tracked headings, airy. ---
const MINIMAL: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "minimal",
  layout: "one",
  headingStyle: "plain",
  contactIcons: false,
  entryDivider: "none",
  bulletStyle: "dash",
  fontFamily: "Inter",
  colors: { ...BASE_COLORS, headline: "#6b7280", entrySubtitle: "#111827", link: "#111827", accent: "#111827", meta: "#9ca3af" },
  text: mkText({
    name: { fontSize: 28 },
    sectionTitle: { fontSize: 12, fontWeight: 600, letterSpacing: 1.6 },
    body: { lineHeight: 1.5 },
  }),
  sectionGap: 26,
  titleContentGap: 12,
  entryGap: 16,
};

// --- Classic: single column, centered serif header, full ruled headings. ---
const CLASSIC: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "classic",
  layout: "one",
  headerAlign: "center",
  contactIcons: false,
  headerRule: true,
  entryDateAlign: "right",
  fontFamily: "Lora",
  colors: { ...BASE_COLORS, headline: "#374151", entrySubtitle: "#111827", link: "#1f2937", accent: "#111827", body: "#1f2937" },
  text: mkText({
    name: { fontSize: 32, letterSpacing: 0 },
    sectionTitle: { fontSize: 13, letterSpacing: 1 },
    body: { fontSize: 11.5, lineHeight: 1.5 },
  }),
  sectionGap: 20,
  titleContentGap: 8,
  entryGap: 12,
};

// --- Compact: two-column, small type, tight spacing, plain headings. ---
const COMPACT: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "compact",
  layout: "two",
  headingStyle: "plain",
  sidebarRatio: 34,
  columnGap: 20,
  entryDivider: "none",
  pagePadX: 38,
  pagePadY: 38,
  fontFamily: "Inter",
  colors: BASE_COLORS,
  text: mkText({
    name: { fontSize: 24, letterSpacing: -0.3 },
    headline: { fontSize: 12.5 },
    sectionTitle: { fontSize: 11.5, letterSpacing: 0.6 },
    entryTitle: { fontSize: 11.5 },
    entrySubtitle: { fontSize: 10.5 },
    meta: { fontSize: 9.5 },
    body: { fontSize: 10, lineHeight: 1.32 },
  }),
  sectionGap: 12,
  titleContentGap: 6,
  entryGap: 8,
};

// --- Executive: serif, tinted left sidebar, ruled header, right-aligned dates. ---
const EXECUTIVE: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "executive",
  layout: "two",
  sidebarSide: "left",
  sidebarRatio: 35,
  sidebarTint: "#f3f4f6",
  headerRule: true,
  entryDateAlign: "right",
  contactIcons: false,
  fontFamily: "Lora",
  colors: { ...BASE_COLORS, name: "#1e293b", headline: "#334155", sectionTitle: "#1e293b", rule: "#1e3a5f", entrySubtitle: "#1e3a5f", meta: "#64748b", body: "#1f2937", link: "#1e3a5f", accent: "#1e3a5f" },
  text: mkText({
    name: { fontSize: 29, letterSpacing: 0 },
    sectionTitle: { fontSize: 12.5, letterSpacing: 1 },
    body: { fontSize: 11, lineHeight: 1.46 },
  }),
  sectionGap: 18,
  titleContentGap: 9,
  entryGap: 12,
};

// --- Technical: bar headings, teal accent, dash bullets, denser two-col. ---
const TECHNICAL: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "technical",
  layout: "two",
  sidebarRatio: 34,
  columnGap: 22,
  headingStyle: "bar",
  bulletStyle: "dash",
  entryDivider: "none",
  fontFamily: "Source Sans 3",
  colors: { ...BASE_COLORS, headline: "#0d9488", sectionTitle: "#0f172a", entrySubtitle: "#0d9488", meta: "#64748b", body: "#334155", link: "#0d9488", accent: "#0d9488" },
  text: mkText({
    name: { fontSize: 26, letterSpacing: -0.3 },
    headline: { fontSize: 13 },
    sectionTitle: { fontSize: 12, letterSpacing: 0.6 },
    entryTitle: { fontSize: 12.5 },
    entrySubtitle: { fontSize: 11 },
    meta: { fontSize: 10 },
    body: { fontSize: 10.5, lineHeight: 1.36 },
  }),
  sectionGap: 15,
  titleContentGap: 7,
  entryGap: 10,
};

// --- Elegant: single column, centered serif, spaced small headings, roomy. ---
const ELEGANT: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "elegant",
  layout: "one",
  headerAlign: "center",
  headingAlign: "center",
  headingStyle: "plain",
  headingCase: "normal",
  contactIcons: false,
  entryDivider: "none",
  fontFamily: "Lora",
  colors: { ...BASE_COLORS, name: "#292524", headline: "#78716c", sectionTitle: "#44403c", entrySubtitle: "#292524", meta: "#a8a29e", body: "#3f3c39", link: "#44403c", accent: "#b45309" },
  text: mkText({
    name: { fontSize: 33, fontWeight: 600, letterSpacing: 0.5 },
    headline: { fontSize: 14, fontWeight: 400 },
    sectionTitle: { fontSize: 12.5, fontWeight: 600, letterSpacing: 2.4 },
    body: { fontSize: 11.5, lineHeight: 1.55 },
  }),
  sectionGap: 26,
  titleContentGap: 12,
  entryGap: 16,
};

// --- Panel: indigo-tinted left sidebar, plain headings, modern sans. ---
const PANEL: ResumeTheme = {
  ...LAYOUT_DEFAULTS,
  preset: "panel",
  layout: "two",
  sidebarSide: "left",
  sidebarRatio: 36,
  sidebarTint: "#eef2ff",
  headingStyle: "plain",
  fontFamily: "Work Sans",
  colors: { ...BASE_COLORS, headline: "#4f46e5", sectionTitle: "#312e81", entrySubtitle: "#4f46e5", meta: "#6b7280", body: "#374151", link: "#4f46e5", accent: "#4f46e5" },
  text: mkText({
    name: { fontSize: 28 },
    sectionTitle: { fontSize: 12.5, letterSpacing: 1 },
  }),
  sectionGap: 20,
  titleContentGap: 10,
  entryGap: 12,
};

export const PRESETS = {
  minimal: MINIMAL,
  modern: MODERN,
  classic: CLASSIC,
  compact: COMPACT,
  executive: EXECUTIVE,
  technical: TECHNICAL,
  elegant: ELEGANT,
  panel: PANEL,
} as const;

export const PRESET_LIST: { key: keyof typeof PRESETS; label: string; ats: boolean }[] = [
  { key: "minimal", label: "Minimal", ats: true },
  { key: "modern", label: "Modern", ats: false },
  { key: "classic", label: "Classic", ats: true },
  { key: "compact", label: "Compact", ats: false },
  { key: "executive", label: "Executive", ats: false },
  { key: "technical", label: "Technical", ats: false },
  { key: "elegant", label: "Elegant", ats: true },
  { key: "panel", label: "Panel", ats: false },
];

export const DEFAULT_THEME: ResumeTheme = MODERN;
