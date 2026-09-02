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

export type DesignPreset =
  | "minimal"
  | "modern"
  | "classic"
  | "compact"
  | "executive"
  | "technical"
  | "elegant"
  | "panel"
  | "custom";

export type ResumeTheme = {
  // Named design the theme came from; flips to "custom" the moment any knob is
  // hand-edited. Purely informational — the renderers read the knobs below.
  preset: DesignPreset;
  layout: "one" | "two"; // single column (ATS-safest) vs main + sidebar
  sidebarSide: "left" | "right"; // two-col only
  sidebarRatio: number; // sidebar width as % of the two-col grid
  sidebarTint: string; // background behind sidebar; "" = none
  columnGap: number; // px gap between the two columns

  // Header
  headerAlign: "left" | "center" | "right";
  contactIcons: boolean; // show icons before phone/email/links
  contactLayout: "inline" | "stacked"; // wrap in a row vs one per line
  headerRule: boolean; // full-width rule under the header block
  nameCase: "upper" | "normal";

  // Headings
  headingStyle: "underline" | "plain" | "accent" | "bar"; // section-title treatment
  headingAlign: "left" | "center";
  headingCase: "upper" | "normal";

  // Entries / density
  entryDateAlign: "below" | "right"; // dates under the title vs right-aligned
  entryDivider: "dashed" | "solid" | "none";
  bulletStyle: "disc" | "dash" | "none";
  linkUnderline: boolean;
  pagePadX: number; // horizontal page padding (px @ preview scale)
  pagePadY: number; // vertical page padding

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
