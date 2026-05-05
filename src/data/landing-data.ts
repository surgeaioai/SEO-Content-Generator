import {
  BarChart3,
  Bot,
  FileText,
  Globe,
  Rocket,
  Wand2,
} from "lucide-react";

export const featureShowcases = [
  {
    label: "AI SEO Writer",
    title: "Write, Publish, and Schedule",
    bullets: [
      "Generate brand-tailored content in 150+ languages",
      "Publish to your CMS with a press of a button",
      "Set a schedule and frequency for auto-posting",
    ],
    cta: "Discover SEO Writer",
    icon: FileText,
    mockLabel: "Article Editor Preview",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    reverse: false,
  },
  {
    label: "AI SEO Editor",
    title: "Edit New and Existing Content",
    bullets: [
      "Rewrite content with custom prompts",
      "Add internal and external links",
      "Regenerate images with custom prompts",
      "Sprinkle in keywords naturally",
    ],
    cta: "Discover Content Editor",
    icon: Wand2,
    mockLabel: "Content Editor Workspace",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    reverse: true,
  },
  {
    label: "SEO Agent",
    title: "Fix Issues with AI SEO Agents",
    bullets: [
      "AI agents find SEO issues and deploy fixes automatically",
      "Add structured data (schema markup)",
      "Optimize meta titles and descriptions",
      "Improve internal linking structure",
      "Add image alt texts and canonical URLs",
    ],
    cta: "Discover AI Agent",
    icon: Bot,
    mockLabel: "Technical SEO Dashboard",
    image:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    reverse: false,
  },
  {
    label: "Autoblog",
    title: "Automated AI Blog in Seconds",
    bullets: [
      "Generate content from RSS, keywords, and YouTube videos",
      "Manual or automated scheduling",
      "Auto-publish social media posts",
      "Index 10x faster on Google",
    ],
    cta: "Discover Autoblog",
    icon: Rocket,
    mockLabel: "Autoblog Campaign Preview",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    reverse: true,
  },
  {
    label: "LLM Brand Tracker",
    title: "Track LLM Brand Mentions",
    bullets: [
      "Track brand mentions across multiple LLMs",
      "Track brand sentiment",
      "Track unlimited prompts",
      "Preview how LLMs showcase your brand",
    ],
    cta: "Discover LLM Tracker",
    icon: Globe,
    mockLabel: "LLM Visibility Analytics",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    reverse: false,
  },
] as const;

export const testimonials = [
  {
    name: "Timo Specht",
    title: "Agency Owner @SpechtGmbH",
    quote:
      "We're ranking for SEO agency Munich and SEO Munich on the top of Google. We've been doing it for 2 months now and it's down to how easy it is to create content.",
  },
  {
    name: "Alicia Reagan",
    title: "Founder @VoiceForTheVulnerable",
    quote:
      "I've been absolutely blown away. I've been able to take on so many more clients and increase my business because I'm not spending forever writing these blogs.",
  },
  {
    name: "Abhinav Singh",
    title: "Agency Owner @theinterconnections",
    quote:
      "Helping us rank a lot of our clients in a short span of two months for very specific keywords. Writing a 2,500 word piece used to take a week, now it takes 45 minutes.",
  },
  {
    name: "Patrick Walsh",
    title: "Founder @PublishingPush",
    quote:
      "Use it for a while, published lots of articles, forgot about it, and where we track inquiries we started getting more which were organic from Google.",
  },
  {
    name: "Harrisson D.",
    title: "Agency Owner @CX.agency",
    quote:
      "You guys really opened my eyes to AI generated content for SEO. I started using you, threw up a couple posts, and started watching my website climb through rankings.",
  },
  {
    name: "Gray Mitchell",
    title: "Agency Owner @igriss",
    quote:
      "I wanted SEO workflow automations for my agency clients. It's been producing really high quality content. Way better than anything we could ever build.",
  },
  {
    name: "Nathan Pennington",
    title: "Marketer",
    quote:
      "SEO Pro produces the most beautiful content. I was really impressed with the thoroughness of the articles. Each article has SEO-optimized images too.",
  },
  {
    name: "Greg Jeffries",
    title: "Owner @SEO Affiliate Domination",
    quote:
      "What got my attention was the internal linking, the intelligent external linking, and the publishing automation.",
  },
  {
    name: "Karan",
    title: "Marketer",
    quote:
      "It's by far the best product out there for research, formatting, and overall quality. Whenever I have an issue, the founder is always on it.",
  },
  {
    name: "Lloyd Divens",
    title: "Owner @CourseBuildingPros",
    quote:
      "It's the most important tool I use in my business. If you're serious about growing your website traffic you should use this tool.",
  },
  {
    name: "Elliot Dean",
    title: "Agency Owner @Temerity Digital",
    quote:
      "We've got about 40 SEO clients. When I saw SEO Pro at this conference I was at I'm like, 'Oh, wow. This looks really good!'",
  },
  {
    name: "Demelza Hay",
    title: "CE @Cointelegraph",
    quote: "This is incredible. I'm really happy!",
  },
  {
    name: "Carlos Courtney",
    title: "Agency Owner",
    quote: "In the past three weeks, our impressions have gone up about 12,000%",
  },
  {
    name: "Rares Marciu",
    title: "Ecom Store Owner",
    quote: "SEO Pro publishes for me while I sleep, and I'm getting traffic.",
  },
  {
    name: "Tess Robinson",
    title: "Go Viral Now",
    quote:
      "SEO Pro is one of the best tools if not the best, that's out there for writing and automating blog content.",
  },
] as const;

