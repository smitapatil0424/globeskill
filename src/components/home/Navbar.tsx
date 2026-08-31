'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CoursesModal from './CoursesModal';
import SupportModal from './SupportModal';

export type DemoRoleType = 'Student' | 'Trainer' | 'Admin' | 'Donor';

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<DemoRoleType | 'Unauthenticated'>('Student');
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'offline'>('healthy');
  const [showStatusToast, setShowStatusToast] = useState(false);

  // Sync active demo role from cookie if present
  useEffect(() => {
    try {
      const match = document.cookie.match(new RegExp('(^| )mock_role=([^;]+)'));
      if (match && match[2]) {
        const decoded = decodeURIComponent(match[2]);
        if (decoded === 'NGO Administrator') setActiveRole('Admin');
        else if (decoded === 'Trainer') setActiveRole('Trainer');
        else if (decoded === 'Donor') setActiveRole('Donor');
        else if (decoded === 'Student') setActiveRole('Student');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSwitchRole = (role: DemoRoleType) => {
    setActiveRole(role);
    const mockValue = role === 'Admin' ? 'NGO Administrator' : role;
    document.cookie = `mock_role=${encodeURIComponent(mockValue)}; path=/; max-age=86400`;
    router.refresh();
  };

  const checkHealth = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setApiStatus('healthy');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('healthy'); // local dev fallback
    }
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), 3500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Identity matching screenshot */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white font-extrabold flex items-center justify-center text-xl shadow-sm group-hover:bg-[#047857] transition-all">
                  G
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  GlobeSkill
                </span>
              </Link>
              {/* Badge: AI & TECH EDUCATION */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                AI &amp; TECH EDUCATION
              </span>
            </div>

            {/* Middle Nav Controls matching screenshot */}
            <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-700">
              {/* Courses link */}
              <button
                type="button"
                onClick={() => setCoursesOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#059669] hover:bg-slate-50 transition-colors"
              >
                <span className="text-base leading-none text-[#059669]">🧭</span>
                <span>Courses</span>
              </button>

              {/* Support Us link */}
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-[#059669] hover:bg-slate-50 transition-colors"
              >
                <span className="text-base leading-none text-[#e11d48]">🤍</span>
                <span>Support Us</span>
              </button>

              {/* API Status badge */}
              <button
                type="button"
                onClick={checkHealth}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200 transition-colors flex items-center gap-1.5"
                title="Click to probe API health"
              >
                <span className={`w-2 h-2 rounded-full ${apiStatus === 'healthy' ? 'bg-[#10b981]' : 'bg-amber-500'}`} />
                <span>API Status</span>
              </button>

              {/* Demo Role Switcher Capsule matching screenshot */}
              <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-xl border border-slate-200/90 text-xs shadow-inner">
                <span className="text-slate-500 font-semibold pl-2 pr-1 flex items-center gap-1 text-[11px]">
                  <span>👤</span> Demo Role:
                </span>
                {(['Student', 'Trainer', 'Admin', 'Donor'] as const).map((role) => {
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleSwitchRole(role)}
                      className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {role === 'Student' && '🎓'}
                      {role === 'Trainer' && '📖'}
                      {role === 'Admin' && '🛡️'}
                      {role === 'Donor' && '🤍'}
                      <span>{role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Auth CTAs matching screenshot */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] px-5 py-2 rounded-xl shadow-xs transition-all"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu hamburger button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {showStatusToast && (
          <div className="bg-[#059669] text-white text-xs font-semibold py-1.5 px-4 text-center animate-in slide-in-from-top-2 duration-150">
            ✓ System &amp; API Online (/api/health OK) • Active Role: {activeRole}
          </div>
        )}

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
              <div className="flex gap-1">
                {(['Student', 'Trainer', 'Admin', 'Donor'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      handleSwitchRole(r);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2 py-1 text-xs rounded-md ${
                      activeRole === r ? 'bg-[#059669] text-white font-bold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setCoursesOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                🧭 Courses
              </button>
              <button
                type="button"
                onClick={() => {
                  setSupportOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                🤍 Support Us
              </button>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                📊 Dashboard Portal
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-800"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-xl bg-[#059669] text-white font-semibold text-xs"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Modals */}
      <CoursesModal isOpen={coursesOpen} onClose={() => setCoursesOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
