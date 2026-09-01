import type { ResumeData, ResumeSection } from "@/types/resume";
import { httpsHref } from "@/lib/links";
import { parseRich, type Run } from "@/lib/richText";

const runsToText = (runs: Run[]) => runs.map((r) => r.text).join("");

// Markdown content → indented plain-text lines (strips **/*, keeps bullets).
function renderRich(content: string): string[] {
  const out: string[] = [];
  for (const b of parseRich(content)) {
    if (b.type === "p") out.push(`  ${runsToText(b.runs)}`);
    else for (const item of b.items) out.push(`  • ${runsToText(item)}`);
  }
  return out;
}

export function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

function dateRange(start: string, end: string, isCurrent: boolean) {
  const e = isCurrent ? "Present" : end;
  return [start, e].filter(Boolean).join(" – ");
}

export function toPlainText(data: ResumeData): string {
  const out: string[] = [];
  const contact = data.sections.find((s) => s.type === "contact");
  if (contact && contact.type === "contact") {
    const d = contact.data;
    out.push(d.fullName.toUpperCase());
    if (d.headline) out.push(d.headline);
    const line = [d.phone, d.email, d.location, d.linkedin && httpsHref(d.linkedin), d.portfolio && httpsHref(d.portfolio), d.website && httpsHref(d.website)]
      .filter(Boolean)
      .join("  |  ");
    if (line) out.push(line);
    out.push("");
  }

  const visible = data.sections.filter((s) => s.visible && s.type !== "contact");
  for (const s of visible) {
    out.push(s.title.toUpperCase());
    out.push("-".repeat(s.title.length));
    out.push(...renderSection(s));
    out.push("");
  }
  return out.join("\n");
}

function renderSection(s: ResumeSection): string[] {
  const out: string[] = [];
  switch (s.type) {
    case "summary":
      out.push(s.data.content);
      break;
    case "experience":
      for (const e of s.entries) {
        out.push(`${e.role} — ${e.company}${e.location ? `, ${e.location}` : ""} (${dateRange(e.startDate, e.endDate, e.isCurrent)})`);
        out.push(...renderRich(e.content));
      }
      break;
    case "education":
      for (const e of s.entries) {
        out.push(`${e.school} — ${e.degree}${e.location ? `, ${e.location}` : ""} (${dateRange(e.startDate, e.endDate, e.isCurrent)})`);
        out.push(...renderRich(e.content));
      }
      break;
    case "projects":
      for (const e of s.entries) {
        out.push(`${e.name}${e.url ? ` — ${httpsHref(e.url)}` : ""}`);
        out.push(...renderRich(e.content));
      }
      break;
    case "skills":
      for (const g of s.groups) out.push(`${g.category ? `${g.category}: ` : ""}${g.skills.join(", ")}`);
      break;
    case "certifications":
      for (const e of s.entries) out.push(`${e.name} — ${e.issuer}${e.issueDate ? ` (${e.issueDate})` : ""}`);
      break;
    case "languages":
      for (const e of s.entries) out.push(`${e.language}: ${e.proficiency}`);
      break;
    case "custom":
      for (const e of s.entries) {
        const meta = [dateRange(e.startDate ?? "", e.endDate ?? "", false), e.url].filter(Boolean).join(" · ");
        const head = [e.name, meta && `(${meta})`].filter(Boolean).join(" ");
        if (head) out.push(head);
        out.push(...renderRich(e.content));
      }
      break;
  }
  return out;
}

const KNOWN_TYPES = new Set([
  "contact", "summary", "experience", "education", "skills",
  "projects", "certifications", "languages", "custom",
]);

/** Rough shape validation before overwriting stored data. */
export function isValidResumeData(x: unknown): x is ResumeData {
  if (!x || typeof x !== "object") return false;
  const sections = (x as { sections?: unknown }).sections;
  if (!Array.isArray(sections) || sections.length === 0) return false;
  return sections.every(
    (s) => s && typeof s === "object" && typeof (s as { id?: unknown }).id === "string" && KNOWN_TYPES.has((s as { type?: string }).type ?? "")
  );
}
