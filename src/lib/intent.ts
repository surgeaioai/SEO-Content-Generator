import { z } from "zod";

export const intentOutputSchema = z.object({
  primaryIntent: z.enum([
    "Informational",
    "Commercial",
    "Transactional",
    "Navigational",
  ]),
  secondaryIntent: z.string().optional(),
  userNeed: z.string().min(1),
  preferredFormat: z.string().min(1),
  mustCoverTopics: z.array(z.string().min(1)).min(6).max(16),
  contentGaps: z.array(z.string().min(1)).min(3).max(10),
});

export type IntentOutput = z.infer<typeof intentOutputSchema>;
