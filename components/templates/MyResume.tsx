import type {
  ResumeData,
  ResumeSection,
  ContactSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  CustomSection,
} from "@/types/resume";
import type { ResumeTheme, TextRole } from "@/types/theme";
import { httpsHref, displayUrl, mailto, tel } from "@/lib/links";
import { parseRich, type Run } from "@/lib/richText";

const HAIR = "#dfe3e8"; // dashed entry separators

function dateRange(start: string, end: string, isCurrent: boolean) {
  const e = isCurrent ? "Present" : end;
  return [start, e].filter(Boolean).join(" - ");
}

const LANG_DOTS: Record<string, number> = {
  Native: 5, Fluent: 4, Professional: 4, Advanced: 3, Conversational: 2, Basic: 1,
};

// ---- theme → CSS helpers ----
function useRole(t: ResumeTheme) {
  return (role: TextRole, colorKey?: keyof ResumeTheme["colors"]): React.CSSProperties => {
    const s = t.text[role];
    return {
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      color: t.colors[colorKey ?? (role as keyof ResumeTheme["colors"])] ?? t.colors.body,
    };
  };
}

// ---- icons (inline, currentColor) ----
function Icon({ d, size = 12, color }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}
const ICONS = {
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.94.7 2.85a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.23-1.27a2 2 0 0 1 2.11-.45c.91.34 1.87.57 2.85.7A2 2 0 0 1 22 16.92z",
  mail: "M4 4h16v16H4z M22 6l-10 7L2 6",
  linkedin: "M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-6a6 6 0 0 1 6-6z M6 9v11H2V9z M4 4a2 2 0 1 0 0 .01",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a2.5 2.5 0 1 0 0 .01",
  calendar: "M7 2v3 M17 2v3 M3.5 8h17 M4 5h16v16H4z",
  link: "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
};

