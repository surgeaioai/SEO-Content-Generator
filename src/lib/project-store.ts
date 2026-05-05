import fs from "node:fs/promises";
import path from "node:path";

import type { Project } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data", "projects");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function projectPath(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function saveProject(project: Project): Promise<void> {
  await ensureDir();
  const file = projectPath(project.id);
  const payload = JSON.stringify(project, null, 2);
  await fs.writeFile(file, payload, "utf-8");
}

export async function loadProject(id: string): Promise<Project | null> {
  try {
    const raw = await fs.readFile(projectPath(id), "utf-8");
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}
