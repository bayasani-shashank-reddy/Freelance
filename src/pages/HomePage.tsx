import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { StatsCounterSection } from '../components/sections/StatsCounterSection';
import { LeaderboardSection } from '../components/sections/LeaderboardSection';
import { FeaturedPortfolioSection } from '../components/sections/FeaturedPortfolioSection';
import { SectionDivider } from '../components/SectionDivider';

const HomePage: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* Hero */}
      <HeroSection />
      <SectionDivider className="-mt-10" />

      {/* How It Works */}
      <div className="py-16">
        <HowItWorksSection />
      </div>

      <SectionDivider />

      {/* Animated Platform Stats */}
      <StatsCounterSection />

      <SectionDivider />

      {/* Featured Portfolio Showcase */}
      <FeaturedPortfolioSection />

      <SectionDivider />

      {/* Top Earner Leaderboard */}
      <LeaderboardSection />

      <div className="h-24" />
    </div>
  );
};

export default HomePage;
