import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AiSeoEditorPage() {
  return (
    <MarketingToolPage
      description="Rewrite, optimize, and polish existing pages with structured prompts, linking guidance, and on-brand tone."
      features={[
        "Bulk editing workflows for headings, intros, and FAQs.",
        "Inline keyword and entity suggestions powered by SERP context.",
        "Preserve your voice while tightening clarity and readability.",
      ]}
      heroImage={MARKETING_IMAGES.dashboardTool}
      heroImageAlt="SEO editor workspace"
      title="AI SEO Editor"
    />
  );
}
