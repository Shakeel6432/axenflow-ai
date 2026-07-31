import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedTechnologies } from "@/components/home/TrustedTechnologies";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ProcessSection } from "@/components/home/ProcessSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { FAQSection } from "@/components/home/FAQSection";

/** Heavy client sections - load after first paint so homepage JS stays smaller. */
const ReviewsSection = dynamic(
  () => import("@/components/home/ReviewsSection").then((m) => m.ReviewsSection),
  { ssr: true, loading: () => <div className="min-h-[20rem]" aria-hidden /> }
);
const ClientFormSection = dynamic(
  () => import("@/components/home/ClientFormSection").then((m) => m.ClientFormSection),
  { ssr: true, loading: () => <div className="min-h-[24rem]" aria-hidden /> }
);

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
