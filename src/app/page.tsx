import { CaseStudies } from "@/components/landing/CaseStudies";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { FAQ } from "@/components/landing/FAQ";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { LandingFooter } from "@/components/landing/Footer";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Hero } from "@/components/landing/Hero";
import { LandingStats } from "@/components/landing/LandingStats";
import { Testimonials } from "@/components/landing/Testimonials";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Hero />
      <LandingStats />
      <FeatureShowcase />
      <DemoVideo />
      <Testimonials />
      <CaseStudies />
      <FAQ />
      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
