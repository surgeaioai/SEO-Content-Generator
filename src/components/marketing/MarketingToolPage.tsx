type MarketingToolPageProps = {
  title: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  features: [string, string, string];
};

export function MarketingToolPage({
  title,
  description,
  heroImage,
  heroImageAlt,
  features,
}: MarketingToolPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-indigo-50 to-violet-50 px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
              AI-Powered Tool
            </span>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
              {title}
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-[#475569]">{description}</p>
            <button
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90"
              type="button"
            >
              Get Started Free
            </button>
          </div>
          <div>
            <img
              alt={heroImageAlt}
              className="h-[400px] w-full rounded-2xl border border-[#E2E8F0] object-cover shadow-xl"
              loading="lazy"
              src={heroImage}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#0F172A] md:text-4xl">
            Key Features
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((text) => (
              <div
                key={text}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-base leading-relaxed text-[#475569]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#0F172A]">Try It Now</h2>
          <p className="mb-8 text-[#475569]">Enter your topic below to get started</p>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            <input
              className="mb-4 w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your keyword or topic..."
              type="text"
            />
            <button
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition-all hover:opacity-90"
              type="button"
            >
              Generate Now
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Scale Your Content?</h2>
          <p className="mb-8 text-lg text-indigo-100">
            Join thousands of marketers using our AI tools
          </p>
          <button
            className="rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-md transition-all hover:bg-indigo-50"
            type="button"
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </main>
  );
}
