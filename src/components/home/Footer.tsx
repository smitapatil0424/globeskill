'use client';

import { useState } from 'react';
import Link from 'next/link';
import SupportModal from './SupportModal';

export default function Footer() {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#0b1528] text-slate-400 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            
            {/* Column 1: Brand & 80G Registration Badge (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-3 group inline-block">
                <div className="w-10 h-10 rounded-xl bg-[#059669] text-white font-extrabold flex items-center justify-center text-xl shadow-sm">
                  G
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  GlobeSkill
                </span>
              </Link>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                A grassroots technology non-profit bringing world-class AI, computing literacy, and career mentorship to underserved children worldwide.
              </p>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064e3b]/40 border border-[#059669]/50 text-xs font-medium text-[#34d399]">
                  <span className="text-[#34d399] text-xs">🛡️</span>
                  <span>80G Tax Exemption Registered</span>
                </span>
              </div>
            </div>

            {/* Column 2: Programs & Skills (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                PROGRAMS &amp; SKILLS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <Link href="/dashboard/student/quiz" className="hover:text-emerald-400 transition-colors">
                    AI Micro Degree for Young Innovators
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                    IBM SkillsBuild Tech Foundations
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                    AI &amp; Data Careers for Women
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                    Full-Stack Web &amp; Creative Coding
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Role Portals (2.5 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                ROLE PORTALS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>
                  <Link href="/dashboard/student" className="hover:text-emerald-400 transition-colors">
                    Student Learning Portal
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/trainer" className="hover:text-emerald-400 transition-colors">
                    Trainer Course Studio
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/admin/donations" className="hover:text-emerald-400 transition-colors">
                    Donor Impact &amp; Receipts Hub
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/admin" className="hover:text-emerald-400 transition-colors">
                    NGO Admin Command Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Get Involved (2.5 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                GET INVOLVED
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Help us sponsor 1,000+ underserved learners with hands-on AI learning kits and mentor access.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setSupportOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>🤍</span>
                  <span>Support Our Mission</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom strip */}
          <div className="mt-14 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; 2026 GlobeSkill Foundation. Empowering technology &amp; AI education for every child.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <Link
                href="/api/health"
                target="_blank"
                className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>API Health Status:</span>
                <span className="text-emerald-400 font-mono">/api/health</span>
              </Link>
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <span className="text-emerald-400">✦</span> Built for Global Impact
              </span>
            </div>
          </div>

        </div>
      </footer>

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
