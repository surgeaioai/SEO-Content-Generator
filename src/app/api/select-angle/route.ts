import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi } from "@/lib/rate-limiter";
import { loadProject, saveProject } from "@/lib/project-store";
import { selectAngleBodySchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const authRes = await requireUserId();
  if (authRes instanceof NextResponse) return authRes;
  const { userId } = authRes;

  const ip = getClientIp(request);
  const rl = await limitGeneralApi(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Please retry shortly.",
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  try {
    const json: unknown = await request.json();
    const parsed = selectAngleBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(userId, parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    await saveProject(userId, {
      ...project,
      selectedAngle: parsed.data.angle,
      updatedAt: now,
      status: "ready",
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    logger.error({ err: error }, "select-angle error");
    return NextResponse.json({ error: "Could not save selection" }, { status: 500 });
  }
}
