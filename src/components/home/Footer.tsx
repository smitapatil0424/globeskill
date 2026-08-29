import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1 & 2: Brand Story & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-block">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black flex items-center justify-center text-lg shadow-md">
                GS
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  GlobeSkill
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">
                  TechPower Foundation
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              GlobeSkill is a non-profit technology education initiative dedicated to equipping youth and underprivileged learners with modern digital competencies, AI skills, and sustainable career enablement.
            </p>

            <div className="flex items-center space-x-3 pt-2 text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                UN SDG 4 &amp; 8 Partner
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-emerald-400">
                Verified NGO Initiative
              </span>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#about" className="hover:text-blue-400 transition-colors">
                  About Foundation
                </Link>
              </li>
              <li>
                <Link href="#focus-areas" className="hover:text-blue-400 transition-colors">
                  Core Focus Areas
                </Link>
              </li>
              <li>
                <Link href="#impact" className="hover:text-blue-400 transition-colors">
                  Impact &amp; Metrics
                </Link>
              </li>
              <li>
                <Link href="#stories" className="hover:text-blue-400 transition-colors">
                  Student Stories
                </Link>
              </li>
              <li>
                <Link href="/test" className="hover:text-blue-400 transition-colors text-blue-400/90 font-medium">
                  DB &amp; Role Console &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Learning Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Learning Programs
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Digital Literacy 101
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Applied AI &amp; Prompting
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Cloud &amp; Web Development
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Employability &amp; Soft Skills
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Women in Tech Cohorts
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Portals & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Portals &amp; Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/student" className="hover:text-blue-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/trainer" className="hover:text-blue-400 transition-colors">
                  Trainer Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-blue-400 transition-colors">
                  Admin &amp; SDG Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-400 transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {currentYear} GlobeSkill &bull; Glob TechPower Foundation Initiative. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="#about" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#about" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="#about" className="hover:text-slate-400 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
