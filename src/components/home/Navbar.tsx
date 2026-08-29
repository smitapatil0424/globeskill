'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 text-white font-black flex items-center justify-center text-xl shadow-md group-hover:shadow-blue-500/20 group-hover:scale-105 transition-all">
              GS
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-950 flex items-center gap-1.5">
                GlobeSkill
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700">
                TechPower Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-slate-600">
            <Link
              href="#about"
              className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="#focus-areas"
              className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Programs &amp; Focus
            </Link>
            <Link
              href="#impact"
              className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Impact &amp; SDGs
            </Link>
            <Link
              href="#stories"
              className="px-3.5 py-2 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              Stories
            </Link>
            <Link
              href="/test"
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              DB &amp; Roles Console
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-600/20 transition-all cursor-pointer"
            >
              <span>Explore Programs</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-blue-600"
            >
              About Us
            </Link>
            <Link
              href="#focus-areas"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-blue-600"
            >
              Programs &amp; Focus
            </Link>
            <Link
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-blue-600"
            >
              Impact &amp; SDGs
            </Link>
            <Link
              href="#stories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-blue-600"
            >
              Stories
            </Link>
            <Link
              href="/test"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-base font-medium text-blue-700 bg-blue-50"
            >
              DB &amp; Roles Console
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Explore Programs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
