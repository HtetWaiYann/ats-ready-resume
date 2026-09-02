"use client";
import { useMemo, useRef, useState } from "react";
import { Button, Dropdown, Segmented, App } from "antd";
import {
  PlusOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ExportOutlined,
  ImportOutlined,
  DownOutlined,
  TrademarkCircleFilled,
  DownloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { SectionType, ResumeData } from "@/types/resume";
import type { ResumeTheme } from "@/types/theme";
import { useResumeStore } from "@/store/resumeStore";
import { download, timestamp, toPlainText, isValidResumeData } from "@/lib/exporters";
import { runAtsChecks } from "@/lib/atsCheck";
import MyResumePdf from "@/components/pdf-templates/MyResumePdf";

const ADDABLE: SectionType[] = ["summary", "experience", "education", "skills", "projects", "certifications", "languages", "custom"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const scoreColor = (n: number) => (n >= 80 ? "#3f9142" : n >= 60 ? "#d9930b" : "#d64545");

export default function Toolbar({ tab, onTab, onOpenAts }: { tab: "edit" | "customize"; onTab: (t: "edit" | "customize") => void; onOpenAts: () => void }) {
  const { message } = App.useApp();
  const { data, theme, saveStatus, previewPages, addSection, replaceAll, setTheme } = useResumeStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const score = useMemo(() => (data ? runAtsChecks(data, theme, previewPages).score : 0), [data, theme, previewPages]);

  if (!data) return null;

  async function exportPdf() {
    setBusy(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<MyResumePdf data={data!} theme={theme} />).toBlob();
      download(`resume-${timestamp()}.pdf`, blob);
    } catch {
      message.error("PDF export failed. Check your font selection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    download(`resume-backup-${timestamp()}.json`, new Blob([JSON.stringify({ sections: data!.sections, theme }, null, 2)], { type: "application/json" }));
  }

  async function importJson(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as { theme?: ResumeTheme } & unknown;
      if (!isValidResumeData(parsed)) {
        message.error("That file doesn't look like a valid resume backup.");
        return;
      }
      replaceAll(parsed as ResumeData);
      if (parsed.theme) setTheme(parsed.theme);
      message.success("Resume imported.");
    } catch {
      message.error("Could not read that file.");
    }
  }

  const statusText = saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "";
  const statusColor = saveStatus === "saving" ? "#c99a2e" : "#3f9142";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: "100%", padding: "0 18px" }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 9, background: "#17181c", color: "#fff", flexShrink: 0 }}>
          <TrademarkCircleFilled style={{ fontSize: 15 }} />
        </span>
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: "#17181c" }}>ATS-Ready Resume</span>
        {statusText && (
          <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: statusColor, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
            {statusText}
          </span>
        )}
      </div>

      {/* Center tabs */}
      <Segmented
        value={tab}
        onChange={(v) => onTab(v as "edit" | "customize")}
        options={[
          { label: "Edit", value: "edit" },
          { label: "Customize", value: "customize" },
        ]}
        style={{ fontWeight: 600 }}
      />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
        <Button icon={<SafetyCertificateOutlined style={{ color: scoreColor(score) }} />} onClick={onOpenAts}>
          ATS
          <span className="mono" style={{ marginLeft: 6, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
        </Button>
        <Dropdown
          menu={{ items: ADDABLE.map((t) => ({ key: t, label: cap(t) })), onClick: ({ key }) => addSection(key as SectionType) }}
        >
          <Button icon={<PlusOutlined />}>Section <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Dropdown>
        <Dropdown
          menu={{
            items: [
              { key: "pdf", icon: <FilePdfOutlined />, label: "PDF document" },
              { key: "txt", icon: <FileTextOutlined />, label: "Plain text (.txt)" },
              { type: "divider" },
              { key: "json", icon: <ExportOutlined />, label: "Backup (.json)" },
              { key: "import", icon: <ImportOutlined />, label: "Import backup…" },
            ],
            onClick: ({ key }) => {
              if (key === "pdf") exportPdf();
              else if (key === "txt") download(`resume-${timestamp()}.txt`, new Blob([toPlainText(data!)], { type: "text/plain" }));
              else if (key === "json") exportJson();
              else fileRef.current?.click();
            },
          }}
        >
          <Button type="primary" icon={<DownloadOutlined />} loading={busy}>Download <DownOutlined style={{ fontSize: 10 }} /></Button>
        </Dropdown>
      </div>
      <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ""; }} />
    </div>
  );
}
