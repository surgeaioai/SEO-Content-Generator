import { MarketingSolutionPage } from "@/components/marketing/MarketingSolutionPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function EcommerceSolutionPage() {
  return (
    <MarketingSolutionPage
      description="Fuel category guides, PDP-adjacent education, and comparison content shoppers actually find in search."
      features={[
        "Intent-aware hubs for seasonal and evergreen collections.",
        "FAQ blocks tuned for long-tail product questions.",
        "Cleaner tables for sizing, specs, and compatibility.",
      ]}
      heroAlt="E-commerce shopping experience"
      heroImage={MARKETING_IMAGES.ecommerce}
      painPoints={[
        "Thin descriptions cannibalize each other across SKUs.",
        "Merchandising timelines leave SEO as an afterthought.",
        "Affiliate-heavy SERPs demand richer owned content.",
      ]}
      testimonial={{
        quote:
          "Non-brand organic revenue climbed once our guides mirrored how customers compare options.",
        name: "Chris Ortiz",
        role: "Head of Growth · Lifestyle Retail",
      }}
      title="E-Commerce SEO"
    />
  );
}
