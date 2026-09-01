export type ID = string; // uuid

export type BaseSection = {
  id: ID;
  title: string; // user-editable display label, e.g. "Work Experience"
  visible: boolean;
  column: "main" | "sidebar";
};

export type ContactSection = BaseSection & {
  type: "contact";
  data: {
    fullName: string;
    headline?: string;
    email: string; // mailto:
    phone: string; // tel:
    location: string;
    website?: string; // https://
    linkedin?: string; // https://
    github?: string;
    portfolio?: string; // https://
    otherLinks: { id: ID; label: string; url: string }[];
    photoUrl?: string;
  };
};

export type SummarySection = BaseSection & {
  type: "summary";
  data: { content: string };
};

export type ExperienceEntry = {
  id: ID;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  content: string; // markdown-lite: paragraphs + "- " bullets
};
export type ExperienceSection = BaseSection & {
  type: "experience";
  entries: ExperienceEntry[];
};

export type EducationEntry = {
  id: ID;
  school: string;
  degree: string;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  content: string; // markdown-lite: paragraphs + "- " bullets
};
export type EducationSection = BaseSection & {
  type: "education";
  entries: EducationEntry[];
};

export type SkillGroup = {
  id: ID;
  category?: string;
  skills: string[];
};
export type SkillsSection = BaseSection & {
  type: "skills";
  displayStyle: "grouped" | "flat";
  groups: SkillGroup[];
};

export type ProjectEntry = {
  id: ID;
  name: string;
  url?: string; // https://
  content: string; // markdown-lite: paragraphs + "- " bullets
};
export type ProjectsSection = BaseSection & {
  type: "projects";
  entries: ProjectEntry[];
};

export type CertificationEntry = {
  id: ID;
  name: string;
  issuer: string;
  issueDate?: string;
};
export type CertificationsSection = BaseSection & {
  type: "certifications";
  entries: CertificationEntry[];
};

export type LanguageEntry = {
  id: ID;
  language: string;
  proficiency:
    | "Native"
    | "Fluent"
    | "Advanced"
    | "Professional"
    | "Conversational"
    | "Basic";
};
export type LanguagesSection = BaseSection & {
  type: "languages";
  entries: LanguageEntry[];
};

export type CustomEntry = {
  id: ID;
  name: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  // Freeform markdown-lite: blank-line paragraphs; lines starting with -/*/• are bullets.
  content: string;
};
export type CustomSection = BaseSection & { type: "custom"; entries: CustomEntry[] };

export type ResumeSection =
  | ContactSection
  | SummarySection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CertificationsSection
  | LanguagesSection
  | CustomSection;

export type SectionType = ResumeSection["type"];

export type ResumeData = {
  sections: ResumeSection[]; // ARRAY ORDER = DISPLAY ORDER within each column
};
