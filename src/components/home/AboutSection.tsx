import Link from 'next/link';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Mission Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
              About Glob TechPower Foundation
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Democratizing Tech Education for Every Aspiring Youth
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Glob TechPower Foundation was established with a singular vision: to ensure that no motivated child or youth is left behind in the rapidly advancing digital and artificial intelligence revolution.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              By combining high-quality open curricula, zero-cost learning pathways, localized mentorship, and corporate placement partnerships, GlobeSkill creates a direct conduit from classroom curiosity to gainful digital employment.
            </p>

            {/* Core Values Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">100% Free &amp; Open</h3>
                  <p className="text-xs text-slate-500">Accessible without paywalls or hidden fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Project-Based Learning</h3>
                  <p className="text-xs text-slate-500">Real-world coding and problem solving.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Industry Mentors</h3>
                  <p className="text-xs text-slate-500">Direct guidance from software practitioners.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Career Placement</h3>
                  <p className="text-xs text-slate-500">Structured pathways into internships.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
              >
                <span>Join As A Learner or Volunteer</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

          </div>

          {/* Right Column: Mission Card Display */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
              
              <div className="relative space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center font-black text-xl">
                  &hearts;
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Our Community Promise
                </h3>

                <blockquote className="text-slate-300 text-base sm:text-lg leading-relaxed italic">
                  &ldquo;Technology should be an equalizer, not a barrier. When we equip a child from an underserved community with AI and coding skills, we don’t just train an individual — we uplift their entire family and local ecosystem.&rdquo;
                </blockquote>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">GlobeSkill Leadership Council</span>
                  <span>Glob TechPower Foundation</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
