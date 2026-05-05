import { MarketingSolutionPage } from "@/components/marketing/MarketingSolutionPage";
import { MARKETING_IMAGES } from "@/data/marketing-images";

export default function DevelopersSolutionPage() {
  return (
    <MarketingSolutionPage
      description="Keep docs and developer blogs searchable with technically accurate scaffolding your engineers can vet fast."
      features={[
        "Structured outlines for tutorials and release notes.",
        "Snippet-friendly FAQs for APIs and SDK pitfalls.",
        "Exports that drop into Markdown/Git workflows cleanly.",
      ]}
      heroAlt="Developer workstation with code"
      heroImage={MARKETING_IMAGES.developerCode}
      painPoints={[
        "Engineers seldom have cycles for beginner-friendly prose.",
        "Stale docs tank activation while support tickets spike.",
        "Thought leadership competes with shipping velocity.",
      ]}
      testimonial={{
        quote:
          "Docs PRs merged faster because drafts arrived with sane headings and example blocks already scaffolded.",
        name: "Alex Chen",
        role: "Developer Advocate · Infrastructure Startup",
      }}
      title="Developer Documentation"
    />
  );
}
