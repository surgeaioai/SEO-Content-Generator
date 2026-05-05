"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { faqs } from "@/data/landing-data";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-[#F8FAFC]"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="pr-8 text-lg font-semibold text-[#0F172A]">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-5">
              <p className="leading-relaxed text-[#475569]">{answer}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="bg-[#F8FAFC] px-4 py-20 md:px-6" id="resources">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Still have questions?
          </h2>
          <p className="text-lg text-[#475569]">Straight answers about SEO Pro workflows.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} answer={faq.answer} question={faq.question} />
          ))}
        </div>
      </div>
    </section>
  );
}
