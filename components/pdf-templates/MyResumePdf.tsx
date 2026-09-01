import {
  Document,
  Page,
  View,
  Text,
  Link,
  Svg,
  Path,
  Font,
} from "@react-pdf/renderer";
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
import { FONT_WEIGHTS, woffUrl } from "@/lib/theme";
import { httpsHref, displayUrl, mailto, tel } from "@/lib/links";
import { parseRich, type Run } from "@/lib/richText";

const HAIR = "#dfe3e8";
const SCALE = 0.75; // web px → pdf pt so the export matches the preview
const sc = (n: number) => n * SCALE;

const registered = new Set<string>();
function ensureFont(family: string) {
  if (registered.has(family)) return;
  Font.register({
    family,
    fonts: FONT_WEIGHTS.map((w) => ({ src: woffUrl(family, w), fontWeight: w })),
  });
  Font.registerHyphenationCallback((w) => [w]); // don't hyphenate
  registered.add(family);
}

const LANG_DOTS: Record<string, number> = {
  Native: 5, Fluent: 4, Professional: 4, Advanced: 3, Conversational: 2, Basic: 1,
};

const ICONS: Record<string, string[]> = {
  phone: ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.98.36 1.94.7 2.85a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.23-1.27a2 2 0 0 1 2.11-.45c.91.34 1.87.57 2.85.7A2 2 0 0 1 22 16.92z"],
  mail: ["M4 4h16v16H4z", "M22 6l-10 7L2 6"],
  linkedin: ["M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-6a6 6 0 0 1 6-6z", "M6 9v11H2V9z", "M4 4a2 2 0 1 0 0 .01"],
  globe: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"],
  pin: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 10a2.5 2.5 0 1 0 0 .01"],
  calendar: ["M7 2v3", "M17 2v3", "M3.5 8h17", "M4 5h16v16H4z"],
  link: ["M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"],
};

