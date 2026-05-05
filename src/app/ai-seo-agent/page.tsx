import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AiSeoAgentPage() {
  return (
    <MarketingToolPage
      description="Automate repetitive SEO hygiene tasks—from meta refinement to structured data reminders—in one guided workspace."
      features={[
        "Structured checklists grounded in SERP competitiveness.",
        "Suggested fixes you can approve before publishing.",
        "Keeps canonical, alt text, and snippet fields aligned.",
      ]}
      heroImage={MARKETING_IMAGES.aiAutomation}
      heroImageAlt="AI automation for SEO workflows"
      title="AI SEO Agent"
    />
  );
}
