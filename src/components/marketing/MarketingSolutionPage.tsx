type MarketingSolutionPageProps = {
  title: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  painPoints: [string, string, string];
  features: [string, string, string];
  testimonial: { quote: string; name: string; role: string };
};

export function MarketingSolutionPage({
  title,
  description,
  heroImage,
  heroAlt,
  painPoints,
  features,
  testimonial,
}: MarketingSolutionPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-indigo-50 to-violet-50 px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
              {title}
            </h1>
            <p className="text-lg leading-relaxed text-[#475569]">{description}</p>
          </div>
          <div>
            <img
              alt={heroAlt}
              className="h-[400px] w-full rounded-2xl border border-[#E2E8F0] object-cover shadow-xl"
              loading="lazy"
              src={heroImage}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-[#0F172A]">
            Pain points we solve
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {painPoints.map((p) => (
              <div
                key={p}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-[#475569]">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-[#0F172A]">
            Built for your workflow
          </h2>
          <ul className="mx-auto max-w-3xl space-y-4">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A]"
              >
                <span className="text-indigo-600">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <p className="mb-6 text-lg italic leading-relaxed text-[#475569]">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <p className="font-semibold text-[#0F172A]">{testimonial.name}</p>
          <p className="text-sm text-[#94A3B8]">{testimonial.role}</p>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Start today</h2>
          <button
            className="rounded-xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-md hover:bg-indigo-50"
            type="button"
          >
            Get Started
          </button>
        </div>
      </section>
    </main>
  );
}
