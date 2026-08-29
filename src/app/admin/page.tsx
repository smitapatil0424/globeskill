import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-xl text-slate-900">GlobeSkill Admin Console</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            NGO Administrator
          </span>
        </div>
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          &larr; Exit to Public Site
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview &amp; Cohort Management</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Welcome to the NGO Administrator dashboard. Here you can supervise curriculum tracks, review student cohorts, and audit donations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Students</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">1,240</div>
          </div>
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Projects</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">12</div>
          </div>
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Donations Received</div>
            <div className="mt-2 text-3xl font-extrabold text-emerald-700">$48,250</div>
          </div>
        </div>
      </main>
    </div>
  );
}
