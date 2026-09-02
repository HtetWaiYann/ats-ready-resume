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
import { fontStack } from "@/lib/theme";

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
  const linkDeco = theme.linkUnderline ? "underline" : "none";
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
          <a key={i} href={httpsHref(run.href)} target="_blank" rel="noreferrer" style={{ ...style, color: theme.colors.link, textDecoration: linkDeco }}>{run.text}</a>
        ) : (
          <span key={i} style={style}>{run.text}</span>
        );
      })}
    </>
  );

  const dash = theme.bulletStyle === "dash";
  const RichContent = ({ content }: { content: string }) => {
    const blocks = parseRich(content);
    if (!blocks.length) return null;
    const noMarker = theme.bulletStyle === "none";
    return (
      <div style={{ marginTop: 3 }}>
        {blocks.map((b, i) =>
          b.type === "p" ? (
            <p key={i} style={{ ...r("body"), marginTop: i ? 4 : 0 }}><Inline runs={b.runs} /></p>
          ) : (
            <ul key={i} style={{ margin: "4px 0 0", paddingLeft: noMarker || dash ? 0 : 16, listStyle: dash || noMarker ? "none" : "disc" }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ ...r("body"), marginTop: 2, display: dash ? "flex" : undefined, gap: dash ? 6 : undefined }}>
                  {dash && <span aria-hidden style={{ flexShrink: 0 }}>–</span>}
                  <span><Inline runs={item} /></span>
                </li>
              ))}
            </ul>
          ),
        )}
      </div>
    );
  };

  function EntrySep({ last }: { last: boolean }) {
    if (last || theme.entryDivider === "none") return null;
    return <div style={{ borderTop: `1px ${theme.entryDivider} ${HAIR}`, margin: `${theme.entryGap}px 0` }} />;
  }

  // Title + subtitle + dates/location, honoring entryDateAlign.
  const EntryHead = ({ title, subtitle, date, location }: { title: string; subtitle?: string; date?: string; location?: string }) => {
    const right = theme.entryDateAlign === "right";
    return (
      <>
        {right ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={r("entryTitle")}>{title}</div>
            {date && <div style={{ ...r("meta"), whiteSpace: "nowrap" }}>{date}</div>}
          </div>
        ) : (
          <div style={r("entryTitle")}>{title}</div>
        )}
        {subtitle && <div style={r("entrySubtitle")}>{subtitle}</div>}
        {(right ? location : date || location) && (
          <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", gap: 14 }}>
            {!right && date && <MetaRow icon="calendar">{date}</MetaRow>}
            {location && <MetaRow icon="pin">{location}</MetaRow>}
          </div>
        )}
      </>
    );
  };

  function SectionBody({ s }: { s: ResumeSection }) {
    switch (s.type) {
      case "summary":
        return <p style={r("body")}>{(s as SummarySection).data.content}</p>;

      case "experience":
        return (
          <>
            {(s as ExperienceSection).entries.map((e, i, arr) => (
              <div key={e.id}>
                <EntryHead title={e.role} subtitle={e.company} date={dateRange(e.startDate, e.endDate, e.isCurrent)} location={e.location} />
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
                <EntryHead title={e.degree} subtitle={e.school} date={dateRange(e.startDate, e.endDate, e.isCurrent)} location={e.location} />
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
                  <a href={httpsHref(e.url)} target="_blank" rel="noreferrer" style={{ marginTop: 2, display: "inline-flex", alignItems: "center", gap: 4, ...r("meta", "link"), textDecoration: linkDeco }}>
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
                <EntrySep last={i === arr.length - 1} />
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
            {(s as CustomSection).entries.map((e, i, arr) => {
              const date = e.startDate || e.endDate ? dateRange(e.startDate ?? "", e.endDate ?? "", false) : undefined;
              return (
                <div key={e.id}>
                  {(e.name || date) && <EntryHead title={e.name} date={date} />}
                  {e.url && (
                    <a href={httpsHref(e.url)} target="_blank" rel="noreferrer" style={{ marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4, ...r("meta", "link"), textDecoration: linkDeco }}>
                      <Icon d={ICONS.link} size={theme.text.meta.fontSize} />
                      {displayUrl(e.url)}
                    </a>
                  )}
                  <RichContent content={e.content} />
                  <EntrySep last={i === arr.length - 1} />
                </div>
              );
            })}
          </>
        );
      case "contact":
        return null;
    }
  }

  const titleStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      ...r("sectionTitle"),
      textTransform: theme.headingCase === "upper" ? "uppercase" : "none",
      textAlign: theme.headingAlign,
      paddingBottom: 3,
      marginBottom: theme.titleContentGap,
    };
    if (theme.headingStyle === "underline") return { ...base, borderBottom: `2.5px solid ${theme.colors.rule}` };
    if (theme.headingStyle === "accent") return { ...base, color: theme.colors.accent };
    if (theme.headingStyle === "bar") return { ...base, borderLeft: `3px solid ${theme.colors.accent}`, paddingLeft: 9, paddingBottom: 0 };
    return base; // plain
  };

  const Column = ({ sections, col }: { sections: ResumeSection[]; col: "main" | "sidebar" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.sectionGap }}>
      {sections.map((s) => (
        <section key={s.id} data-block-id={s.id} data-col={col} style={{ marginTop: breaks[s.id] ?? 0 }}>
          <div style={titleStyle()}>{s.title}</div>
          <SectionBody s={s} />
        </section>
      ))}
    </div>
  );

  const c = contact?.data;
  const ls = hLink(theme, linkDeco);
  const hIcon = (d: string) => (theme.contactIcons ? <Icon d={d} color={theme.colors.accent} /> : null);
  const headerLinks: React.ReactNode[] = [];
  if (c) {
    if (c.phone) headerLinks.push(<a key="ph" href={tel(c.phone)} style={ls}>{hIcon(ICONS.phone)} {c.phone}</a>);
    if (c.email) headerLinks.push(<a key="em" href={mailto(c.email)} style={ls}>{hIcon(ICONS.mail)} {c.email}</a>);
    if (c.linkedin) headerLinks.push(<a key="li" href={httpsHref(c.linkedin)} target="_blank" rel="noreferrer" style={ls}>{hIcon(ICONS.linkedin)} {displayUrl(c.linkedin)}</a>);
    if (c.portfolio) headerLinks.push(<a key="pf" href={httpsHref(c.portfolio)} target="_blank" rel="noreferrer" style={ls}>{hIcon(ICONS.globe)} {displayUrl(c.portfolio)}</a>);
    if (c.website) headerLinks.push(<a key="ws" href={httpsHref(c.website)} target="_blank" rel="noreferrer" style={ls}>{hIcon(ICONS.globe)} {displayUrl(c.website)}</a>);
    for (const l of c.otherLinks) headerLinks.push(<a key={l.id} href={httpsHref(l.url)} target="_blank" rel="noreferrer" style={ls}>{hIcon(ICONS.link)} {l.label || displayUrl(l.url)}</a>);
  }

  const align = theme.headerAlign; // left | center | right
  const flexAlign = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const stacked = theme.contactLayout === "stacked";
  // One column: render every visible section in array order (the ATS-safe
  // shape). Two: main + sidebar, order/ratio flipped by sidebarSide.
  const sidebarLeft = theme.sidebarSide === "left";
  const ratio = theme.sidebarRatio;
  const mainFr = 100 - ratio;

  const tinted = (node: React.ReactNode) =>
    theme.sidebarTint ? (
      <div style={{ background: theme.sidebarTint, borderRadius: 8, padding: "14px 14px" }}>{node}</div>
    ) : (
      node
    );

  return (
    <div style={{ width: "210mm", minHeight: "297mm", background: "#fff", padding: `${theme.pagePadY}px ${theme.pagePadX}px`, fontFamily: fontStack(theme.fontFamily) }}>
      {c && (
        <header
          style={{
            marginBottom: theme.sectionGap,
            textAlign: align,
            ...(theme.headerRule ? { borderBottom: `1.5px solid ${theme.colors.rule}`, paddingBottom: 12 } : {}),
          }}
        >
          <div style={{ ...r("name"), textTransform: theme.nameCase === "upper" ? "uppercase" : "none" }}>{c.fullName}</div>
          {c.headline && <div style={{ ...r("headline"), marginTop: 2 }}>{c.headline}</div>}
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", flexDirection: stacked ? "column" : "row", gap: stacked ? "3px 0" : "6px 18px", alignItems: stacked ? flexAlign : "center", justifyContent: flexAlign }}>{headerLinks}</div>
          {c.location && (
            <div style={{ marginTop: 6, display: "flex", justifyContent: flexAlign }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...r("meta"), fontWeight: 600, color: theme.colors.body }}>
                {theme.contactIcons && <Icon d={ICONS.pin} />} {c.location}
              </span>
            </div>
          )}
        </header>
      )}
      {theme.layout === "one" ? (
        <Column sections={visible} col="main" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: sidebarLeft ? `${ratio}fr ${mainFr}fr` : `${mainFr}fr ${ratio}fr`, gap: theme.columnGap }}>
          {sidebarLeft ? (
            <>
              {tinted(<Column sections={sidebar} col="sidebar" />)}
              <Column sections={main} col="main" />
            </>
          ) : (
            <>
              <Column sections={main} col="main" />
              {tinted(<Column sections={sidebar} col="sidebar" />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function hLink(t: ResumeTheme, deco: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: t.text.meta.fontSize,
    fontWeight: 600,
    color: t.colors.body,
    textDecoration: deco,
  };
}
