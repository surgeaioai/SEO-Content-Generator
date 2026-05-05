import Link from "next/link";

import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-indigo-50 to-violet-50 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="mb-4 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              Resources
            </span>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
              Learn modern SEO workflows
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-[#475569]">
              Playbooks for keyword research, SERP analysis, and AI-assisted publishing—built for operators who ship every week.
            </p>
            <Link
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 font-semibold text-white shadow-md transition-all hover:opacity-90"
              href="/blog"
            >
              Browse the blog
            </Link>
          </div>
          <img
            alt="Team learning and collaboration"
            className="h-64 w-full rounded-2xl border border-[#E2E8F0] object-cover shadow-md md:h-[480px]"
            loading="lazy"
            src={MARKETING_IMAGES.agencyTeam}
          />
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] md:text-4xl">Coming soon</h2>
          <p className="text-[#475569]">
            Structured courses and live cohorts will live here. For now, explore the blog and product tools to go from keyword to publish-ready draft.
          </p>
        </div>
      </section>
    </main>
  );
}
