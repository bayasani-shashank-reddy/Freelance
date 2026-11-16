import React, { useState, useEffect } from 'react';
import NexusCraftPillHero from '../components/hero/NexusCraftPillHero';
import Navbar from '../components/Navbar';
import HowItWorksWorkflow from '../components/sections/HowItWorksWorkflow';
import PlatformFeatureShowcase from '../components/sections/PlatformFeatureShowcase';
import ProductWorkspacePreview from '../components/sections/ProductWorkspacePreview';
import AiIntelligenceSection from '../components/sections/AiIntelligenceSection';
import RoleSpecificExperience from '../components/sections/RoleSpecificExperience';
import WhyNexusCraft from '../components/sections/WhyNexusCraft';
import FoundersSection from '../components/sections/FoundersSection';
import HomeValueAndFaqSection from '../components/sections/HomeValueAndFaqSection';
import FinalCtaFooter from '../components/sections/FinalCtaFooter';

export const HomePage: React.FC = () => {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky navbar once user scrolls past 80% of hero height
      if (window.scrollY > window.innerHeight * 0.75) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#222438] font-sans antialiased selection:bg-[#E9E3FF] selection:text-[#7357FF]">
      
      {/* ─── 1. WILD-STYLE PRODUCT OPENING HERO ─── */}
      <NexusCraftPillHero />

      {/* ─── 2. STICKY TOP NAVBAR (Appears smoothly when scrolling down) ─── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolledPastHero
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <Navbar />
      </div>

      <main className="relative z-10 bg-[#F5F6FA]">
        {/* ─── 3. VALUE PROPOSITION, DUAL CTAs & TRUST METRICS ─── */}
        <HomeValueAndFaqSection />

        {/* ─── 4. HOW NEXUSCRAFT WORKS (6-Step Lifecycle Workflow) ─── */}
        <HowItWorksWorkflow />

        {/* ─── 4. PLATFORM FEATURE SHOWCASE (6 Core Software Capabilities) ─── */}
        <PlatformFeatureShowcase />

        {/* ─── 5. PRODUCT PREVIEW SECTION (Client, Admin, Specialist Workspaces) ─── */}
        <ProductWorkspacePreview />

        {/* ─── 6. AI INTELLIGENCE SECTION (Gemini 1.5 Scoping + Interactive Sandbox) ─── */}
        <AiIntelligenceSection />

        {/* ─── 7. ROLE-SPECIFIC EXPERIENCES (Clients, Admins, Freelancers) ─── */}
        <RoleSpecificExperience />

        {/* ─── 8. WHY NEXUSCRAFT (8 Real Product Benefits) ─── */}
        <WhyNexusCraft />

        {/* ─── 9. FOUNDERS & EXECUTIVE STEWARDSHIP ─── */}
        <FoundersSection />
      </main>

      {/* ─── 10. FINAL CTA & SAAS FOOTER ─── */}
      <FinalCtaFooter />
    </div>
  );
};

export default HomePage;
