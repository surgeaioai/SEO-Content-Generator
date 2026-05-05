"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

import { featureShowcases } from "@/data/landing-data";

export function FeatureShowcase() {
  return (
    <section className="bg-[#F1F5F9] px-4 py-20 md:px-6" id="features">
      <div className="mx-auto max-w-7xl space-y-24">
        {featureShowcases.map((feature, i) => (
          <div
            key={feature.title}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
              feature.reverse ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                {feature.label}
              </span>
              <h2 className="mt-2 mb-6 text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
                {feature.title}
              </h2>
              <ul className="mb-8 space-y-4">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-indigo-500" />
                    <span className="text-base leading-relaxed text-[#475569]">{bullet}</span>
                  </li>
                ))}
              </ul>
              <button
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:opacity-90"
                type="button"
              >
                {feature.cta} <ArrowRight className="ml-1 inline-block h-4 w-4 align-middle" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <img
                  alt={feature.mockLabel}
                  className="aspect-[4/3] w-full rounded-2xl border border-[#E2E8F0] object-cover"
                  loading="lazy"
                  src={feature.image}
                />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
