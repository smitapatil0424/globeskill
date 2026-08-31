import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import ImpactStats from '@/components/home/ImpactStats';
import AboutSection from '@/components/home/AboutSection';
import FocusAreas from '@/components/home/FocusAreas';
import CommunityStories from '@/components/home/CommunityStories';
import CTABanner from '@/components/home/CTABanner';
import Footer from '@/components/home/Footer';

import AIChat from '@/components/AIChat';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* 1. Header Navigation Bar */}
      <Navbar />

      {/* 2. Main Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Impact Metrics Stats Strip */}
        <ImpactStats />

        {/* About Foundation & Core Values */}
        <AboutSection />

        {/* Core Focus Areas & 4 Learning Pillars */}
        <FocusAreas />

        {/* Learner Stories & Community Testimonials */}
        <CommunityStories />

        {/* Call to Action Banner */}
        <CTABanner />
      </main>

      {/* 3. Comprehensive Foundation Footer */}
      <Footer />

      {/* 4. Floating Ask AI Mentor launcher */}
      <AIChat courseContext="GlobeSkill Platform & AI Skilling" />
    </div>
  );
}
