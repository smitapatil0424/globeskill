import Link from 'next/link';

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 py-20 text-white">
      {/* Decorative Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/15 blur-3xl pointer-events-none rounded-full" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Accent Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-xs font-semibold text-blue-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Enrollment Open &bull; Zero Tuition Fees for Deserving Youth
        </div>

        {/* Catchy Headline */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ready to Transform Your Future with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Future-Ready Digital Skills?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Join GlobeSkill today. Access free curricula, interactive AI mentors, real-world development projects, and corporate career placement support.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-slate-950 bg-white hover:bg-slate-100 active:bg-slate-200 shadow-xl hover:shadow-2xl transition-all duration-150"
          >
            <span>Register &amp; Enroll for Free</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all duration-150"
          >
            <span>Login to Portal</span>
          </Link>
        </div>

        {/* Bottom Small Assurance */}
        <div className="pt-4 text-xs text-slate-400 flex items-center justify-center gap-6">
          <span>&bull; No credit card required</span>
          <span>&bull; Self-paced + Mentor tracks</span>
          <span>&bull; Verifiable credentials</span>
        </div>

      </div>
    </section>
  );
}
