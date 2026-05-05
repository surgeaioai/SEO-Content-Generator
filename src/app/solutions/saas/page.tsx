import { MarketingSolutionPage } from "@/components/marketing/MarketingSolutionPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function SaaSSolutionPage() {
  return (
    <MarketingSolutionPage
      description="Ship product narratives, comparison pages, and changelog posts that compound organic demand."
      features={[
        "Launch-ready landing copy frameworks aligned to funnel stage.",
        "Technical explainers devs actually want to read.",
        "Unified briefs marketing and RevOps can share.",
      ]}
      heroAlt="SaaS growth dashboard"
      heroImage={MARKETING_IMAGES.dashboardTool}
      painPoints={[
        "Organic traffic stalls between launches.",
        "Messaging drifts across blog, docs, and sales pages.",
        "Lean teams lack time for SERP-informed rewrites.",
      ]}
      testimonial={{
        quote:
          "We doubled demo requests after restructuring our pillar pages—the workflow finally matches how buyers research.",
        name: "Jordan Lee",
        role: "VP Marketing · B2B SaaS",
      }}
      title="SaaS Growth Content"
    />
  );
}
