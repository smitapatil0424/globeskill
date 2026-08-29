'use client';

import { useState, useEffect } from 'react';
import {
  DonorTransaction,
  DonorMetricsSummary,
  DEFAULT_DONOR_TRANSACTIONS,
  DEFAULT_DONOR_SUMMARY,
} from '@/types/donations';

interface ProjectOption {
  id: string;
  title: string;
  category: string;
}

const AVAILABLE_PROJECTS: ProjectOption[] = [
  { id: 'c0000000-0000-0000-0000-000000000001', title: 'IBM SkillsBuild - Frontend Development', category: 'Web Development' },
  { id: 'c0000000-0000-0000-0000-000000000002', title: 'AI Micro Degree', category: 'Artificial Intelligence' },
  { id: 'c0000000-0000-0000-0000-000000000003', title: 'Certificate Program in IT', category: 'Information Technology' },
];

function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonorContributionLedger() {
  const [transactions, setTransactions] = useState<DonorTransaction[]>(DEFAULT_DONOR_TRANSACTIONS);
  const [summary, setSummary] = useState<DonorMetricsSummary | null>(DEFAULT_DONOR_SUMMARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [allocationFilter, setAllocationFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Allocation Modal State
  const [allocatingDonation, setAllocatingDonation] = useState<DonorTransaction | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDonations() {
      try {
        const res = await fetch('/api/admin/donations');
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setTransactions(json.data.transactions);
            setSummary(json.data.summary);
          }
        }
      } catch (err) {
        console.warn('Failed to load donations, using baseline:', err);
      }
    }

    loadDonations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Transactions
  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.donorName.toLowerCase().includes(q) ||
      t.donorEmail.toLowerCase().includes(q) ||
      (t.projectTitle && t.projectTitle.toLowerCase().includes(q)) ||
      (t.transactionId && t.transactionId.toLowerCase().includes(q));

    const matchesProject =
      projectFilter === 'All' ||
      (projectFilter === 'Unallocated' && !t.projectId) ||
      t.projectId === projectFilter;

    const matchesAllocation =
      allocationFilter === 'All' ||
      (allocationFilter === 'Allocated' && t.projectId !== null) ||
      (allocationFilter === 'Unallocated' && t.projectId === null);

    return matchesSearch && matchesProject && matchesAllocation;
  });

  // Handle Allocation Submit
  const handleSaveAllocation = async () => {
    if (!allocatingDonation) return;
    setIsSubmittingAllocation(true);

    try {
      const res = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: allocatingDonation.id,
          projectId: selectedProjectId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to allocate contribution.');
      }

      const assignedProject = AVAILABLE_PROJECTS.find((p) => p.id === selectedProjectId);

      // Update local state
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === allocatingDonation.id) {
            return {
              ...t,
              projectId: selectedProjectId || null,
              projectTitle: assignedProject?.title || null,
              projectCategory: assignedProject?.category || null,
            };
          }
          return t;
        })
      );

      // Recalculate summary metrics locally
      const updatedTotal = transactions.reduce((s, t) => s + t.amount, 0);
      const updatedAllocated = transactions.reduce((s, t) => {
        const isCurrent = t.id === allocatingDonation.id;
        const hasProj = isCurrent ? selectedProjectId !== '' : t.projectId !== null;
        return hasProj ? s + t.amount : s;
      }, 0);

      setSummary({
        totalDonationsUSD: Math.round(updatedTotal),
        totalDonationsINR: Math.round(updatedTotal * 83),
        allocatedCapitalUSD: Math.round(updatedAllocated),
        availableCapitalUSD: Math.round(updatedTotal - updatedAllocated),
        totalTransactionsCount: transactions.length,
        allocatedTransactionsCount: transactions.filter((t) => (t.id === allocatingDonation.id ? selectedProjectId !== '' : t.projectId !== null)).length,
        unallocatedTransactionsCount: transactions.filter((t) => (t.id === allocatingDonation.id ? selectedProjectId === '' : t.projectId === null)).length,
      });

      setToastMessage(json.message || '✓ Contribution allocated successfully.');
      setAllocatingDonation(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Allocation error:', err);
      setToastMessage(err instanceof Error ? err.message : 'Error allocating contribution.');
    } finally {
      setIsSubmittingAllocation(false);
    }
  };

  const openAllocationModal = (donation: DonorTransaction) => {
    setAllocatingDonation(donation);
    setSelectedProjectId(donation.projectId || '');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-emerald-500/80 shadow-xl flex items-center justify-between animate-fade-in">
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-4">
            &times;
          </button>
        </div>
      )}

      {/* 1. FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Donations Made */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Donations Made
              </span>
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                💳
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrencyUSD(summary?.totalDonationsUSD ?? 58150)}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              ≈ {formatCurrencyINR(summary?.totalDonationsINR ?? 4825000)} &bull; {summary?.totalTransactionsCount ?? 5} Contributions
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Gross capital received across all donors
          </div>
        </div>

        {/* Current Available Capital */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Current Available Capital
              </span>
              <span className="w-8 h-8 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                ✨
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white">
                {formatCurrencyUSD(summary?.availableCapitalUSD ?? 20650)}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Unallocated Pool
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1 font-medium">
              ≈ {formatCurrencyINR((summary?.availableCapitalUSD ?? 20650) * 83)} &bull; Ready for allocation
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-800/40 text-[11px] text-indigo-300 relative z-10">
            Discretionary funding ready to deploy to cohorts
          </div>
        </div>

        {/* Allocated Capital */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Allocated Capital
              </span>
              <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                🎯
              </span>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrencyUSD(summary?.allocatedCapitalUSD ?? 37500)}
              </span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                Active Projects
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Earmarked for AI, Cloud & Web Skilling Tracks
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            {summary?.allocatedTransactionsCount ?? 3} of {summary?.totalTransactionsCount ?? 5} contributions assigned
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by donor name, email, or transaction ID..."
              className="block w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl placeholder-slate-400 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-colors"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Project Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Target Skilling Track:</span>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Tracks</option>
                <option value="Unallocated">Unallocated / General Pool</option>
                {AVAILABLE_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Allocation Status Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={allocationFilter}
                onChange={(e) => setAllocationFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="All">All Transactions</option>
                <option value="Allocated">Allocated to Track</option>
                <option value="Unallocated">Unallocated Pool</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DONOR CONTRIBUTIONS ROSTER */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-base">💎</span>
              <span>Donor Contributions & Capital Allocation Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredTransactions.length} of {transactions.length} contributions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Donor Name</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Target Skilling Track</th>
                <th className="py-3 px-3 text-right">Contribution Amount</th>
                <th className="py-3 px-3 text-center">Payment Status</th>
                <th className="py-3 px-3 text-right">Allocation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const dateFormatted = new Date(tx.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                const isAllocated = !!tx.projectId;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Donor Details */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            tx.isAnonymous
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs'
                          }`}
                        >
                          {tx.isAnonymous ? '?' : tx.donorName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{tx.donorName}</span>
                            {tx.isAnonymous && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Anonymous
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {tx.donorEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {dateFormatted}
                    </td>

                    {/* Target Skilling Track */}
                    <td className="py-3.5 px-3">
                      {isAllocated ? (
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {tx.projectTitle}
                          </div>
                          <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-0.5">
                            {tx.projectCategory || 'Skilling Track'}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>General Capital Pool (Unallocated)</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatCurrencyUSD(tx.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        ≈ {formatCurrencyINR(tx.amount * 83)}
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="capitalize">{tx.paymentStatus}</span>
                      </span>
                      <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                        {tx.paymentMethod}
                      </div>
                    </td>

                    {/* Allocation Action */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => openAllocationModal(tx)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          isAllocated
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        }`}
                      >
                        {isAllocated ? 'Reallocate' : 'Allocate Track'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ALLOCATION MODAL */}
      {allocatingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Allocate Capital Contribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Earmark donor funding for a specific vocational or technical curriculum.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllocatingDonation(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Donation Context Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Donor:</span>
                <span className="font-bold text-slate-900">{allocatingDonation.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contribution Amount:</span>
                <span className="font-extrabold text-emerald-600">
                  {formatCurrencyUSD(allocatingDonation.amount)} ({formatCurrencyINR(allocatingDonation.amount * 83)})
                </span>
              </div>
              {allocatingDonation.message && (
                <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600 italic">
                  &ldquo;{allocatingDonation.message}&rdquo;
                </div>
              )}
            </div>

            {/* Target Track Select */}
            <div className="space-y-2 text-xs">
              <label htmlFor="select-target-track" className="font-bold text-slate-700 block">
                Assign to Target Skilling Track:
              </label>
              <select
                id="select-target-track"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">-- General Capital Pool (Unallocated) --</option>
                {AVAILABLE_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 block">
                Funds will be directly attributed to cohort learning kits and certification vouchers.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAllocatingDonation(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAllocation}
                onClick={handleSaveAllocation}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAllocation ? 'Saving...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
