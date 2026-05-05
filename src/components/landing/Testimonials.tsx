"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { testimonials } from "@/data/landing-data";
import { MARKETING_IMAGES } from "@/data/marketing-images";

const testimonialFaces = [
  MARKETING_IMAGES.agencyTeam,
  MARKETING_IMAGES.localBusiness,
  MARKETING_IMAGES.ecommerce,
];

export function Testimonials() {
  const slice = testimonials.slice(0, 6);

  return (
    <section className="bg-white px-4 py-20 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Join 20,000+ agencies and marketers
          </h2>
          <p className="text-lg text-[#475569]">
            SEO Pro helps teams drive measurable results in Google, ChatGPT, and wherever people search next.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slice.map((t, i) => (
            <motion.div
              key={`${t.name}-${i}`}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: i * 0.03 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-4 leading-relaxed text-[#475569]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-[#E2E8F0] pt-4">
                <img
                  alt=""
                  className="h-12 w-12 rounded-full border border-[#E2E8F0] object-cover"
                  loading="lazy"
                  src={testimonialFaces[i % testimonialFaces.length]}
                />
                <div>
                  <div className="font-semibold text-[#0F172A]">{t.name}</div>
                  <div className="text-sm text-[#94A3B8]">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
