import { MarketingSolutionPage } from "@/components/marketing/MarketingSolutionPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AgenciesSolutionPage() {
  return (
    <MarketingSolutionPage
      description="Deliver client-ready drafts faster with repeatable briefs, exports, and quality checks your team trusts."
      features={[
        "Keyword intake that mirrors your discovery calls.",
        "White-label friendly outputs your AMs can ship.",
        "Keeps SMEs focused on strategy—not first-draft typing.",
      ]}
      heroAlt="Creative agency team collaborating"
      heroImage={MARKETING_IMAGES.agencyTeam}
      painPoints={[
        "Margins shrink when writers sit in blank-page mode.",
        "Briefs bounce between SEO, creative, and clients.",
        "Reporting eats hours that should go to experimentation.",
      ]}
      testimonial={{
        quote:
          "Turnaround dropped from ten days to three without sacrificing depth—clients finally feel the momentum.",
        name: "Priya Shah",
        role: "Managing Director · Boutique SEO Agency",
      }}
      title="Agency Delivery"
    />
  );
}
