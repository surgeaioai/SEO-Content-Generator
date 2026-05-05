import { z } from "zod";

import { callLLM, callLLMJson } from "@/lib/llm";
import {
  GENERATE_OUTLINE_PROMPT,
  POLISH_PASS_PROMPT,
  WRITE_CONCLUSION_PROMPT,
  WRITE_FAQ_PROMPT,
  WRITE_INTRO_PROMPT,
  WRITE_SECTION_PROMPT,
} from "@/lib/prompts";
import { markdownToHtml } from "@/lib/markdown";
import { validateBlogQuality } from "@/lib/blog-quality";
import { generateImageSuggestions } from "@/lib/image-suggestions";
import { suggestInternalLinks } from "@/lib/internal-linking";
import { slugify } from "@/lib/slug";
import type {
  ContentAngle,
  GeneratedBlog,
  IntentAnalysis,
  Project,
} from "@/types";

const outlineSectionSchema = z.object({
  h2: z.string().min(1),
  wordTarget: z.number().int().positive().max(5000),
  subPoints: z.array(z.string()).default([]),
  h3s: z
    .array(
      z.object({
        heading: z.string(),
        covers: z.string(),
      }),
    )
    .default([]),
  includeElements: z.array(z.string()).default([]),
});

const outlineSchema = z.object({
  h1: z.string().min(1).max(200),
  metaDescription: z.string().min(1).max(220),
  introduction: z.array(z.string()).min(1).max(12),
  sections: z.array(outlineSectionSchema).min(3).max(20),
  conclusion: z.array(z.string()).min(1).max(12),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .min(1)
    .max(12),
});

type Outline = z.infer<typeof outlineSchema>;

function getBrandVoiceDescription(voice?: string): string {
  const voices: Record<string, string> = {
    professional: "Authoritative, industry-expert tone. Use data and research.",
    friendly: "Warm, conversational, approachable voice.",
    playful: "Fun, witty, casual; still clear and useful.",
    technical: "Detailed, precise, and jargon-aware for expert audiences.",
    storytelling: "Narrative-driven, engaging, and emotionally resonant.",
    persuasive: "Convincing, action-oriented, and benefit-focused.",
  };
  return voices[voice ?? "professional"] ?? voices.professional;
}

const TABLE_FORMATTING_GUARDRAILS = `
CRITICAL TABLE INSTRUCTIONS:
- If you output a markdown table, every row MUST be on its own line.
- Always include a separator row with hyphens after the header row.

Correct:
| Feature | Tool A | Tool B |
|---------|--------|--------|
| Price | $99 | $199 |
| Users | 5 | 25 |

Wrong:
| Feature | Tool A | Tool B | |---|---|---| | Price | $99 | $199 |
`;

function sampleH2Themes(serpResults: Project["serpResults"], limit = 40) {
  const bag = new Map<string, number>();
  for (const row of serpResults) {
    for (const h2 of row.headings?.h2 ?? []) {
      const key = h2.trim().toLowerCase();
      if (!key) continue;
      bag.set(key, (bag.get(key) ?? 0) + 1);
    }
  }
  return [...bag.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text]) => text);
}

function countWords(text: string) {
  return text.trim().length
    ? text.trim().split(/\s+/).filter(Boolean).length
    : 0;
}

function extractHeadingStructure(markdown: string) {
  const lines = markdown.split("\n");
  const structure: Array<{ level: number; text: string }> = [];
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    structure.push({ level: match[1].length, text: match[2].trim() });
  }
  return structure;
}

function headingHierarchyOk(structure: Array<{ level: number; text: string }>) {
  if (structure.length === 0) return false;
  let prev = 1;
  for (const item of structure) {
    if (item.level > prev + 1) {
      return false;
    }
    prev = item.level;
  }
  return true;
}

