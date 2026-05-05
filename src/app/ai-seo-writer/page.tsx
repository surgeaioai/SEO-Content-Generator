import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AiSeoWriterPage() {
  return (
    <MarketingToolPage
      description="Generate publication-ready SEO articles from a keyword with outlines, FAQs, tables, and schema-friendly structure."
      features={[
        "Angles informed by SERP scraping and competitor headings.",
        "Structured sections with internal linking placeholders.",
        "Exports to Markdown or HTML ready for your CMS.",
      ]}
      heroImage={MARKETING_IMAGES.writingBlog}
      heroImageAlt="Writing and content creation"
      title="AI SEO Writer"
    />
  );
}
