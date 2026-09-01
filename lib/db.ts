import Dexie, { type Table } from "dexie";
import type { ResumeData } from "@/types/resume";
import type { ResumeTheme } from "@/types/theme";

export interface ResumeRecord {
  id: "my-resume"; // fixed singleton key — only ever one row
  data: ResumeData;
  theme?: ResumeTheme;
  updatedAt: string;
}

class ResumeDB extends Dexie {
  resume!: Table<ResumeRecord, string>;
  constructor() {
    super("ResumeBuilderDB");
    this.version(1).stores({ resume: "id" });
  }
}

export const db = new ResumeDB();

export async function getResume(): Promise<ResumeRecord | null> {
  return (await db.resume.get("my-resume")) ?? null;
}

export async function saveResume(data: ResumeData, theme?: ResumeTheme): Promise<void> {
  await db.resume.put({
    id: "my-resume",
    data,
    theme,
    updatedAt: new Date().toISOString(),
  });
}
