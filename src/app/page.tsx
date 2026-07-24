import { HeroSection } from "@/components/home/HeroSection";
import { TrustedTechnologies } from "@/components/home/TrustedTechnologies";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ClientFormSection } from "@/components/home/ClientFormSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedTechnologies />
      <ServicesSection />
      <WhyChooseUs />
      <ReviewsSection />
      <ProcessSection />
      <PortfolioSection />
      <IndustriesSection />
      <FAQSection />
      <ClientFormSection />
    </>
  );
}
