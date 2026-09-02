import type {
  ResumeData,
  ResumeSection,
  ContactSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
} from "@/types/resume";
import type { ResumeTheme } from "@/types/theme";
import { parseRich, type Run } from "@/lib/richText";

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckGroup = "Structure" | "Content" | "Format";
export type AtsCheck = {
  id: string;
  group: CheckGroup;
  label: string;
  status: CheckStatus;
  detail: string; // one-line explanation / fix
  weight: number;
};
export type AtsReport = {
  score: number; // 0-100
  checks: AtsCheck[];
  counts: Record<CheckStatus, number>;
};

// --- text helpers ------------------------------------------------------------
const runsText = (runs: Run[]) => runs.map((r) => r.text).join("");

function bulletsOf(content: string): string[] {
  const out: string[] = [];
  for (const b of parseRich(content)) if (b.type === "ul") for (const it of b.items) out.push(runsText(it));
  return out;
}
function plainOf(content: string): string {
  return parseRich(content)
    .map((b) => (b.type === "p" ? runsText(b.runs) : b.items.map(runsText).join(" ")))
    .join(" ");
}
const wordCount = (s: string) => (s.trim().match(/\S+/g) ?? []).length;
const hasNumber = (s: string) => /\d/.test(s);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Openers that read as passive/duty-listing rather than achievement-oriented.
const WEAK_OPENERS = ["responsible for", "worked on", "helped", "duties included", "tasked with", "assisted with", "in charge of"];

type WithContent = { content: string };

/** All experience/projects/custom/education entry bodies, flattened to bullets. */
function allBullets(data: ResumeData): string[] {
  const out: string[] = [];
  for (const s of data.sections) {
    if (s.type === "experience" || s.type === "education" || s.type === "projects" || s.type === "custom") {
      for (const e of s.entries as WithContent[]) out.push(...bulletsOf(e.content));
    }
  }
  return out;
}

/** Everything a keyword scan should see, lowercased. */
export function resumeText(data: ResumeData): string {
  const parts: string[] = [];
  for (const s of data.sections) {
    switch (s.type) {
      case "contact":
        parts.push(s.data.fullName, s.data.headline ?? "");
        break;
      case "summary":
        parts.push(s.data.content);
        break;
      case "experience":
        for (const e of s.entries) parts.push(e.role, e.company, e.location ?? "", plainOf(e.content));
        break;
      case "education":
        for (const e of s.entries) parts.push(e.degree, e.school, e.location ?? "", plainOf(e.content));
        break;
      case "projects":
        for (const e of s.entries) parts.push(e.name, plainOf(e.content));
        break;
      case "skills":
        for (const g of s.groups) parts.push(g.category ?? "", g.skills.join(" "));
        break;
      case "certifications":
        for (const e of s.entries) parts.push(e.name, e.issuer);
        break;
      case "languages":
        for (const e of s.entries) parts.push(e.language);
        break;
      case "custom":
        for (const e of s.entries) parts.push(e.name, plainOf(e.content));
        break;
    }
  }
  return parts.join(" ").toLowerCase();
}

