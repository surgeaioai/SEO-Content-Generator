"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

const navLinkClass =
  "text-sm font-medium text-[#475569] transition-colors hover:text-indigo-600";

const activeClass = "text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5";

const toolsAiWriting = [
  { href: "/ai-seo-editor", label: "AI SEO Editor" },
  { href: "/ai-seo-writer", label: "AI SEO Writer" },
  { href: "/ai-news-writer", label: "AI News Writer" },
  { href: "/ai-listicle-generator", label: "AI Listicle Generator" },
  { href: "/youtube-to-blog", label: "YouTube to Blog" },
] as const;

const toolsAutomation = [
  { href: "/ai-seo-agent", label: "AI SEO Agent" },
  { href: "/autoblog", label: "Autoblog" },
  { href: "/seo-reports", label: "SEO Reports" },
  { href: "/llm-visibility", label: "LLM Visibility" },
] as const;

const resources = [
  { href: "/pricing", label: "Pricing" },
  { href: "/learn", label: "Learn" },
  { href: "/blog", label: "Blog" },
  { href: "/help-docs", label: "Help Docs" },
  { href: "/api-docs", label: "API Docs" },
] as const;

const solutions = [
  { href: "/solutions/saas", label: "SaaS" },
  { href: "/solutions/agencies", label: "Agencies" },
  { href: "/solutions/ecommerce", label: "E-Commerce" },
  { href: "/solutions/local-business", label: "Local Business" },
  { href: "/solutions/developers", label: "Developers" },
] as const;

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHashRoute = href.includes("#");
  const active =
    !isHashRoute && (pathname === href || (href !== "/" && pathname.startsWith(href)));
  return (
    <Link className={active ? `${navLinkClass} ${activeClass}` : navLinkClass} href={href}>
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <Link className="flex items-center gap-2 transition hover:opacity-90" href="/">
          <img
            src="/logo.png"
            alt="SEO Pro Logo"
            className="h-8 w-8 object-contain"
            loading="lazy"
          />
          <span className="text-lg font-semibold tracking-tight text-[#0F172A]">SEO Pro</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link className={navLinkClass} href="/#features">
            Features
          </Link>
          <Link className={navLinkClass} href="/#how">
            How
          </Link>
          <div className="group relative">
            <button
              className="text-sm font-medium text-[#475569] hover:text-indigo-600"
              type="button"
            >
              AI Writing
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-[#E2E8F0] bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {toolsAiWriting.map((item) => (
                <Link
                  key={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-indigo-50 hover:text-indigo-600"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="group relative">
            <button
              className="text-sm font-medium text-[#475569] hover:text-indigo-600"
              type="button"
            >
              Automation
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-[#E2E8F0] bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {toolsAutomation.map((item) => (
                <Link
                  key={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-indigo-50 hover:text-indigo-600"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="group relative">
            <button
              className="text-sm font-medium text-[#475569] hover:text-indigo-600"
              type="button"
            >
              Resources
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-[#E2E8F0] bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {resources.map((item) => (
                <Link
                  key={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-indigo-50 hover:text-indigo-600"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="group relative">
            <button
              className="text-sm font-medium text-[#475569] hover:text-indigo-600"
              type="button"
            >
              Solutions
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-[#E2E8F0] bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {solutions.map((item) => (
                <Link
                  key={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[#475569] hover:bg-indigo-50 hover:text-indigo-600"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink href="/pricing">Pricing</NavLink>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-lg border border-[#E2E8F0] p-2 text-[#0F172A]"
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Marketing
              </p>
              <Link className="block py-2 text-[#0F172A]" href="/#features" onClick={() => setOpen(false)}>
                Features
              </Link>
              <Link className="block py-2 text-[#0F172A]" href="/#how" onClick={() => setOpen(false)}>
                How it works
              </Link>
              <Link className="block py-2 text-[#0F172A]" href="/pricing" onClick={() => setOpen(false)}>
                Pricing
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                AI Writing
              </p>
              {toolsAiWriting.map((item) => (
                <Link
                  key={item.href}
                  className="block py-1.5 text-sm text-[#475569]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Automation
              </p>
              {toolsAutomation.map((item) => (
                <Link
                  key={item.href}
                  className="block py-1.5 text-sm text-[#475569]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Resources
              </p>
              {resources.map((item) => (
                <Link
                  key={item.href}
                  className="block py-1.5 text-sm text-[#475569]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Solutions
              </p>
              {solutions.map((item) => (
                <Link
                  key={item.href}
                  className="block py-1.5 text-sm text-[#475569]"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
