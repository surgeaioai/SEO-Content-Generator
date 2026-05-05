"use client";

import { Play } from "lucide-react";

import { MARKETING_IMAGES } from "@/data/marketing-images";

export function DemoVideo() {
  return (
    <section className="bg-[#F8FAFC] px-4 py-20 md:px-6" id="how">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
          Product demo: how it all works
        </h2>
        <p className="mb-12 text-lg text-[#475569]">
          An in-depth walkthrough of SEO Pro features and how they compound organic growth.
        </p>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl">
            <img
              alt="Dashboard preview used as video thumbnail"
              className="h-full w-full object-cover"
              loading="lazy"
              src={MARKETING_IMAGES.dashboardTool}
            />
            <div className="absolute inset-0 bg-indigo-900/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
                <Play className="ml-1 h-10 w-10 fill-indigo-600 text-indigo-600" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-sm font-medium text-white drop-shadow">
              <span>Watch the demo</span>
              <span>5:32</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
