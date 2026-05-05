import { callLLM } from "./llm";

type InternalLinkSuggestion = { anchor: string; url: string; reason: string };

function sanitizeSuggestions(input: unknown): InternalLinkSuggestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return typeof row.anchor === "string" &&
        typeof row.url === "string" &&
        typeof row.reason === "string";
    })
    .map((item) => item as InternalLinkSuggestion)
    .slice(0, 8);
}

export async function suggestInternalLinks(
  blogContent: string,
  sitemap: string[],
): Promise<InternalLinkSuggestion[]> {
  if (sitemap.length === 0) return [];

  const prompt = `Analyze this blog and suggest 5-8 internal links from the sitemap.

Blog: ${blogContent.slice(0, 5000)}

Sitemap URLs:
${sitemap.slice(0, 50).join("\n")}

Return JSON array with: [{ "anchor": "exact text from blog", "url": "matching URL", "reason": "brief explanation" }]
Only suggest links that are highly relevant. Return [] if no good matches.`;

  try {
    const response = await callLLM("You are an SEO expert.", prompt, 1500, true);
    return sanitizeSuggestions(JSON.parse(response));
  } catch {
    return [];
  }
}
