import { MarketingSolutionPage } from "@/components/marketing/MarketingSolutionPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function LocalBusinessSolutionPage() {
  return (
    <MarketingSolutionPage
      description="Earn map-pack adjacency with localized service pages, FAQs, and neighborhood-focused guides."
      features={[
        "Hyper-local copy without sounding spammy.",
        "Service-area pages templated yet unique per market.",
        "Review-response starters that stay on-brand.",
      ]}
      heroAlt="Local storefront and community"
      heroImage={MARKETING_IMAGES.localBusiness}
      painPoints={[
        "Franchise clusters duplicate each others’ blurbs.",
        "Owners rarely have time for consistent blogging.",
        "Mixed NAP citations confuse assistants and shoppers alike.",
      ]}
      testimonial={{
        quote:
          "Inbound calls shifted from PPC-heavy to organic once our city clusters had unique coverage.",
        name: "Maria Gonzales",
        role: "Owner · Regional Services Brand",
      }}
      title="Local Business Visibility"
    />
  );
}
