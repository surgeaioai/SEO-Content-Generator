import { MARKETING_IMAGES } from "@/data/marketing-images";

const posts = [
  {
    slug: "serp-to-outline",
    title: "From SERP snapshot to outline in under five minutes",
    category: "Workflow",
    date: "Apr 18, 2026",
    image: MARKETING_IMAGES.writingBlog,
  },
  {
    slug: "aeo-checklist",
    title: "The pragmatic AEO checklist for 2026",
    category: "Strategy",
    date: "Apr 10, 2026",
    image: MARKETING_IMAGES.seoAnalytics,
  },
  {
    slug: "tables-that-rank",
    title: "Why comparison tables still win helpful content updates",
    category: "SEO",
    date: "Mar 29, 2026",
    image: MARKETING_IMAGES.reportsCharts,
  },
  {
    slug: "brand-voice",
    title: "Teaching models your voice without sounding robotic",
    category: "Editorial",
    date: "Mar 22, 2026",
    image: MARKETING_IMAGES.agencyTeam,
  },
  {
    slug: "llm-citations",
    title: "What LLM citations mean for measurement teams",
    category: "Analytics",
    date: "Mar 12, 2026",
    image: MARKETING_IMAGES.aiAutomation,
  },
  {
    slug: "cms-handoff",
    title: "Clean CMS handoffs from Markdown to rich HTML",
    category: "Ops",
    date: "Mar 2, 2026",
    image: MARKETING_IMAGES.dashboardTool,
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
            Insights
          </h1>
          <p className="text-lg text-[#475569]">
            Practical notes on SEO, AEO, and AI-assisted publishing.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                alt=""
                className="h-48 w-full object-cover"
                loading="lazy"
                src={post.image}
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="mb-2 inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                  {post.category}
                </span>
                <h2 className="text-xl font-semibold text-[#0F172A]">{post.title}</h2>
                <p className="mt-auto pt-6 text-sm text-[#94A3B8]">{post.date}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
