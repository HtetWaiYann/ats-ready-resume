"use client";
import { Drawer, Select, Slider, ColorPicker, Collapse, InputNumber, Divider, Button } from "antd";
import type { ResumeTheme, TextRole } from "@/types/theme";
import { TEXT_ROLE_LABELS, COLOR_LABELS } from "@/types/theme";
import { useResumeStore } from "@/store/resumeStore";
import { FONTS, FONT_WEIGHTS, DEFAULT_THEME } from "@/lib/theme";

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

export default function ThemePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme } = useResumeStore();
  const t = theme;

  const setText = (role: TextRole, patch: Partial<ResumeTheme["text"][TextRole]>) =>
    setTheme({ ...t, text: { ...t.text, [role]: { ...t.text[role], ...patch } } });
  const setColor = (key: keyof ResumeTheme["colors"], value: string) =>
    setTheme({ ...t, colors: { ...t.colors, [key]: value } });

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
    <Drawer
      title="Design"
      open={open}
      onClose={onClose}
      size="default"
      extra={<Button size="small" onClick={() => setTheme(DEFAULT_THEME)}>Reset</Button>}
    >
      <Head first>Font</Head>
      <Select
        style={{ width: "100%" }}
        value={t.fontFamily}
        onChange={(v) => setTheme({ ...t, fontFamily: v })}
        options={FONTS.map((f) => ({ value: f.name, label: f.name }))}
      />

      <Head>Spacing</Head>
      <Row label="Between sections">
        <Slider min={6} max={48} value={t.sectionGap} onChange={(v) => setTheme({ ...t, sectionGap: v })} style={{ width: 140 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.sectionGap}</span>
      </Row>
      <Row label="Title → content">
        <Slider min={2} max={28} value={t.titleContentGap} onChange={(v) => setTheme({ ...t, titleContentGap: v })} style={{ width: 140 }} />
        <span style={{ width: 28, textAlign: "right", fontSize: 12 }}>{t.titleContentGap}</span>
      </Row>
      <Row label="Between entries">
        <Slider min={2} max={32} value={t.entryGap} onChange={(v) => setTheme({ ...t, entryGap: v })} style={{ width: 140 }} />
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
    </Drawer>
  );
}
