import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function YoutubeToBlogPage() {
  return (
    <MarketingToolPage
      description="Repurpose videos into structured blog posts with summaries, chapters, and quote-ready excerpts."
      features={[
        "Preserves key talking points while adapting for readers.",
        "Adds headings and FAQs suitable for SEO snippets.",
        "Creates shareable pull quotes for social promo.",
      ]}
      heroImage={MARKETING_IMAGES.aiAutomation}
      heroImageAlt="Automation and multimedia workflow"
      title="YouTube to Blog"
    />
  );
}
