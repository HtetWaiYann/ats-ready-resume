"use client";
import { useEffect, useState } from "react";
import { Input, Button, Select, Checkbox, Popover } from "antd";
import { DeleteOutlined, PlusOutlined, HolderOutlined, InfoCircleOutlined } from "@ant-design/icons";
import type {
  ResumeSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  LanguagesSection,
  CustomSection,
  SkillGroup,
} from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";
import { SortableList } from "./Sortable";

const uid = () => crypto.randomUUID();

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 2 }}>{label}</span>
      {children}
    </label>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="dashed" icon={<PlusOutlined />} onClick={onClick} block style={{ marginTop: 8 }}>
      {label}
    </Button>
  );
}

function Del({ onClick }: { onClick: () => void }) {
  return <Button type="text" danger icon={<DeleteOutlined />} onClick={onClick} />;
}

const grip = (handle: React.ReactNode) => <span style={{ color: "#bbb", cursor: "grab" }}>{handle}</span>;

function EntryShell({ handle, onRemove, children }: { handle: React.ReactNode; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #eef0f3", background: "#fafbfc", borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        {grip(handle)}
        <Del onClick={onRemove} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

const MD_PLACEHOLDER = "Freeform text — blank line for a new paragraph.\n- start a line with a dash for a bullet\n**bold**, *italic*, [text](url)";

const FORMATTING_HELP = (
  <div style={{ fontSize: 13, lineHeight: 1.9 }}>
    <div><code>**bold**</code> → <strong>bold</strong></div>
    <div><code>*italic*</code> → <em>italic</em></div>
    <div><code>[text](url)</code> → link</div>
    <div><code>- item</code> at line start → bullet</div>
    <div>Blank line → new paragraph</div>
  </div>
);

function MdField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, fontWeight: 500, color: "#6b7280", marginBottom: 2 }}>
        {label}
        <Popover placement="leftTop" title="Formatting" content={FORMATTING_HELP}>
          <InfoCircleOutlined style={{ color: "#a6a7af", fontSize: 13, cursor: "help" }} />
        </Popover>
      </span>
      <Input.TextArea rows={5} value={value} placeholder={MD_PLACEHOLDER} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SkillsCsv({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => setText(value.join(", ")), [value]);
  return (
    <Input
           value={text}
      placeholder="React, Node.js, TypeScript"
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(",").map((x) => x.trim()).filter(Boolean));
      }}
    />
  );
}

