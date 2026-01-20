import { HeaderNew } from "@/components/landing-page/HeaderNew";
import { HeroNew } from "@/components/landing-page/HeroNew";
import { ProblemSection } from "@/components/landing-page/ProblemSection";
import { SolutionSection } from "@/components/landing-page/SolutionSection";
import { ResourcesSection } from "@/components/landing-page/ResourcesSection";
import { FeaturesNew } from "@/components/landing-page/FeaturesNew";
import { PlansNew } from "@/components/landing-page/PlansNew";
import { FaqNew } from "@/components/landing-page/FaqNew";
import { FooterNew } from "@/components/landing-page/FooterNew";

export default function Home() {
  return (
    <main className="min-h-screen font-sans">
      <HeaderNew />
      <HeroNew />
      <FeaturesNew />
      <PlansNew />
      <FaqNew />
      <FooterNew />
    </main>
  );
}
