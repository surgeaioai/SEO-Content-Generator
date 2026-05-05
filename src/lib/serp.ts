import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import axios from "axios";

const SERPAPI_URL = "https://serpapi.com/search";

export interface SerpApiResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  displayed_link: string;
}

const CACHE_DIR = path.join(process.cwd(), "data", "serp-cache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  results: SerpApiResult[];
};

function cacheKey(keyword: string, location: string, numResults: number) {
  const raw = `${keyword.toLowerCase()}|${location.toLowerCase()}|${numResults}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function readCache(
  keyword: string,
  location: string,
  numResults: number,
): Promise<SerpApiResult[] | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const file = path.join(CACHE_DIR, `${cacheKey(keyword, location, numResults)}.json`);
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed.results;
  } catch {
    return null;
  }
}

async function writeCache(
  keyword: string,
  location: string,
  numResults: number,
  results: SerpApiResult[],
) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${cacheKey(keyword, location, numResults)}.json`);
  const payload: CacheEntry = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    results,
  };
  await fs.writeFile(file, JSON.stringify(payload), "utf-8");
}

export async function fetchSerpResults(
  keyword: string,
  location: string,
  numResults: number = 30,
): Promise<SerpApiResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY is not configured");
  }

  const cached = await readCache(keyword, location, numResults);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        api_key: apiKey,
        q: keyword,
        location,
        num: numResults,
        engine: "google",
        hl: "en",
      },
      timeout: 30_000,
    });

    const organicResults = response.data?.organic_results ?? [];

    const mapped: SerpApiResult[] = organicResults
      .slice(0, numResults)
      .map((result: Record<string, unknown>, index: number) => ({
        position: Number(result.position ?? index + 1),
        title: String(result.title ?? ""),
        link: String(result.link ?? ""),
        snippet: String(result.snippet ?? ""),
        displayed_link: String(result.displayed_link ?? ""),
      }))
      .filter((r: SerpApiResult) => r.link.length > 0);

    await writeCache(keyword, location, numResults, mapped);
    return mapped;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data === "object"
          ? JSON.stringify(error.response?.data)
          : error.message;
      throw new Error(`SerpAPI request failed: ${message}`);
    }
    throw error;
  }
}
