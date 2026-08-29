'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [apiData, setApiData] = useState<{ project: string; status: string; phase: string } | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleExplore = async () => {
    setIsConnecting(true);
    setStatusMessage('GlobeSkill platform is successfully running.');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiData(data);
      }
    } catch (err) {
      console.warn('Backend probe offline:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-sm"
              aria-hidden="true"
            >
              GS
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              GlobeSkill
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Education Initiative
            </span>
            <Link
              href="/test"
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Test DB &amp; Roles
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors px-3.5 py-1.5 rounded-lg shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl w-full mx-auto text-center space-y-8">
          
          {/* Mission Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs sm:text-sm font-medium text-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
            Empowering Underserved Youth Globally
          </div>

          {/* Main Headings */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              GlobeSkill
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-emerald-800 tracking-tight">
              Technology &amp; AI Education for Every Child
            </p>
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            GlobeSkill is an initiative to help underserved learners gain access to digital skills,
            technology education and AI-enabled career opportunities.
          </p>

          {/* Call-to-Action Area */}
          <div className="pt-2 flex flex-col items-center justify-center gap-4">
            <button
              id="explore-globeskill-btn"
              type="button"
              onClick={handleExplore}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 transition-colors duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 cursor-pointer"
              aria-label="Explore GlobeSkill"
            >
              <span>Explore GlobeSkill</span>
              <svg 
                className="w-5 h-5 transition-transform duration-150 group-hover:translate-x-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {/* Client-Side State Feedback Alert */}
            {statusMessage && (
              <div 
                role="status" 
                aria-live="polite" 
                className="w-full max-w-md mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start gap-3 text-left transition-all"
              >
                <div className="mt-0.5 rounded-full bg-emerald-600 text-white p-1 flex-shrink-0" aria-hidden="true">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-950">
                    {statusMessage}
                  </p>
                  {apiData ? (
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Backend Connected: <span className="font-mono font-bold text-emerald-900">{apiData.status}</span> &bull; {apiData.phase}
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {isConnecting ? 'Connecting to backend...' : 'Ready to deliver curriculum, mentors, and learning pathways.'}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStatusMessage(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md transition-colors"
                  aria-label="Dismiss message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Three Educational Pillars (Lightweight, Accessible, No Stock Images) */}
          <section aria-labelledby="pillars-heading" className="pt-10 border-t border-slate-200/80">
            <h2 id="pillars-heading" className="sr-only">Our Core Pillars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
                  01
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  Digital Access
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Supplying essential hardware and digital literacy skills to underserved classrooms.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm mb-3">
                  02
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  AI &amp; Tech Literacy
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Demystifying artificial intelligence through hands-on, ethical, and project-based learning.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm mb-3">
                  03
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1">
                  Career Pathways
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Connecting motivated young learners with mentors and real-world tech career horizons.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Accessible Non-Profit Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>&copy; {new Date().getFullYear()} GlobeSkill Initiative. A non-profit education mission.</p>
          <div className="flex items-center space-x-4">
            <Link href="/test" className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline">
              Database &amp; Role Test Console
            </Link>
            <span className="text-slate-400">Lightweight &bull; Highly Accessible &bull; Free for All Learners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
