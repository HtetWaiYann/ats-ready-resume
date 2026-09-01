import { create } from "zustand";
import type {
  ResumeData,
  ResumeSection,
  SectionType,
  CustomSection,
} from "@/types/resume";
import { getResume, saveResume } from "@/lib/db";
import { SEED_RESUME } from "@/lib/seedData";
import type { ResumeTheme } from "@/types/theme";
import { DEFAULT_THEME } from "@/lib/theme";

const uid = () => crypto.randomUUID();

type SaveStatus = "idle" | "saving" | "saved";

interface ResumeStore {
  data: ResumeData | null;
  theme: ResumeTheme;
  loaded: boolean;
  saveStatus: SaveStatus;
  load: () => Promise<void>;
  setTheme: (theme: ResumeTheme) => void;

  // sections
  updateSection: (id: string, patch: Record<string, unknown>) => void;
  toggleSectionVisible: (id: string) => void;
  moveSection: (id: string, toColumn: "main" | "sidebar", toIndex: number) => void;
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;

  // entries (experience/education/projects/certifications/languages/custom)
  addEntry: (sectionId: string, entry: Record<string, unknown>) => void;
  updateEntry: (sectionId: string, entryId: string, patch: Record<string, unknown>) => void;
  removeEntry: (sectionId: string, entryId: string) => void;
  reorderEntries: (sectionId: string, fromIndex: number, toIndex: number) => void;

  replaceAll: (data: ResumeData) => void;
}

// --- autosave (debounced) ---
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

// ponytail: cast through this shared shape — the discriminated union guarantees
// `entries` exists for the section types the UI calls these on.
type WithEntries = ResumeSection & { entries: Array<{ id: string }> };

export const useResumeStore = create<ResumeStore>((set, get) => {
  const persist = () => {
    set({ saveStatus: "saving" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const { data, theme } = get();
      if (data) await saveResume(data, theme);
      set({ saveStatus: "saved" });
    }, 500);
  };

  const commit = (sections: ResumeSection[]) => {
    set({ data: { sections } });
    persist();
  };

  const mapSections = (fn: (s: ResumeSection) => ResumeSection) => {
    const cur = get().data;
    if (!cur) return;
    commit(cur.sections.map(fn));
  };

  const mapSection = (id: string, fn: (s: ResumeSection) => ResumeSection) =>
    mapSections((s) => (s.id === id ? fn(s) : s));

  const mapEntries = (
    sectionId: string,
    fn: (entries: WithEntries["entries"]) => WithEntries["entries"]
  ) =>
    mapSection(sectionId, (s) => {
      const sec = s as WithEntries;
      return { ...sec, entries: fn(sec.entries) } as ResumeSection;
    });

  return {
    data: null,
    theme: DEFAULT_THEME,
    loaded: false,
    saveStatus: "idle",

    load: async () => {
      let rec = await getResume();
      if (!rec) {
        await saveResume(SEED_RESUME, DEFAULT_THEME);
        rec = await getResume();
      }
      set({ data: migrate(rec!.data), theme: rec!.theme ?? DEFAULT_THEME, loaded: true, saveStatus: "saved" });
    },

    setTheme: (theme) => {
      set({ theme });
      persist();
    },

    updateSection: (id, patch) => mapSection(id, (s) => ({ ...s, ...patch } as ResumeSection)),

    toggleSectionVisible: (id) =>
      mapSection(id, (s) => ({ ...s, visible: !s.visible })),

    moveSection: (id, toColumn, toIndex) => {
      const cur = get().data;
      if (!cur) return;
      const sections = cur.sections.slice();
      const idx = sections.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const [sec] = sections.splice(idx, 1);
      const moved = { ...sec, column: toColumn };

      // Rebuild: keep other sections' relative order, insert moved at toIndex
      // among the sections of the target column.
      const result: ResumeSection[] = [];
      let placed = false;
      const targetColSeen = () =>
        result.filter((s) => s.column === toColumn).length;
      for (const s of sections) {
        if (!placed && s.column === toColumn && targetColSeen() === toIndex) {
          result.push(moved);
          placed = true;
        }
        result.push(s);
      }
      if (!placed) result.push(moved);
      commit(result);
    },

    addSection: (type) => {
      const cur = get().data;
      if (!cur) return;
      const section = newSection(type);
      commit([...cur.sections, section]);
    },

    removeSection: (id) => {
      const cur = get().data;
      if (!cur) return;
      commit(cur.sections.filter((s) => s.id !== id));
    },

    addEntry: (sectionId, entry) =>
      mapEntries(sectionId, (entries) => [...entries, { id: uid(), ...entry } as WithEntries["entries"][number]]),

    updateEntry: (sectionId, entryId, patch) =>
      mapEntries(sectionId, (entries) =>
        entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e))
      ),

    removeEntry: (sectionId, entryId) =>
      mapEntries(sectionId, (entries) => entries.filter((e) => e.id !== entryId)),

    reorderEntries: (sectionId, from, to) =>
      mapEntries(sectionId, (entries) => move(entries, from, to)),

    replaceAll: (data) => commit(data.sections),
  };
});

// Fold legacy shapes into the current markdown `content` model so old IndexedDB
// data doesn't crash: custom's single `content` string → one entry, and
// experience/projects/education's description + bullets/notes → one content string.
type LegacyEntry = { id: string; content?: string; description?: string; notes?: string; bullets?: { id: string; text: string }[] } & Record<string, unknown>;

function foldEntry(e: LegacyEntry): LegacyEntry {
  if (typeof e.content === "string") return e;
  const parts: string[] = [];
  if (e.description) parts.push(e.description);
  if (e.notes) parts.push(e.notes);
  for (const b of e.bullets ?? []) parts.push(`- ${b.text}`);
  const { description: _1, notes: _2, bullets: _3, ...rest } = e;
  return { ...rest, content: parts.join("\n") };
}

function migrate(data: ResumeData): ResumeData {
  return {
    ...data,
    sections: data.sections.map((s) => {
      if (s.type === "custom" && !("entries" in s)) {
        const legacy = (s as unknown as { content?: string }).content ?? "";
        const { content: _drop, ...rest } = s as unknown as { content?: string } & CustomSection;
        return { ...rest, entries: legacy.trim() ? [{ id: uid(), name: "", content: legacy }] : [] };
      }
      if (s.type === "experience" || s.type === "projects" || s.type === "education") {
        return { ...s, entries: (s.entries as LegacyEntry[]).map(foldEntry) } as ResumeSection;
      }
      return s;
    }),
  };
}

function newSection(type: SectionType): ResumeSection {
  const base = { id: uid(), visible: true, column: "main" as const };
  switch (type) {
    case "contact":
      return { ...base, type, title: "Contact", data: { fullName: "", email: "", phone: "", location: "", otherLinks: [] } };
    case "summary":
      return { ...base, type, title: "Summary", data: { content: "" } };
    case "experience":
      return { ...base, type, title: "Experience", entries: [] };
    case "education":
      return { ...base, type, title: "Education", entries: [] };
    case "skills":
      return { ...base, type, title: "Skills", displayStyle: "grouped", groups: [] };
    case "projects":
      return { ...base, type, title: "Projects", entries: [] };
    case "certifications":
      return { ...base, type, title: "Certifications", entries: [] };
    case "languages":
      return { ...base, type, title: "Languages", entries: [] };
    case "custom":
      return { ...base, type, title: "Custom", entries: [] };
  }
}
