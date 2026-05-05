"use client";

import { Loader2 } from "lucide-react";

import { MARKETING_IMAGES } from "@/data/marketing-images";
import type { ContentAngle } from "@/types";

const ANGLE_IMAGES = [
  MARKETING_IMAGES.writingBlog,
  MARKETING_IMAGES.seoAnalytics,
  MARKETING_IMAGES.reportsCharts,
  MARKETING_IMAGES.aiAutomation,
  MARKETING_IMAGES.dashboardTool,
];

function pickAngleImage(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h + title.charCodeAt(i) * (i + 1)) % 1_000_000;
  }
  return ANGLE_IMAGES[h % ANGLE_IMAGES.length];
}

function difficultyBadgeClass(level: ContentAngle["estimatedDifficulty"]) {
  switch (level) {
    case "Low":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Medium":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "High":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
  }
}

type ContentAngleCardProps = {
  angle: ContentAngle;
  disabled?: boolean;
  busy?: boolean;
  onSelect: (angle: ContentAngle) => void;
};

export function ContentAngleCard({
  angle,
  disabled,
  busy,
  onSelect,
}: ContentAngleCardProps) {
  const cover = pickAngleImage(angle.title);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <img
        alt={angle.title}
        className="h-48 w-full object-cover"
        loading="lazy"
        src={cover}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            {angle.targetFormat}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${difficultyBadgeClass(angle.estimatedDifficulty)}`}
          >
            {angle.estimatedDifficulty}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-bold text-[#0F172A]">{angle.title}</h3>
        <p className="mb-3 text-sm text-[#94A3B8]">{angle.angle}</p>
        <p className="mb-2 text-sm leading-relaxed text-[#475569]">{angle.whyItWorks}</p>
        <p className="mb-6 text-xs font-medium text-indigo-600">
          👥 {angle.targetAudience}
        </p>

        <button
          className="mt-auto w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          disabled={disabled || busy}
          onClick={() => onSelect(angle)}
          type="button"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </span>
          ) : (
            "Select This Angle →"
          )}
        </button>
      </div>
    </div>
  );
}