// --- the report --------------------------------------------------------------
export function runAtsChecks(data: ResumeData, theme: ResumeTheme, pages = 0): AtsReport {
  const checks: AtsCheck[] = [];
  const add = (group: CheckGroup, id: string, label: string, status: CheckStatus, detail: string, weight = 1) =>
    checks.push({ group, id, label, status, detail, weight });

  const contact = data.sections.find((s): s is ContactSection => s.type === "contact");
  const c = contact?.data;
  const visible = data.sections.filter((s) => s.visible && s.type !== "contact");
  const first = <T extends ResumeSection>(type: T["type"]) =>
    visible.find((s) => s.type === type) as T | undefined;

  // ---- Structure ----
  add("Structure", "email", "Email address", c && EMAIL_RE.test(c.email) ? "pass" : "fail",
    c && EMAIL_RE.test(c.email) ? "A valid, parseable email is present." : "Add a valid email — it's the field ATS keys on most.", 3);
  add("Structure", "phone", "Phone number", c?.phone ? "pass" : "warn",
    c?.phone ? "Phone number present." : "Add a phone number so recruiters can reach you.", 1);
  add("Structure", "location", "Location", c?.location ? "pass" : "warn",
    c?.location ? "Location present." : "Add a city/region — many ATS filter on location.", 1);
  const hasLink = !!(c && (c.linkedin || c.portfolio || c.website || c.github || c.otherLinks.length));
  add("Structure", "links", "Professional link", hasLink ? "pass" : "warn",
    hasLink ? "At least one profile/portfolio link present." : "Add a LinkedIn or portfolio link.", 1);

  const exp = first<ExperienceSection>("experience");
  add("Structure", "experience", "Experience section", exp && exp.entries.length ? "pass" : "fail",
    exp && exp.entries.length ? `${exp.entries.length} experience entr${exp.entries.length === 1 ? "y" : "ies"}.` : "Add a work-experience section with at least one entry.", 3);
  const edu = first<EducationSection>("education");
  add("Structure", "education", "Education section", edu && edu.entries.length ? "pass" : "warn",
    edu && edu.entries.length ? "Education present." : "Add an education section.", 1);
  const skills = first<SkillsSection>("skills");
  const skillCount = skills ? skills.groups.reduce((n, g) => n + g.skills.length, 0) : 0;
  add("Structure", "skills", "Skills section", skillCount >= 5 ? "pass" : skillCount ? "warn" : "warn",
    skillCount >= 5 ? `${skillCount} skills listed.` : skillCount ? "List more skills — ATS matches these directly." : "Add a skills section with the tools/keywords you want matched.", 2);
  const summary = first<SummarySection>("summary");
  const summaryWords = summary ? wordCount(summary.data.content) : 0;
  add("Structure", "summary", "Summary", summaryWords ? "pass" : "warn",
    summaryWords ? "Summary present." : "Add a short professional summary at the top.", 1);

  // dates on every experience entry
  const missingDates = exp ? exp.entries.filter((e) => !e.startDate.trim()).length : 0;
  if (exp && exp.entries.length)
    add("Structure", "dates", "Employment dates", missingDates ? "warn" : "pass",
      missingDates ? `${missingDates} experience entr${missingDates === 1 ? "y is" : "ies are"} missing a start date.` : "Every experience entry has dates.", 1);

  // standard, ATS-recognizable section headers
  const titleOk = (s: ResumeSection | undefined, words: string[]) =>
    !s || words.some((w) => s.title.toLowerCase().includes(w));
  const headersOk = titleOk(exp, ["experience", "employment", "work"]) && titleOk(edu, ["education", "academic"]) && titleOk(skills, ["skill", "technolog", "competenc"]);
  add("Structure", "headers", "Standard section titles", headersOk ? "pass" : "warn",
    headersOk ? "Section headings use conventional, ATS-recognized names." : "Rename core sections to conventional headings (e.g. “Experience”, “Education”, “Skills”).", 1);

  // ---- Content ----
  const bullets = allBullets(data);
  const emptyExp = exp ? exp.entries.filter((e) => !bulletsOf(e.content).length && !plainOf(e.content).trim()).length : 0;
  if (exp && exp.entries.length)
    add("Content", "bullets", "Experience detail", emptyExp ? "warn" : "pass",
      emptyExp ? `${emptyExp} experience entr${emptyExp === 1 ? "y has" : "ies have"} no bullet points.` : "Every experience entry has detail.", 2);

  const weak = bullets.filter((b) => WEAK_OPENERS.some((w) => b.trim().toLowerCase().startsWith(w))).length;
  add("Content", "weak", "Action-oriented wording", weak ? "warn" : "pass",
    weak ? `${weak} bullet${weak === 1 ? "" : "s"} start with passive phrasing like “responsible for”. Lead with an action verb.` : "Bullets lead with action verbs.", 1);

  const quantified = bullets.filter(hasNumber).length;
  const quantRatio = bullets.length ? quantified / bullets.length : 0;
  add("Content", "quantified", "Quantified impact", quantRatio >= 0.25 ? "pass" : "warn",
    bullets.length ? `${quantified} of ${bullets.length} bullets include a number. Aim for measurable results (%, $, counts).` : "Add bullets with measurable results.", 2);

  const totalWords = wordCount(resumeText(data));
  const lenStatus: CheckStatus = totalWords < 180 ? "warn" : totalWords > 1000 ? "warn" : "pass";
  add("Content", "length", "Overall length", lenStatus,
    totalWords < 180 ? `Only ~${totalWords} words — looks thin. Add more detail.` : totalWords > 1000 ? `~${totalWords} words — consider trimming for focus.` : `~${totalWords} words — a healthy length.`, 1);

  if (summaryWords)
    add("Content", "summaryLen", "Summary length", summaryWords >= 15 && summaryWords <= 90 ? "pass" : "warn",
      summaryWords >= 15 && summaryWords <= 90 ? "Summary is a good length." : summaryWords < 15 ? "Summary is very short — 2–4 sentences works best." : "Summary is long — tighten to 2–4 sentences.", 1);

  // ---- Format ----
  add("Format", "layout", "Column layout", theme.layout === "one" ? "pass" : "warn",
    theme.layout === "one" ? "Single-column — safest for ATS reading order." : "Two-column layouts can scramble reading order in some ATS. Switch to single-column if in doubt.", 2);
  if (pages > 0)
    add("Format", "pages", "Page count", pages <= 2 ? "pass" : "warn",
      pages <= 2 ? `${pages} page${pages === 1 ? "" : "s"}.` : `${pages} pages — most roles expect 1–2.`, 1);
  add("Format", "machine", "Machine-readable", "pass",
    "Exports as real selectable text with live links and embedded fonts — no images or scanned content.", 1);

  const counts: Record<CheckStatus, number> = { pass: 0, warn: 0, fail: 0 };
  let got = 0;
  let max = 0;
  for (const ch of checks) {
    counts[ch.status]++;
    got += ch.weight * (ch.status === "pass" ? 1 : ch.status === "warn" ? 0.5 : 0);
    max += ch.weight;
  }
  const score = max ? Math.round((got / max) * 100) : 0;
  return { score, checks, counts };
}

