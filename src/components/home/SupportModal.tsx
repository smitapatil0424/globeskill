'use client';

import React, { useState } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [selectedTier, setSelectedTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');
  const [learnerCount, setLearnerCount] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const tiers = {
    tier1: { title: 'Seed Sponsor', perStudent: 25, label: '₹2,000 / $25' },
    tier2: { title: 'Cohort Champion', perStudent: 50, label: '₹4,150 / $50' },
    tier3: { title: 'Visionary Patron', perStudent: 120, label: '₹10,000 / $120' },
  };

  const totalUSD = tiers[selectedTier].perStudent * learnerCount;
  const totalINR = totalUSD * 83;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              🤍
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sponsor Underserved AI Learners</h3>
              <p className="text-xs text-slate-500">80G Tax Exemption Certificate included</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-lg font-bold text-slate-900">Thank You for Your Generosity!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your pledge to sponsor {learnerCount} students with verified AI skilling has been recorded. Our NGO coordinator will send your 80G tax receipt and cohort impact report.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Back to Learning
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* 80G Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <span className="text-emerald-700 font-bold">🛡️ 80G Registered:</span>
              <span>All contributions qualify for 50% income tax exemption under Indian IT Act.</span>
            </div>

            {/* Select Tier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Sponsorship Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['tier1', 'tier2', 'tier3'] as const).map((tierKey) => (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedTier(tierKey)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedTier === tierKey
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{tiers[tierKey].title}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">{tiers[tierKey].label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Students Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span>Number of Students</span>
                <span className="text-emerald-700 font-extrabold text-sm">{learnerCount} Students</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={learnerCount}
                onChange={(e) => setLearnerCount(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 Learner</span>
                <span>25 Learners</span>
                <span>50 Learners</span>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Total Commitment:</span>
                <div className="text-base font-extrabold text-slate-900">
                  ${totalUSD.toLocaleString()} USD <span className="text-xs font-normal text-slate-500">(≈ ₹{totalINR.toLocaleString()} INR)</span>
                </div>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Direct NGO Impact
              </span>
            </div>

            {/* Action */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors text-center"
              >
                Pledge Contribution &amp; Get 80G Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
