# SEO Content Intelligence Tool

Full-stack application to analyze the top-ranking SERP content for a keyword and generate SEO/AEO/LLM-optimized blog posts.

## Current Status

Phase 1 (foundation) is complete:
- Next.js app scaffolded with TypeScript + Tailwind (App Router)
- shadcn/ui initialized
- Core dependencies installed (axios, cheerio, framer-motion, zod, lucide-react)
- Theme system (light/dark toggle) added
- Stage 1 UI shell implemented on the home page
- Project structure scaffolded for all pages, API routes, and libraries

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- next-themes
- Axios + Cheerio
- Zod

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Fill in API keys in `.env.local`:

- `SERPAPI_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
src/
  app/
    page.tsx
    analyze/[projectId]/page.tsx
    configure/[projectId]/page.tsx
    result/[projectId]/page.tsx
    api/
      scrape-serp/route.ts
      scrape-headings/route.ts
      classify-pages/route.ts
      analyze-intent/route.ts
      recommend-angles/route.ts
      generate-blog/route.ts
  components/
    ui/
    KeywordInputForm.tsx
    AnalysisDashboard.tsx
    PageTypeBreakdown.tsx
    HeadingsList.tsx
    ContentAngleCard.tsx
    ConfigurationForm.tsx
    BlogPreview.tsx
    theme-provider.tsx
    theme-toggle.tsx
  lib/
    serp.ts
    scraper.ts
    classifier.ts
    llm.ts
    prompts.ts
    db.ts
    utils.ts
  types/
    index.ts
```

## Next Phase

Phase 2 will implement:
- Stage 1 form submission flow with project ID generation
- `lib/serp.ts` SerpAPI integration
- `lib/scraper.ts` heading extraction with fallback strategy
- `/api/scrape-serp` endpoint wired end to end
