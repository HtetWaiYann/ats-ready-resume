"use client";
import { useState } from "react";
import { Input, Button } from "antd";
import { DeleteOutlined, PlusOutlined, DownOutlined, RightOutlined, UserOutlined } from "@ant-design/icons";
import type { ContactSection } from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";

const uid = () => crypto.randomUUID();

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span className="eyebrow" style={{ display: "block", fontSize: 9.5, marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

export default function ContactForm({ section }: { section: ContactSection }) {
  const { updateSection } = useResumeStore();
  const [open, setOpen] = useState(true);
  const d = section.data;
  const patch = (p: Partial<ContactSection["data"]>) => updateSection(section.id, { data: { ...d, ...p } });

  return (
    <div
      className="sec-panel"
      style={{ border: "1px solid #e7e7ea", borderRadius: 14, background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(20,20,35,0.04)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "12px 12px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", font: "inherit" }}
      >
        <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: "#eef0ff", color: "#4f46e5", flexShrink: 0 }}>
          <UserOutlined style={{ fontSize: 14 }} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "#17181c", letterSpacing: -0.2 }}>Personal details</span>
          <span style={{ display: "block", fontSize: 11.5, color: "#9a9ba3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {[d.fullName, d.headline].filter(Boolean).join(" · ") || "Add your name and headline"}
          </span>
        </span>
        <span style={{ color: "#b6b7bf", display: "flex", fontSize: 12 }}>{open ? <DownOutlined /> : <RightOutlined />}</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid #f0f0f2", padding: 14, background: "#fcfcfd" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full name"><Input value={d.fullName} onChange={(e) => patch({ fullName: e.target.value })} /></Field>
            <Field label="Headline"><Input value={d.headline ?? ""} onChange={(e) => patch({ headline: e.target.value })} /></Field>
            <Field label="Email"><Input value={d.email} onChange={(e) => patch({ email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={d.phone} onChange={(e) => patch({ phone: e.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <Field label="Location"><Input value={d.location} onChange={(e) => patch({ location: e.target.value })} /></Field>
            <Field label="LinkedIn"><Input value={d.linkedin ?? ""} placeholder="linkedin.com/in/..." onChange={(e) => patch({ linkedin: e.target.value })} /></Field>
            <Field label="Portfolio"><Input value={d.portfolio ?? ""} placeholder="site.com" onChange={(e) => patch({ portfolio: e.target.value })} /></Field>
            <Field label="Website"><Input value={d.website ?? ""} onChange={(e) => patch({ website: e.target.value })} /></Field>
          </div>

          <div style={{ marginTop: 14 }}>
            <span className="eyebrow" style={{ fontSize: 9.5 }}>Other links</span>
            {d.otherLinks.map((l) => (
              <div key={l.id} style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Input placeholder="Label" value={l.label} onChange={(e) => patch({ otherLinks: d.otherLinks.map((x) => (x.id === l.id ? { ...x, label: e.target.value } : x)) })} />
                <Input placeholder="URL" value={l.url} onChange={(e) => patch({ otherLinks: d.otherLinks.map((x) => (x.id === l.id ? { ...x, url: e.target.value } : x)) })} />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => patch({ otherLinks: d.otherLinks.filter((x) => x.id !== l.id) })} />
              </div>
            ))}
            <br />
            <Button type="link" size="small" icon={<PlusOutlined />} style={{ padding: 0, marginTop: 6 }} onClick={() => patch({ otherLinks: [...d.otherLinks, { id: uid(), label: "", url: "" }] })}>
              Add link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
