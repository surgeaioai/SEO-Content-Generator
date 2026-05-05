import { callLLM } from "./llm";

type ImageSuggestion = {
  placement: string;
  description: string;
  altText: string;
  aiPrompt: string;
};

function sanitizeSuggestions(input: unknown): ImageSuggestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return typeof row.placement === "string" &&
        typeof row.description === "string" &&
        typeof row.altText === "string" &&
        typeof row.aiPrompt === "string";
    })
    .map((item) => item as ImageSuggestion)
    .slice(0, 5);
}

export async function generateImageSuggestions(blogContent: string) {
  const prompt = `Suggest 5 image placements for this blog. For each:
1. Section/paragraph where it goes
2. Image description
3. SEO alt text
4. AI generation prompt (DALL-E/Midjourney style)

Blog: ${blogContent.slice(0, 3000)}

Return JSON: [{ "placement": "...", "description": "...", "altText": "...", "aiPrompt": "..." }]`;

  try {
    const response = await callLLM(
      "You are an image SEO expert.",
      prompt,
      1500,
      true,
    );
    return sanitizeSuggestions(JSON.parse(response));
  } catch {
    return [];
  }
}
