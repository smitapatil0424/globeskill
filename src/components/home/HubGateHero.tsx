'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DemoRoleType } from './Navbar';

interface HubGateHeroProps {
  onExploreClick?: () => void;
}

export default function HubGateHero({ onExploreClick }: HubGateHeroProps) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string>('Unauthenticated');
  const [switchedRole, setSwitchedRole] = useState<DemoRoleType | null>(null);

  useEffect(() => {
    try {
      const match = document.cookie.match(new RegExp('(^| )mock_role=([^;]+)'));
      if (match && match[2]) {
        setActiveRole(decodeURIComponent(match[2]));
      } else {
        setActiveRole('Unauthenticated');
      }
    } catch {
      setActiveRole('Unauthenticated');
    }
  }, []);

  const handleRoleSelect = (role: DemoRoleType) => {
    const roleValue = role === 'Admin' ? 'NGO Administrator' : role;
    document.cookie = `mock_role=${encodeURIComponent(roleValue)}; path=/; max-age=86400`;
    setActiveRole(roleValue);
    setSwitchedRole(role);

    // If Trainer or Admin, redirect to their hub after brief delay
    if (role === 'Trainer') {
      setTimeout(() => {
        router.push('/dashboard/trainer');
      }, 700);
    } else if (role === 'Admin') {
      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 700);
    } else if (role === 'Student') {
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 700);
    }
  };

  const handleReset = () => {
    document.cookie = 'mock_role=; path=/; max-age=0';
    setActiveRole('Unauthenticated');
    setSwitchedRole(null);
  };

  return (
    <section className="min-h-[calc(100vh-80px-280px)] flex flex-col items-center justify-center px-4 py-10 sm:py-16 bg-white">
      {/* Centered Access Restriction Card (Exact match to reference screenshot) */}
      <div className="max-w-2xl w-full bg-white border border-amber-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative transition-all">
        
        {/* Amber Shield Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-500 flex items-center justify-center mb-6 shadow-xs">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Message matching screenshot wording */}
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-8 max-w-lg mx-auto">
          The <strong className="font-bold text-slate-900">Trainer Management Hub</strong> is reserved for authorized{' '}
          <strong className="font-bold text-slate-900">trainer, admin</strong> accounts. Your current active role is{' '}
          <span className="font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            {activeRole}
          </span>
          .
        </p>

        {/* SWITCH DEMO ROLE TO CONTINUE Capsule Box */}
        <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-5 sm:p-6 mb-8 shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">
            <span className="text-[#059669]">👤</span>
            <span>SWITCH DEMO ROLE TO CONTINUE:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Student', 'Trainer', 'Admin', 'Donor'] as const).map((r) => {
              const isSelected =
                switchedRole === r ||
                (activeRole === 'NGO Administrator' && r === 'Admin') ||
                activeRole === r;

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#059669] text-white border-[#047857] shadow-sm scale-[1.02]'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 border-slate-200/80 shadow-xs'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          {switchedRole && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-center gap-2 text-xs font-semibold text-[#059669] animate-in fade-in">
              <span>✓ Role switched to <strong>{switchedRole}</strong>.</span>
              {switchedRole === 'Trainer' && (
                <Link href="/dashboard/trainer" className="underline font-bold hover:text-[#047857]">
                  Opening Trainer Hub &rarr;
                </Link>
              )}
              {switchedRole === 'Admin' && (
                <Link href="/dashboard/admin" className="underline font-bold hover:text-[#047857]">
                  Opening Admin Console &rarr;
                </Link>
              )}
              {switchedRole === 'Student' && (
                <Link href="/dashboard/student" className="underline font-bold hover:text-[#047857]">
                  Opening Student Workspace &rarr;
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors text-center cursor-pointer"
          >
            Return to Homepage
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Log in with Another Account</span>
            <span>&rarr;</span>
          </Link>
        </div>

      </div>

      {/* Optional link to explore platform below */}
      {onExploreClick && (
        <button
          type="button"
          onClick={onExploreClick}
          className="mt-8 text-xs font-semibold text-slate-400 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Explore All Curriculums &amp; Impact Programs</span>
          <svg className="w-3.5 h-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </section>
  );
}