function PdfIcon({ name, size, color }: { name: keyof typeof ICONS; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ICONS[name].map((d, i) => (
        <Path key={i} d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

function dateRange(start: string, end: string, isCurrent: boolean) {
  const e = isCurrent ? "Present" : end;
  return [start, e].filter(Boolean).join(" - ");
}

export default function MyResumePdf({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
  ensureFont(theme.fontFamily);
  const t = theme;
  const rt = (role: TextRole, colorKey?: keyof ResumeTheme["colors"]) => {
    const s = t.text[role];
    return {
      fontFamily: t.fontFamily,
      fontSize: sc(s.fontSize),
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: sc(s.letterSpacing),
      color: t.colors[colorKey ?? (role as keyof ResumeTheme["colors"])] ?? t.colors.body,
    };
  };
  const metaSize = sc(t.text.meta.fontSize);

  const Sep = () => (
    <View style={{ borderTopWidth: 1, borderTopColor: HAIR, borderStyle: "dashed", marginVertical: sc(t.entryGap) }} />
  );

  const MetaItem = ({ icon, children }: { icon: keyof typeof ICONS; children: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: sc(14) }}>
      <PdfIcon name={icon} size={metaSize} color={t.colors.meta} />
      <Text style={{ ...rt("meta"), marginLeft: sc(4) }}>{children}</Text>
    </View>
  );

  const Runs = ({ runs }: { runs: Run[] }) => (
    <>
      {runs.map((run, i) => {
        const style = { fontWeight: run.bold ? (700 as const) : undefined, fontStyle: run.italic ? ("italic" as const) : undefined };
        return run.href ? (
          <Link key={i} src={httpsHref(run.href)} style={{ ...style, color: t.colors.link, textDecoration: "none" }}>{run.text}</Link>
        ) : (
          <Text key={i} style={style}>{run.text}</Text>
        );
      })}
    </>
  );

  const PdfRich = ({ content }: { content: string }) => (
    <>
      {parseRich(content).map((b, i) =>
        b.type === "p" ? (
          <Text key={i} style={{ ...rt("body"), marginTop: sc(i ? 4 : 3) }}><Runs runs={b.runs} /></Text>
        ) : (
          b.items.map((item, j) => (
            <View key={`${i}-${j}`} style={{ flexDirection: "row", marginTop: sc(2) }}>
              <Text style={{ ...rt("body"), width: sc(12) }}>•</Text>
              <Text style={{ ...rt("body"), flex: 1 }}><Runs runs={item} /></Text>
            </View>
          ))
        ),
      )}
    </>
  );

  function Body({ s }: { s: ResumeSection }) {
    switch (s.type) {
      case "summary":
        return <Text style={rt("body")}>{(s as SummarySection).data.content}</Text>;
      case "experience":
        return (
          <>
            {(s as ExperienceSection).entries.map((e, i, arr) => (
              <View key={e.id}>
                <Text style={rt("entryTitle")}>{e.role}</Text>
                <Text style={rt("entrySubtitle")}>{e.company}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sc(3) }}>
                  <MetaItem icon="calendar">{dateRange(e.startDate, e.endDate, e.isCurrent)}</MetaItem>
                  {e.location ? <MetaItem icon="pin">{e.location}</MetaItem> : null}
                </View>
                <PdfRich content={e.content} />
                {i < arr.length - 1 ? <Sep /> : null}
              </View>
            ))}
          </>
        );
      case "education":
        return (
          <>
            {(s as EducationSection).entries.map((e, i, arr) => (
              <View key={e.id}>
                <Text style={rt("entryTitle")}>{e.degree}</Text>
                <Text style={rt("entrySubtitle")}>{e.school}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sc(3) }}>
                  <MetaItem icon="calendar">{dateRange(e.startDate, e.endDate, e.isCurrent)}</MetaItem>
                  {e.location ? <MetaItem icon="pin">{e.location}</MetaItem> : null}
                </View>
                <PdfRich content={e.content} />
                {i < arr.length - 1 ? <Sep /> : null}
              </View>
            ))}
          </>
        );
      case "projects":
        return (
          <>
            {(s as ProjectsSection).entries.map((e, i, arr) => (
              <View key={e.id}>
                <Text style={rt("entryTitle")}>{e.name}</Text>
                {e.url ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: sc(2) }}>
                    <PdfIcon name="link" size={metaSize} color={t.colors.link} />
                    <Link src={httpsHref(e.url)} style={{ ...rt("meta", "link"), marginLeft: sc(4), textDecoration: "none" }}>{displayUrl(e.url)}</Link>
                  </View>
                ) : null}
                <PdfRich content={e.content} />
                {i < arr.length - 1 ? <Sep /> : null}
              </View>
            ))}
          </>
        );
      case "skills": {
        const sk = s as SkillsSection;
        return (
          <>
            {sk.groups.map((g, i, arr) => (
              <View key={g.id}>
                {g.category ? <Text style={{ ...rt("entrySubtitle"), marginBottom: sc(4) }}>{g.category}</Text> : null}
                <Text style={rt("body")}>{g.skills.join(", ")}</Text>
                {i < arr.length - 1 ? <Sep /> : null}
              </View>
            ))}
          </>
        );
      }
      case "certifications":
        return (
          <>
            {(s as CertificationsSection).entries.map((e, i, arr) => (
              <View key={e.id} style={{ marginBottom: i < arr.length - 1 ? sc(t.entryGap) : 0 }}>
                <Text style={rt("entryTitle")}>{e.name}</Text>
                <Text style={{ ...rt("meta"), marginTop: sc(2) }}>{e.issuer}{e.issueDate ? ` · ${e.issueDate}` : ""}</Text>
              </View>
            ))}
          </>
        );
      case "languages":
        return (
          <>
            {(s as LanguagesSection).entries.map((e, i, arr) => (
              <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: i < arr.length - 1 ? sc(t.entryGap) : 0 }}>
                <View>
                  <Text style={rt("entryTitle")}>{e.language}</Text>
                  <Text style={{ ...rt("meta"), marginTop: sc(1) }}>{e.proficiency}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <View key={n} style={{ width: sc(9), height: sc(9), borderRadius: sc(5), marginLeft: sc(4), backgroundColor: n <= (LANG_DOTS[e.proficiency] ?? 3) ? t.colors.accent : HAIR }} />
                  ))}
                </View>
              </View>
            ))}
          </>
        );
      case "custom":
        return (
          <>
            {(s as CustomSection).entries.map((e, i, arr) => (
              <View key={e.id}>
                {e.name ? <Text style={rt("entryTitle")}>{e.name}</Text> : null}
                {e.startDate || e.endDate || e.url ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: sc(3) }}>
                    {e.startDate || e.endDate ? <MetaItem icon="calendar">{dateRange(e.startDate ?? "", e.endDate ?? "", false)}</MetaItem> : null}
                    {e.url ? (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <PdfIcon name="link" size={metaSize} color={t.colors.link} />
                        <Link src={httpsHref(e.url)} style={{ ...rt("meta", "link"), marginLeft: sc(4), textDecoration: "none" }}>{displayUrl(e.url)}</Link>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                <PdfRich content={e.content} />
                {i < arr.length - 1 ? <Sep /> : null}
              </View>
            ))}
          </>
        );
      case "contact":
        return null;
    }
  }

  const Column = ({ sections, width }: { sections: ResumeSection[]; width: string }) => (
    <View style={{ width }}>
      {sections.map((s) => (
        <View key={s.id} style={{ marginBottom: sc(t.sectionGap) }} wrap={false}>
          <Text style={{ ...rt("sectionTitle"), textTransform: "uppercase", borderBottomWidth: 2.5 * SCALE, borderBottomColor: t.colors.rule, paddingBottom: sc(3), marginBottom: sc(t.titleContentGap) }}>{s.title}</Text>
          <Body s={s} />
        </View>
      ))}
    </View>
  );

  const contact = data.sections.find((s) => s.type === "contact") as ContactSection | undefined;
  const c = contact?.data;
  const visible = data.sections.filter((s) => s.visible && s.type !== "contact");
  const main = visible.filter((s) => s.column === "main");
  const sidebar = visible.filter((s) => s.column === "sidebar");

  const HeaderLink = ({ icon, href, label }: { icon: keyof typeof ICONS; href: string; label: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: sc(18), marginBottom: sc(6) }}>
      <PdfIcon name={icon} size={metaSize} color={t.colors.accent} />
      <Link src={href} style={{ fontFamily: t.fontFamily, fontSize: metaSize, fontWeight: 600, color: t.colors.body, textDecoration: "none", marginLeft: sc(5) }}>{label}</Link>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={{ paddingVertical: sc(48), paddingHorizontal: sc(44), fontFamily: t.fontFamily }}>
        {c ? (
          <View style={{ marginBottom: sc(t.sectionGap) }}>
            <Text style={{ ...rt("name"), textTransform: "uppercase" }}>{c.fullName}</Text>
            {c.headline ? <Text style={{ ...rt("headline"), marginTop: sc(2) }}>{c.headline}</Text> : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: sc(10) }}>
              {c.phone ? <HeaderLink icon="phone" href={tel(c.phone)} label={c.phone} /> : null}
              {c.email ? <HeaderLink icon="mail" href={mailto(c.email)} label={c.email} /> : null}
              {c.linkedin ? <HeaderLink icon="linkedin" href={httpsHref(c.linkedin)} label={displayUrl(c.linkedin)} /> : null}
              {c.portfolio ? <HeaderLink icon="globe" href={httpsHref(c.portfolio)} label={displayUrl(c.portfolio)} /> : null}
              {c.website ? <HeaderLink icon="globe" href={httpsHref(c.website)} label={displayUrl(c.website)} /> : null}
              {c.otherLinks.map((l) => <HeaderLink key={l.id} icon="link" href={httpsHref(l.url)} label={l.label || displayUrl(l.url)} />)}
            </View>
            {c.location ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: sc(1) }}>
                <PdfIcon name="pin" size={metaSize} color={t.colors.body} />
                <Text style={{ fontFamily: t.fontFamily, fontSize: metaSize, fontWeight: 600, color: t.colors.body, marginLeft: sc(5) }}>{c.location}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Column sections={main} width="62%" />
          <Column sections={sidebar} width="34%" />
        </View>
      </Page>
    </Document>
  );
}
