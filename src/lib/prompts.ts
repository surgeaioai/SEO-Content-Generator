export const CLASSIFY_PAGE_PROMPT = `You are a web page classifier. Given a page's title, URL, H1, and H2 headings,
classify it into ONE of these types:

- "Blog Post" — informational article, how-to, listicle
- "Service Page" — describes a service offering (e.g., "Web Design Services")
- "Product Page" — sells a specific product
- "Company/About Page" — homepage or about-us page
- "Comparison Page" — compares multiple options ("X vs Y", "Best of")
- "Category/Collection Page" — lists products or articles in a category
- "Landing Page" — single-purpose conversion page
- "News Article" — time-sensitive news content
- "Forum/Q&A" — Reddit, Quora, StackOverflow style
- "Video Page" — YouTube or video-first page

Respond ONLY with the type name. No explanation.`;

export const ANALYZE_INTENT_PROMPT = `Analyze the search intent for this keyword: "{keyword}"

Top ranking pages have these characteristics:
- Page types breakdown: {pageTypeStats}
- Common H1 patterns: {sampleH1s}
- Common topics in H2s: {sampleH2s}

Provide a JSON object with EXACTLY these keys:
{
  "primaryIntent": "Informational" | "Commercial" | "Transactional" | "Navigational",
  "secondaryIntent": "optional string",
  "userNeed": "one sentence",
  "preferredFormat": "blog post | comparison | listicle | guide | tutorial | other",
  "mustCoverTopics": ["8 to 12 strings"],
  "contentGaps": ["5 strings describing gaps"]
}

Return ONLY JSON. No markdown fences.`;

export const RECOMMEND_ANGLES_PROMPT = `Based on the SERP analysis below, suggest exactly 4 DISTINCT content angles I could write
to outrank competitors. Each angle should:
- Have a unique positioning (don't suggest 4 versions of the same thing)
- Address an identified gap or improve on competitor weakness
- Be appropriate for the dominant page type in SERP

Keyword: {keyword}
Intent JSON: {intent}
Page type counts JSON: {pageTypes}
Gaps JSON: {gaps}
Must-cover topics JSON: {mustCover}
Competitor H2 themes JSON: {h2Themes}

Return exactly 4 distinct content angles as a JSON array.
Each angle object must include these keys:
id, title, targetAudience, tone, estimatedWordCount, whyItWorks, angle, targetFormat, estimatedDifficulty

Where:
- id is 1..4
- targetFormat is one of: blog, guide, comparison, listicle, tutorial
- estimatedDifficulty is one of: Low, Medium, High
- tone is a short descriptor (e.g., Professional, Conversational, Authoritative)
- estimatedWordCount is an integer between 800 and 2500
- title max 60 characters`;

export const GENERATE_OUTLINE_PROMPT = `You are an expert SEO content strategist. Create a detailed blog outline for:

Keyword: {keyword}
Location: {location}
Selected angle JSON: {selectedAngle}
Target word count: {wordCount}
Search intent JSON: {intentAnalysis}
Must-cover topics JSON: {mustCoverTopics}
Identified gaps JSON: {gaps}
Competitor H2 samples JSON: {competitorH2s}
Brand guidelines: {brandGuidelines}
Extra target keywords JSON: {targetKeywords}
Internal links to weave in JSON: {internalLinks}
CTAs JSON: {ctas}

Create an outline that is BETTER than competitors by:
1. Covering all must-have topics
2. Filling identified gaps competitors miss
3. Optimizing for AEO (Answer Engine Optimization) — use question-based H2s where natural
4. Optimizing for LLM citations — include factual, citation-worthy statements
5. Structuring for featured snippets — include definition paragraphs, lists, tables

Return ONLY JSON with this shape:
{
  "h1": "primary H1 headline (under 60 chars, includes keyword naturally)",
  "metaDescription": "155-char meta description",
  "introduction": ["intro bullet 1", "intro bullet 2", "intro bullet 3"],
  "sections": [
    {
      "h2": "section heading",
      "wordTarget": 400,
      "subPoints": ["bullet 1", "bullet 2"],
      "h3s": [{"heading": "optional h3", "covers": "what it covers"}],
      "includeElements": ["definition", "list", "table", "example", "stat"]
    }
  ],
  "conclusion": ["conclusion bullet 1", "conclusion bullet 2"],
  "faqs": [{"question": "...", "answer": "brief factual answer"}]
}`;

export const WRITE_INTRO_PROMPT = `Write the introduction for a blog post as markdown.

Outline JSON: {fullOutline}
Brand voice: {brandGuidelines}
Keyword: {keyword}
Target words: {wordTarget}

Requirements:
- SEO: natural keyword + semantic variations
- AEO: short direct answer in the first 2 sentences
- Second-person POV ("you")
- No H1; start with plain paragraphs (no leading #)

Return ONLY markdown for the introduction.`;

export const WRITE_SECTION_PROMPT = `Write the following section of a blog post.

Full outline JSON: {fullOutline}
Current section JSON: {currentSection}
Target words for this section: {sectionWordTarget}
Brand voice: {brandGuidelines}
Keyword to weave in naturally: {keyword}
Internal links JSON: {internalLinks}
Target keywords JSON: {targetKeywords}

Writing requirements:
- SEO: Use the keyword and semantic variations naturally (no stuffing). Include LSI keywords.
- AEO: Start with a clear, citable answer. Use question-based subheadings where natural. Include definitions, lists, and tables.
- LLM-friendly: Make factual claims specific and verifiable. Use clear cause-effect language. Avoid fluff.
- Use second-person POV ("you")
- Short paragraphs (2–4 sentences max)
- Use bullet lists where they improve scanability
- Add one concrete example or data point per section
- Bold key phrases sparingly using **double asterisks**

Output: Pure markdown for this section only. Start with the H2 (##) matching the section's h2 exactly.`;

export const WRITE_CONCLUSION_PROMPT = `Write the conclusion as markdown for a blog post.

Outline JSON: {fullOutline}
Brand voice: {brandGuidelines}
Keyword: {keyword}
CTAs JSON: {ctas}

Requirements:
- Start with ## Conclusion
- 2 short paragraphs + optional bullet list
- Naturally include a CTA if ctas are provided

Return ONLY markdown.`;

export const WRITE_FAQ_PROMPT = `Expand FAQs into markdown.

FAQ outline JSON: {faqs}
Keyword: {keyword}

Return markdown starting with "## Frequently Asked Questions" and use ### for each question.`;

export const POLISH_PASS_PROMPT = `You are an editor. Improve transitions and remove duplicated headings.

Rules:
- Preserve all factual claims and structure
- Remove duplicate level-2 headings (##) if repeated
- Fix awkward jumps between sections
- Keep markdown format

Full markdown:
{markdown}

Return ONLY the polished markdown.`;
