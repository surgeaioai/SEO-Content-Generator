import { MarketingToolPage } from "@/components/marketing/MarketingToolPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function AutoblogPage() {
  return (
    <MarketingToolPage
      description="Plan recurring posts from keywords or feeds, then publish on a cadence that keeps your site fresh."
      features={[
        "Queue drafts with customizable templates per vertical.",
        "Hands-off reminders when topics need a refresh.",
        "Pairs with export formats your stack already uses.",
      ]}
      heroImage={MARKETING_IMAGES.dashboardTool}
      heroImageAlt="Publishing dashboard"
      title="Autoblog"
    />
  );
}