// `breaks` (sectionId → extra top margin) is injected by PaperPreview to push
// sections onto the next A4 sheet; empty in the PDF template and web export.
export default function MyResume({ data, theme, breaks = {} }: { data: ResumeData; theme: ResumeTheme; breaks?: Record<string, number> }) {
  const r = useRole(theme);
  const contact = data.sections.find((s) => s.type === "contact") as ContactSection | undefined;
  const visible = data.sections.filter((s) => s.visible && s.type !== "contact");
  const main = visible.filter((s) => s.column === "main");
  const sidebar = visible.filter((s) => s.column === "sidebar");

  const MetaRow = ({ icon, children }: { icon: keyof typeof ICONS; children: React.ReactNode }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...r("meta"), fontWeight: 400 }}>
      <Icon d={ICONS[icon]} size={theme.text.meta.fontSize} />
      {children}
    </span>
  );

  const Inline = ({ runs }: { runs: Run[] }) => (
    <>
      {runs.map((run, i) => {
        const style: React.CSSProperties = { fontWeight: run.bold ? 700 : undefined, fontStyle: run.italic ? "italic" : undefined };
        return run.href ? (
          <a key={i} href={httpsHref(run.href)} target="_blank" rel="noreferrer" style={{ ...style, color: theme.colors.link, textDecoration: "none" }}>{run.text}</a>
        ) : (
          <span key={i} style={style}>{run.text}</span>
        );
      })}
    </>
  );

  const RichContent = ({ content }: { content: string }) => {
    const blocks = parseRich(content);
    if (!blocks.length) return null;
    return (
      <div style={{ marginTop: 3 }}>
        {blocks.map((b, i) =>
          b.type === "p" ? (
            <p key={i} style={{ ...r("body"), marginTop: i ? 4 : 0 }}><Inline runs={b.runs} /></p>
          ) : (
            <ul key={i} style={{ margin: "4px 0 0", paddingLeft: 16, listStyle: "disc" }}>
              {b.items.map((item, j) => <li key={j} style={{ ...r("body"), marginTop: 2 }}><Inline runs={item} /></li>)}
            </ul>
          ),
        )}
      </div>
    );
  };

  function EntrySep({ last }: { last: boolean }) {
    if (last) return null;
    return <div style={{ borderTop: `1px dashed ${HAIR}`, margin: `${theme.entryGap}px 0` }} />;
  }

  function SectionBody({ s }: { s: ResumeSection }) {
    switch (s.type) {
      case "summary":
        return <p style={r("body")}>{(s as SummarySection).data.content}</p>;

      case "experience":
        return (
          <>
            {(s as ExperienceSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <div style={r("entryTitle")}>{e.role}</div>
                <div style={r("entrySubtitle")}>{e.company}</div>
                <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 14 }}>
                  <MetaRow icon="calendar">{dateRange(e.startDate, e.endDate, e.isCurrent)}</MetaRow>
                  {e.location && <MetaRow icon="pin">{e.location}</MetaRow>}
                </div>
                <RichContent content={e.content} />
                <EntrySep last={i === arr.length - 1} />
              </div>
            ))}
          </>
        );

      case "education":
        return (
          <>
            {(s as EducationSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <div style={r("entryTitle")}>{e.degree}</div>
                <div style={r("entrySubtitle")}>{e.school}</div>
                <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 14 }}>
                  <MetaRow icon="calendar">{dateRange(e.startDate, e.endDate, e.isCurrent)}</MetaRow>
                  {e.location && <MetaRow icon="pin">{e.location}</MetaRow>}
                </div>
                <RichContent content={e.content} />
                <EntrySep last={i === arr.length - 1} />
              </div>
            ))}
          </>
        );

      case "projects":
        return (
          <>
            {(s as ProjectsSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <div style={r("entryTitle")}>{e.name}</div>
                {e.url && (
                  <a href={httpsHref(e.url)} target="_blank" rel="noreferrer" style={{ marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4, ...r("meta", "link"), textDecoration: "none" }}>
                    <Icon d={ICONS.link} size={theme.text.meta.fontSize} />
                    {displayUrl(e.url)}
                  </a>
                )}
                <RichContent content={e.content} />
                <EntrySep last={i === arr.length - 1} />
              </div>
            ))}
          </>
        );

      case "skills": {
        const sk = s as SkillsSection;
        return (
          <div>
            {sk.groups.map((g, i, arr) => (
              <div key={g.id}>
                {g.category && <div style={{ ...r("entrySubtitle"), marginBottom: 4 }}>{g.category}</div>}
                <div style={r("body")}>{g.skills.join(", ")}</div>
                {i < arr.length - 1 && <div style={{ borderTop: `1px dashed ${HAIR}`, margin: `${theme.entryGap}px 0` }} />}
              </div>
            ))}
          </div>
        );
      }

      case "certifications":
        return (
          <>
            {(s as CertificationsSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <div style={r("entryTitle")}>{e.name}</div>
                <div style={{ ...r("meta"), marginTop: 2 }}>{e.issuer}{e.issueDate ? ` · ${e.issueDate}` : ""}</div>
                {i < arr.length - 1 && <div style={{ height: theme.entryGap }} />}
              </div>
            ))}
          </>
        );

      case "languages":
        return (
          <>
            {(s as LanguagesSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={r("entryTitle")}>{e.language}</div>
                    <div style={{ ...r("meta"), marginTop: 1 }}>{e.proficiency}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} style={{ width: 9, height: 9, borderRadius: "50%", background: n <= (LANG_DOTS[e.proficiency] ?? 3) ? theme.colors.accent : HAIR }} />
                    ))}
                  </div>
                </div>
                {i < arr.length - 1 && <div style={{ height: theme.entryGap }} />}
              </div>
            ))}
          </>
        );

      case "custom":
        return (
          <>
            {(s as CustomSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                {e.name && <div style={r("entryTitle")}>{e.name}</div>}
                {(e.startDate || e.endDate || e.url) && (
                  <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 14 }}>
                    {(e.startDate || e.endDate) && <MetaRow icon="calendar">{dateRange(e.startDate ?? "", e.endDate ?? "", false)}</MetaRow>}
                    {e.url && (
                      <a href={httpsHref(e.url)} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, ...r("meta", "link"), textDecoration: "none" }}>
                        <Icon d={ICONS.link} size={theme.text.meta.fontSize} />
                        {displayUrl(e.url)}
                      </a>
                    )}
                  </div>
                )}
                <RichContent content={e.content} />
                <EntrySep last={i === arr.length - 1} />
              </div>
            ))}
          </>
        );
      case "contact":
        return null;
    }
  }

  const Column = ({ sections, col }: { sections: ResumeSection[]; col: "main" | "sidebar" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.sectionGap }}>
      {sections.map((s) => (
        <section key={s.id} data-block-id={s.id} data-col={col} style={{ marginTop: breaks[s.id] ?? 0 }}>
          <div style={{ ...r("sectionTitle"), textTransform: "uppercase", borderBottom: `2.5px solid ${theme.colors.rule}`, paddingBottom: 3, marginBottom: theme.titleContentGap }}>
            {s.title}
          </div>
          <SectionBody s={s} />
        </section>
      ))}
    </div>
  );

  const c = contact?.data;
  const headerLinks: React.ReactNode[] = [];
  if (c) {
    const ac = theme.colors.accent;
    if (c.phone) headerLinks.push(<a key="ph" href={tel(c.phone)} style={hLink(theme)}><Icon d={ICONS.phone} color={ac} /> {c.phone}</a>);
    if (c.email) headerLinks.push(<a key="em" href={mailto(c.email)} style={hLink(theme)}><Icon d={ICONS.mail} color={ac} /> {c.email}</a>);
    if (c.linkedin) headerLinks.push(<a key="li" href={httpsHref(c.linkedin)} target="_blank" rel="noreferrer" style={hLink(theme)}><Icon d={ICONS.linkedin} color={ac} /> {displayUrl(c.linkedin)}</a>);
    if (c.portfolio) headerLinks.push(<a key="pf" href={httpsHref(c.portfolio)} target="_blank" rel="noreferrer" style={hLink(theme)}><Icon d={ICONS.globe} color={ac} /> {displayUrl(c.portfolio)}</a>);
    if (c.website) headerLinks.push(<a key="ws" href={httpsHref(c.website)} target="_blank" rel="noreferrer" style={hLink(theme)}><Icon d={ICONS.globe} color={ac} /> {displayUrl(c.website)}</a>);
    for (const l of c.otherLinks) headerLinks.push(<a key={l.id} href={httpsHref(l.url)} target="_blank" rel="noreferrer" style={hLink(theme)}><Icon d={ICONS.link} color={ac} /> {l.label || displayUrl(l.url)}</a>);
  }

  return (
    <div style={{ width: "210mm", minHeight: "297mm", background: "#fff", padding: "48px 44px", fontFamily: `'${theme.fontFamily}', sans-serif` }}>
      {c && (
        <header style={{ marginBottom: theme.sectionGap }}>
          <div style={{ ...r("name"), textTransform: "uppercase" }}>{c.fullName}</div>
          {c.headline && <div style={{ ...r("headline"), marginTop: 2 }}>{c.headline}</div>}
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>{headerLinks}</div>
          {c.location && (
            <div style={{ marginTop: 6 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...r("meta"), fontWeight: 600, color: theme.colors.body }}>
                <Icon d={ICONS.pin} /> {c.location}
              </span>
            </div>
          )}
        </header>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "63fr 37fr", gap: 28 }}>
        <Column sections={main} col="main" />
        <Column sections={sidebar} col="sidebar" />
      </div>
    </div>
  );
}

function hLink(t: ResumeTheme): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: t.text.meta.fontSize,
    fontWeight: 600,
    color: t.colors.body,
    textDecoration: "none",
  };
}
