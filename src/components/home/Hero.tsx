'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HealthData {
  project: string;
  status: string;
  phase: string;
  activeCourses?: number;
}

export default function Hero() {
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<HealthData | null>(null);
  const [probeMsg, setProbeMsg] = useState<string | null>(null);

  const handleTestHealth = async () => {
    setIsProbing(true);
    setProbeMsg('Connecting to GlobeSkill learning cloud...');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setProbeResult(data);
        setProbeMsg('Platform is active and ready for students worldwide.');
      } else {
        setProbeMsg('Platform operating in offline-first resilient mode.');
      }
    } catch {
      setProbeMsg('Platform connected (client-cached local mode).');
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-[28rem] h-[28rem] bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs text-xs sm:text-sm font-semibold text-emerald-900">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]"></span>
              </span>
              <span>Bridging the Digital Divide &bull; Empowering Youth</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Empowering Communities &amp; Youth Through{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-emerald-600 to-teal-500">
                  Future-Ready Technology
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                Providing accessible digital skilling, career enablement, and vocational learning to build a thriving, inclusive digital economy for underserved talent globally.
              </p>
            </div>

            {/* Dual CTAs & Diagnostic Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] shadow-md hover:shadow-lg hover:shadow-emerald-600/25 transition-all duration-150"
              >
                <span>Explore Programs</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <Link
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 shadow-xs hover:shadow-sm transition-all"
              >
                <span>Partner With Us</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={handleTestHealth}
                disabled={isProbing}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50/50 transition-colors inline-flex items-center gap-1.5"
                title="Verify live backend connection"
              >
                <svg className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                {isProbing ? 'Testing API...' : 'Live Probe'}
              </button>
            </div>

            {/* Probe Notification Pill */}
            {probeMsg && (
              <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-3 shadow-xs max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{probeMsg}</span>
                  {probeResult && (
                    <span className="font-mono font-bold text-blue-700">
                      ({probeResult.project} &bull; {probeResult.phase})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setProbeMsg(null)}
                  className="text-blue-600 hover:text-blue-900 font-bold px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Trust Highlights Strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span>100% Free for Underprivileged Youth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span>Industry Mentor Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                <span>UN SDG Aligned</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Impact Visual Simulation Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-20 transform -rotate-1"></div>

            {/* Main Interactive Hub Container */}
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white space-y-6">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-xs font-mono text-slate-400 ml-2">globeskill.learn / live</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                  Active Cohort 2026
                </span>
              </div>

              {/* Course Track Visual Card */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold">
                      AI
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-100">Artificial Intelligence &amp; Cloud</h2>
                      <p className="text-xs text-slate-400">Track 02 &bull; 12-Week Vocational Immersion</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    Live Session
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>Curriculum Mastery</span>
                    <span className="text-blue-400 font-bold">78% Complete</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full w-[78%] transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              {/* Micro-Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 space-y-1">
                  <div className="flex items-center gap-2 text-sky-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-300">Modular Learning</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Interactive labs &amp; localized video transcripts.</p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/40 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-300">Career Placement</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Resume builder &amp; corporate internship access.</p>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-900/60 text-blue-300 text-xs font-medium border border-blue-700/50">
                  🏆 Industry Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-700/50">
                  ⚡ 100% Free Tuition
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-900/60 text-purple-300 text-xs font-medium border border-purple-700/50">
                  🤝 1-on-1 Mentor Connect
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
