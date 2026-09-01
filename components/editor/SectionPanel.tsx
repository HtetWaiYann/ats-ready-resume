"use client";
import { useState } from "react";
import { Segmented, Switch, Button, App, Tooltip, Input, Modal, Popover } from "antd";
import { DeleteOutlined, EditOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type { ResumeSection } from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";
import SectionForms from "./SectionForms";

const TYPE_LABEL: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certs",
  languages: "Languages",
  custom: "Custom",
};

export default function SectionPanel({ section, handle }: { section: ResumeSection; handle: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toggleSectionVisible, removeSection, moveSection, updateSection } = useResumeStore();
  const { modal } = App.useApp();

  return (
    <div
      className="sec-panel"
      style={{
        background: "#fff",
        border: "1px solid #e7e7ea",
        borderRadius: 14,
        boxShadow: "0 1px 2px rgba(20,20,35,0.04)",
        opacity: section.visible ? 1 : 0.55,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 10px 8px" }}>
        <span style={{ color: "#c7c8ce", display: "flex" }}>{handle}</span>
        <button
          onClick={() => setOpen(true)}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "2px 0",
            font: "inherit",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "#17181c", letterSpacing: -0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {section.title}
          </span>
          <span className="eyebrow" style={{ fontSize: 9.5, color: "#bcbdc4" }}>{TYPE_LABEL[section.type] ?? ""}</span>
        </button>
        <Tooltip title="Edit section">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setOpen(true)} style={{ color: "#8b8c94" }} />
        </Tooltip>
        <Tooltip title={section.visible ? "Shown on resume" : "Hidden"}>
          <Switch size="small" checked={section.visible} onChange={() => toggleSectionVisible(section.id)} />
        </Tooltip>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        width="min(920px, 94vw)"
        footer={null}
        destroyOnHidden
        styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingRight: 4 } }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>{section.title}</span>
            <span className="eyebrow" style={{ fontSize: 9.5, color: "#bcbdc4" }}>{TYPE_LABEL[section.type] ?? ""}</span>
            {section.type === "custom" && (
              <Popover
                placement="bottomLeft"
                title="Formatting"
                content={
                  <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                    <div><code>**bold**</code> → <strong>bold</strong></div>
                    <div><code>*italic*</code> → <em>italic</em></div>
                    <div><code>[text](url)</code> → link</div>
                    <div><code>- item</code> at line start → bullet</div>
                    <div>Blank line → new paragraph</div>
                  </div>
                }
              >
                <InfoCircleOutlined style={{ color: "#a6a7af", fontSize: 15, cursor: "help" }} />
              </Popover>
            )}
          </div>
        }
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
          <label style={{ flex: "1 1 260px", minWidth: 220 }}>
            <span className="eyebrow" style={{ display: "block", fontSize: 9.5, marginBottom: 5 }}>Section title</span>
            <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
          </label>
          <div>
            <span className="eyebrow" style={{ display: "block", fontSize: 9.5, marginBottom: 5 }}>Column</span>
            <Segmented
              value={section.column}
              onChange={(v) => moveSection(section.id, v as "main" | "sidebar", 999)}
              options={[
                { label: "Main", value: "main" },
                { label: "Sidebar", value: "sidebar" },
              ]}
            />
          </div>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              modal.confirm({
                title: `Delete "${section.title}"?`,
                content: "This removes the section from your resume.",
                okText: "Delete",
                okButtonProps: { danger: true },
                onOk: () => {
                  removeSection(section.id);
                  setOpen(false);
                },
              })
            }
          >
            Delete
          </Button>
        </div>
        <SectionForms section={section} />
      </Modal>
    </div>
  );
}
