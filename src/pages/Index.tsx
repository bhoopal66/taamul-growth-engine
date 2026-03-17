import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/SEOHead";
import FloatingButtons from "@/components/layout/FloatingButtons";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import BusinessAccountsSection from "@/components/home/BusinessAccountsSection";

import CalculatorSection from "@/components/home/CalculatorSection";
import PartnersSection from "@/components/home/PartnersSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Taamul Credit Review Services | Business Financing Solutions in UAE"
        description="UAE's trusted partner for business financing. Business loans, working capital, SME loans, corporate financing, trade finance and more."
        path="/"
      />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <BusinessAccountsSection />
        
        <CalculatorSection />
        <PartnersSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default Index;
