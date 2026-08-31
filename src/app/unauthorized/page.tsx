'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar, { DemoRoleType } from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AIChat from '@/components/AIChat';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [targetHub, setTargetHub] = useState('Trainer Management Hub');
  const [targetRequired, setTargetRequired] = useState('trainer, admin');
  const [activeRole, setActiveRole] = useState<string>('Unauthenticated');
  const [switched, setSwitched] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const h = params.get('hub');
      const r = params.get('required');
      if (h) setTargetHub(h);
      if (r) setTargetRequired(r);

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
    }
  }, []);

  const handleRoleSelect = (role: DemoRoleType) => {
    const roleValue = role === 'Admin' ? 'NGO Administrator' : role;
    document.cookie = `mock_role=${encodeURIComponent(roleValue)}; path=/; max-age=86400`;
    setActiveRole(roleValue);
    setSwitched(role);

    // If switched to Trainer or Admin, provide prompt redirect after brief delay
    if (role === 'Trainer') {
      setTimeout(() => {
        router.push('/dashboard/trainer');
      }, 700);
    } else if (role === 'Admin') {
      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. Header Navigation Bar */}
      <Navbar />

      {/* 2. Center Access Restriction Card (Exact replica of user screenshot) */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm text-center relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* Amber Shield Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-600 flex items-center justify-center mb-6 shadow-xs">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 2.714z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Restriction Notice matching screenshot wording */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-8 max-w-md mx-auto">
            The <strong className="font-bold text-slate-900">{targetHub}</strong> is reserved for authorized{' '}
            <strong className="font-bold text-slate-900">{targetRequired}</strong> accounts. Your current active role is{' '}
            <span className="font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              {activeRole}
            </span>
            .
          </p>

          {/* SWITCH DEMO ROLE TO CONTINUE Box */}
          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider text-slate-600 uppercase mb-3.5">
              <span className="text-[#059669]">👤</span>
              <span>SWITCH DEMO ROLE TO CONTINUE:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Student', 'Trainer', 'Admin', 'Donor'] as const).map((r) => {
                const isSelected =
                  switched === r ||
                  (activeRole === 'NGO Administrator' && r === 'Admin') ||
                  activeRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#059669] text-white border-[#047857] shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>

            {switched && (
              <p className="mt-3 text-xs text-[#059669] font-medium animate-in fade-in">
                ✓ Role switched to <strong>{switched}</strong>. Redirecting...
              </p>
            )}
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors text-center"
            >
              Return to Homepage
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Log in with Another Account</span>
              <span>&rarr;</span>
            </Link>
          </div>

        </div>
      </main>

      {/* 3. Dark Navy Footer */}
      <Footer />

      {/* 4. Floating Ask AI Mentor Widget */}
      <AIChat courseContext="Access Control & RBAC Assistant" />
    </div>
  );
}
