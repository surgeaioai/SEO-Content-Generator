"use client";

import { useMemo, useState } from "react";

const tiers = [
  {
    name: "Starter",
    monthly: 49,
    annual: 39,
    description: "For solo creators validating SEO workflows.",
    features: ["5 generations / month", "SERP snapshots", "Markdown export"],
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 149,
    annual: 119,
    description: "For teams publishing weekly with QA checkpoints.",
    features: [
      "Unlimited generations",
      "Advanced outlines",
      "CMS-ready HTML",
      "Priority refresh cadence",
    ],
    highlight: true,
  },
  {
    name: "Agency",
    monthly: 399,
    annual: 329,
    description: "For agencies coordinating multiple workspaces.",
    features: ["Dedicated success notes", "Bulk exports", "White-label PDF briefs"],
    highlight: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const label = useMemo(() => (annual ? "billed annually" : "billed monthly"), [annual]);

  return (
    <main className="min-h-screen bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
            Predictable pricing
          </h1>
          <p className="text-lg text-[#475569]">
            Switch billing anytime—every tier includes SERP-informed drafting.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-1">
            <button
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                !annual ? "bg-white text-indigo-600 shadow-sm" : "text-[#475569]"
              }`}
              onClick={() => setAnnual(false)}
              type="button"
            >
              Monthly
            </button>
            <button
              className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                annual ? "bg-white text-indigo-600 shadow-sm" : "text-[#475569]"
              }`}
              onClick={() => setAnnual(true)}
              type="button"
            >
              Annual
            </button>
          </div>
          <p className="mt-3 text-sm text-[#94A3B8]">{label}</p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                tier.highlight ? "border-indigo-500 ring-2 ring-indigo-100" : "border-[#E2E8F0]"
              }`}
            >
              {tier.highlight ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Most popular
                </span>
              ) : (
                <span className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {tier.name}
                </span>
              )}
              {!tier.highlight ? (
                <h2 className="text-2xl font-bold text-[#0F172A]">{tier.name}</h2>
              ) : (
                <h2 className="text-2xl font-bold text-[#0F172A]">{tier.name}</h2>
              )}
              <p className="mt-2 flex-1 text-[#475569]">{tier.description}</p>
              <p className="mt-6 text-4xl font-bold text-[#0F172A]">
                ${annual ? tier.annual : tier.monthly}
                <span className="text-base font-medium text-[#94A3B8]"> / mo</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-[#475569]">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-10 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white shadow-md transition-all hover:opacity-90"
                type="button"
              >
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
