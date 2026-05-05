"use client";

import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="bg-white px-4 py-16 md:px-6" id="pricing">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-16 text-center shadow-xl md:px-16 md:py-20">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
          Rank more clients.
          <br />
          Do less busywork.
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100">
          Ship SEO-ready drafts on a repeatable cadence—without sacrificing quality or brand voice.
        </p>
        <button
          className="mb-12 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-md transition-all hover:bg-indigo-50"
          type="button"
        >
          Get Started <ArrowRight className="ml-1 inline-block h-5 w-5 align-middle" />
        </button>
        <div className="flex flex-col items-center gap-4 border-t border-white/20 pt-10">
          <p className="font-semibold text-white">
            Trusted by <strong className="text-white">20,000+</strong> marketers and agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-100">
            <span>✓ Cancel anytime</span>
            <span>✓ Drafts in minutes</span>
            <span>✓ Built for teams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