export const caseStudies = [
  {
    metric: "0 -> 14,000/mo",
    growth: "+1400%",
    title: "From 0 to 14,000/mo in 60 Days",
    description: "Under30CEO is the leading media site for young entrepreneurs.",
  },
  {
    metric: "0 -> 5,800",
    growth: "+580%",
    title: "0 to 5,800 in 30 days",
    description: "From 0 to a peak of 15,000/mo from US-based traffic.",
  },
  {
    metric: "1k -> 24,000",
    growth: "+2400%",
    title: "1k to 24,000 in 12 months",
    description: "From sub-2000 to 24,000/mo + ranking on LLMs worth $4,500/mo.",
  },
  {
    metric: "300%",
    growth: "+300%",
    title: "300% Traffic Increase",
    description: "SmarterGlass leveraged SEO Pro for high-buying intent keywords.",
  },
  {
    metric: "26,000/mo",
    growth: "+2600%",
    title: "26,000/mo Traffic with AI Content",
    description: "SelfEmployed used SEO Pro to drive search traffic to content.",
  },
  {
    metric: "6,000/mo",
    growth: "+600%",
    title: "6,000 Monthly Visitors in Health Niche",
    description: "Dr. Jeffrey Mark used SEO Pro for his medical practice.",
  },
  {
    metric: "5,400/mo",
    growth: "+540%",
    title: "5,400/mo Traffic from Videos",
    description: "Converting English videos into French blog posts.",
  },
  {
    metric: "Rank #1",
    growth: "24 hrs",
    title: "Ranking #1 in 24 Hours",
    description: "Outranking the competition with our own product.",
  },
] as const;

export const faqs = [
  {
    question: "Are the articles copyright/plagiarism free?",
    answer:
      "Yes. The content is AI-generated and built to be unique and non-duplicative, reducing plagiarism concerns.",
  },
  {
    question: "Can Google tell if an article is written by AI?",
    answer:
      "Google focuses on quality and helpfulness. High-quality content that serves users can perform well regardless of creation method.",
  },
  {
    question: "Can I edit the articles before they go live?",
    answer:
      "Absolutely. You can revise sections, regenerate snippets, add links, and tune tone before publishing.",
  },
  {
    question: "Can I customize the structure of articles?",
    answer:
      "Yes. You can include custom sections, FAQs, introductions, and tailored content blocks.",
  },
  {
    question: "Can I integrate with other platforms?",
    answer:
      "Yes. You can connect common CMS platforms and automation tools for publishing workflows.",
  },
  {
    question: "Can I post generated blogs directly to my website?",
    answer:
      "Yes, direct publishing is supported through integrations and export flows.",
  },
  {
    question: "Can I use AI to write articles?",
    answer:
      "Yes. SEO Pro combines AI generation with your guidelines and brand voice to keep content aligned and useful.",
  },
  {
    question: "Can I use this for multiple sites?",
    answer:
      "Yes. You can run content workflows for multiple brands and properties.",
  },
  {
    question: "Do generated blogs include images, videos and links?",
    answer:
      "Yes. Output supports images, links, structured sections, and rich formatting like tables and lists.",
  },
  {
    question: "Do you have an affiliate program?",
    answer:
      "Yes. We support recurring referral commissions for qualifying partners.",
  },
  {
    question: "Do you support internal and external linking?",
    answer:
      "Yes. You can suggest, insert, and refine internal/external links during editing and generation.",
  },
  {
    question: "Does Google penalize AI content?",
    answer:
      "Google does not inherently penalize AI content; low-value content is the real risk.",
  },
  {
    question: "Does SEO Pro pass AI detectors?",
    answer:
      "Detection tools vary. We optimize for clarity, usefulness, and authenticity over detector scores.",
  },
  {
    question: "Is it legal to use AI to write articles?",
    answer:
      "Generally yes, but legal frameworks vary by jurisdiction. You should review your local requirements.",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "SEO Pro is an end-to-end workflow: SERP analysis, strategy, generation, optimization, and publishing readiness.",
  },
  {
    question: "How does Google auto-indexing work?",
    answer:
      "Connect your stack and submit content through indexing workflows for faster discovery.",
  },
] as const;

export const featureCards = [
  {
    icon: FileText,
    title: "AI Article Writer",
    description:
      "Generate SEO-optimized articles with custom keywords, brand voice, and targeted intent in 90 seconds.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: BarChart3,
    title: "SERP Intelligence",
    description:
      "Analyze top ranking pages, extract heading patterns, and identify content gaps automatically.",
    gradient: "from-indigo-600 to-emerald-500",
  },
  {
    icon: Bot,
    title: "AEO Optimization",
    description:
      "Get cited by ChatGPT, Claude, and Perplexity with answer-engine-first optimization.",
    gradient: "from-violet-500 to-indigo-600",
  },
] as const;
