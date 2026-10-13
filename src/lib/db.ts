import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface StoredProject {
  id: string;
  title: string;
  language: string;
  code: string;
  learningMode: boolean;
  lastExplanationJson: string | null;
  lastDebugJson: string | null;
  lastExecutionJson: string | null;
  hintsUsed: number;
  createdAt: string;
  updatedAt: string;
}

const FALLBACK_FILE = path.join(process.cwd(), "prisma", "fallback-projects.json");

function readFallbackProjects(): StoredProject[] {
  try {
    if (!fs.existsSync(FALLBACK_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(FALLBACK_FILE, "utf-8");
    return JSON.parse(raw) as StoredProject[];
  } catch {
    return [];
  }
}

function writeFallbackProjects(projects: StoredProject[]): void {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(projects, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write fallback projects:", err);
  }
}

export async function listProjects(): Promise<{ projects: StoredProject[]; storageMode: "sqlite" | "local_file" }> {
  try {
    const rows = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return {
      storageMode: "sqlite",
      projects: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  } catch {
    const projects = readFallbackProjects().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return { storageMode: "local_file", projects };
  }
}

export async function getProjectById(id: string): Promise<StoredProject | null> {
  try {
    const row = await prisma.project.findUnique({ where: { id } });
    if (!row) return null;
    return {
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch {
    const projects = readFallbackProjects();
    return projects.find((p) => p.id === id) ?? null;
  }
}

export async function createProject(data: {
  title: string;
  language: string;
  code: string;
  learningMode?: boolean;
  lastExplanationJson?: string | null;
  lastDebugJson?: string | null;
  lastExecutionJson?: string | null;
  hintsUsed?: number;
}): Promise<StoredProject> {
  try {
    const created = await prisma.project.create({
      data: {
        title: data.title,
        language: data.language,
        code: data.code,
        learningMode: data.learningMode ?? true,
        lastExplanationJson: data.lastExplanationJson ?? null,
        lastDebugJson: data.lastDebugJson ?? null,
        lastExecutionJson: data.lastExecutionJson ?? null,
        hintsUsed: data.hintsUsed ?? 0,
      },
    });
    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  } catch {
    const projects = readFallbackProjects();
    const now = new Date().toISOString();
    const newProj: StoredProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: data.title,
      language: data.language,
      code: data.code,
      learningMode: data.learningMode ?? true,
      lastExplanationJson: data.lastExplanationJson ?? null,
      lastDebugJson: data.lastDebugJson ?? null,
      lastExecutionJson: data.lastExecutionJson ?? null,
      hintsUsed: data.hintsUsed ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    projects.unshift(newProj);
    writeFallbackProjects(projects);
    return newProj;
  }
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string;
    language: string;
    code: string;
    learningMode: boolean;
    lastExplanationJson: string | null;
    lastDebugJson: string | null;
    lastExecutionJson: string | null;
    hintsUsed: number;
  }>
): Promise<StoredProject | null> {
  try {
    const updated = await prisma.project.update({
      where: { id },
      data,
    });
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch {
    const projects = readFallbackProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    projects[idx] = {
      ...projects[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeFallbackProjects(projects);
    return projects[idx];
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id } });
    return true;
  } catch {
    const projects = readFallbackProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) return false;
    writeFallbackProjects(filtered);
    return true;
  }
}