export default function SectionForms({ section }: { section: ResumeSection }) {
  const { updateSection, addEntry, updateEntry, removeEntry, reorderEntries } = useResumeStore();
  const id = section.id;

  switch (section.type) {
    case "summary": {
      const s = section as SummarySection;
      return <Input.TextArea rows={5} value={s.data.content} onChange={(e) => updateSection(id, { data: { content: e.target.value } })} placeholder="Professional summary" />;
    }

    case "experience": {
      const s = section as ExperienceSection;
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <EntryShell handle={handle} onRemove={() => removeEntry(id, e.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Role"><Input value={e.role} onChange={(ev) => updateEntry(id, e.id, { role: ev.target.value })} /></Field>
                  <Field label="Company"><Input value={e.company} onChange={(ev) => updateEntry(id, e.id, { company: ev.target.value })} /></Field>
                  <Field label="Location"><Input value={e.location ?? ""} onChange={(ev) => updateEntry(id, e.id, { location: ev.target.value })} /></Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Field label="Start"><Input value={e.startDate} onChange={(ev) => updateEntry(id, e.id, { startDate: ev.target.value })} /></Field>
                    <Field label="End"><Input value={e.endDate} onChange={(ev) => updateEntry(id, e.id, { endDate: ev.target.value })} /></Field>
                  </div>
                </div>
                <Checkbox checked={e.isCurrent} onChange={(ev) => updateEntry(id, e.id, { isCurrent: ev.target.checked })}>Current role</Checkbox>
                <MdField label="Details" value={e.content} onChange={(v) => updateEntry(id, e.id, { content: v })} />
              </EntryShell>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { company: "", role: "", startDate: "", endDate: "", isCurrent: false, content: "" })} label="Add experience" />
        </div>
      );
    }

    case "education": {
      const s = section as EducationSection;
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <EntryShell handle={handle} onRemove={() => removeEntry(id, e.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Degree"><Input value={e.degree} onChange={(ev) => updateEntry(id, e.id, { degree: ev.target.value })} /></Field>
                  <Field label="School"><Input value={e.school} onChange={(ev) => updateEntry(id, e.id, { school: ev.target.value })} /></Field>
                  <Field label="Location"><Input value={e.location ?? ""} onChange={(ev) => updateEntry(id, e.id, { location: ev.target.value })} /></Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Field label="Start"><Input value={e.startDate} onChange={(ev) => updateEntry(id, e.id, { startDate: ev.target.value })} /></Field>
                    <Field label="End"><Input value={e.endDate} onChange={(ev) => updateEntry(id, e.id, { endDate: ev.target.value })} /></Field>
                  </div>
                </div>
                <MdField label="Notes" value={e.content} onChange={(v) => updateEntry(id, e.id, { content: v })} />
              </EntryShell>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { school: "", degree: "", startDate: "", endDate: "", isCurrent: false, content: "" })} label="Add education" />
        </div>
      );
    }

    case "projects": {
      const s = section as ProjectsSection;
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <EntryShell handle={handle} onRemove={() => removeEntry(id, e.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Name"><Input value={e.name} onChange={(ev) => updateEntry(id, e.id, { name: ev.target.value })} /></Field>
                  <Field label="URL"><Input value={e.url ?? ""} placeholder="example.com" onChange={(ev) => updateEntry(id, e.id, { url: ev.target.value })} /></Field>
                </div>
                <MdField label="Details" value={e.content} onChange={(v) => updateEntry(id, e.id, { content: v })} />
              </EntryShell>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { name: "", url: "", content: "" })} label="Add project" />
        </div>
      );
    }

    case "certifications": {
      const s = section as CertificationsSection;
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <EntryShell handle={handle} onRemove={() => removeEntry(id, e.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Name"><Input value={e.name} onChange={(ev) => updateEntry(id, e.id, { name: ev.target.value })} /></Field>
                  <Field label="Issuer"><Input value={e.issuer} onChange={(ev) => updateEntry(id, e.id, { issuer: ev.target.value })} /></Field>
                </div>
                <Field label="Date"><Input value={e.issueDate ?? ""} onChange={(ev) => updateEntry(id, e.id, { issueDate: ev.target.value })} /></Field>
              </EntryShell>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { name: "", issuer: "" })} label="Add certification" />
        </div>
      );
    }

    case "languages": {
      const s = section as LanguagesSection;
      const levels = ["Native", "Fluent", "Advanced", "Professional", "Conversational", "Basic"];
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                {grip(handle)}
                <Input value={e.language} placeholder="Language" onChange={(ev) => updateEntry(id, e.id, { language: ev.target.value })} />
                <Select
                                   style={{ width: 150 }}
                  value={e.proficiency}
                  onChange={(v) => updateEntry(id, e.id, { proficiency: v })}
                  options={levels.map((l) => ({ value: l, label: l }))}
                />
                <Del onClick={() => removeEntry(id, e.id)} />
              </div>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { language: "", proficiency: "Advanced" })} label="Add language" />
        </div>
      );
    }

    case "skills": {
      const s = section as SkillsSection;
      const setGroups = (groups: SkillGroup[]) => updateSection(id, { groups });
      return (
        <div>
          <Checkbox
            checked={s.displayStyle === "grouped"}
            onChange={(e) => updateSection(id, { displayStyle: e.target.checked ? "grouped" : "flat" })}
            style={{ marginBottom: 8 }}
          >
            Group by category
          </Checkbox>
          {s.groups.map((g) => (
            <div key={g.id} style={{ border: "1px solid #eef0f3", background: "#fafbfc", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Input value={g.category ?? ""} placeholder="Category" onChange={(e) => setGroups(s.groups.map((x) => (x.id === g.id ? { ...x, category: e.target.value } : x)))} />
                <Del onClick={() => setGroups(s.groups.filter((x) => x.id !== g.id))} />
              </div>
              <Field label="Skills (comma-separated)">
                <SkillsCsv value={g.skills} onChange={(skills) => setGroups(s.groups.map((x) => (x.id === g.id ? { ...x, skills } : x)))} />
              </Field>
            </div>
          ))}
          <AddBtn onClick={() => setGroups([...s.groups, { id: uid(), category: "", skills: [] }])} label="Add skill group" />
        </div>
      );
    }

    case "custom": {
      const s = section as CustomSection;
      return (
        <div>
          <SortableList items={s.entries} onReorder={(f, t) => reorderEntries(id, f, t)}>
            {(e, handle) => (
              <EntryShell handle={handle} onRemove={() => removeEntry(id, e.id)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Name"><Input value={e.name} onChange={(ev) => updateEntry(id, e.id, { name: ev.target.value })} /></Field>
                  <Field label="Link"><Input value={e.url ?? ""} placeholder="example.com" onChange={(ev) => updateEntry(id, e.id, { url: ev.target.value })} /></Field>
                  <Field label="Start"><Input value={e.startDate ?? ""} onChange={(ev) => updateEntry(id, e.id, { startDate: ev.target.value })} /></Field>
                  <Field label="End"><Input value={e.endDate ?? ""} onChange={(ev) => updateEntry(id, e.id, { endDate: ev.target.value })} /></Field>
                </div>
                <MdField label="Content" value={e.content} onChange={(v) => updateEntry(id, e.id, { content: v })} />
              </EntryShell>
            )}
          </SortableList>
          <AddBtn onClick={() => addEntry(id, { name: "", content: "" })} label="Add item" />
        </div>
      );
    }

    case "contact":
      return null;
  }
}

export { HolderOutlined };
