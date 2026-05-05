"use client";

import { motion } from "framer-motion";

import { caseStudies } from "@/data/landing-data";

const featuredBarHeights = [18, 26, 31, 28, 36, 47, 62, 74, 86, 98];
const compactBarHeights = [22, 30, 26, 38, 51, 68, 82];

function GrowthBars({
  heights,
  compact = false,
}: {
  heights: number[];
  compact?: boolean;
}) {
  return (
    <div className={`flex items-end gap-1 ${compact ? "h-16" : "h-36"}`}>
      {heights.map((height, idx) => (
        <motion.div
          key={`${height}-${idx}`}
          animate={{ opacity: 1, scaleY: 1 }}
          className={`flex-1 rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 ${
            compact ? "min-w-[8px]" : "min-w-[10px]"
          }`}
          initial={{ opacity: 0, scaleY: 0.3 }}
          style={{ height: `${height}%`, transformOrigin: "bottom" }}
          transition={{ delay: idx * 0.03, duration: 0.35 }}
        />
      ))}
    </div>
  );
}

export function CaseStudies() {
  const [featured, ...rest] = caseStudies;
  const stacked = rest.slice(0, 4);

  return (
    <section className="border-t border-[#E2E8F0] bg-gradient-to-b from-white to-gray-50 px-4 py-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Verified Outcomes
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Real results, real users
          </h2>
          <p className="text-base text-[#475569]">
            Transparent growth snapshots from teams using SEO Pro in live markets.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <motion.article
            className="h-fit cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl lg:sticky lg:top-28"
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                Case Study
              </span>
              <span className="text-xs font-medium text-emerald-700">Verified result</span>
            </div>

            <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
              <GrowthBars heights={featuredBarHeights} />
            </div>

            <p className="mb-2 text-3xl font-bold text-[#0F172A]">{featured.metric}</p>
            <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">{featured.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">{featured.description}</p>

            <div className="mb-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                {featured.growth}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
                Based on 60 days growth
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
                Organic traffic
              </span>
            </div>

            <div className="flex items-center gap-3 border-t border-[#E2E8F0] pt-5">
              <img
                alt="Client avatar"
                className="h-11 w-11 rounded-full border border-[#E2E8F0]"
                loading="lazy"
                src="https://i.pravatar.cc/100?img=1"
              />
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">John Carter</p>
                <p className="text-xs text-[#94A3B8]">Growth Lead</p>
              </div>
            </div>
          </motion.article>

          <div className="space-y-5">
            {stacked.map((study, index) => (
              <motion.article
                key={study.title}
                className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
                initial={{ opacity: 0, x: 18 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-28 shrink-0 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <GrowthBars compact heights={compactBarHeights} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {study.growth}
                      </span>
                      <span className="text-xs text-[#94A3B8]">Real client data</span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-[#0F172A]">{study.title}</h3>
                    <p className="line-clamp-2 text-sm text-gray-500">{study.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-[#475569]">{study.metric}</p>
                      <div className="flex items-center gap-2">
                        <img
                          alt="Client avatar"
                          className="h-7 w-7 rounded-full border border-[#E2E8F0]"
                          loading="lazy"
                          src={`https://i.pravatar.cc/100?img=${index + 2}`}
                        />
                        <span className="text-xs text-[#94A3B8]">Based on 30-90 days growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
