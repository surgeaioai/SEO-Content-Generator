"use client";

import Link from "next/link";

const footerColumns = [
  {
    title: "AI Writing",
    links: [
      { label: "AI SEO Editor", href: "/ai-seo-editor" },
      { label: "AI SEO Writer", href: "/ai-seo-writer" },
      { label: "AI News Writer", href: "/ai-news-writer" },
      { label: "AI Listicle Generator", href: "/ai-listicle-generator" },
      { label: "YouTube to Blog", href: "/youtube-to-blog" },
    ],
  },
  {
    title: "Automation",
    links: [
      { label: "AI SEO Agent", href: "/ai-seo-agent" },
      { label: "Autoblog", href: "/autoblog" },
      { label: "SEO Reports", href: "/seo-reports" },
      { label: "LLM Visibility", href: "/llm-visibility" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Learn", href: "/learn" },
      { label: "Blog", href: "/blog" },
      { label: "Help Docs", href: "/help-docs" },
      { label: "API Docs", href: "/api-docs" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "SaaS", href: "/solutions/saas" },
      { label: "Agencies", href: "/solutions/agencies" },
      { label: "E-Commerce", href: "/solutions/ecommerce" },
      { label: "Local Business", href: "/solutions/local-business" },
      { label: "Developers", href: "/solutions/developers" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#F1F5F9] px-4 py-16 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <img
                src="/logo.png"
                alt="SEO Pro Logo"
                className="h-10 w-10 object-contain"
                loading="lazy"
              />
              <span className="text-lg font-semibold text-[#0F172A]">SEO Pro</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#475569]">
              AI-powered SEO content and visibility platform.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold text-[#0F172A]">{column.title}</h3>
              <ul className="space-y-2 text-sm text-[#475569]">
                {column.links.map((item) => (
                  <li key={item.href}>
                    <Link className="transition-colors hover:text-indigo-600" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#E2E8F0] pt-8 md:flex-row">
          <p className="text-sm text-[#94A3B8]">© 2026 SEO Pro. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#475569]">
            <span className="cursor-not-allowed opacity-70">Privacy</span>
            <span className="cursor-not-allowed opacity-70">Terms</span>
            <a className="transition-colors hover:text-indigo-600" href="mailto:hello@seopro.com">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
