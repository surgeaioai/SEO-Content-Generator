import { z } from "zod";

import type { ContentAngle } from "@/types";

const targetFormatEnum = z.enum(["blog", "guide", "comparison", "listicle", "tutorial"]);

export const contentAngleSchema = z.object({
  title: z.string().min(1).max(120),
  angle: z.string().min(1),
  targetFormat: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const v = val.trim().toLowerCase();
    if (v.includes("compar")) return "comparison";
    if (v.includes("list")) return "listicle";
    if (v.includes("tutorial") || v.includes("how to")) return "tutorial";
    if (v.includes("guide")) return "guide";
    if (v.includes("blog") || v.includes("article")) return "blog";
    return v;
  }, targetFormatEnum),
  estimatedDifficulty: z.preprocess((val) => {
    if (typeof val !== "string") return val;
    const v = val.trim().toLowerCase();
    if (v.startsWith("low")) return "Low";
    if (v.startsWith("high")) return "High";
    return "Medium";
  }, z.enum(["Low", "Medium", "High"])),
  whyItWorks: z.string().min(1),
  targetAudience: z.string().min(1),
});

export const contentAnglesSchema = z.array(contentAngleSchema).length(4);

export function normalizeAngles(raw: unknown): ContentAngle[] {
  let candidate: unknown = raw;
  if (raw && typeof raw === "object" && "angles" in raw) {
    candidate = (raw as { angles: unknown }).angles;
  }

  return contentAnglesSchema.parse(candidate);
}
