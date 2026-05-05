import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AiNewsWriterPage() {
  return (
    <MarketingToolPage
      description="Turn timely topics into credible news-style articles with citations-ready structure and clean formatting."
      features={[
        "Neutral, editorial tone presets for announcements and updates.",
        "Quick turnaround drafts you can vet before publishing.",
        "Optional quotes and TL;DR blocks for busy readers.",
      ]}
      heroImage={MARKETING_IMAGES.writingBlog}
      heroImageAlt="News and editorial writing"
      title="AI News Writer"
    />
  );
}
