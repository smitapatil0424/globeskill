import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-purple-950">
              GS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">GlobeSkill Admin Console</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  NGO Administrator
                </span>
              </div>
              <p className="text-xs text-slate-400">Supervisory Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5"
            >
              <span>Launch Full Admin Suite</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors border border-slate-800"
            >
              Public Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Administrative Operations Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Platform Governance &amp; Operations
            </h1>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Supervise student learning trajectories, monitor cohort completion metrics, manage IBM SkillsBuild curriculum, and audit financial contributions.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/admin"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition-all"
              >
                Go to Full NGO Admin Dashboard &rarr;
              </Link>
              <Link
                href="/dashboard/admin/sdg"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                UN SDG Impact Analytics
              </Link>
              <Link
                href="/dashboard/admin/donations"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                Donor Contributions Ledger
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Students</div>
            <div className="mt-2 text-3xl font-extrabold text-white">1,240</div>
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <span>↑ 18.2%</span>
              <span className="text-slate-500">from last cohort</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tracks</div>
            <div className="mt-2 text-3xl font-extrabold text-blue-400">12</div>
            <div className="mt-2 text-xs text-slate-400 font-medium">
              IBM SkillsBuild Certified
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certificates Awarded</div>
            <div className="mt-2 text-3xl font-extrabold text-teal-400">894</div>
            <div className="mt-2 text-xs text-slate-400 font-medium">
              Digital Badges Issued
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Funds Mobilized</div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-400">₹48.25L</div>
            <div className="mt-2 text-xs text-emerald-400/80 font-medium">
              100% Earmarked to Skilling
            </div>
          </div>
        </div>

        {/* Console Hubs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/admin"
            className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              Student Cohorts &amp; Grades
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Supervise progress, view individual assessment scores, assign trainers, and approve completion badges.
            </p>
            <div className="mt-4 text-xs font-semibold text-purple-400 flex items-center gap-1">
              <span>Open Cohort Management</span>
              <span>&rarr;</span>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/sdg"
            className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              UN SDG Impact Reporting
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time calculations for SDG 4 (Quality Education), SDG 8 (Decent Work), and regional hubs infrastructure.
            </p>
            <div className="mt-4 text-xs font-semibold text-blue-400 flex items-center gap-1">
              <span>View SDG Metrics</span>
              <span>&rarr;</span>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/donations"
            className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group block"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              💰
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              Donor Ledger &amp; Audits
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track incoming grant allocations, verified donor certificates, tax receipts, and program expenditure audits.
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>View Donation Ledger</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
}
