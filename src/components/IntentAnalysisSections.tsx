"use client";

import { Compass, Layers, ShoppingCart, Target } from "lucide-react";

import type { IntentAnalysis } from "@/types";

function intentBadgeStyles(intent: IntentAnalysis["primaryIntent"]) {
  switch (intent) {
    case "Informational":
      return "bg-blue-100 text-blue-800";
    case "Commercial":
      return "bg-emerald-100 text-emerald-800";
    case "Transactional":
      return "bg-orange-100 text-orange-800";
    case "Navigational":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-indigo-100 text-indigo-700";
  }
}

function IntentIcon({ intent }: { intent: IntentAnalysis["primaryIntent"] }) {
  const cls = "h-6 w-6 shrink-0 text-[#475569]";
  switch (intent) {
    case "Informational":
      return <Layers className={cls} />;
    case "Commercial":
      return <ShoppingCart className={cls} />;
    case "Transactional":
      return <Target className={cls} />;
    case "Navigational":
      return <Compass className={cls} />;
    default:
      return <Layers className={cls} />;
  }
}

function secondaryBadgeStyles(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("commercial")) return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("transactional")) return "bg-orange-100 text-orange-800";
  if (normalized.includes("informational")) return "bg-blue-100 text-blue-800";
  return "bg-indigo-50 text-indigo-700";
}

type IntentAnalysisSectionsProps = {
  intent: IntentAnalysis;
};

export function IntentAnalysisSections({ intent }: IntentAnalysisSectionsProps) {
  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <IntentIcon intent={intent.primaryIntent} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Primary intent
              </p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${intentBadgeStyles(intent.primaryIntent)}`}
              >
                {intent.primaryIntent}
              </span>
            </div>
          </div>
          <p className="text-base leading-relaxed text-[#475569]">
            Align your outline and CTA depth with how searchers expect to learn at this stage.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <Layers className="h-6 w-6 shrink-0 text-[#475569]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Secondary intent
              </p>
              {intent.secondaryIntent ? (
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${secondaryBadgeStyles(intent.secondaryIntent)}`}
                >
                  {intent.secondaryIntent}
                </span>
              ) : (
                <p className="mt-2 text-sm text-[#94A3B8]">No secondary intent captured</p>
              )}
            </div>
          </div>
          <p className="text-base leading-relaxed text-[#475569]">
            Blend supporting angles so you still satisfy mixed SERP expectations.
          </p>
        </div>
      </div>

      <div className="rounded-r-xl border-l-4 border-indigo-500 bg-indigo-50 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          User need
        </p>
        <p className="text-base leading-relaxed text-[#0F172A]">{intent.userNeed}</p>
        <p className="mt-4 text-sm font-medium text-indigo-900">
          Preferred format:{" "}
          <span className="font-semibold">{intent.preferredFormat}</span>
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-[#0F172A]">Must-cover topics</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {intent.mustCoverTopics.map((topic) => (
            <div
              key={topic}
              className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4"
            >
              <span className="mt-0.5 text-indigo-500">✓</span>
              <span className="font-medium text-[#0F172A]">{topic}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-[#0F172A]">Content gaps</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {intent.contentGaps.map((gap) => (
            <div
              key={gap}
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4"
            >
              <span className="mt-0.5 text-amber-600">!</span>
              <span className="font-medium text-[#0F172A]">{gap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
