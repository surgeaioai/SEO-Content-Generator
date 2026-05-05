import { NextResponse } from "next/server";

import { loadProject, saveProject } from "@/lib/project-store";
import { selectAngleBodySchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = selectAngleBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    await saveProject({
      ...project,
      selectedAngle: parsed.data.angle,
      updatedAt: now,
      status: "ready",
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("select-angle error", error);
    return NextResponse.json({ error: "Could not save selection" }, { status: 500 });
  }
}
