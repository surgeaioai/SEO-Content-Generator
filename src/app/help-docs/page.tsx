export default function HelpDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
            Help Center
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-[#475569]">
            Search guides covering imports, workflows, and billing—written for operators, not bots.
          </p>
          <label className="mx-auto block max-w-xl">
            <span className="sr-only">Search documentation</span>
            <input
              className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-[#0F172A] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search articles…"
              type="search"
            />
          </label>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Getting started
            </p>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">Projects & workspaces</li>
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">Keyword ingestion</li>
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">Exports</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Troubleshooting
            </p>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">SERP scraping limits</li>
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">Provider connectivity</li>
              <li className="rounded-lg px-2 py-1 hover:bg-indigo-50">Billing FAQ</li>
            </ul>
          </div>
        </aside>

        <article className="space-y-10 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#0F172A]">Kickoff checklist</h2>
            <p className="text-base leading-relaxed text-[#475569]">
              Connect your workspace, confirm keyword locales, and verify exports land where your CMS expects them.
              Each project stores SERP snapshots so you can revisit angle decisions later.
            </p>
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#0F172A]">Need more help?</h2>
            <p className="text-[#475569]">
              Email{" "}
              <a className="font-semibold text-indigo-600" href="mailto:hello@seopro.com">
                hello@seopro.com
              </a>{" "}
              with your project ID for faster routing.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
