import { callLLM } from "@/lib/llm";
import { CLASSIFY_PAGE_PROMPT } from "@/lib/prompts";
import type { SerpResult } from "@/types";

export async function classifyPage(result: SerpResult): Promise<string> {
  if (!result.scrapedSuccessfully || !result.headings) {
    return "Unknown";
  }

  const h1 = result.headings.h1[0] ?? "";
  const h2s = result.headings.h2.slice(0, 3).join(", ");

  const userPrompt = `
Title: ${result.title}
URL: ${result.url}
H1: ${h1}
H2s: ${h2s}
`.trim();

  try {
    const classification = await callLLM(CLASSIFY_PAGE_PROMPT, userPrompt, 120);
    return classification.replaceAll("\n", " ").trim() || "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function classifyPages(
  results: SerpResult[],
  batchSize: number = 5,
): Promise<Map<string, string>> {
  const classifications = new Map<string, string>();

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    const settled = await Promise.all(
      batch.map(async (result) => ({
        url: result.url,
        pageType: await classifyPage(result),
      })),
    );

    settled.forEach(({ url, pageType }) => {
      classifications.set(url, pageType);
    });

    if (i + batchSize < results.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return classifications;
}