// --- job-description keyword match ------------------------------------------
const STOP = new Set(
  "a an the and or but for nor to of in on at by with from as is are was were be been being this that these those you your we our they their it its i me my he she his her them us will would can could should shall may might must have has had do does did not no so if then than too very just about into over under out up down more most such our your all any each which who whom whose what when where why how also per within across via etc using use used work working experience team teams role responsible ability strong excellent good great new plus".split(
    /\s+/,
  ),
);

// Boilerplate that shows up in nearly every JD but isn't a real skill/keyword.
const JD_STOP = new Set(
  "years year experience required require preferred candidate candidates ideal looking join company companies opportunity responsibilities responsibility requirements requirement qualifications qualification knowledge understanding proficiency proficient familiarity familiar background degree bachelor master equivalent field environment position member members must nice looking include includes including".split(
    /\s+/,
  ),
);

// Crude, *consistent* suffix strip so "developed"/"developing"/"development" collide on match.
// ponytail: not a real stemmer — good enough for matching; swap in a stemmer lib if misses matter.
function stem(w: string): string {
  if (w.length >= 6) w = w.replace(/(ing|ed|ment|tions?)$/, "");
  if (w.length >= 5) w = w.replace(/(es|s)$/, "");
  return w;
}

const words = (s: string): string[] =>
  (s.toLowerCase().match(/[a-z0-9][a-z0-9+#.]*/g) ?? [])
    .map((w) => w.replace(/\.+$/, "")) // keep "node.js", drop sentence-ending "kubernetes."
    .filter((w) => w.length >= 2 && !STOP.has(w) && !JD_STOP.has(w) && !/^\d+$/.test(w));

/** Unigrams (len>=3) + adjacent two-word phrases, e.g. "machine learning". */
function candidates(s: string): string[] {
  const w = words(s);
  const out: string[] = [];
  for (let i = 0; i < w.length; i++) {
    if (w[i].length >= 3) out.push(w[i]);
    if (i + 1 < w.length) out.push(w[i] + " " + w[i + 1]);
  }
  return out;
}

export type KeywordMatch = { coverage: number; matched: string[]; missing: string[]; total: number };

/** Top keywords from a job description and whether the resume covers them. */
export function keywordMatch(jd: string, data: ResumeData, limit = 30): KeywordMatch {
  const freq = new Map<string, number>();
  for (const c of candidates(jd)) freq.set(c, (freq.get(c) ?? 0) + 1);
  // Phrases only survive if they recur (>=2) — filters random cross-sentence pairs; prefer phrases on ties.
  const ranked = [...freq.entries()]
    .filter(([k, n]) => (k.includes(" ") ? n >= 2 : true))
    .sort((a, b) => b[1] - a[1] || Number(b[0].includes(" ")) - Number(a[0].includes(" ")));

  const keywords: string[] = [];
  for (const [k] of ranked) {
    if (keywords.length >= limit) break;
    // Drop a unigram already contained in a chosen phrase ("learning" once "machine learning" is in).
    if (!k.includes(" ") && keywords.some((p) => p.includes(" ") && p.split(" ").includes(k))) continue;
    keywords.push(k);
  }

  const have = new Set(words(resumeText(data)).map(stem));
  const has = (k: string) => k.split(" ").every((t) => have.has(stem(t)));
  const matched = keywords.filter(has);
  const missing = keywords.filter((k) => !has(k));
  return { coverage: keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0, matched, missing, total: keywords.length };
}

// self-check: `ATS_SELFCHECK=1 npx tsx lib/atsCheck.ts`
if (process.env.ATS_SELFCHECK) {
  const data: ResumeData = {
    sections: [
      { id: "c", type: "contact", title: "Contact", visible: true, column: "main", data: { fullName: "A B", email: "a@b.com", phone: "1", location: "X", otherLinks: [], linkedin: "in/x" } },
      { id: "e", type: "experience", title: "Experience", visible: true, column: "main", entries: [{ id: "e1", company: "Co", role: "Dev", startDate: "2020", endDate: "2022", isCurrent: false, content: "- Built X serving 3000 users\n- Responsible for stuff" }] },
      { id: "sk", type: "skills", title: "Skills", visible: true, column: "sidebar", displayStyle: "flat", groups: [{ id: "g", skills: ["react", "node", "python", "aws", "typescript"] }] },
    ],
  };
  const theme = { layout: "one" } as ResumeTheme;
  const rep = runAtsChecks(data, theme, 1);
  console.assert(rep.checks.find((c) => c.id === "email")!.status === "pass", "email pass");
  console.assert(rep.checks.find((c) => c.id === "weak")!.status === "warn", "weak opener flagged");
  console.assert(rep.checks.find((c) => c.id === "layout")!.status === "pass", "one-col pass");
  console.assert(rep.score > 60 && rep.score <= 100, `score in range, got ${rep.score}`);
  const km = keywordMatch(
    "Looking for a React and Python developer. Developing machine learning pipelines on AWS and Kubernetes. Machine learning experience required.",
    data,
  );
  console.assert(km.matched.includes("react") && km.matched.includes("python"), "matched react/python");
  console.assert(km.missing.includes("kubernetes"), "kubernetes missing");
  console.assert(km.missing.includes("machine learning"), "recurring phrase extracted, got: " + km.missing.join(","));
  console.assert(!km.missing.includes("candidate") && !km.missing.includes("required"), "boilerplate dropped");
  console.log("ats self-check ok", { score: rep.score, coverage: km.coverage, missing: km.missing.slice(0, 5) });
}
