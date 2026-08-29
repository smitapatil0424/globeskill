'use client';

import Link from 'next/link';
import DonorContributionLedger from '@/components/DonorContributionLedger';

export default function AdminDonationsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Executive Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard/admin"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center space-x-1"
              >
                <span>&larr; Admin Overview</span>
              </Link>
              <span className="text-slate-500 text-xs">/</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wide text-emerald-300">
                Capital Allocation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Donor Contributions & Capital Allocation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track philanthropic contributions, monitor available vs. allocated funds in real time, and earmark financial capital directly to targeted skilling tracks and hardware initiatives.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/admin/sdg"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <span>UN SDG Portfolio &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Donor Contribution Ledger */}
      <DonorContributionLedger />
    </div>
  );
}
