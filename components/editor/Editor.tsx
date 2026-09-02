"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HolderOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import type { ContactSection, ResumeSection } from "@/types/resume";
import { useResumeStore } from "@/store/resumeStore";
import Toolbar from "./Toolbar";
import ContactForm from "./ContactForm";
import SectionPanel from "./SectionPanel";
import ThemePanel from "./ThemePanel";
import PaperPreview from "./PaperPreview";
import FontLoader from "@/components/FontLoader";

function SortableSectionPanel({ section }: { section: ResumeSection }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, marginBottom: 10 };
  const handle = (
    <span {...attributes} {...listeners} style={{ cursor: "grab", touchAction: "none", display: "flex", padding: 3 }}>
      <HolderOutlined />
    </span>
  );
  return (
    <div ref={setNodeRef} style={style}>
      <SectionPanel section={section} handle={handle} />
    </div>
  );
}

function Column({ id, label, sections }: { id: "main" | "sidebar"; label: string; sections: ResumeSection[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${id}` });
  return (
    <div style={{ marginTop: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        {label}
        <span style={{ flex: 1, height: 1, background: "#e6e6ea" }} />
        <span style={{ color: "#c3c4cb" }}>{sections.length}</span>
      </div>
      <div ref={setNodeRef} style={{ minHeight: 64, borderRadius: 12, padding: 3, background: isOver ? "#eef0ff" : "transparent", transition: "background 0.15s" }}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => <SortableSectionPanel key={s.id} section={s} />)}
          {!sections.length && (
            <div style={{ textAlign: "center", padding: "18px 8px", fontSize: 12.5, color: "#b6b7bf" }}>Drop a section here</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

// Single-column layout: one flat, reorderable list — no Main/Sidebar split.
function SingleList({ sections }: { sections: ResumeSection[] }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        Sections
        <span style={{ flex: 1, height: 1, background: "#e6e6ea" }} />
        <span style={{ color: "#c3c4cb" }}>{sections.length}</span>
      </div>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        {sections.map((s) => <SortableSectionPanel key={s.id} section={s} />)}
      </SortableContext>
    </div>
  );
}

export default function Editor() {
  const { data, theme, loaded, load, moveSection, replaceAll } = useResumeStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [designOpen, setDesignOpen] = useState(false);

  useEffect(() => { load(); }, [load]);

  if (!loaded || !data) {
    return <div style={{ height: "100vh", display: "grid", placeItems: "center" }}><Spin size="large" /></div>;
  }

  const contact = data.sections.find((s) => s.type === "contact") as ContactSection | undefined;
  const nonContact = data.sections.filter((s) => s.type !== "contact");
  const main = nonContact.filter((s) => s.column === "main");
  const sidebar = nonContact.filter((s) => s.column === "sidebar");

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    // Single-column: pure array reorder over all non-contact sections; each
    // section keeps its `column` (ignored in this layout, restored if the user
    // switches back to two-column).
    if (theme.layout === "one") {
      const from = nonContact.findIndex((s) => s.id === activeId);
      const to = nonContact.findIndex((s) => s.id === overId);
      if (from === -1 || to === -1) return;
      const reordered = arrayMove(nonContact, from, to);
      let i = 0;
      const merged = data!.sections.map((s) => (s.type === "contact" ? s : reordered[i++]));
      replaceAll({ sections: merged });
      return;
    }

    const toColumn: "main" | "sidebar" =
      overId === "col-sidebar" ? "sidebar" : overId === "col-main" ? "main" : nonContact.find((s) => s.id === overId)?.column ?? "main";

    // ponytail: "insert before over" — off-by-one on downward same-column drags
    // is acceptable for a personal tool; revisit if reordering feels wrong.
    const colList = nonContact.filter((s) => s.column === toColumn && s.id !== activeId);
    const overIdx = colList.findIndex((s) => s.id === overId);
    const toIndex = overIdx === -1 ? colList.length : overIdx;
    moveSection(activeId, toColumn, toIndex);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#e6e7ea" }}>
      <FontLoader family={theme.fontFamily} />
      <header style={{ height: 60, background: "#fff", borderBottom: "1px solid #ececef", flexShrink: 0, zIndex: 5 }}>
        <Toolbar onOpenDesign={() => setDesignOpen(true)} />
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Editing rail */}
        <aside
          className="rail-scroll"
          style={{ width: 480, flexShrink: 0, overflowY: "auto", background: "#f6f6f7", borderRight: "1px solid #e7e7ea" }}
        >
          <div style={{ padding: "20px 20px 60px" }}>
            {contact && <ContactForm section={contact} />}

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
              {theme.layout === "one" ? (
                <SingleList sections={nonContact} />
              ) : (
                <>
                  <Column id="main" label="Main column" sections={main} />
                  <Column id="sidebar" label="Sidebar" sections={sidebar} />
                </>
              )}
            </DndContext>
          </div>
        </aside>

        {/* Paper preview — the hero */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "44px 24px 72px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            background: "radial-gradient(120% 80% at 50% 0%, #edeef1 0%, #e2e2e6 70%)",
          }}
        >
          <PaperPreview data={data} theme={theme} />
        </div>
      </div>

      <ThemePanel open={designOpen} onClose={() => setDesignOpen(false)} />
    </div>
  );
}
