import { z } from "zod";

import { contentAngleSchema } from "@/lib/angles";

export const scrapeSerpBodySchema = z.object({
  keyword: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(40).optional(),
  projectId: z.string().uuid().optional(),
});

export const projectIdBodySchema = z.object({
  projectId: z.string().uuid(),
});

export const selectAngleBodySchema = z.object({
  projectId: z.string().uuid(),
  angle: contentAngleSchema,
});

export const generateBlogBodySchema = z.object({
  projectId: z.string().uuid(),
  wordCount: z.number().int().min(2000).max(5000),
  brandGuidelines: z.string().max(12000).optional(),
  brandVoice: z.string().trim().min(1).max(40).optional(),
  contentType: z.string().trim().min(1).max(40).optional(),
  internalLinks: z.array(z.string().url()).max(50).optional(),
  targetKeywords: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  customKeywords: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  quickMode: z.boolean().optional(),
  ctas: z.array(z.string().trim().min(1).max(500)).max(20).optional(),
});

export const scrapeHeadingsBodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(50),
});
