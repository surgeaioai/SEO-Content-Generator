import axios from "axios";
import * as cheerio from "cheerio";

export interface HeadingData {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface ScrapeResult {
  success: boolean;
  headings?: HeadingData;
  error?: string;
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function extractHeadings(html: string): HeadingData {
  const $ = cheerio.load(html);
  const h1s: string[] = [];
  const h2s: string[] = [];
  const h3s: string[] = [];

  $("h1").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1s.push(text);
  });
  $("h2").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });
  $("h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3s.push(text);
  });

  return { h1: h1s, h2: h2s, h3: h3s };
}

function headingsEmpty(headings: HeadingData) {
  return headings.h1.length === 0 && headings.h2.length === 0 && headings.h3.length === 0;
}

async function scrapeWithPuppeteer(url: string): Promise<HeadingData | null> {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!executablePath) {
    return null;
  }

  try {
    const puppeteer = await import("puppeteer-core");
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    try {
      const page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 8000 });
      const html = await page.content();
      return extractHeadings(html);
    } finally {
      await browser.close();
    }
  } catch {
    return null;
  }
}

export async function scrapeHeadings(url: string): Promise<ScrapeResult> {
  try {
    const response = await axios.get<string>(url, {
      timeout: 8000,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      maxRedirects: 3,
      responseType: "text",
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const headings = extractHeadings(response.data);
    if (headingsEmpty(headings)) {
      const fallback = await scrapeWithPuppeteer(url);
      if (fallback && !headingsEmpty(fallback)) {
        return { success: true, headings: fallback };
      }
    }

    return { success: true, headings };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const fallback = await scrapeWithPuppeteer(url);
    if (fallback && !headingsEmpty(fallback)) {
      return { success: true, headings: fallback };
    }
    return { success: false, error: message };
  }
}

export async function scrapeMultipleUrls(
  urls: string[],
  delayMs: number = 1000,
): Promise<Map<string, ScrapeResult>> {
  const results = new Map<string, ScrapeResult>();

  for (const url of urls) {
    const result = await scrapeHeadings(url);
    results.set(url, result);
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
