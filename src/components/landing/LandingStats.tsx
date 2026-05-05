"use client";

const stats = [
  { label: "Articles drafted", value: "2.4M+", hint: "Across teams worldwide" },
  { label: "Avg. time saved", value: "18 hrs", hint: "Per writer every week" },
  { label: "Marketers onboarded", value: "20k+", hint: "Agencies & brands" },
  { label: "Markets covered", value: "150+", hint: "Locales & languages" },
];

export function LandingStats() {
  return (
    <section className="bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-16 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 text-center text-white sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="space-y-2 rounded-2xl bg-white/10 px-6 py-8 backdrop-blur-sm">
            <div className="text-4xl font-bold tracking-tight md:text-5xl">{item.value}</div>
            <div className="text-base font-semibold text-white">{item.label}</div>
            <p className="text-sm text-indigo-100">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
