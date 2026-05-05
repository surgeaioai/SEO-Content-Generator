import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function SeoReportsPage() {
  return (
    <MarketingToolPage
      description="Turn crawl and ranking signals into readable briefs your clients can act on—without spreadsheet gymnastics."
      features={[
        "Snapshot summaries for stakeholders who skip the raw data.",
        "Trend lines for visibility and topical coverage.",
        "Export-ready narratives you can brand for delivery.",
      ]}
      heroImage={MARKETING_IMAGES.reportsCharts}
      heroImageAlt="Charts and SEO reporting"
      title="SEO Reports"
    />
  );
}
