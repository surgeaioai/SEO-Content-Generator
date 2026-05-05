export interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  headings?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  pageType?: string;
  scrapedSuccessfully?: boolean;
  errorMessage?: string;
}

export type ProjectStatus =
  | "scraping"
  | "analyzing"
  | "ready"
  | "generating"
  | "complete";

export interface IntentAnalysis {
  primaryIntent:
    | "Informational"
    | "Commercial"
    | "Transactional"
    | "Navigational";
  secondaryIntent?: string;
  userNeed: string;
  preferredFormat: string;
  mustCoverTopics: string[];
  contentGaps: string[];
  pageTypeBreakdown: Record<string, number>;
}

export interface ContentAngle {
  title: string;
  angle: string;
  targetFormat: string;
  estimatedDifficulty: "Low" | "Medium" | "High";
  whyItWorks: string;
  targetAudience: string;
}

export interface GeneratedBlog {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  markdown: string;
  html: string;
  wordCount: number;
  readingTime: number;
  headingStructure: Array<{ level: number; text: string }>;
  targetKeywords: string[];
  schemaMarkup: Record<string, unknown>;
  generationTimeSec?: number;
  seoScore?: number;
  contentType?: string;
  brandVoice?: string;
  qualityReport?: {
    score: number;
    checks: Array<{
      name: string;
      passed: boolean;
      message: string;
    }>;
    warnings: string[];
  };
  internalLinkSuggestions?: Array<{
    anchor: string;
    url: string;
    reason: string;
  }>;
  imageSuggestions?: Array<{
    placement: string;
    description: string;
    altText: string;
    aiPrompt: string;
  }>;
  seoChecklist: {
    keywordInH1: boolean;
    keywordInFirst100Words: boolean;
    metaDescriptionLength: boolean;
    headingHierarchy: boolean;
    internalLinksAdded: boolean;
    imageAltSuggestions: string[];
  };
}

export interface BlogConfig {
  wordCount: number;
  brandGuidelines?: string;
  brandVoice?: string;
  contentType?: string;
  internalLinks?: string[];
  targetKeywords?: string[];
  customKeywords?: string[];
  quickMode?: boolean;
  ctas?: string[];
}

export interface Project {
  id: string;
  keyword: string;
  location: string;
  serpResults: SerpResult[];
  intentAnalysis?: IntentAnalysis;
  recommendedAngles?: ContentAngle[];
  selectedAngle?: ContentAngle;
  contentType?: string;
  generatedBlog?: GeneratedBlog;
  lastBlogConfig?: BlogConfig;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
}
