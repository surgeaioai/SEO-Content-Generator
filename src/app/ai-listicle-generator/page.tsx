import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AiListicleGeneratorPage() {
  return (
    <MarketingToolPage
      description="Produce scannable listicles that rank—from numbered picks to comparison callouts and product blurbs."
      features={[
        "Consistent item structure with headings and takeaway lines.",
        "Automatic tables for specs when you compare options.",
          "Audience-first intros that match search intent.",
      ]}
      heroImage={MARKETING_IMAGES.seoAnalytics}
      heroImageAlt="Analytics for listicle performance"
      title="AI Listicle Generator"
    />
  );
}
