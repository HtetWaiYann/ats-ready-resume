"use client";
import { Select, Slider, ColorPicker, Collapse, InputNumber, Divider, Button, Segmented, Tag, Switch } from "antd";
import type { ResumeTheme, TextRole } from "@/types/theme";
import { TEXT_ROLE_LABELS, COLOR_LABELS } from "@/types/theme";
import { useResumeStore } from "@/store/resumeStore";
import { FONTS, FONT_WEIGHTS, DEFAULT_THEME, PRESETS, PRESET_LIST } from "@/lib/theme";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
    </div>
  );
}

function Head({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <>
      <div className="eyebrow" style={{ marginTop: first ? 0 : 22 }}>{children}</div>
      <Divider style={{ margin: "8px 0 14px" }} />
    </>
  );
}

export default function ThemePanel() {
  const { theme, setTheme } = useResumeStore();
  const t = theme;

  // Any hand-edit marks the theme "custom" so the design picker stops
  // highlighting a preset the theme no longer matches.
  const edit = (patch: Partial<ResumeTheme>) => setTheme({ ...t, ...patch, preset: "custom" });
  const setText = (role: TextRole, patch: Partial<ResumeTheme["text"][TextRole]>) =>
    edit({ text: { ...t.text, [role]: { ...t.text[role], ...patch } } });
  const setColor = (key: keyof ResumeTheme["colors"], value: string) =>
    edit({ colors: { ...t.colors, [key]: value } });

  const typographyItems = (Object.keys(TEXT_ROLE_LABELS) as TextRole[]).map((role) => {
    const s = t.text[role];
    return {
      key: role,
      label: TEXT_ROLE_LABELS[role],
      children: (
        <>
          <Row label="Size">
            <Slider min={7} max={44} step={0.5} value={s.fontSize} onChange={(v) => setText(role, { fontSize: v })} style={{ width: 120 }} />
            <InputNumber size="small" min={7} max={44} step={0.5} value={s.fontSize} onChange={(v) => v != null && setText(role, { fontSize: v })} style={{ width: 64 }} />
          </Row>
          <Row label="Weight">
            <Select
              size="small"
              style={{ width: 110 }}
              value={s.fontWeight}
              onChange={(v) => setText(role, { fontWeight: v })}
              options={FONT_WEIGHTS.map((w) => ({ value: w, label: { 400: "Regular", 500: "Medium", 600: "Semibold", 700: "Bold" }[w] }))}
            />
          </Row>
          <Row label="Line height">
            <InputNumber size="small" min={0.9} max={2} step={0.05} value={s.lineHeight} onChange={(v) => v != null && setText(role, { lineHeight: v })} style={{ width: 80 }} />
          </Row>
          <Row label="Letter spacing">
            <InputNumber size="small" min={-2} max={4} step={0.1} value={s.letterSpacing} onChange={(v) => v != null && setText(role, { letterSpacing: v })} style={{ width: 80 }} />
          </Row>
        </>
      ),
    };
  });

  return (
    <div style={{ padding: "20px 20px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#17181c" }}>Design</span>
        <Button size="small" onClick={() => setTheme(DEFAULT_THEME)}>Reset</Button>
      </div>
      <Head first>Presets</Head>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PRESET_LIST.map((p) => {
          const active = t.preset === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setTheme(PRESETS[p.key])}
              style={{
                textAlign: "left", cursor: "pointer", padding: "10px 12px", borderRadius: 8,
                border: `1.5px solid ${active ? "#2563eb" : "#e5e7eb"}`,
                background: active ? "#eff4ff" : "#fff",
                transition: "border-color .12s, background .12s",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.label}</div>
              <div style={{ marginTop: 3, fontSize: 11, color: "#9ca3af" }}>{p.ats ? "1-col · ATS-safe" : "2-col"}</div>
            </button>
          );
        })}
      </div>

      <Head>Layout</Head>
      <Row label="Columns">
        <Segmented
          size="small"
          value={t.layout}
          onChange={(v) => edit({ layout: v as ResumeTheme["layout"] })}
          options={[{ value: "one", label: "Single" }, { value: "two", label: "Two" }]}
        />
      </Row>
      {t.layout === "two" && (
        <div style={{ marginTop: 4, marginBottom: 6 }}>
          <Tag color="warning" style={{ fontSize: 11 }}>Two-column may confuse some ATS parsers</Tag>
        </div>
      )}

      <Head>Header</Head>
      <Row label="Align">
        <Segmented
          size="small"
          value={t.headerAlign}
          onChange={(v) => edit({ headerAlign: v as ResumeTheme["headerAlign"] })}
          options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]}
        />
      </Row>
      <Row label="Contact icons">
        <Switch size="small" checked={t.contactIcons} onChange={(v) => edit({ contactIcons: v })} />
      </Row>
      <Row label="Contact layout">
        <Segmented
          size="small"
          value={t.contactLayout}
          onChange={(v) => edit({ contactLayout: v as ResumeTheme["contactLayout"] })}
          options={[{ value: "inline", label: "Inline" }, { value: "stacked", label: "Stacked" }]}
        />
      </Row>
      <Row label="Rule under header">
        <Switch size="small" checked={t.headerRule} onChange={(v) => edit({ headerRule: v })} />
      </Row>
      <Row label="Name case">
        <Segmented
          size="small"
          value={t.nameCase}
          onChange={(v) => edit({ nameCase: v as ResumeTheme["nameCase"] })}
          options={[{ value: "upper", label: "UPPER" }, { value: "normal", label: "Normal" }]}
        />
      </Row>

      <Head>Headings</Head>
      <Row label="Style">
        <Segmented
          size="small"
          value={t.headingStyle}
          onChange={(v) => edit({ headingStyle: v as ResumeTheme["headingStyle"] })}
          options={[{ value: "underline", label: "Rule" }, { value: "plain", label: "Plain" }, { value: "accent", label: "Accent" }, { value: "bar", label: "Bar" }]}
        />
      </Row>
      <Row label="Align">
        <Segmented
          size="small"
          value={t.headingAlign}
          onChange={(v) => edit({ headingAlign: v as ResumeTheme["headingAlign"] })}
          options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }]}
        />
      </Row>
      <Row label="Case">
        <Segmented
          size="small"
          value={t.headingCase}
          onChange={(v) => edit({ headingCase: v as ResumeTheme["headingCase"] })}
          options={[{ value: "upper", label: "UPPER" }, { value: "normal", label: "Normal" }]}
        />
      </Row>

      {t.layout === "two" && (
        <>
          <Head>Sidebar</Head>
          <Row label="Side">
            <Segmented
              size="small"
              value={t.sidebarSide}
              onChange={(v) => edit({ sidebarSide: v as ResumeTheme["sidebarSide"] })}
              options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]}
            />
          </Row>
          <Row label="Width">
            <Slider min={25} max={45} value={t.sidebarRatio} onChange={(v) => edit({ sidebarRatio: v })} style={{ width: 120 }} />
            <span style={{ width: 34, textAlign: "right", fontSize: 12 }}>{t.sidebarRatio}%</span>
          </Row>
          <Row label="Column gap">
            <Slider min={8} max={56} value={t.columnGap} onChange={(v) => edit({ columnGap: v })} style={{ width: 120 }} />
            <span style={{ width: 34, textAlign: "right", fontSize: 12 }}>{t.columnGap}</span>
          </Row>
          <Row label="Background tint">
            <ColorPicker
              size="small"
              allowClear
              value={t.sidebarTint || null}
              onChangeComplete={(col) => edit({ sidebarTint: col.toHexString() })}
              onClear={() => edit({ sidebarTint: "" })}
            />
          </Row>
        </>
      )}

      <Head>Density</Head>
      <Row label="Page margin ↔">
        <Slider min={20} max={72} value={t.pagePadX} onChange={(v) => edit({ pagePadX: v })} style={{ width: 120 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.pagePadX}</span>
      </Row>
      <Row label="Page margin ↕">
        <Slider min={20} max={72} value={t.pagePadY} onChange={(v) => edit({ pagePadY: v })} style={{ width: 120 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.pagePadY}</span>
      </Row>
      <Row label="Entry divider">
        <Segmented
          size="small"
          value={t.entryDivider}
          onChange={(v) => edit({ entryDivider: v as ResumeTheme["entryDivider"] })}
          options={[{ value: "dashed", label: "Dashed" }, { value: "solid", label: "Solid" }, { value: "none", label: "None" }]}
        />
      </Row>
      <Row label="Bullets">
        <Segmented
          size="small"
          value={t.bulletStyle}
          onChange={(v) => edit({ bulletStyle: v as ResumeTheme["bulletStyle"] })}
          options={[{ value: "disc", label: "Disc" }, { value: "dash", label: "Dash" }, { value: "none", label: "None" }]}
        />
      </Row>
      <Row label="Entry dates">
        <Segmented
          size="small"
          value={t.entryDateAlign}
          onChange={(v) => edit({ entryDateAlign: v as ResumeTheme["entryDateAlign"] })}
          options={[{ value: "below", label: "Below" }, { value: "right", label: "Right" }]}
        />
      </Row>
      <Row label="Underline links">
        <Switch size="small" checked={t.linkUnderline} onChange={(v) => edit({ linkUnderline: v })} />
      </Row>

      <Head>Font</Head>
      <Select
        style={{ width: "100%" }}
        value={t.fontFamily}
        onChange={(v) => edit({ fontFamily: v })}
        options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
      />

      <Head>Spacing</Head>
      <Row label="Between sections">
        <Slider min={6} max={48} value={t.sectionGap} onChange={(v) => edit({ sectionGap: v })} style={{ width: 140 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.sectionGap}</span>
      </Row>
      <Row label="Title → content">
        <Slider min={2} max={28} value={t.titleContentGap} onChange={(v) => edit({ titleContentGap: v })} style={{ width: 140 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.titleContentGap}</span>
      </Row>
      <Row label="Between entries">
        <Slider min={2} max={32} value={t.entryGap} onChange={(v) => edit({ entryGap: v })} style={{ width: 140 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.entryGap}</span>
      </Row>

      <Head>Colors</Head>
      {(Object.keys(COLOR_LABELS) as (keyof ResumeTheme["colors"])[]).map((key) => (
        <Row key={key} label={COLOR_LABELS[key]}>
          <ColorPicker
            size="small"
            value={t.colors[key]}
            onChangeComplete={(c) => setColor(key, c.toHexString())}
            showText
          />
        </Row>
      ))}

      <Head>Typography</Head>
      <Collapse accordion size="small" items={typographyItems} />
    </div>
  );
}
