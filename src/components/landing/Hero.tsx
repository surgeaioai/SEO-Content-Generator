"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { KeywordInputForm } from "@/components/KeywordInputForm";
import { MARKETING_IMAGES } from "@/data/marketing-images";

const trustAvatars = [
  { src: MARKETING_IMAGES.agencyTeam, alt: "Marketing team member" },
  { src: MARKETING_IMAGES.localBusiness, alt: "Local business operator" },
  { src: MARKETING_IMAGES.ecommerce, alt: "E-commerce founder" },
];

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-indigo-50 to-violet-50 px-4 py-20 md:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#475569] shadow-sm"
            initial={{ opacity: 0, y: 10 }}
          >
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
              New
            </span>
            AI Visibility Tracker is live
          </motion.span>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#0F172A] md:text-6xl">
            Rank on Google.
            <br />
            <span className="text-indigo-600">Get cited by ChatGPT.</span>
            <br />
            <span className="text-2xl font-semibold text-[#475569] md:text-3xl">
              Without the busywork.
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-relaxed text-[#475569] md:text-lg">
            Generate ready-to-rank content that matches your voice, earns citations, and turns organic visits into pipeline.
          </p>

          <div className="mb-10 flex flex-col items-start gap-6">
            <button
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90"
              type="button"
            >
              Get Started
              <ArrowRight className="ml-2 inline-block h-5 w-5 align-middle" />
            </button>

            <div className="flex flex-col gap-3">
              <div className="flex -space-x-3">
                {trustAvatars.map((avatar) => (
                  <img
                    key={avatar.alt}
                    alt={avatar.alt}
                    className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
                    loading="lazy"
                    src={avatar.src}
                  />
                ))}
              </div>
              <p className="text-sm text-[#475569]">
                Trusted by <strong className="text-[#0F172A]">20,000+</strong> marketers and agencies
              </p>
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <KeywordInputForm />
          </div>
        </div>
      </div>
    </section>
  );
}