function firstContentAfterH1(markdown: string) {
  const withoutTitle = markdown.replace(/^#\s+.+\n+/, "");
  return withoutTitle.slice(0, 800);
}

function buildSchema(params: {
  projectId: string;
  keyword: string;
  h1: string;
  metaDescription: string;
  slug: string;
  faqs: Outline["faqs"];
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl.replace(/\/$/, "")}/result/${params.projectId}`;

  const article = {
    "@type": "Article",
    headline: params.h1,
    description: params.metaDescription,
    inLanguage: "en",
    mainEntityOfPage: url,
    keywords: params.keyword,
  };

  const faq = {
    "@type": "FAQPage",
    mainEntity: params.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [article, faq],
  };
}

function buildImageAltSuggestions(keyword: string, headings: string[]) {
  const samples = headings.slice(0, 6).filter(Boolean);
  const alts = [
    `${keyword} — hero visual explaining the core decision framework`,
    `Comparison chart related to ${keyword}`,
    `Step-by-step diagram for ${keyword}`,
  ];

  samples.forEach((h, idx) => {
    alts.push(`Illustration supporting: ${h} (${idx + 1})`);
  });

  return alts.slice(0, 8);
}

function toGeneratedBlog(params: {
  projectId: string;
  keyword: string;
  markdown: string;
  h1Fallback: string;
  targetKeywords: string[];
  generationTimeSec?: number;
  faqSeed?: Array<{ question: string; answer: string }>;
}) {
  const lines = params.markdown.split("\n");
  const firstH1 = lines.find((line) => /^#\s+/.test(line.trim()));
  const h1 = firstH1 ? firstH1.replace(/^#\s+/, "").trim() : params.h1Fallback;
  const headingStructure = extractHeadingStructure(params.markdown);

  const keywordLc = params.keyword.trim().toLowerCase();
  const h1Lc = h1.toLowerCase();
  const firstChunk = firstContentAfterH1(params.markdown).toLowerCase();
  const firstWords = firstChunk.split(/\s+/).slice(0, 100).join(" ");

  const metaDescriptionCandidate =
    lines.find((line) => line.trim().length >= 120 && line.trim().length <= 165) ??
    `${params.keyword} — practical guide and actionable recommendations.`;

  const slug = slugify(h1);
  const wordCount = countWords(params.markdown);
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const schemaMarkup = buildSchema({
    projectId: params.projectId,
    keyword: params.keyword,
    h1,
    metaDescription: metaDescriptionCandidate.trim(),
    slug,
    faqs: params.faqSeed && params.faqSeed.length > 0
      ? params.faqSeed
      : [{ question: "What should you do next?", answer: "Use this guide as a checklist before you publish." }],
  });

  const seoChecklist = {
    keywordInH1: keywordLc.length > 0 && h1Lc.includes(keywordLc),
    keywordInFirst100Words:
      keywordLc.length > 0 && firstWords.includes(keywordLc),
    metaDescriptionLength:
      metaDescriptionCandidate.trim().length >= 120 &&
      metaDescriptionCandidate.trim().length <= 165,
    headingHierarchy: headingHierarchyOk(headingStructure),
    internalLinksAdded: true,
    imageAltSuggestions: buildImageAltSuggestions(
      params.keyword,
      headingStructure.filter((h) => h.level === 2).map((h) => h.text),
    ),
  };

  return {
    h1,
    metaTitle: h1.slice(0, 70),
    metaDescription: metaDescriptionCandidate.trim(),
    slug,
    markdown: params.markdown,
    wordCount,
    readingTime,
    headingStructure,
    targetKeywords: params.targetKeywords,
    schemaMarkup,
    seoChecklist,
    generationTimeSec: params.generationTimeSec,
  };
}

export async function generateBlogFast(params: {
  projectId: string;
  keyword: string;
  selectedAngle: ContentAngle;
  wordCount: number;
  brandGuidelines?: string;
  brandVoice?: string;
  contentType?: string;
  customKeywords?: string[];
  intentAnalysis: IntentAnalysis;
}): Promise<GeneratedBlog> {
  const {
    projectId,
    keyword,
    selectedAngle,
    wordCount,
    brandGuidelines,
    brandVoice,
    contentType,
    customKeywords,
    intentAnalysis,
  } = params;

  const secondaryKeywords = customKeywords?.filter(Boolean) ?? [];
  const sectionCount = Math.max(4, Math.min(10, Math.floor(wordCount / 500)));

  const singlePassPrompt = `You are a world-class SEO content writer creating publication-ready content.

PRIMARY KEYWORD: ${keyword}
SECONDARY KEYWORDS: ${secondaryKeywords.join(", ") || "None specified"}
CONTENT TYPE: ${contentType ?? "blog"}
CONTENT ANGLE: ${selectedAngle.title}
TARGET LENGTH: ${wordCount} words (±10%)
BRAND VOICE: ${brandGuidelines || "Professional, informative"}
VOICE STYLE: ${getBrandVoiceDescription(brandVoice)}

REQUIREMENTS:
1. Start with a Quick Answer callout near top:
   > **Quick Answer:** direct answer in 2-3 sentences.
2. SEO optimized (keyword in H1, first 100 words, naturally throughout)
3. Clear H1 -> H2 -> H3 hierarchy
4. Include introduction, ${sectionCount} main sections, Key Takeaways, conclusion
5. Use bullet points and short paragraphs for readability
6. Include 5-7 FAQs at the end
7. Write in second-person POV ("you")
8. Include at least one comparison or step-by-step table when relevant.
9. When using comparison tables, use strict markdown table syntax with each row on its own line:
   | Header A | Header B |
   |----------|----------|
   | Row 1    | Value    |
${TABLE_FORMATTING_GUARDRAILS}
10. Add one stat callout in this style:
   > 📊 **Key Stat:** [stat with source]
11. End with:
   ## Key Takeaways
   - ✅ Point 1
   - ✅ Point 2
   - ✅ Point 3

SEARCH INTENT: ${intentAnalysis.primaryIntent}
MUST COVER: ${intentAnalysis.mustCoverTopics.join(", ")}
GAPS TO FILL: ${intentAnalysis.contentGaps.join(", ")}

OUTPUT FORMAT:
Return ONLY the markdown blog post. No preamble, no explanations.
Start with # H1 title, then content.

Write the complete ${wordCount}-word blog now.`;

  const startedAt = Date.now();
  const markdown = await callLLM(
    "You are an expert SEO content writer.",
    singlePassPrompt,
    Math.min(wordCount * 2, 16_000),
    false,
  );
  const generationTimeSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

  const base = toGeneratedBlog({
    projectId,
    keyword,
    markdown: markdown.trim(),
    h1Fallback: `${keyword} — ${selectedAngle.title}`,
    targetKeywords: [keyword, ...secondaryKeywords],
    generationTimeSec,
  });

  const html = await markdownToHtml(base.markdown);
  const qualityReport = validateBlogQuality(base.markdown, keyword, wordCount);
  const [internalLinkSuggestions, imageSuggestions] = await Promise.all([
    suggestInternalLinks(base.markdown, []),
    generateImageSuggestions(base.markdown),
  ]);

  return {
    ...base,
    html,
    qualityReport,
    seoScore: qualityReport.score,
    brandVoice: brandVoice ?? "professional",
    contentType: contentType ?? "blog",
    internalLinkSuggestions,
    imageSuggestions,
  };
}

export async function generateFullBlog(params: {
  project: Project;
  angle: ContentAngle;
  wordCount: number;
  brandGuidelines?: string;
  brandVoice?: string;
  contentType?: string;
  internalLinks?: string[];
  targetKeywords?: string[];
  ctas?: string[];
}): Promise<GeneratedBlog> {
  const startedAt = Date.now();
  const { project, angle, wordCount } = params;

  if (!project.intentAnalysis) {
    throw new Error("Intent analysis is required before generation");
  }

  const intent = project.intentAnalysis;

  const brandGuidelines =
    params.brandGuidelines?.trim() ||
    "Voice: clear, friendly, authoritative. Use second person. Avoid hype and filler.";

  const internalLinks = params.internalLinks ?? [];
  const targetKeywords = [
    ...(params.targetKeywords ?? []),
    project.keyword,
  ].filter(Boolean);

  const ctas = params.ctas ?? [];
  const brandVoice = params.brandVoice ?? "professional";
  const contentType = params.contentType ?? project.contentType ?? "blog";

  const competitorH2s = sampleH2Themes(project.serpResults);

  const outlinePrompt = GENERATE_OUTLINE_PROMPT.replace("{keyword}", project.keyword)
    .replace("{location}", project.location)
    .replace("{selectedAngle}", JSON.stringify(angle))
    .replace("{wordCount}", String(wordCount))
    .replace("{intentAnalysis}", JSON.stringify(intent))
    .replace("{mustCoverTopics}", JSON.stringify(intent.mustCoverTopics))
    .replace("{gaps}", JSON.stringify(intent.contentGaps))
    .replace("{competitorH2s}", JSON.stringify(competitorH2s))
    .replace("{brandGuidelines}", brandGuidelines)
    .replace("{targetKeywords}", JSON.stringify(targetKeywords))
    .replace("{internalLinks}", JSON.stringify(internalLinks))
    .replace("{ctas}", JSON.stringify(ctas));

  const outlineUnknown = await callLLMJson<unknown>(
    "You are an expert SEO content strategist.",
    outlinePrompt,
    6000,
  );

  const outline = outlineSchema.parse(outlineUnknown);

  const introTarget = Math.min(320, Math.max(180, Math.round(wordCount * 0.08)));

  const intro = await callLLM(
    "You are an expert blog writer.",
    WRITE_INTRO_PROMPT.replace("{fullOutline}", JSON.stringify(outline))
      .replace("{brandGuidelines}", brandGuidelines)
      .replace("{keyword}", project.keyword)
      .replace("{wordTarget}", String(introTarget)),
    1200,
  );

  let markdown = `# ${outline.h1}\n\n${intro.trim()}\n\n`;

  for (const section of outline.sections) {
    const sectionPrompt = WRITE_SECTION_PROMPT.replace(
      "{fullOutline}",
      JSON.stringify(outline),
    )
      .replace("{currentSection}", JSON.stringify(section))
      .replace("{sectionWordTarget}", String(section.wordTarget))
      .replace("{brandGuidelines}", brandGuidelines)
      .replace("{keyword}", project.keyword)
      .replace("{internalLinks}", JSON.stringify(internalLinks))
      .replace("{targetKeywords}", JSON.stringify(targetKeywords));

    const sectionMd = await callLLM(
      "You are an expert blog writer.",
      sectionPrompt,
      3500,
    );

    markdown += `${sectionMd.trim()}\n\n`;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  const conclusion = await callLLM(
    "You are an expert blog writer.",
    WRITE_CONCLUSION_PROMPT.replace("{fullOutline}", JSON.stringify(outline))
      .replace("{brandGuidelines}", brandGuidelines)
      .replace("{keyword}", project.keyword)
      .replace("{ctas}", JSON.stringify(ctas)),
    1200,
  );

  markdown += `${conclusion.trim()}\n\n`;

  if (outline.faqs.length > 0) {
    const faqMd = await callLLM(
      "You are an expert blog writer.",
      WRITE_FAQ_PROMPT.replace("{faqs}", JSON.stringify(outline.faqs)).replace(
        "{keyword}",
        project.keyword,
      ),
      2500,
    );
    markdown += `${faqMd.trim()}\n\n`;
  }

  const polished = await callLLM(
    "You are a meticulous editor.",
    POLISH_PASS_PROMPT.replace("{markdown}", markdown.slice(0, 120_000)),
    6000,
  );

  markdown = polished.trim();

  const slug = slugify(outline.h1);
  const metaTitle = outline.h1.slice(0, 70);

  const html = await markdownToHtml(markdown);
  const wordCountActual = countWords(markdown);
  const readingTime = Math.max(1, Math.round(wordCountActual / 200));
  const headingStructure = extractHeadingStructure(markdown);

  const keywordLc = project.keyword.trim().toLowerCase();
  const h1Lc = outline.h1.toLowerCase();
  const firstChunk = firstContentAfterH1(markdown).toLowerCase();
  const firstWords = firstChunk.split(/\s+/).slice(0, 100).join(" ");

  const internalLinksAdded =
    internalLinks.length === 0
      ? true
      : internalLinks.every((link) => markdown.includes(link));

  const seoChecklist = {
    keywordInH1: keywordLc.length > 0 && h1Lc.includes(keywordLc),
    keywordInFirst100Words:
      keywordLc.length > 0 && firstWords.includes(keywordLc),
    metaDescriptionLength:
      outline.metaDescription.length >= 120 &&
      outline.metaDescription.length <= 165,
    headingHierarchy: headingHierarchyOk(headingStructure),
    internalLinksAdded,
    imageAltSuggestions: buildImageAltSuggestions(
      project.keyword,
      headingStructure.filter((h) => h.level === 2).map((h) => h.text),
    ),
  };

  const schemaMarkup = buildSchema({
    projectId: project.id,
    keyword: project.keyword,
    h1: outline.h1,
    metaDescription: outline.metaDescription,
    slug,
    faqs: outline.faqs,
  });

  return {
    h1: outline.h1,
    metaTitle,
    metaDescription: outline.metaDescription,
    slug,
    markdown,
    html,
    wordCount: wordCountActual,
    readingTime,
    headingStructure,
    targetKeywords,
    schemaMarkup,
    seoChecklist,
    seoScore: validateBlogQuality(markdown, project.keyword, wordCount).score,
    qualityReport: validateBlogQuality(markdown, project.keyword, wordCount),
    brandVoice,
    contentType,
    internalLinkSuggestions: await suggestInternalLinks(markdown, internalLinks),
    imageSuggestions: await generateImageSuggestions(markdown),
    generationTimeSec: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
  };
}
