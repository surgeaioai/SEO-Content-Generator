import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function LlmVisibilityPage() {
  return (
    <MarketingToolPage
      description="Watch how AI assistants mention your brand, category, and competitors—then adapt content to earn more citations."
      features={[
        "Prompt monitoring across common discovery queries.",
        "Sentiment and mention frequency at a glance.",
        "Pairs with your editorial calendar for follow-up briefs.",
      ]}
      heroImage={MARKETING_IMAGES.seoAnalytics}
      heroImageAlt="LLM visibility analytics"
      title="LLM Visibility"
    />
  );
}
