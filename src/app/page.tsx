import Navbar from '@/components/home/Navbar';
import HubGateHero from '@/components/home/HubGateHero';
import ImpactStats from '@/components/home/ImpactStats';
import AboutSection from '@/components/home/AboutSection';
import FocusAreas from '@/components/home/FocusAreas';
import CommunityStories from '@/components/home/CommunityStories';
import CTABanner from '@/components/home/CTABanner';
import Footer from '@/components/home/Footer';
import AIChat from '@/components/AIChat';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Header Navigation Bar */}
      <Navbar />

      {/* 2. Main Page Hero: Exact Match to User Screenshot Gate Card */}
      <main className="flex-1">
        <HubGateHero />

        {/* Foundation Learning Tracks & Community Sections */}
        <section id="explore" className="border-t border-slate-200/80 bg-slate-50/50">
          <ImpactStats />
          <AboutSection />
          <FocusAreas />
          <CommunityStories />
          <CTABanner />
        </section>
      </main>

      {/* 3. 4-Column Deep Navy Footer with 80G Badge */}
      <Footer />

      {/* 4. Floating Ask AI Mentor Widget */}
      <AIChat courseContext="GlobeSkill Platform & AI Skilling" />
    </div>
  );
}
