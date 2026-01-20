import { Header } from "@/components/landing-page/Header";
import { HeroSection } from "@/components/landing-page/HeroSection";
import { ProblemSection } from "@/components/landing-page/ProblemSection";
import { SolutionSection } from "@/components/landing-page/SolutionSection";
import { ResourcesSection } from "@/components/landing-page/ResourcesSection";
import { AiSection } from "@/components/landing-page/AiSection";
import { PlansSection } from "@/components/landing-page/PlansSection";
import { SocialProofSection } from "@/components/landing-page/SocialProofSection";
import { FaqSection } from "@/components/landing-page/FaqSection";
import { CtaSection } from "@/components/landing-page/CtaSection";
import { Footer } from "@/components/landing-page/Footer";

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <Header />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ResourcesSection />
      <AiSection />
      <SocialProofSection />
      <PlansSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
