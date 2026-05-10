import { Prisma, ProjectStatus as DbProjectStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import type {
  BlogConfig,
  ContentAngle,
  GeneratedBlog,
  IntentAnalysis,
  Project,
  ProjectStatus as AppProjectStatus,
  SerpResult,
} from "@/types";

type SerpDataPayload = {
  location: string;
  contentType?: string;
  serpResults: SerpResult[];
};

type AnglesDataPayload = {
  recommendedAngles?: ContentAngle[];
  selectedAngle?: ContentAngle;
  lastBlogConfig?: BlogConfig;
};

function appStatusToDb(status: AppProjectStatus): DbProjectStatus {
  switch (status) {
    case "scraping":
      return DbProjectStatus.SCRAPING;
    case "analyzing":
      return DbProjectStatus.ANALYZING;
    case "ready":
      return DbProjectStatus.ANALYZING;
    case "generating":
      return DbProjectStatus.GENERATING;
    case "complete":
      return DbProjectStatus.COMPLETED;
    default:
      return DbProjectStatus.PENDING;
  }
}

function dbStatusToApp(status: DbProjectStatus): AppProjectStatus {
  switch (status) {
    case DbProjectStatus.SCRAPING:
      return "scraping";
    case DbProjectStatus.ANALYZING:
      return "analyzing";
    case DbProjectStatus.GENERATING:
      return "generating";
    case DbProjectStatus.COMPLETED:
      return "complete";
    case DbProjectStatus.FAILED:
      return "ready";
    case DbProjectStatus.PENDING:
      return "ready";
    default:
      return "ready";
  }
}

function parseSerpData(raw: Prisma.JsonValue | null): SerpDataPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { location: "", serpResults: [] };
  }
  const o = raw as Record<string, unknown>;
  const location = typeof o.location === "string" ? o.location : "";
  const contentType = typeof o.contentType === "string" ? o.contentType : undefined;
  const serpResults = Array.isArray(o.serpResults)
    ? (o.serpResults as SerpResult[])
    : [];
  return { location, contentType, serpResults };
}

function parseAnglesData(raw: Prisma.JsonValue | null): AnglesDataPayload {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const o = raw as Record<string, unknown>;
  return {
    recommendedAngles: Array.isArray(o.recommendedAngles)
      ? (o.recommendedAngles as ContentAngle[])
      : undefined,
    selectedAngle:
      o.selectedAngle && typeof o.selectedAngle === "object"
        ? (o.selectedAngle as ContentAngle)
        : undefined,
    lastBlogConfig:
      o.lastBlogConfig && typeof o.lastBlogConfig === "object"
        ? (o.lastBlogConfig as BlogConfig)
        : undefined,
  };
}

function rowToProject(row: {
  id: string;
  keyword: string;
  serpData: Prisma.JsonValue | null;
  intentData: Prisma.JsonValue | null;
  anglesData: Prisma.JsonValue | null;
  generatedBlog: string | null;
  status: DbProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}): Project {
  const serp = parseSerpData(row.serpData);
  const angles = parseAnglesData(row.anglesData);
  let intentAnalysis: IntentAnalysis | undefined;
  if (row.intentData && typeof row.intentData === "object" && !Array.isArray(row.intentData)) {
    intentAnalysis = row.intentData as unknown as IntentAnalysis;
  }

  let generatedBlog: GeneratedBlog | undefined;
  if (row.generatedBlog) {
    try {
      generatedBlog = JSON.parse(row.generatedBlog) as GeneratedBlog;
    } catch {
      logger.warn({ projectId: row.id }, "failed to parse generatedBlog JSON");
    }
  }

  return {
    id: row.id,
    keyword: row.keyword,
    location: serp.location,
    contentType: serp.contentType ?? angles.lastBlogConfig?.contentType,
    serpResults: serp.serpResults,
    intentAnalysis,
    recommendedAngles: angles.recommendedAngles,
    selectedAngle: angles.selectedAngle,
    generatedBlog,
    lastBlogConfig: angles.lastBlogConfig,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: dbStatusToApp(row.status),
  };
}

export async function loadProject(userId: string, id: string): Promise<Project | null> {
  const row = await db.project.findFirst({
    where: { id, userId },
  });
  if (!row) return null;
  return rowToProject(row);
}

export async function saveProject(userId: string, project: Project): Promise<void> {
  const existing = await db.project.findUnique({
    where: { id: project.id },
  });
  if (existing && existing.userId !== userId) {
    throw new Error("Project access denied");
  }

  const serpData: SerpDataPayload = {
    location: project.location,
    contentType: project.contentType,
    serpResults: project.serpResults,
  };

  const anglesData: AnglesDataPayload = {
    recommendedAngles: project.recommendedAngles,
    selectedAngle: project.selectedAngle,
    lastBlogConfig: project.lastBlogConfig,
  };

  const intentForDb:
    | Prisma.NullableJsonNullValueInput
    | Prisma.InputJsonValue =
    project.intentAnalysis === undefined
      ? Prisma.DbNull
      : (project.intentAnalysis as unknown as Prisma.InputJsonValue);

  const generatedStr =
    project.generatedBlog === undefined ? null : JSON.stringify(project.generatedBlog);

  await db.project.upsert({
    where: { id: project.id },
    create: {
      id: project.id,
      userId,
      keyword: project.keyword,
      serpData: serpData as unknown as Prisma.InputJsonValue,
      scrapedData: Prisma.JsonNull,
      intentData: intentForDb,
      anglesData: anglesData as unknown as Prisma.InputJsonValue,
      generatedBlog: generatedStr,
      status: appStatusToDb(project.status),
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    },
    update: {
      keyword: project.keyword,
      serpData: serpData as unknown as Prisma.InputJsonValue,
      intentData: intentForDb,
      anglesData: anglesData as unknown as Prisma.InputJsonValue,
      generatedBlog: generatedStr,
      status: appStatusToDb(project.status),
      updatedAt: new Date(project.updatedAt),
    },
  });
}
