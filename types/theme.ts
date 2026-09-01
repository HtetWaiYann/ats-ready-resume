export type TextRole =
  | "name"
  | "headline"
  | "sectionTitle"
  | "entryTitle"
  | "entrySubtitle"
  | "meta"
  | "body";

export type TextStyle = {
  fontSize: number; // pt (used as px in web preview, pt in PDF)
  fontWeight: 400 | 500 | 600 | 700;
  lineHeight: number;
  letterSpacing: number;
};

export type ResumeTheme = {
  fontFamily: string; // Google font family name, e.g. "Inter"
  colors: {
    name: string;
    headline: string;
    sectionTitle: string;
    rule: string;
    entryTitle: string;
    entrySubtitle: string;
    meta: string;
    body: string;
    link: string;
    accent: string; // language dots, skill chip accents
  };
  text: Record<TextRole, TextStyle>;
  sectionGap: number; // vertical space between sections
  titleContentGap: number; // space between a section's title and its content
  entryGap: number; // space between entries within a section
};

export const TEXT_ROLE_LABELS: Record<TextRole, string> = {
  name: "Name",
  headline: "Headline",
  sectionTitle: "Section title",
  entryTitle: "Entry title",
  entrySubtitle: "Entry subtitle",
  meta: "Meta / dates",
  body: "Body text",
};

export const COLOR_LABELS: Record<keyof ResumeTheme["colors"], string> = {
  name: "Name",
  headline: "Headline",
  sectionTitle: "Section title",
  rule: "Section rule",
  entryTitle: "Entry title",
  entrySubtitle: "Entry subtitle",
  meta: "Meta / dates",
  body: "Body text",
  link: "Links",
  accent: "Accent",
};
